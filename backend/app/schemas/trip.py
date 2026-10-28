from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.charger import RiskBreakdown


class WaypointInput(BaseModel):
    name: str
    lat: float
    lng: float


class TripPlanRequest(BaseModel):
    origin_name: str
    origin_lat: float
    origin_lng: float
    
    destination_name: str
    destination_lat: float
    destination_lng: float
    
    vehicle_id: str
    start_battery_pct: float = Field(90.0, ge=10.0, le=100.0)
    min_arrival_battery_pct: float = Field(15.0, ge=5.0, le=50.0)
    
    preference: str = Field("lowest_risk", json_schema_extra={"example": "lowest_risk"})
    waypoints: List[WaypointInput] = Field(default_factory=list)
    
    highway_factor: float = Field(1.15, ge=0.8, le=1.5)
    ac_factor: float = Field(1.10, ge=0.9, le=1.4)
    departure_time: Optional[datetime] = None


class BackupStopCandidate(BaseModel):
    station_id: str
    name: str
    operator: str
    latitude: float
    longitude: float
    detour_km: float
    detour_time_min: float
    max_power_kw: float
    live_status: str
    risk_score: float
    risk_category: str
    feasibility_notes: str


class ChargingStopDetail(BaseModel):
    stop_number: int
    station_id: str
    station_name: str
    operator: str
    latitude: float
    longitude: float
    distance_from_start_km: float
    segment_distance_km: float
    arrival_battery_pct: float
    target_departure_battery_pct: float
    energy_added_kwh: float
    charging_duration_min: float
    charging_power_kw: float
    estimated_cost_inr: float
    station_risk: RiskBreakdown
    primary_backup: Optional[BackupStopCandidate] = None
    all_backups: List[BackupStopCandidate] = Field(default_factory=list)


class TripAlternativeSummary(BaseModel):
    route_id: str
    name: str
    description: str
    total_distance_km: float
    total_driving_time_min: float
    total_charging_time_min: float
    total_duration_min: float
    charging_stops_count: int
    overall_risk_score: float
    overall_risk_category: str
    estimated_cost_inr: float
    min_battery_reserve_pct: float
    charging_stops: List[ChargingStopDetail]
    route_geometry: List[List[float]]


class TripPlanResponse(BaseModel):
    trip_id: Optional[str] = None
    title: str
    origin_name: str
    destination_name: str
    vehicle_name: str
    vehicle_battery_usable_kwh: float
    
    total_distance_km: float
    total_driving_time_min: float
    total_charging_time_min: float
    total_duration_min: float
    total_energy_kwh: float
    estimated_cost_inr: float
    min_battery_reserve_pct: float
    
    overall_risk_score: float
    overall_risk_category: str
    risk_breakdown: RiskBreakdown
    
    charging_stops: List[ChargingStopDetail]
    route_geometry: List[List[float]]
    
    alternatives: List[TripAlternativeSummary] = Field(default_factory=list)
    
    assumptions: Dict[str, Any]
    warnings: List[str] = Field(default_factory=list)


class TripSaveRequest(BaseModel):
    title: str
    plan_data: Dict[str, Any]


class TripResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    vehicle_name: Optional[str] = None
    total_distance_km: float
    total_driving_time_min: float
    total_charging_time_min: float
    total_duration_min: float
    overall_risk_score: float
    overall_risk_category: str
    charging_stops: List[Any]
    backup_stops: List[Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
