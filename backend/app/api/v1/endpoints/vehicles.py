from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.vehicle import VehicleModel, UserVehicle
from app.schemas.vehicle import (
    VehicleModelResponse,
    VehicleModelCreate,
    UserVehicleCreate,
    UserVehicleResponse,
)

router = APIRouter()


@router.get("", response_model=List[VehicleModelResponse])
async def list_vehicles(
    manufacturer: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(VehicleModel)
    if manufacturer:
        stmt = stmt.where(VehicleModel.manufacturer.ilike(f"%{manufacturer}%"))
    stmt = stmt.order_by(VehicleModel.manufacturer.asc(), VehicleModel.model.asc())
    res = await db.execute(stmt)
    vehicles = res.scalars().all()
    return [VehicleModelResponse.model_validate(v) for v in vehicles]


@router.get("/{vehicle_id}", response_model=VehicleModelResponse)
async def get_vehicle(vehicle_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(VehicleModel).where(VehicleModel.id == vehicle_id)
    res = await db.execute(stmt)
    vehicle = res.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle model not found")
    return VehicleModelResponse.model_validate(vehicle)


@router.post("/custom", response_model=VehicleModelResponse)
async def create_custom_vehicle(
    data: VehicleModelCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    vehicle = VehicleModel(
        manufacturer=data.manufacturer.strip(),
        model=data.model.strip(),
        model_year=data.model_year,
        battery_capacity_kwh=data.battery_capacity_kwh,
        usable_battery_capacity_kwh=data.usable_battery_capacity_kwh,
        consumption_kwh_100km=data.consumption_kwh_100km,
        connector_types=data.connector_types,
        max_ac_power_kw=data.max_ac_power_kw,
        max_dc_power_kw=data.max_dc_power_kw,
        charging_curve=data.charging_curve,
        range_reference_km=data.range_reference_km,
        source=f"Custom Profile: {data.source}",
        is_custom=True,
        created_by_user_id=current_user.id if current_user else None,
    )
    db.add(vehicle)
    await db.commit()
    await db.refresh(vehicle)
    return VehicleModelResponse.model_validate(vehicle)


@router.get("/user/garage", response_model=List[UserVehicleResponse])
async def get_user_garage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(UserVehicle)
        .where(UserVehicle.user_id == current_user.id)
        .options(selectinload(UserVehicle.vehicle_model))
    )
    res = await db.execute(stmt)
    user_vehicles = res.scalars().all()
    return [UserVehicleResponse.model_validate(uv) for uv in user_vehicles]


@router.post("/user/garage", response_model=UserVehicleResponse)
async def add_to_garage(
    item: UserVehicleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    veh_stmt = select(VehicleModel).where(VehicleModel.id == item.vehicle_model_id)
    veh_res = await db.execute(veh_stmt)
    vehicle = veh_res.scalar_one_or_none()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle model not found")

    user_veh = UserVehicle(
        user_id=current_user.id,
        vehicle_model_id=vehicle.id,
        custom_nickname=item.custom_nickname,
        custom_consumption_multiplier=item.custom_consumption_multiplier,
    )
    db.add(user_veh)
    await db.commit()
    await db.refresh(user_veh)
    
    # Reload with vehicle_model
    stmt = (
        select(UserVehicle)
        .where(UserVehicle.id == user_veh.id)
        .options(selectinload(UserVehicle.vehicle_model))
    )
    res = await db.execute(stmt)
    loaded = res.scalar_one()
    return UserVehicleResponse.model_validate(loaded)
