"""
Provider Adapter Base Interfaces.

Provides decoupling between business logic and third-party mapping / charging APIs.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class RouteGeometryResult(BaseModel):
    distance_km: float
    duration_min: float
    coordinates: List[List[float]] # GeoJSON format: [[lng, lat], ...]
    steps: List[Dict[str, Any]] = []


class RoutingProvider(ABC):
    @abstractmethod
    async def get_route(
        self,
        origin_lat: float,
        origin_lng: float,
        dest_lat: float,
        dest_lng: float,
        waypoints: Optional[List[Dict[str, float]]] = None,
    ) -> RouteGeometryResult:
        """Calculates road route geometry, distance and travel time."""
        pass


class ChargerDataProvider(ABC):
    @abstractmethod
    async def fetch_nearby_chargers(
        self,
        lat: float,
        lng: float,
        radius_km: float = 25.0,
    ) -> List[Dict[str, Any]]:
        """Discovers charging stations near a geographic point."""
        pass
