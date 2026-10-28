from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_optional
from app.models.user import User
from app.models.charger import ChargingStation
from app.models.report import CommunityReport
from app.schemas.charger import (
    ChargingStationResponse,
    ChargingStationBase,
    RiskBreakdown,
)
from app.schemas.report import CommunityReportResponse, CommunityReportCreate
from app.services.charger_service import ChargerService
from app.services.risk_engine import RiskEngine
from app.services.backup_finder import BackupFinder

router = APIRouter()


@router.get("", response_model=List[ChargingStationResponse])
async def list_chargers(
    connector_type: Optional[str] = None,
    min_power_kw: Optional[float] = None,
    operator: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    stations = await ChargerService.get_all_stations(
        db=db,
        connector_type=connector_type,
        min_power_kw=min_power_kw,
        operator=operator,
        city=city,
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
            nearby_backup_count=1, # approximate default for listing
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
