from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import json

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.trip import Trip
from app.schemas.trip import (
    TripPlanRequest,
    TripPlanResponse,
    TripSaveRequest,
    TripResponse,
)
from app.services.trip_planner import TripPlanner

router = APIRouter()
planner = TripPlanner()


@router.post("/plan", response_model=TripPlanResponse)
async def plan_trip(
    request: TripPlanRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        response = await planner.plan_trip(db=db, request=request)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trip planning calculation failed: {str(e)}")


@router.post("/save", response_model=TripResponse)
async def save_trip(
    data: TripSaveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    plan = data.plan_data
    trip = Trip(
        user_id=current_user.id,
        title=data.title or plan.get("title", "Saved Trip"),
        origin_name=plan.get("origin_name", ""),
        origin_lat=plan.get("origin_lat", 0.0),
        origin_lng=plan.get("origin_lng", 0.0),
        destination_name=plan.get("destination_name", ""),
        destination_lat=plan.get("destination_lat", 0.0),
        destination_lng=plan.get("destination_lng", 0.0),
        vehicle_id=plan.get("vehicle_id"),
        vehicle_name=plan.get("vehicle_name"),
        start_battery_pct=plan.get("start_battery_pct", 90.0),
        min_arrival_battery_pct=plan.get("min_arrival_battery_pct", 15.0),
        preference=plan.get("preference", "lowest_risk"),
        total_distance_km=plan.get("total_distance_km", 0.0),
        total_driving_time_min=plan.get("total_driving_time_min", 0.0),
        total_charging_time_min=plan.get("total_charging_time_min", 0.0),
        total_duration_min=plan.get("total_duration_min", 0.0),
        total_energy_kwh=plan.get("total_energy_kwh", 0.0),
        estimated_cost_inr=plan.get("estimated_cost_inr", 0.0),
        min_battery_reserve_pct=plan.get("min_battery_reserve_pct", 15.0),
        overall_risk_score=plan.get("overall_risk_score", 15.0),
        overall_risk_category=plan.get("overall_risk_category", "Low Risk"),
        route_geometry=plan.get("route_geometry", []),
        waypoints=plan.get("waypoints", []),
        charging_stops=plan.get("charging_stops", []),
        backup_stops=[s.get("primary_backup") for s in plan.get("charging_stops", []) if s.get("primary_backup")],
        assumptions=plan.get("assumptions", {}),
    )
    db.add(trip)
    await db.commit()
    await db.refresh(trip)
    return TripResponse.model_validate(trip)


@router.get("/user/saved", response_model=List[TripResponse])
async def list_user_trips(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Trip)
        .where(Trip.user_id == current_user.id)
        .order_by(desc(Trip.created_at))
    )
    res = await db.execute(stmt)
    trips = res.scalars().all()
    return [TripResponse.model_validate(t) for t in trips]


@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Trip).where(Trip.id == trip_id)
    res = await db.execute(stmt)
    trip = res.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Saved trip not found")
    return TripResponse.model_validate(trip)


@router.delete("/user/{trip_id}", status_code=204)
async def delete_user_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Trip).where(Trip.id == trip_id, Trip.user_id == current_user.id)
    res = await db.execute(stmt)
    trip = res.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found or unauthorized")
    await db.delete(trip)
    await db.commit()
    return None
