import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChargingStation(Base):
    __tablename__ = "charging_stations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    external_id = Column(String(100), index=True, nullable=True)
    name = Column(String(255), nullable=False)
    
    # Geolocation
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), index=True, nullable=True)
    district = Column(String(100), index=True, nullable=True)
    state = Column(String(100), index=True, nullable=False, default="Gujarat")
    state_code = Column(String(10), index=True, nullable=True)
    country = Column(String(100), nullable=False, default="India")
    
    # Operator & Hardware
    operator = Column(String(100), index=True, nullable=False) # e.g. "Tata Power", "Jio-bp pulse", "Statiq"
    connector_types = Column(JSON, nullable=False, default=list) # e.g. [{"type": "CCS2", "power_kw": 60, "count": 2}]
    currents = Column(JSON, nullable=True, default=list) # e.g. ["AC", "DC"]
    standards = Column(JSON, nullable=True, default=list) # e.g. ["CCS2", "Type 2"]
    vehicle_classes = Column(JSON, nullable=True, default=list) # e.g. ["car", "two_wheeler"]
    total_plugs = Column(Integer, default=2)
    max_power_kw = Column(Float, default=50.0)
    
    # Access and Operations
    access_restrictions = Column(String(100), default="Public 24/7")
    opening_hours = Column(String(100), default="24/7")
    payment_network = Column(String(100), default="App / RFID / UPI")
    
    # Operational Status
    # Values: "operational", "partially_available", "offline", "unknown", "verified_directory"
    live_status = Column(String(50), default="unknown", index=True)
    source_provider = Column(String(100), default="Verified Corridor Seed")
    dataset_snapshot = Column(String(100), nullable=True, default="till 26th October 2025")
    
    # Timestamps & Data Integrity
    last_data_refresh = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_successful_verification = Column(DateTime, nullable=True)
    fault_report_count = Column(Integer, default=0)
    confidence_score = Column(Float, default=0.85) # 0.0 to 1.0
    external_url = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    reports = relationship("CommunityReport", back_populates="station", cascade="all, delete-orphan")
