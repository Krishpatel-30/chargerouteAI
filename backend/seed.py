"""
Database Seeding Script.

Loads realistic EV vehicle models (all Indian market EV cars) and verified
pan-India national expressway & highway charging stations into the active database.
"""

import json
import os
import asyncio
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from app.core.database import AsyncSessionLocal, Base, engine
from app.models.vehicle import VehicleModel
from app.models.charger import ChargingStation
from app.models.user import User
from app.core.security import get_password_hash


async def seed_database(force_refresh_seeds: bool = True):
    # 1. Create tables if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Load vehicles from seed_vehicles.json
        veh_path = os.path.join(os.path.dirname(__file__), "app", "data", "seed_vehicles.json")
        if os.path.exists(veh_path):
            with open(veh_path, "r", encoding="utf-8") as f:
                vehicles_data = json.load(f)

            # Query existing non-custom vehicle models
            existing_vehs_res = await db.execute(
                select(VehicleModel).where(VehicleModel.is_custom == False)
            )
            existing_vehs = {f"{v.manufacturer}::{v.model}": v for v in existing_vehs_res.scalars().all()}

            added_v = 0
            updated_v = 0
            for v in vehicles_data:
                key = f"{v['manufacturer']}::{v['model']}"
                if key in existing_vehs:
                    # Update specs to latest
                    veh_obj = existing_vehs[key]
                    veh_obj.battery_capacity_kwh = v["battery_capacity_kwh"]
                    veh_obj.usable_battery_capacity_kwh = v["usable_battery_capacity_kwh"]
                    veh_obj.consumption_kwh_100km = v["consumption_kwh_100km"]
                    veh_obj.connector_types = v.get("connector_types", ["CCS2"])
                    veh_obj.max_ac_power_kw = v.get("max_ac_power_kw", 7.2)
                    veh_obj.max_dc_power_kw = v.get("max_dc_power_kw", 50.0)
                    veh_obj.charging_curve = v.get("charging_curve")
                    veh_obj.range_reference_km = v.get("range_reference_km", 300.0)
                    veh_obj.source = v.get("source", "Manufacturer Spec")
                    updated_v += 1
                else:
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
                    added_v += 1
            print(f"[Seed] Vehicles synchronized: {added_v} added, {updated_v} updated. Total catalog: {len(vehicles_data)} Indian market EVs.")

        # Load chargers from seed_chargers.json
        charger_path = os.path.join(os.path.dirname(__file__), "app", "data", "seed_chargers.json")
        if os.path.exists(charger_path):
            with open(charger_path, "r", encoding="utf-8") as f:
                chargers_data = json.load(f)

            existing_chargers_res = await db.execute(select(ChargingStation))
            existing_chargers = {
                (c.external_id or c.name): c for c in existing_chargers_res.scalars().all()
            }

            added_c = 0
            updated_c = 0
            for c in chargers_data:
                key = c.get("external_id") or c["name"]
                if key in existing_chargers:
                    ch_obj = existing_chargers[key]
                    ch_obj.name = c["name"]
                    ch_obj.latitude = c["latitude"]
                    ch_obj.longitude = c["longitude"]
                    ch_obj.address = c.get("address")
                    ch_obj.city = c.get("city")
                    ch_obj.state = c.get("state", "India")
                    ch_obj.country = c.get("country", "India")
                    ch_obj.operator = c["operator"]
                    ch_obj.connector_types = c.get("connector_types", [])
                    ch_obj.total_plugs = c.get("total_plugs", 2)
                    ch_obj.max_power_kw = c.get("max_power_kw", 50.0)
                    ch_obj.access_restrictions = c.get("access_restrictions", "Public 24/7")
                    ch_obj.opening_hours = c.get("opening_hours", "24/7")
                    ch_obj.payment_network = c.get("payment_network", "App / UPI")
                    ch_obj.live_status = c.get("live_status", "operational")
                    ch_obj.source_provider = c.get("source_provider", "Verified Pan-India Corridor Seed")
                    ch_obj.confidence_score = c.get("confidence_score", 0.90)
                    ch_obj.last_data_refresh = datetime.now(timezone.utc)
                    updated_c += 1
                else:
                    ch_obj = ChargingStation(
                        external_id=c.get("external_id"),
                        name=c["name"],
                        latitude=c["latitude"],
                        longitude=c["longitude"],
                        address=c.get("address"),
                        city=c.get("city"),
                        state=c.get("state", "India"),
                        country=c.get("country", "India"),
                        operator=c["operator"],
                        connector_types=c.get("connector_types", []),
                        total_plugs=c.get("total_plugs", 2),
                        max_power_kw=c.get("max_power_kw", 50.0),
                        access_restrictions=c.get("access_restrictions", "Public 24/7"),
                        opening_hours=c.get("opening_hours", "24/7"),
                        payment_network=c.get("payment_network", "App / UPI"),
                        live_status=c.get("live_status", "operational"),
                        source_provider=c.get("source_provider", "Verified Pan-India Corridor Seed"),
                        confidence_score=c.get("confidence_score", 0.90),
                        last_data_refresh=datetime.now(timezone.utc),
                    )
                    db.add(ch_obj)
                    added_c += 1
            print(f"[Seed] Charging stations synchronized: {added_c} added, {updated_c} updated. Total network: {len(chargers_data)} pan-India stations.")

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
    print("[Seed] Pan-India database seed completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
