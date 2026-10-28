from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CommunityReportCreate(BaseModel):
    station_id: str
    problem_type: str = Field(..., json_schema_extra={"example": "connector_unavailable"})
    is_operational: bool = True
    successful_charge: bool = True
    comment: Optional[str] = Field(None, max_length=1000)
    photo_url: Optional[str] = None
    observed_at: Optional[datetime] = None


class CommunityReportUpdate(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "approved"})


class CommunityReportResponse(BaseModel):
    id: str
    station_id: str
    user_id: Optional[str] = None
    problem_type: str
    is_operational: bool
    successful_charge: bool
    comment: Optional[str] = None
    photo_url: Optional[str] = None
    status: str
    observed_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
