from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class VehicleModelBase(BaseModel):
    manufacturer: str = Field(..., json_schema_extra={"example": "Tata"})
    model: str = Field(..., json_schema_extra={"example": "Nexon EV Long Range"})
    model_year: int = Field(2024, json_schema_extra={"example": 2024})
    battery_capacity_kwh: float = Field(..., gt=0, json_schema_extra={"example": 40.5})
    usable_battery_capacity_kwh: float = Field(..., gt=0, json_schema_extra={"example": 38.0})
    consumption_kwh_100km: float = Field(..., gt=0, json_schema_extra={"example": 15.5})
    connector_types: List[str] = Field(default_factory=lambda: ["CCS2", "Type 2"])
    max_ac_power_kw: float = Field(7.2, gt=0)
    max_dc_power_kw: float = Field(50.0, gt=0)
    charging_curve: Optional[Dict[str, Any]] = None
    range_reference_km: float = Field(..., gt=0, json_schema_extra={"example": 320.0})
    source: str = Field("Manufacturer official specifications")


class VehicleModelCreate(VehicleModelBase):
    is_custom: bool = True


class VehicleModelResponse(VehicleModelBase):
    id: str
    is_custom: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserVehicleCreate(BaseModel):
    vehicle_model_id: str
    custom_nickname: Optional[str] = None
    custom_consumption_multiplier: float = Field(1.0, ge=0.5, le=2.0)


class UserVehicleResponse(BaseModel):
    id: str
    user_id: str
    vehicle_model_id: str
    custom_nickname: Optional[str] = None
    custom_consumption_multiplier: float = 1.0
    created_at: datetime
    vehicle_model: VehicleModelResponse

    model_config = ConfigDict(from_attributes=True)
