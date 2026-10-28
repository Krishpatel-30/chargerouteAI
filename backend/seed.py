"""
Database Seeding Script.

Loads realistic EV vehicle models and high-density Gujarat highway charging stations
into the active database.
"""

import json
import os
import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import AsyncSessionLocal, Base, engine
from app.models.vehicle import VehicleModel
from app.models.charger import ChargingStation
from app.models.user import User
from app.core.security import get_password_hash


async def seed_database():
    # 1. Create tables if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if vehicles already seeded
        veh_count = (await db.execute(select(func.count(VehicleModel.id)))).scalar() or 0
        if veh_count == 0:
            veh_path = os.path.join(os.path.dirname(__file__), "app", "data", "seed_vehicles.json")
            if os.path.exists(veh_path):
                with open(veh_path, "r", encoding="utf-8") as f:
                    vehicles_data = json.load(f)
                for v in vehicles_data:
                    veh_obj = VehicleModel(
                        manufacturer=v["manufacturer"],
                        model=v["model"],
                        model_year=v.get("model_year", 2024),
                        battery_capacity_kwh=v["battery_capacity_kwh"],
                        usable_battery_capacity_kwh=v["usable_battery_capacity_kwh"],
                        consumption_kwh_100km=v["consumption_kwh_100km"],
                        connector_types=v.get("connector_types", ["CCS2"]),
                        max_ac_power_kw=v.get("max_ac_power_kw", 7.2),
                        max_dc_power_kw=v.get("max_dc_power_kw", 50.0),
                        charging_curve=v.get("charging_curve"),
                        range_reference_km=v.get("range_reference_km", 300.0),
                        source=v.get("source", "Manufacturer Spec"),
                        is_custom=False,
                    )
                    db.add(veh_obj)
                print(f"[Seed] Added {len(vehicles_data)} EV models.")

        # Check if chargers already seeded
        charger_count = (await db.execute(select(func.count(ChargingStation.id)))).scalar() or 0
        if charger_count == 0:
            charger_path = os.path.join(os.path.dirname(__file__), "app", "data", "seed_chargers.json")
            if os.path.exists(charger_path):
                with open(charger_path, "r", encoding="utf-8") as f:
                    chargers_data = json.load(f)
                for c in chargers_data:
                    ch_obj = ChargingStation(
                        external_id=c.get("external_id"),
                        name=c["name"],
                        latitude=c["latitude"],
                        longitude=c["longitude"],
                        address=c.get("address"),
                        city=c.get("city"),
                        state=c.get("state", "Gujarat"),
                        country=c.get("country", "India"),
                        operator=c["operator"],
                        connector_types=c.get("connector_types", []),
                        total_plugs=c.get("total_plugs", 2),
                        max_power_kw=c.get("max_power_kw", 50.0),
                        access_restrictions=c.get("access_restrictions", "Public 24/7"),
                        opening_hours=c.get("opening_hours", "24/7"),
                        payment_network=c.get("payment_network", "App / UPI"),
                        live_status=c.get("live_status", "operational"),
                        source_provider=c.get("source_provider", "Verified Corridor Seed"),
                        confidence_score=c.get("confidence_score", 0.90),
                        last_data_refresh=datetime.now(timezone.utc),
                    )
                    db.add(ch_obj)
                print(f"[Seed] Added {len(chargers_data)} charging stations.")

        # Create demo user if none
        user_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
        if user_count == 0:
            demo_user = User(
                email="driver@chargeroute.ai",
                hashed_password=get_password_hash("voltplan123"),
                full_name="Krish Patel",
                is_active=True,
                is_admin=True,
            )
            db.add(demo_user)
            print("[Seed] Created demo user: driver@chargeroute.ai (Password: voltplan123)")

        await db.commit()
    print("[Seed] Database seed completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
