"""
Backup Charging Stop Discovery & Feasibility Evaluator.

For each primary charging stop, discovers alternative stations within a practical detour radius,
evaluates connector compatibility, estimates detour distance/time, verifies remaining battery
reachability, and computes backup risk.
"""

import math
from typing import List, Tuple, Optional
from datetime import datetime
from app.models.charger import ChargingStation
from app.schemas.trip import BackupStopCandidate
from app.services.risk_engine import RiskEngine


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to compute great-circle distance in kilometers."""
    R = 6371.0  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


class BackupFinder:
    MAX_DETOUR_RADIUS_KM = 35.0  # Maximum search radius from primary stop

    @staticmethod
    def find_backups_for_stop(
        primary_station: ChargingStation,
        all_candidate_stations: List[ChargingStation],
        vehicle_connector_types: List[str],
        arrival_battery_pct: float,
        usable_battery_kwh: float,
        consumption_kwh_100km: float,
    ) -> List[BackupStopCandidate]:
        """
        Finds and ranks backup stations within detour radius of the primary stop.
        """
        backups: List[BackupStopCandidate] = []

        for st in all_candidate_stations:
            # Skip primary station itself
            if st.id == primary_station.id:
                continue

            # Check connector compatibility
            st_connectors = [c.get("type", "") if isinstance(c, dict) else str(c) for c in (st.connector_types or [])]
            compatible = any(c in st_connectors for c in vehicle_connector_types)
            if not compatible:
                continue

            # Calculate direct distance from primary station
            dist_km = haversine_distance_km(
                primary_station.latitude,
                primary_station.longitude,
                st.latitude,
                st.longitude,
            )

            # Road detour multiplier (~1.25x haversine)
            road_detour_km = dist_km * 1.25

            if road_detour_km <= BackupFinder.MAX_DETOUR_RADIUS_KM:
                # Calculate battery required for detour
                detour_energy = (road_detour_km * consumption_kwh_100km) / 100.0
                detour_pct_drop = (detour_energy / usable_battery_kwh) * 100.0 if usable_battery_kwh > 0 else 0
                remaining_at_backup = arrival_battery_pct - detour_pct_drop
                detour_time_min = (road_detour_km / 50.0) * 60.0  # Assumes 50 km/h average detour speed

                feasibility = []
                if remaining_at_backup >= 8.0:
                    feasibility.append(f"Reachable with ~{remaining_at_backup:.1f}% remaining SoC")
                elif remaining_at_backup > 0:
                    feasibility.append(f"CRITICAL: Reachable with only {remaining_at_backup:.1f}% battery")
                else:
                    feasibility.append(f"UNREACHABLE: Requires {abs(remaining_at_backup):.1f}% more battery than available")

                if st.live_status == "operational":
                    feasibility.append("Operational")
                elif st.live_status == "offline":
                    feasibility.append("Reported Offline")

                # Compute risk for the backup station itself
                backup_risk = RiskEngine.calculate_station_risk(
                    live_status=st.live_status,
                    last_refresh=st.last_data_refresh,
                    fault_reports_count=st.fault_report_count,
                    total_plugs=st.total_plugs,
                    access_restrictions=st.access_restrictions,
                    opening_hours=st.opening_hours,
                    nearby_backup_count=1,
                    nearest_backup_detour_km=road_detour_km,
                    estimated_arrival_battery_pct=remaining_at_backup,
                )

                candidate = BackupStopCandidate(
                    station_id=st.id,
                    name=st.name,
                    operator=st.operator,
                    latitude=st.latitude,
                    longitude=st.longitude,
                    detour_km=round(road_detour_km, 1),
                    detour_time_min=round(detour_time_min, 1),
                    max_power_kw=float(st.max_power_kw or 50.0),
                    live_status=st.live_status or "unknown",
                    risk_score=backup_risk.score,
                    risk_category=backup_risk.category,
                    feasibility_notes="; ".join(feasibility),
                )
                backups.append(candidate)

        # Sort by detour distance and risk
        backups.sort(key=lambda b: (b.detour_km, b.risk_score))
        return backups
