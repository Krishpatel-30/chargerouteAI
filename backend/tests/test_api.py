import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_check_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_vehicles_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/vehicles")
        assert resp.status_code == 200
        vehicles = resp.json()
        assert len(vehicles) >= 8
        first_veh = vehicles[0]
        assert "manufacturer" in first_veh
        assert "usable_battery_capacity_kwh" in first_veh


@pytest.mark.asyncio
async def test_chargers_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/chargers?city=Ahmedabad")
        assert resp.status_code == 200
        chargers = resp.json()
        assert len(chargers) >= 1
        st = chargers[0]
        assert "risk_assessment" in st
        assert st["risk_assessment"]["category"] in ["Low Risk", "Moderate Risk", "Elevated Risk"]


@pytest.mark.asyncio
async def test_plan_trip_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Get a vehicle id
        veh_resp = await ac.get("/api/v1/vehicles")
        vehicle_id = veh_resp.json()[0]["id"]

        plan_payload = {
            "origin_name": "Ahmedabad",
            "origin_lat": 23.0225,
            "origin_lng": 72.5714,
            "destination_name": "Vadodara",
            "destination_lat": 22.3072,
            "destination_lng": 73.1812,
            "vehicle_id": vehicle_id,
            "start_battery_pct": 90.0,
            "min_arrival_battery_pct": 15.0,
            "preference": "lowest_risk",
        }
        resp = await ac.post("/api/v1/trips/plan", json=plan_payload)
        assert resp.status_code == 200
        trip = resp.json()
        assert trip["origin_name"] == "Ahmedabad"
        assert trip["total_distance_km"] > 80.0
        assert "overall_risk_score" in trip
