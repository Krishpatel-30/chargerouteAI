"""
Location & Village Geocoding API Endpoints for Pan-India EV Trip Planning.

Exposes Google Maps Platform and national geocoding services across India.
"""

from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from app.providers.base import LocationResult
from app.providers.geocoding import geocoding_service, INDIA_LOCATIONS_DIRECTORY

router = APIRouter()


@router.get("/config")
async def get_geocoding_config():
    """Returns geocoding capability and active provider metadata."""
    has_gmap = geocoding_service.has_google_maps_configured()
    return {
        "has_google_maps_configured": has_gmap,
        "primary_provider": "google_maps" if has_gmap else "pan_india_geocoder",
        "description": "Google Maps Platform Geocoding + Comprehensive Pan-India National Directory",
        "total_rural_locations_indexed": len(INDIA_LOCATIONS_DIRECTORY),
    }


@router.get("/search", response_model=List[LocationResult])
async def search_locations(
    q: str = Query(..., min_length=1, description="City, town, village, or highway hub anywhere in India"),
    limit: int = Query(8, ge=1, le=20, description="Maximum number of search results to return"),
):
    """
    Search for locations across all 28 states and UTs in India.
    Uses Google Maps Geocoding if configured, with resilient fallback to
    OpenStreetMap and the offline Indian location directory.
    """
    if not q or not q.strip():
        return []
    
    results = await geocoding_service.search(query=q.strip(), limit=limit)
    return results


@router.get("/reverse", response_model=Optional[LocationResult])
async def reverse_geocode(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    lng: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
):
    """
    Reverse geocodes coordinates to a recognizable Indian location or landmark.
    """
    result = await geocoding_service.reverse(lat=lat, lng=lng)
    return result


@router.get("/popular-villages", response_model=List[LocationResult])
async def get_popular_villages():
    """
    Returns curated popular EV road trip destinations, expressways hubs, and tourism spots across India.
    """
    featured_names = [
        "New Delhi",
        "Mumbai",
        "Bengaluru",
        "Hyderabad",
        "Kolkata",
        "Ahmedabad",
        "Sasan Gir",
        "Dholera",
        "Agra",
        "Jaipur",
        "Pune",
        "Lonavala",
        "Mysuru",
        "Panaji",
        "Kochi",
        "Kevadia (Statue of Unity)",
        "Ooty",
        "Puducherry",
    ]
    popular = []
    for entry in INDIA_LOCATIONS_DIRECTORY:
        if entry["name"] in featured_names:
            popular.append(
                LocationResult(
                    id=f"feat_{entry['name'].replace(' ', '_').lower()}",
                    name=f"{entry['name']}, {entry.get('district', '')}, {entry.get('state', 'India')}",
                    display_name=f"{entry['name']}, {entry.get('district', '')}, {entry.get('state', 'India')}",
                    category=entry.get("category", "hub"),
                    village=entry["name"],
                    district=entry.get("district"),
                    state=entry.get("state", "India"),
                    country="India",
                    latitude=entry["lat"],
                    longitude=entry["lng"],
                    provider="india_directory",
                )
            )
    return popular
