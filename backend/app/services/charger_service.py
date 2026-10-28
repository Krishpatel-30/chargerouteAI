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
        search: Optional[str] = None,
    ) -> List[ChargingStation]:
        stmt = select(ChargingStation)

        filters = []
        if operator:
            filters.append(ChargingStation.operator.ilike(f"%{operator}%"))
        if city:
            filters.append(ChargingStation.city.ilike(f"%{city}%"))
        if search:
            filters.append(
                or_(
                    ChargingStation.name.ilike(f"%{search}%"),
                    ChargingStation.address.ilike(f"%{search}%"),
                    ChargingStation.city.ilike(f"%{search}%"),
                    ChargingStation.operator.ilike(f"%{search}%"),
                )
            )

        if filters:
            stmt = stmt.where(and_(*filters))

        result = await db.execute(stmt)
        stations = list(result.scalars().all())

        # Post-filter in Python for JSON connector types and min_power
        filtered = []
        for st in stations:
            if min_power_kw and st.max_power_kw < min_power_kw:
                continue

            if connector_type:
                conns = [c.get("type", "") if isinstance(c, dict) else str(c) for c in (st.connector_types or [])]
                if not any(connector_type.lower() in c.lower() for c in conns):
                    continue

            filtered.append(st)

        return filtered

    @staticmethod
    async def get_station_by_id(db: AsyncSession, station_id: str) -> Optional[ChargingStation]:
        stmt = select(ChargingStation).where(ChargingStation.id == station_id)
        res = await db.execute(stmt)
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
