import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "ChargeRoute AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "chargeroute-super-secret-key-change-in-production-2026-gujarat"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    # Defaults to SQLite async for local zero-config execution, overrides to PostgreSQL if DATABASE_URL is set
    DATABASE_URL: str = "sqlite+aiosqlite:///./voltplan.db"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Third-Party Provider Adapters
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    OPEN_CHARGE_MAP_API_KEY: Optional[str] = None
    OSRM_ROUTING_URL: str = "https://router.project-osrm.org"
    
    # Trip Planning Defaults
    DEFAULT_MIN_RESERVE_PERCENT: float = 15.0
    HIGHWAY_SPEED_FACTOR: float = 1.15  # 15% higher consumption at 100+ km/h
    AC_CLIMATE_FACTOR: float = 1.10     # 10% higher consumption for Indian summer HVAC
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
