import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class CommunityReport(Base):
    __tablename__ = "community_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    station_id = Column(String(36), ForeignKey("charging_stations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Problem categories
    # "working", "not_working", "connector_unavailable", "station_inaccessible", "charger_occupied", "pricing_issue", "other"
    problem_type = Column(String(50), nullable=False)
    is_operational = Column(Boolean, nullable=False, default=True)
    successful_charge = Column(Boolean, nullable=False, default=True)
    comment = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    
    # Moderation state: "approved", "pending", "flagged"
    status = Column(String(50), default="approved", index=True)
    observed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    station = relationship("ChargingStation", back_populates="reports")
    user = relationship("User", back_populates="reports")
