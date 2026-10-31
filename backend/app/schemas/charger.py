from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ConnectorDetail(BaseModel):
    type: str # e.g. "CCS2", "Type 2", "Bharat DC-001"
    power_kw: float
    count: int = 1


class ChargingStationBase(BaseModel):
    name: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    address: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    state: str = "Gujarat"
    state_code: Optional[str] = None
    country: str = "India"
    operator: str
    connector_types: List[Dict[str, Any]] = Field(default_factory=list)
    currents: Optional[List[str]] = Field(default_factory=list)
    standards: Optional[List[str]] = Field(default_factory=list)
    vehicle_classes: Optional[List[str]] = Field(default_factory=list)
    total_plugs: int = 2
    max_power_kw: float = 50.0
    access_restrictions: str = "Public 24/7"
    opening_hours: str = "24/7"
    payment_network: str = "App / RFID / UPI"
    live_status: str = "unknown"
    source_provider: str = "Verified Corridor Seed"
    dataset_snapshot: Optional[str] = "till 26th October 2025"
    external_url: Optional[str] = None
    distance_km: Optional[float] = None


class ChargingStationCreate(ChargingStationBase):
    external_id: Optional[str] = None


class RiskBreakdown(BaseModel):
    score: float # 0 to 100
    category: str # "Low Risk", "Moderate Risk", "Elevated Risk"
    confidence_label: str
    contributing_factors: List[str]
    backup_count: int
    nearest_backup_detour_km: Optional[float] = None
    staleness_hours: float
    operational_status_weight: str


class ChargingStationResponse(ChargingStationBase):
    id: str
    external_id: Optional[str] = None
    last_data_refresh: datetime
    last_successful_verification: Optional[datetime] = None
    fault_report_count: int = 0
    confidence_score: float = 0.85
    created_at: datetime
    
    risk_assessment: Optional[RiskBreakdown] = None

    model_config = ConfigDict(from_attributes=True)


class ChargingStationFilterParams(BaseModel):
    min_power_kw: Optional[float] = None
    connector_type: Optional[str] = None
    operator: Optional[str] = None
    city: Optional[str] = None
    max_risk_category: Optional[str] = None
    search: Optional[str] = None


class IndiaEVMetadataResponse(BaseModel):
    source_name: str
    publisher: str
    snapshot_label: str
    attribution: str
    total_stations_directory: int
    total_stations_local_db: int
    total_states_indexed: int
    last_sync: Optional[datetime] = None
    dataset_disclaimer: str = (
        "Dataset republished from the official Bureau of Energy Efficiency (BEE), "
        "Ministry of Power, Government of India. Historical government directory records "
        "are displayed with explainable risk ratings and are not live socket telemetry."
    )
