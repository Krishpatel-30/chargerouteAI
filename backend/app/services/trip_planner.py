"""
Core EV Trip Planning Orchestrator.

Integrates routing, deterministic energy calculations, intelligent charging-stop selection,
backup charger allocation, explainable risk scoring, and multi-route comparison.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.vehicle import VehicleModel
from app.models.charger import ChargingStation
from app.schemas.trip import (
    TripPlanRequest,
    TripPlanResponse,
    ChargingStopDetail,
    BackupStopCandidate,
    TripAlternativeSummary,
)
from app.providers.routing_osrm import OSRMRoutingProvider
from app.services.energy_calculator import EnergyCalculator
from app.services.risk_engine import RiskEngine
from app.services.backup_finder import BackupFinder
from app.services.charger_service import ChargerService


class TripPlanner:
    def __init__(self, routing_provider: Optional[OSRMRoutingProvider] = None):
        self.routing = routing_provider or OSRMRoutingProvider()

    async def plan_trip(
        self,
        db: AsyncSession,
        request: TripPlanRequest,
    ) -> TripPlanResponse:
        # 1. Fetch vehicle model specifications
        veh_stmt = select(VehicleModel).where(VehicleModel.id == request.vehicle_id)
        veh_res = await db.execute(veh_stmt)
        vehicle = veh_res.scalar_one_or_none()
        if not vehicle:
            raise ValueError(f"Vehicle profile with ID '{request.vehicle_id}' not found.")

        # 2. Get road route from provider adapter
        waypoints_dicts = [{"lat": wp.lat, "lng": wp.lng} for wp in request.waypoints] if request.waypoints else None
        route_result = await self.routing.get_route(
            origin_lat=request.origin_lat,
            origin_lng=request.origin_lng,
            dest_lat=request.destination_lat,
            dest_lng=request.destination_lng,
            waypoints=waypoints_dicts,
        )

        total_distance_km = route_result.distance_km
        driving_time_min = route_result.duration_min
        route_coords = route_result.coordinates

        # 3. Discover all charging stations in database
        all_stations_res = await db.execute(select(ChargingStation))
        all_stations = list(all_stations_res.scalars().all())

        # Filter corridor chargers along polyline
        vehicle_connectors = vehicle.connector_types or ["CCS2"]
        corridor_chargers = ChargerService.find_chargers_along_route(
            route_coords=route_coords,
            all_stations=all_stations,
            corridor_width_km=22.0,
            compatible_connectors=vehicle_connectors,
        )

        # 4. Simulate primary plan based on user preference
        primary_stops, warnings = self._simulate_stops(
            vehicle=vehicle,
            request=request,
            total_distance_km=total_distance_km,
            corridor_chargers=corridor_chargers,
            all_stations=all_stations,
            preference=request.preference,
        )

        # 5. Compute totals
        total_charging_time_min = sum(s.charging_duration_min for s in primary_stops)
        total_duration_min = round(driving_time_min + total_charging_time_min, 1)
        total_energy_kwh = sum(s.energy_added_kwh for s in primary_stops)
        # Also include initial battery energy used to reach arrival
        base_trip_energy = EnergyCalculator.calculate_segment_energy_kwh(
            distance_km=total_distance_km,
            base_consumption_kwh_100km=vehicle.consumption_kwh_100km,
            highway_factor=request.highway_factor,
            ac_factor=request.ac_factor,
        )
        total_cost_inr = sum(s.estimated_cost_inr for s in primary_stops)

        # 6. Overall Risk Assessment
        stop_risks = [s.station_risk for s in primary_stops]
        overall_risk = RiskEngine.calculate_overall_trip_risk(stop_risks)

        # 7. Generate Alternative Options (e.g. Fastest vs Max Safety / Lowest Risk)
        alternatives = self._generate_alternatives(
            vehicle=vehicle,
            request=request,
            total_distance_km=total_distance_km,
            driving_time_min=driving_time_min,
            corridor_chargers=corridor_chargers,
            all_stations=all_stations,
            route_coords=route_coords,
            primary_preference=request.preference,
        )

        # Min arrival battery reserve reached on trip
        min_reserve = request.start_battery_pct
        if primary_stops:
            min_reserve = min(min(s.arrival_battery_pct for s in primary_stops), request.min_arrival_battery_pct)
        else:
            final_arrival_pct = EnergyCalculator.estimate_arrival_battery_pct(
                start_battery_pct=request.start_battery_pct,
                segment_energy_kwh=base_trip_energy,
                usable_battery_capacity_kwh=vehicle.usable_battery_capacity_kwh,
            )
            min_reserve = final_arrival_pct

        return TripPlanResponse(
            title=f"{request.origin_name} to {request.destination_name}",
            origin_name=request.origin_name,
            destination_name=request.destination_name,
            vehicle_name=f"{vehicle.manufacturer} {vehicle.model}",
            vehicle_battery_usable_kwh=vehicle.usable_battery_capacity_kwh,
            total_distance_km=round(total_distance_km, 1),
            total_driving_time_min=round(driving_time_min, 1),
            total_charging_time_min=round(total_charging_time_min, 1),
            total_duration_min=round(total_duration_min, 1),
            total_energy_kwh=round(base_trip_energy, 2),
            estimated_cost_inr=round(total_cost_inr, 2),
            min_battery_reserve_pct=round(min_reserve, 1),
            overall_risk_score=overall_risk.score,
            overall_risk_category=overall_risk.category,
            risk_breakdown=overall_risk,
            charging_stops=primary_stops,
            route_geometry=route_coords,
            alternatives=alternatives,
            assumptions={
                "vehicle_consumption_kwh_100km": vehicle.consumption_kwh_100km,
                "highway_speed_multiplier": request.highway_factor,
                "ac_climate_multiplier": request.ac_factor,
                "effective_consumption_kwh_100km": round(
                    vehicle.consumption_kwh_100km * request.highway_factor * request.ac_factor, 2
                ),
                "usable_battery_capacity_kwh": vehicle.usable_battery_capacity_kwh,
                "min_desired_reserve_pct": request.min_arrival_battery_pct,
                "tariff_rate_inr_kwh": 19.5,
                "calculation_model": "Deterministic multi-factor segment integration (Section 10)",
            },
            warnings=warnings,
        )

    def _simulate_stops(
        self,
        vehicle: VehicleModel,
        request: TripPlanRequest,
        total_distance_km: float,
        corridor_chargers: List[Any],
        all_stations: List[ChargingStation],
        preference: str,
    ) -> (List[ChargingStopDetail], List[str]):
        """Simulates battery discharge along the route and schedules charging stops."""
        stops: List[ChargingStopDetail] = []
        warnings: List[str] = []

        current_km = 0.0
        current_battery = request.start_battery_pct
        stop_index = 1

        # Check if trip can be completed without stopping
        full_trip_energy = EnergyCalculator.calculate_segment_energy_kwh(
            total_distance_km,
            vehicle.consumption_kwh_100km,
            request.highway_factor,
            request.ac_factor,
        )
        direct_arrival_pct = EnergyCalculator.estimate_arrival_battery_pct(
            request.start_battery_pct, full_trip_energy, vehicle.usable_battery_capacity_kwh
        )

        if direct_arrival_pct >= request.min_arrival_battery_pct:
            # Trip is safely within non-stop range!
            return [], []

        # We must plan charging stops
        while current_km < total_distance_km:
            remaining_trip_km = total_distance_km - current_km
            seg_energy = EnergyCalculator.calculate_segment_energy_kwh(
                remaining_trip_km,
                vehicle.consumption_kwh_100km,
                request.highway_factor,
                request.ac_factor,
            )
            est_dest_arrival = EnergyCalculator.estimate_arrival_battery_pct(
                current_battery, seg_energy, vehicle.usable_battery_capacity_kwh
            )

            if est_dest_arrival >= request.min_arrival_battery_pct:
                # Can reach destination with required reserve
                break

            # Find next stop candidates ahead of current_km that are reachable
            candidates = []
            for st, st_km, detour in corridor_chargers:
                if st_km <= current_km + 10.0:
                    continue  # already passed or too close

                dist_to_st = st_km - current_km
                energy_needed = EnergyCalculator.calculate_segment_energy_kwh(
                    dist_to_st,
                    vehicle.consumption_kwh_100km,
                    request.highway_factor,
                    request.ac_factor,
                )
                arrival_at_st = EnergyCalculator.estimate_arrival_battery_pct(
                    current_battery, energy_needed, vehicle.usable_battery_capacity_kwh
                )

                # Station must be reachable with at least 8% battery
                if arrival_at_st >= 8.0:
                    candidates.append((st, st_km, dist_to_st, arrival_at_st, detour))

            if not candidates:
                warnings.append(
                    f"Warning: Insufficient compatible charging stations between km {current_km:.1f} and destination. "
                    "Battery range limit reached before finding a safe stop."
                )
                break

            # Select best candidate based on preference
            def score_candidate(cand):
                st, st_km, dist_to_st, arrival_soc, detour = cand
                # Higher dist_to_st means fewer total stops
                dist_score = dist_to_st / total_distance_km
                power_score = min(st.max_power_kw, vehicle.max_dc_power_kw) / 100.0
                safety_score = 1.0 if st.live_status == "operational" else 0.4

                if preference == "lowest_risk":
                    return safety_score * 3.0 + power_score * 1.0 - (detour / 20.0)
                elif preference == "fastest":
                    return power_score * 3.0 + dist_score * 1.5
                elif preference == "lowest_cost":
                    return dist_score * 2.0 - (st.max_power_kw / 200.0)
                else:  # more_alternatives
                    return safety_score * 2.0 + (st.total_plugs / 4.0)

            best_candidate = max(candidates, key=score_candidate)
            sel_station, sel_km, seg_dist, arrival_soc, detour = best_candidate

            # Calculate charging needs: charge up to 80% or 85% for quick turn-around
            target_soc = 82.0
            if arrival_soc >= 80.0:
                target_soc = min(95.0, arrival_soc + 15.0)

            energy_added, duration_min, charging_power = EnergyCalculator.estimate_charging_time_and_energy(
                current_battery_pct=arrival_soc,
                target_battery_pct=target_soc,
                usable_battery_capacity_kwh=vehicle.usable_battery_capacity_kwh,
                station_power_kw=sel_station.max_power_kw,
                vehicle_max_dc_kw=vehicle.max_dc_power_kw,
            )
            cost_inr = EnergyCalculator.calculate_charging_cost_inr(energy_added)

            # Discover backups
            backups = BackupFinder.find_backups_for_stop(
                primary_station=sel_station,
                all_candidate_stations=all_stations,
                vehicle_connector_types=vehicle.connector_types or ["CCS2"],
                arrival_battery_pct=arrival_soc,
                usable_battery_kwh=vehicle.usable_battery_capacity_kwh,
                consumption_kwh_100km=vehicle.consumption_kwh_100km,
            )

            primary_backup = backups[0] if backups else None
            if not primary_backup:
                warnings.append(f"Notice: Stop {stop_index} ({sel_station.name}) has NO reachable backup within 35 km.")

            # Compute station risk
            nearest_detour = primary_backup.detour_km if primary_backup else None
            st_risk = RiskEngine.calculate_station_risk(
                live_status=sel_station.live_status,
                last_refresh=sel_station.last_data_refresh,
                fault_reports_count=sel_station.fault_report_count,
                total_plugs=sel_station.total_plugs,
                access_restrictions=sel_station.access_restrictions,
                opening_hours=sel_station.opening_hours,
                nearby_backup_count=len(backups),
                nearest_backup_detour_km=nearest_detour,
                estimated_arrival_battery_pct=arrival_soc,
            )

            stop_detail = ChargingStopDetail(
                stop_number=stop_index,
                station_id=sel_station.id,
                station_name=sel_station.name,
                operator=sel_station.operator,
                latitude=sel_station.latitude,
                longitude=sel_station.longitude,
                distance_from_start_km=round(sel_km, 1),
                segment_distance_km=round(seg_dist, 1),
                arrival_battery_pct=round(arrival_soc, 1),
                target_departure_battery_pct=round(target_soc, 1),
                energy_added_kwh=round(energy_added, 2),
                charging_duration_min=round(duration_min, 1),
                charging_power_kw=round(charging_power, 1),
                estimated_cost_inr=round(cost_inr, 2),
                station_risk=st_risk,
                primary_backup=primary_backup,
                all_backups=backups[:4],
            )
            stops.append(stop_detail)

            # Advance state
            current_km = sel_km
            current_battery = target_soc
            stop_index += 1

            if stop_index > 5:
                warnings.append("Route exceeded maximum planned charging hops limit (5 stops).")
                break

        return stops, warnings

    def _generate_alternatives(
        self,
        vehicle: VehicleModel,
        request: TripPlanRequest,
        total_distance_km: float,
        driving_time_min: float,
        corridor_chargers: List[Any],
        all_stations: List[ChargingStation],
        route_coords: List[List[float]],
        primary_preference: str,
    ) -> List[TripAlternativeSummary]:
        """Generates 2 distinct alternative routes for side-by-side comparison."""
        alternatives: List[TripAlternativeSummary] = []
        alt_configs = [
            ("fastest", "High-Power Speed Route", "Prioritizes 120kW+ superfast chargers for shortest charging downtime."),
            ("lowest_risk", "Maximum Safety & Backup Hubs", "Picks multi-stall expressway plazas with verified backups and high confidence."),
            ("lowest_cost", "Eco & Balanced Reserve", "Minimizes top-up overhead while sustaining a safe 15% buffer."),
        ]

        for pref, name, desc in alt_configs:
            if pref == primary_preference and len(alternatives) >= 2:
                continue

            stops, _ = self._simulate_stops(
                vehicle=vehicle,
                request=request,
                total_distance_km=total_distance_km,
                corridor_chargers=corridor_chargers,
                all_stations=all_stations,
                preference=pref,
            )

            total_charging_min = sum(s.charging_duration_min for s in stops)
            total_cost = sum(s.estimated_cost_inr for s in stops)
            stop_risks = [s.station_risk for s in stops]
            overall_r = RiskEngine.calculate_overall_trip_risk(stop_risks)
            min_reserve = min([s.arrival_battery_pct for s in stops] or [request.min_arrival_battery_pct])

            alternatives.append(
                TripAlternativeSummary(
                    route_id=f"alt_{pref}",
                    name=name,
                    description=desc,
                    total_distance_km=round(total_distance_km, 1),
                    total_driving_time_min=round(driving_time_min, 1),
                    total_charging_time_min=round(total_charging_min, 1),
                    total_duration_min=round(driving_time_min + total_charging_min, 1),
                    charging_stops_count=len(stops),
                    overall_risk_score=overall_r.score,
                    overall_risk_category=overall_r.category,
                    estimated_cost_inr=round(total_cost, 2),
                    min_battery_reserve_pct=round(min_reserve, 1),
                    charging_stops=stops,
                    route_geometry=route_coords,
                )
            )

            if len(alternatives) >= 2:
                break

        return alternatives
