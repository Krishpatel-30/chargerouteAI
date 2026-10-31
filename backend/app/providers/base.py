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


class LocationResult(BaseModel):
    id: str
    name: str
    display_name: str
    category: str = "location"  # village, town, city, landmark, etc.
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = "India"
    country: str = "India"
    latitude: float
    longitude: float
    provider: str  # google_maps, nominatim, india_directory
    place_id: Optional[str] = None


class GeocodingProvider(ABC):
    @abstractmethod
    async def search(self, query: str, limit: int = 8) -> List[LocationResult]:
        """Searches for locations/villages matching a query."""
        pass

    @abstractmethod
    async def reverse(self, lat: float, lng: float) -> Optional[LocationResult]:
        """Reverse geocodes coordinates to a location/village description."""
        pass

