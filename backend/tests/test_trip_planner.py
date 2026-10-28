import pytest
import pytest_asyncio
from app.core.database import AsyncSessionLocal
from app.services.trip_planner import TripPlanner
from app.schemas.trip import TripPlanRequest
from sqlalchemy import select
from app.models.vehicle import VehicleModel


@pytest.mark.asyncio
async def test_trip_planner_simulation():
    async with AsyncSessionLocal() as db:
        # Get an EV model from seed
        res = await db.execute(select(VehicleModel).where(VehicleModel.manufacturer == "Tata"))
        vehicle = res.scalars().first()
        assert vehicle is not None

        planner = TripPlanner()

        # Plan trip from Ahmedabad to Surat (~260 km)
        request = TripPlanRequest(
            origin_name="Ahmedabad, Gujarat",
            origin_lat=23.0225,
            origin_lng=72.5714,
            destination_name="Surat, Gujarat",
            destination_lat=21.1702,
            destination_lng=72.8311,
            vehicle_id=vehicle.id,
            start_battery_pct=85.0,
            min_arrival_battery_pct=15.0,
            preference="lowest_risk",
        )

        response = await planner.plan_trip(db=db, request=request)

        assert response.total_distance_km > 200.0
        assert response.total_driving_time_min > 120.0
        assert len(response.route_geometry) > 10
        assert 0.0 <= response.overall_risk_score <= 100.0
        assert response.overall_risk_category in ["Low Risk", "Moderate Risk", "Elevated Risk"]

        # For a ~260km trip with 85% starting battery on a ~300km car, at least one safe charging stop or high confidence arrival
        if response.charging_stops:
            stop = response.charging_stops[0]
            assert stop.station_name is not None
            assert stop.energy_added_kwh > 0
            assert stop.charging_duration_min > 0
            assert stop.station_risk.score >= 0.0

        # Alternatives comparison should be populated
        assert len(response.alternatives) >= 1
