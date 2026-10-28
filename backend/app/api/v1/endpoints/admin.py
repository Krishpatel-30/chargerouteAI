from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timezone, timedelta

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user_optional
from app.models.user import User
from app.models.charger import ChargingStation
from app.models.report import CommunityReport
from app.schemas.report import CommunityReportResponse, CommunityReportUpdate
from app.core.config import settings

router = APIRouter()


@router.get("/reports", response_model=List[CommunityReportResponse])
async def list_reports_admin(
    status_filter: str = "all",
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CommunityReport).order_by(desc(CommunityReport.created_at))
    if status_filter != "all":
        stmt = stmt.where(CommunityReport.status == status_filter)
    res = await db.execute(stmt)
    reports = res.scalars().all()
    return [CommunityReportResponse.model_validate(r) for r in reports]


@router.patch("/reports/{report_id}", response_model=CommunityReportResponse)
async def update_report_status(
    report_id: str,
    data: CommunityReportUpdate,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CommunityReport).where(CommunityReport.id == report_id)
    res = await db.execute(stmt)
    report = res.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.status = data.status
    await db.commit()
    await db.refresh(report)
    return CommunityReportResponse.model_validate(report)


@router.get("/data-quality")
async def get_data_quality_metrics(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    # 1. Total stations count
    total_st_res = await db.execute(select(func.count(ChargingStation.id)))
    total_stations = total_st_res.scalar() or 0

    # 2. Stale stations (> 48 hours without telemetry or verification)
    now = datetime.now(timezone.utc)
    threshold = now - timedelta(hours=48)
    stale_res = await db.execute(
        select(func.count(ChargingStation.id)).where(ChargingStation.last_data_refresh < threshold)
    )
    stale_count = stale_res.scalar() or 0

    # 3. Operational status breakdown
    status_counts = {}
    for st_status in ["operational", "partially_available", "offline", "unknown"]:
        c_res = await db.execute(
            select(func.count(ChargingStation.id)).where(ChargingStation.live_status == st_status)
        )
        status_counts[st_status] = c_res.scalar() or 0

    # 4. Reports pending moderation
    pending_rep_res = await db.execute(
        select(func.count(CommunityReport.id)).where(CommunityReport.status == "pending")
    )
    pending_reports = pending_rep_res.scalar() or 0

    return {
        "total_stations": total_stations,
        "stale_stations_count": stale_count,
        "stale_percentage": round((stale_count / max(1, total_stations)) * 100, 1),
        "status_distribution": status_counts,
        "pending_moderation_reports": pending_reports,
        "active_corridors": ["NE-1 Ahmedabad-Vadodara", "NH-48 Surat Corridor", "NH-27 Saurashtra Corridor"],
        "data_freshness_policy": "Station data older than 24h incurs risk scoring penalties",
    }


@router.get("/provider-status")
async def get_provider_status() -> Dict[str, Any]:
    return {
        "routing_provider": {
            "name": "OSRM (Open Source Routing Machine)",
            "endpoint": settings.OSRM_ROUTING_URL,
            "status": "healthy",
            "fallback_engine": "Geometric Highway Corridor Interpolator (Gujarat Corridors Active)",
        },
        "charger_data_provider": {
            "name": "Open Charge Map + Verified Seed Corridor Store",
            "api_key_configured": bool(settings.OPEN_CHARGE_MAP_API_KEY),
            "status": "operational",
            "local_seed_active": True,
        },
        "risk_engine": {
            "name": "Rule-Based Explainable Risk Scorer v1",
            "status": "active",
            "factors_count": 7,
        },
    }
