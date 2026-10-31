"""
Charging Station Query, Filtering, and Spatial Corridor Service.
"""

from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.models.charger import ChargingStation
from app.services.backup_finder import haversine_distance_km
from app.services.risk_engine import RiskEngine
from app.schemas.charger import RiskBreakdown, ChargingStationResponse


class ChargerService:
    @staticmethod
    async def get_all_stations(
        db: AsyncSession,
        connector_type: Optional[str] = None,
        min_power_kw: Optional[float] = None,
        operator: Optional[str] = None,
        city: Optional[str] = None,
        state: Optional[str] = None,
        state_code: Optional[str] = None,
        current: Optional[str] = None,
        vehicle_connectors: Optional[List[str]] = None,
        search: Optional[str] = None,
        nearby_lat: Optional[float] = None,
        nearby_lng: Optional[float] = None,
        radius_km: Optional[float] = None,
    ) -> List[ChargingStation]:
        stmt = select(ChargingStation)

        filters = []
        if operator:
            filters.append(ChargingStation.operator.ilike(f"%{operator}%"))
        if city:
            filters.append(ChargingStation.city.ilike(f"%{city}%"))
        if state:
            filters.append(ChargingStation.state.ilike(f"%{state}%"))
        if state_code:
            filters.append(ChargingStation.state_code.ilike(f"{state_code}"))
        if search:
            filters.append(
                or_(
                    ChargingStation.name.ilike(f"%{search}%"),
                    ChargingStation.address.ilike(f"%{search}%"),
                    ChargingStation.city.ilike(f"%{search}%"),
                    ChargingStation.state.ilike(f"%{search}%"),
                    ChargingStation.operator.ilike(f"%{search}%"),
                    ChargingStation.external_id.ilike(f"%{search}%"),
                )
            )

        if filters:
            stmt = stmt.where(and_(*filters))

        result = await db.execute(stmt)
        stations = list(result.scalars().all())

        # Post-filter in Python for JSON connector types, min_power, currents, vehicle compatibility, and proximity
        filtered = []
        for st in stations:
            if min_power_kw and (st.max_power_kw or 0) < min_power_kw:
                continue

            conns = [c.get("type", "") if isinstance(c, dict) else str(c) for c in (st.connector_types or [])]

            if connector_type:
                if not any(connector_type.lower() in c.lower() for c in conns):
                    continue

            # Current filter (AC or DC)
            if current:
                c_upper = current.upper()
                st_currents = [str(x).upper() for x in (st.currents or [])]
                # If currents not specified, infer from connector standards
                is_dc = "DC" in st_currents or any("CCS" in c or "CHA" in c or "BHARAT" in c for c in conns)
                is_ac = "AC" in st_currents or any("TYPE 2" in c or "TYPE2" in c or "15A" in c for c in conns)
                if c_upper == "DC" and not is_dc:
                    continue
                if c_upper == "AC" and not is_ac:
                    continue

            # Vehicle compatibility filter
            if vehicle_connectors:
                # Station must share at least one connector standard with the vehicle
                if not any(any(vc.lower() in sc.lower() for sc in conns) for vc in vehicle_connectors):
                    continue

            # GPS Distance Calculation
            if nearby_lat is not None and nearby_lng is not None:
                dist = haversine_distance_km(nearby_lat, nearby_lng, st.latitude, st.longitude)
                if radius_km and dist > radius_km:
                    continue
                st.distance_km = round(dist, 2)

            filtered.append(st)

        if nearby_lat is not None and nearby_lng is not None:
            filtered.sort(key=lambda x: getattr(x, "distance_km", 999999.0))

        return filtered

    @staticmethod
    async def get_station_by_id(db: AsyncSession, station_id: str) -> Optional[ChargingStation]:
        stmt = select(ChargingStation).where(
            or_(
                ChargingStation.id == station_id,
                ChargingStation.external_id == station_id
            )
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()
        return res.scalar_one_or_none()

    @staticmethod
    def find_chargers_along_route(
        route_coords: List[List[float]], # [[lng, lat], ...]
        all_stations: List[ChargingStation],
        corridor_width_km: float = 18.0,
        compatible_connectors: Optional[List[str]] = None,
    ) -> List[Tuple[ChargingStation, float, float]]:
        """
        Finds stations located within corridor_width_km of the route polyline.
        Returns list of (station, distance_along_route_km, detour_km_from_path).
        """
        if not route_coords or len(route_coords) < 2:
            return []

        # Calculate cumulative distance along polyline vertices
        cum_dist = [0.0]
        for i in range(1, len(route_coords)):
            seg = haversine_distance_km(
                route_coords[i - 1][1], route_coords[i - 1][0],
                route_coords[i][1], route_coords[i][0]
            ) * 1.20 # road multiplier
            cum_dist.append(cum_dist[-1] + seg)

        route_chargers = []

        for st in all_stations:
            # Check connector compatibility if provided
            if compatible_connectors:
                st_conns = [c.get("type", "") if isinstance(c, dict) else str(c) for c in (st.connector_types or [])]
                if not any(c in st_conns for c in compatible_connectors):
                    continue

            # Find closest vertex on the route
            min_dist_to_route = float("inf")
            best_idx = 0

            # Subsample points if polyline is dense for fast processing
            step = 1 if len(route_coords) < 100 else 2
            for idx in range(0, len(route_coords), step):
                pt = route_coords[idx]
                d = haversine_distance_km(st.latitude, st.longitude, pt[1], pt[0])
                if d < min_dist_to_route:
                    min_dist_to_route = d
                    best_idx = idx

            if min_dist_to_route <= corridor_width_km:
                dist_along = cum_dist[min(best_idx, len(cum_dist) - 1)]
                route_chargers.append((st, round(dist_along, 1), round(min_dist_to_route * 1.25, 1)))

        # Sort by distance along route from origin
        route_chargers.sort(key=lambda x: x[1])
        return route_chargers
