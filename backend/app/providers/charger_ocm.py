"""
Open Charge Map (OCM) Provider Adapter.

Interacts with OpenChargeMap v3 API to query real-world stations when an API key is available,
translating provider fields into normalized ChargeRoute schemas.
"""

import httpx
from typing import List, Dict, Any, Optional
from app.providers.base import ChargerDataProvider
from app.core.config import settings


class OpenChargeMapProvider(ChargerDataProvider):
    BASE_URL = "https://api.openchargemap.io/v3/poi"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPEN_CHARGE_MAP_API_KEY

    async def fetch_nearby_chargers(
        self,
        lat: float,
        lng: float,
        radius_km: float = 25.0,
    ) -> List[Dict[str, Any]]:
        if not self.api_key:
            # When no key is configured, caller relies on local database seed
            return []

        params = {
            "output": "json",
            "latitude": lat,
            "longitude": lng,
            "distance": radius_km,
            "distanceunit": "KM",
            "maxresults": 20,
            "key": self.api_key,
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(self.BASE_URL, params=params)
                if resp.status_code == 200:
                    raw_data = resp.json()
                    return self._normalize_ocm_data(raw_data)
        except Exception:
            pass

        return []

    def _normalize_ocm_data(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized = []
        for item in data:
            addr = item.get("AddressInfo", {})
            operator = item.get("OperatorInfo", {}).get("Title", "Unknown Network")
            conns = item.get("Connections", [])
            
            connector_list = []
            max_kw = 22.0
            for c in conns:
                conn_type = c.get("ConnectionType", {}).get("Title", "Type 2")
                kw = float(c.get("PowerKW") or 22.0)
                if kw > max_kw:
                    max_kw = kw
                connector_list.append({
                    "type": "CCS2" if "CCS" in conn_type or "Combo" in conn_type else conn_type,
                    "power_kw": kw,
                    "count": int(c.get("Quantity") or 1)
                })

            normalized.append({
                "external_id": f"ocm_{item.get('ID')}",
                "name": addr.get("Title", "Charging Station"),
                "latitude": float(addr.get("Latitude", 0.0)),
                "longitude": float(addr.get("Longitude", 0.0)),
                "address": addr.get("AddressLine1", ""),
                "city": addr.get("Town", "Gujarat"),
                "state": addr.get("StateOrProvince", "Gujarat"),
                "operator": operator,
                "connector_types": connector_list,
                "total_plugs": sum(c["count"] for c in connector_list) or 2,
                "max_power_kw": max_kw,
                "access_restrictions": "Public" if item.get("UsageType", {}).get("IsPayAtLocation") else "Restricted",
                "opening_hours": "24/7",
                "live_status": "operational" if item.get("StatusType", {}).get("IsOperational") else "unknown",
                "source_provider": "OpenChargeMap",
                "external_url": f"https://openchargemap.org/site/poi/details/{item.get('ID')}",
            })
        return normalized
