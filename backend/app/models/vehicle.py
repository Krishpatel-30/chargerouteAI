import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class VehicleModel(Base):
    __tablename__ = "vehicle_models"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    manufacturer = Column(String(100), index=True, nullable=False)
    model = Column(String(100), index=True, nullable=False)
    model_year = Column(Integer, nullable=False, default=2024)
    
    # Battery specifications
    battery_capacity_kwh = Column(Float, nullable=False)        # Gross capacity
    usable_battery_capacity_kwh = Column(Float, nullable=False) # Usable capacity
    consumption_kwh_100km = Column(Float, nullable=False)       # Reference consumption
    
    # Connectors and charging capabilities
    connector_types = Column(JSON, nullable=False, default=list) # e.g. ["CCS2", "Type 2"]
    max_ac_power_kw = Column(Float, nullable=False, default=7.4)
    max_dc_power_kw = Column(Float, nullable=False, default=50.0)
    
    # Detailed curves & estimates
    charging_curve = Column(JSON, nullable=True) # Optional power step points
    range_reference_km = Column(Float, nullable=False) # Real-world reference range
    
    # Source attribution
    source = Column(String(255), nullable=False, default="Manufacturer official specifications")
    is_custom = Column(Boolean, default=False)
    created_by_user_id = Column(String(36), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user_vehicles = relationship("UserVehicle", back_populates="vehicle_model")


class UserVehicle(Base):
    __tablename__ = "user_vehicles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vehicle_model_id = Column(String(36), ForeignKey("vehicle_models.id", ondelete="CASCADE"), nullable=False)
    custom_nickname = Column(String(100), nullable=True)
    custom_consumption_multiplier = Column(Float, default=1.0) # e.g. 1.05 for roof racks/style
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="user_vehicles")
    vehicle_model = relationship("VehicleModel", back_populates="user_vehicles")
