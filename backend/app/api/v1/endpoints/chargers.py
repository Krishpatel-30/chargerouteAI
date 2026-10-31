from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_optional
from app.models.user import User
from app.models.charger import ChargingStation
from app.models.vehicle import VehicleModel
from app.models.report import CommunityReport
from app.schemas.charger import (
    ChargingStationResponse,
    ChargingStationBase,
    RiskBreakdown,
    IndiaEVMetadataResponse,
)
from app.schemas.report import CommunityReportResponse, CommunityReportCreate
from app.services.charger_service import ChargerService
from app.services.risk_engine import RiskEngine
from app.services.backup_finder import BackupFinder
from app.services.india_ev_service import IndiaEVService

router = APIRouter()


@router.get("/metadata", response_model=IndiaEVMetadataResponse)
async def get_chargers_metadata(db: AsyncSession = Depends(get_db)):
    """
    Returns official Bureau of Energy Efficiency (BEE) dataset metadata,
    including snapshot date, attribution, and local vs upstream counts.
    """
    try:
        upstream_meta = await IndiaEVService.fetch_source_metadata()
    except Exception:
        upstream_meta = {
            "source_name": "EV Public Charging Stations Data till 26th October 2025",
            "publisher": "Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India",
            "snapshot_label": "till 26th October 2025",
            "attribution": "Data: Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India",
            "total_upstream_stations": 29184,
        }

    # Count local stations
    count_stmt = select(func.count(ChargingStation.id))
    local_count_res = await db.execute(count_stmt)
    local_count = local_count_res.scalar() or 0

    # Count states
    states_stmt = select(func.count(func.distinct(ChargingStation.state)))
    states_res = await db.execute(states_stmt)
    states_count = states_res.scalar() or 35

    return IndiaEVMetadataResponse(
        source_name=upstream_meta.get("source_name", "EV Public Charging Stations Data till 26th October 2025"),
        publisher=upstream_meta.get("publisher", "Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India"),
        snapshot_label=upstream_meta.get("snapshot_label", "till 26th October 2025"),
        attribution=upstream_meta.get("attribution", "Data: Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India"),
        total_stations_directory=upstream_meta.get("total_upstream_stations", 29184),
        total_stations_local_db=local_count,
        total_states_indexed=states_count,
        last_sync=datetime.now(timezone.utc),
    )


@router.get("/states")
async def get_states():
    """
    Returns 36 Indian states and union territories with station statistics.
    """
    states = await IndiaEVService.fetch_states()
    if not states:
        return [
            {"name": "Gujarat", "code": "GJ"},
            {"name": "Maharashtra", "code": "MH"},
            {"name": "Delhi", "code": "DL"},
            {"name": "Karnataka", "code": "KA"},
            {"name": "Tamil Nadu", "code": "TN"},
            {"name": "Rajasthan", "code": "RJ"},
            {"name": "Uttar Pradesh", "code": "UP"},
            {"name": "Haryana", "code": "HR"},
        ]
    return states


@router.get("/nearby", response_model=List[ChargingStationResponse])
async def get_nearby_chargers(
    lat: float = Query(..., ge=-90.0, le=90.0),
    lng: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(25.0, ge=1.0, le=150.0),
    current: Optional[str] = None, # "AC" or "DC"
    min_power_kw: Optional[float] = None,
    connector_type: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=150),
    db: AsyncSession = Depends(get_db),
):
    """
    Discovers charging stations within radius_km of the provided GPS coordinates.
    Supports AC/DC, power, connector, and vehicle compatibility filtering.
    """
    vehicle_connectors = None
    if vehicle_id:
        veh_stmt = select(VehicleModel).where(VehicleModel.id == vehicle_id)
        veh_res = await db.execute(veh_stmt)
        veh = veh_res.scalar_one_or_none()
        if veh:
            vehicle_connectors = veh.connector_types

    # First check database stations
    local_nearby = await ChargerService.get_all_stations(
        db=db,
        connector_type=connector_type,
        min_power_kw=min_power_kw,
        current=current,
        vehicle_connectors=vehicle_connectors,
        nearby_lat=lat,
        nearby_lng=lng,
        radius_km=radius_km,
    )

    # If few local stations found within radius, query upstream API to enrich live
    if len(local_nearby) < 5:
        try:
            upstream_near = await IndiaEVService.fetch_nearby_api(
                lat=lat,
                lng=lng,
                radius_km=radius_km,
                current=current,
                min_power_kw=min_power_kw,
                connector=connector_type,
                limit=limit,
            )
            if upstream_near:
                # Ingest into DB
                await IndiaEVService.import_stations_batch(db, upstream_near)
                # Re-query
                local_nearby = await ChargerService.get_all_stations(
                    db=db,
                    connector_type=connector_type,
                    min_power_kw=min_power_kw,
                    current=current,
                    vehicle_connectors=vehicle_connectors,
                    nearby_lat=lat,
                    nearby_lng=lng,
                    radius_km=radius_km,
                )
        except Exception:
            pass

    paged = local_nearby[:limit]
    responses = []
    for st in paged:
        risk = RiskEngine.calculate_station_risk(
            live_status=st.live_status,
            last_refresh=st.last_data_refresh,
            fault_reports_count=st.fault_report_count,
            total_plugs=st.total_plugs,
            access_restrictions=st.access_restrictions,
            opening_hours=st.opening_hours,
            nearby_backup_count=1,
        )
        res = ChargingStationResponse.model_validate(st)
        res.risk_assessment = risk
        res.distance_km = getattr(st, "distance_km", None)
        responses.append(res)

    return responses


@router.post("/sync-india-api")
async def sync_india_charging_stations(
    pages: int = Query(5, ge=1, le=50),
    page_size: int = Query(100, ge=10, le=100),
    db: AsyncSession = Depends(get_db),
):
    """
    Synchronizes public EV stations from the Bureau of Energy Efficiency API
    into the active database.
    """
    res = await IndiaEVService.sync_priority_hubs(db, pages=pages, page_size=page_size)
    return res


@router.get("", response_model=List[ChargingStationResponse])
async def list_chargers(
    connector_type: Optional[str] = None,
    min_power_kw: Optional[float] = None,
    operator: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    state_code: Optional[str] = None,
    current: Optional[str] = None, # AC or DC
    vehicle_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(300, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    vehicle_connectors = None
    if vehicle_id:
        veh_stmt = select(VehicleModel).where(VehicleModel.id == vehicle_id)
        veh_res = await db.execute(veh_stmt)
        veh = veh_res.scalar_one_or_none()
        if veh:
            vehicle_connectors = veh.connector_types

    stations = await ChargerService.get_all_stations(
        db=db,
        connector_type=connector_type,
        min_power_kw=min_power_kw,
        operator=operator,
        city=city,
        state=state,
        state_code=state_code,
        current=current,
        vehicle_connectors=vehicle_connectors,
        search=search,
    )

    # Paginate
    paged = stations[offset : offset + limit]

    # Attach dynamic risk calculations
    responses = []
    for st in paged:
        risk = RiskEngine.calculate_station_risk(
            live_status=st.live_status,
            last_refresh=st.last_data_refresh,
            fault_reports_count=st.fault_report_count,
            total_plugs=st.total_plugs,
            access_restrictions=st.access_restrictions,
            opening_hours=st.opening_hours,
            nearby_backup_count=1,
        )
        res = ChargingStationResponse.model_validate(st)
        res.risk_assessment = risk
        responses.append(res)

    return responses


@router.get("/{station_id}", response_model=ChargingStationResponse)
async def get_charger_detail(station_id: str, db: AsyncSession = Depends(get_db)):
    station = await ChargerService.get_station_by_id(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")

    all_stations = await ChargerService.get_all_stations(db)
    backups = BackupFinder.find_backups_for_stop(
        primary_station=station,
        all_candidate_stations=all_stations,
        vehicle_connector_types=["CCS2", "Type 2"],
        arrival_battery_pct=25.0,
        usable_battery_kwh=40.0,
        consumption_kwh_100km=15.0,
    )

    nearest_detour = backups[0].detour_km if backups else None
    risk = RiskEngine.calculate_station_risk(
        live_status=station.live_status,
        last_refresh=station.last_data_refresh,
        fault_reports_count=station.fault_report_count,
        total_plugs=station.total_plugs,
        access_restrictions=station.access_restrictions,
        opening_hours=station.opening_hours,
        nearby_backup_count=len(backups),
        nearest_backup_detour_km=nearest_detour,
    )

    resp = ChargingStationResponse.model_validate(station)
    resp.risk_assessment = risk
    return resp


@router.get("/{station_id}/reports", response_model=List[CommunityReportResponse])
async def get_station_reports(
    station_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CommunityReport)
        .where(CommunityReport.station_id == station_id)
        .order_by(desc(CommunityReport.created_at))
        .limit(20)
    )
    res = await db.execute(stmt)
    reports = res.scalars().all()
    return [CommunityReportResponse.model_validate(r) for r in reports]


@router.post("/{station_id}/reports", response_model=CommunityReportResponse)
async def submit_station_report(
    station_id: str,
    data: CommunityReportCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    station = await ChargerService.get_station_by_id(db, station_id)
    if not station:
        raise HTTPException(status_code=404, detail="Charging station not found")

    report = CommunityReport(
        station_id=station_id,
        user_id=current_user.id if current_user else None,
        problem_type=data.problem_type,
        is_operational=data.is_operational,
        successful_charge=data.successful_charge,
        comment=data.comment,
        photo_url=data.photo_url,
        status="approved",
        observed_at=data.observed_at or datetime.now(timezone.utc),
    )
    db.add(report)

    # If user reported an outage or not operational, update station stats
    if not data.is_operational or not data.successful_charge or data.problem_type in ["not_working", "connector_unavailable"]:
        station.fault_report_count = (station.fault_report_count or 0) + 1
        station.confidence_score = max(0.2, (station.confidence_score or 0.85) - 0.15)
        if station.fault_report_count >= 3:
            station.live_status = "offline"
    else:
        # Successful charge confirms operational status
        station.last_successful_verification = datetime.now(timezone.utc)
        station.confidence_score = min(0.99, (station.confidence_score or 0.85) + 0.05)
        station.live_status = "operational"

    station.last_data_refresh = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(report)

    return CommunityReportResponse.model_validate(report)
