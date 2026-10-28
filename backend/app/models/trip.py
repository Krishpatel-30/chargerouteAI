import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    
    # Origin & Destination
    origin_name = Column(String(255), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    
    destination_name = Column(String(255), nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    
    # Vehicle parameters at plan time
    vehicle_id = Column(String(36), ForeignKey("vehicle_models.id", ondelete="SET NULL"), nullable=True)
    vehicle_name = Column(String(150), nullable=True)
    start_battery_pct = Column(Float, nullable=False, default=90.0)
    min_arrival_battery_pct = Column(Float, nullable=False, default=15.0)
    preference = Column(String(50), default="lowest_risk") # "fastest", "lowest_risk", "lowest_cost", "more_alternatives"
    
    # Summary Metrics
    total_distance_km = Column(Float, nullable=False)
    total_driving_time_min = Column(Float, nullable=False)
    total_charging_time_min = Column(Float, nullable=False)
    total_duration_min = Column(Float, nullable=False)
    total_energy_kwh = Column(Float, nullable=False, default=0.0)
    estimated_cost_inr = Column(Float, nullable=False, default=0.0)
    min_battery_reserve_pct = Column(Float, nullable=False, default=15.0)
    
    # Overall Risk
    overall_risk_score = Column(Float, nullable=False, default=15.0) # 0 to 100
    overall_risk_category = Column(String(50), nullable=False, default="Low Risk")
    
    # Detailed payloads
    route_geometry = Column(JSON, nullable=False) # GeoJSON LineString coordinates [[lng, lat], ...]
    waypoints = Column(JSON, nullable=True)
    charging_stops = Column(JSON, nullable=False) # list of planned charging stops with battery in/out, dwell time, risk
    backup_stops = Column(JSON, nullable=False)   # list of backup candidates for each planned stop
    assumptions = Column(JSON, nullable=False)    # environmental, speed, and consumption assumptions
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="saved_trips")
