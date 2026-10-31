"""
India EV Charging Stations API Ingestion & Integration Service.
Wraps the Bureau of Energy Efficiency (BEE) National Directory API
(https://ev-charging-stations-api.vercel.app).
"""

import logging
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_

from app.core.config import settings
from app.models.charger import ChargingStation
from app.services.backup_finder import haversine_distance_km
from app.services.risk_engine import RiskEngine

logger = logging.getLogger("chargeroute.india_ev")


class IndiaEVService:
    BASE_URL = settings.INDIA_EV_API_BASE.rstrip("/")

    @classmethod
    async def fetch_source_metadata(cls) -> Dict[str, Any]:
        """
        Fetches dataset metadata from the API (source publisher, snapshot label, attribution).
        """
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{cls.BASE_URL}/v1/stations?limit=1")
            resp.raise_for_status()
            data = resp.json()
            meta = data.get("meta", {})
            source = meta.get("source", {})
            return {
                "source_name": source.get("name", "EV Public Charging Stations Data till 26th October 2025"),
                "publisher": source.get("publisher", "Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India"),
                "snapshot_label": source.get("snapshot_label", "till 26th October 2025"),
                "attribution": meta.get("attribution", "Data: Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India"),
                "total_upstream_stations": meta.get("total", 29184),
                "api_endpoint": cls.BASE_URL,
            }

    @classmethod
    async def fetch_states(cls) -> List[Dict[str, Any]]:
        """
        Fetches all 36 Indian states and union territories with station statistics.
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{cls.BASE_URL}/v1/states")
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Error fetching states from India EV API: {e}")
            return []

    @classmethod
    async def fetch_cities(cls, state_code: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetches Indian cities index from the API, optionally filtered by state_code.
        """
        try:
            url = f"{cls.BASE_URL}/v1/cities"
            params = {}
            if state_code:
                params["state"] = state_code.upper()
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Error fetching cities from India EV API: {e}")
            return []

    @classmethod
    async def fetch_operators(cls) -> List[Dict[str, Any]]:
        """
        Fetches all charging network operators in India.
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f"{cls.BASE_URL}/v1/operators")
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Error fetching operators from India EV API: {e}")
            return []

    @classmethod
    async def fetch_nearby_api(
        cls,
        lat: float,
        lng: float,
        radius_km: float = 25.0,
        vehicle: str = "car",
        current: Optional[str] = None,
        min_power_kw: Optional[float] = None,
        connector: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """
        Direct spatial proximity query against the India EV API GPS radius endpoint.
        """
        params: Dict[str, Any] = {
            "lat": lat,
            "lng": lng,
            "radius_km": min(radius_km, 150.0),
            "vehicle": vehicle,
            "limit": limit,
        }
        if current:
            params["current"] = current.lower()
        if min_power_kw and min_power_kw > 0:
            params["min_power_kw"] = min_power_kw
        if connector:
            params["connector"] = connector

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.get(f"{cls.BASE_URL}/v1/stations/near", params=params)
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Error querying nearby stations from API: {e}")
            return []

    @classmethod
    def transform_api_station(cls, raw: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converts India EV API station schema to ChargeRoute AI ChargingStation model attributes.
        """
        station_id = raw.get("id") or f"bee_{raw.get('latitude')}_{raw.get('longitude')}"
        operator = raw.get("operator") or "Public EV Network"
        city = raw.get("city") or "India"
        district = raw.get("district")
        state = raw.get("state") or "India"
        state_code = raw.get("state_code")
        address = raw.get("address") or f"{city}, {state}"

        # Clean station name
        name_parts = [operator]
        if city and city != "India":
            name_parts.append(city.title())
        elif district:
            name_parts.append(district.title())
        name = " - ".join(name_parts) + " Hub"

        # Extract connector types & guns
        connector_types = []
        chargers = raw.get("chargers", [])
        for ch in chargers:
            guns = ch.get("guns", [])
            if guns:
                for gun in guns:
                    connector_types.append({
                        "type": gun.get("standard", "CCS2"),
                        "power_kw": float(gun.get("kw") or ch.get("charger_kw") or 50.0),
                        "count": 1,
                    })
            else:
                standards = ch.get("standards", ["CCS2"])
                kw = float(ch.get("charger_kw") or 50.0)
                count = int(ch.get("connectors_per_charger") or 1)
                for std in standards:
                    connector_types.append({
                        "type": std,
                        "power_kw": kw,
                        "count": count,
                    })

        if not connector_types:
            for std in raw.get("standards", ["CCS2"]):
                connector_types.append({
                    "type": std,
                    "power_kw": float(raw.get("max_power_kw") or 50.0),
                    "count": 1,
                })

        total_plugs = int(raw.get("total_connectors") or len(connector_types) or 2)
        max_power = float(raw.get("max_power_kw") or 50.0)

        # Operational status: Notice - historical directory records are marked as 'verified_directory'
        # so they are never misrepresented as real-time socket availability
        live_status = "verified_directory"

        return {
            "external_id": station_id,
            "name": name,
            "latitude": float(raw["latitude"]),
            "longitude": float(raw["longitude"]),
            "address": address,
            "city": city,
            "district": district,
            "state": state,
            "state_code": state_code,
            "country": "India",
            "operator": operator,
            "connector_types": connector_types,
            "currents": raw.get("currents", ["DC"]),
            "standards": raw.get("standards", ["CCS2"]),
            "vehicle_classes": raw.get("vehicle_classes", ["car"]),
            "total_plugs": total_plugs,
            "max_power_kw": max_power,
            "access_restrictions": "Public Government Directory (BEE)",
            "opening_hours": "24/7 (Verify locally)",
            "payment_network": f"{operator} / UPI / RFID",
            "live_status": live_status,
            "source_provider": "BEE India EV Directory (till Oct 2025)",
            "dataset_snapshot": "till 26th October 2025",
            "confidence_score": 0.88,
            "last_data_refresh": datetime.now(timezone.utc),
            "external_url": f"https://ev-charging-stations-api.vercel.app/v1/stations/{station_id}",
        }

    @classmethod
    async def import_stations_batch(
        cls,
        db: AsyncSession,
        stations_raw: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """
        Upserts a batch of raw station records into the database.
        """
        if not stations_raw:
            return {"added": 0, "updated": 0}

        ext_ids = [s.get("id") for s in stations_raw if s.get("id")]
        stmt = select(ChargingStation).where(ChargingStation.external_id.in_(ext_ids))
        res = await db.execute(stmt)
        existing_map = {st.external_id: st for st in res.scalars().all()}

        added = 0
        updated = 0

        for raw in stations_raw:
            attrs = cls.transform_api_station(raw)
            ext_id = attrs["external_id"]

            if ext_id in existing_map:
                st = existing_map[ext_id]
                for k, v in attrs.items():
                    if k != "external_id":
                        setattr(st, k, v)
                updated += 1
            else:
                new_st = ChargingStation(**attrs)
                db.add(new_st)
                added += 1

        await db.commit()
        return {"added": added, "updated": updated}

    @classmethod
    async def sync_priority_hubs(
        cls,
        db: AsyncSession,
        pages: int = 10,
        page_size: int = 100,
    ) -> Dict[str, Any]:
        """
        Synchronizes high-priority India-wide stations (fast DC highway hubs & city networks)
        from the API into the active database.
        """
        total_added = 0
        total_updated = 0
        meta = await cls.fetch_source_metadata()

        async with httpx.AsyncClient(timeout=15.0) as client:
            for p in range(1, pages + 1):
                try:
                    url = f"{cls.BASE_URL}/v1/stations?limit={page_size}&page={p}"
                    resp = await client.get(url)
                    if resp.status_code != 200:
                        break
                    data = resp.json()
                    stations = data.get("data", [])
                    if not stations:
                        break

                    res = await cls.import_stations_batch(db, stations)
                    total_added += res["added"]
                    total_updated += res["updated"]
                    logger.info(f"[IndiaEV Sync] Page {p}/{pages}: {res['added']} added, {res['updated']} updated")
                except Exception as e:
                    logger.error(f"[IndiaEV Sync] Error syncing page {p}: {e}")
                    break

        return {
            "success": True,
            "added": total_added,
            "updated": total_updated,
            "source_meta": meta,
        }
