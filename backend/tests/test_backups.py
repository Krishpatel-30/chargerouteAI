import pytest
from datetime import datetime, timezone
from app.models.charger import ChargingStation
from app.services.backup_finder import BackupFinder, haversine_distance_km


def test_haversine_distance():
    # Ahmedabad (23.0225, 72.5714) to Vadodara (22.3072, 73.1812) ~100 km
    dist = haversine_distance_km(23.0225, 72.5714, 22.3072, 73.1812)
    assert 95.0 <= dist <= 115.0


def test_backup_finder_reachability():
    primary = ChargingStation(
        id="prim_1",
        name="Primary Anand Plaza",
        latitude=22.5645,
        longitude=72.9289,
        operator="Tata Power",
        connector_types=[{"type": "CCS2", "power_kw": 60}],
        live_status="operational",
        last_data_refresh=datetime.now(timezone.utc),
    )

    backup_close = ChargingStation(
        id="back_1",
        name="Nearby Nadiad",
        latitude=22.6000,
        longitude=72.9000,
        operator="Jio-bp pulse",
        connector_types=[{"type": "CCS2", "power_kw": 60}],
        live_status="operational",
        last_data_refresh=datetime.now(timezone.utc),
    )

    backup_far = ChargingStation(
        id="back_far",
        name="Distant Surat Hub",
        latitude=21.1702,
        longitude=72.8311,
        operator="Statiq",
        connector_types=[{"type": "CCS2", "power_kw": 60}],
        live_status="operational",
        last_data_refresh=datetime.now(timezone.utc),
    )

    backups = BackupFinder.find_backups_for_stop(
        primary_station=primary,
        all_candidate_stations=[primary, backup_close, backup_far],
        vehicle_connector_types=["CCS2"],
        arrival_battery_pct=25.0,
        usable_battery_kwh=40.0,
        consumption_kwh_100km=15.0,
    )

    assert len(backups) == 1
    assert backups[0].station_id == "back_1"
    assert "Reachable" in backups[0].feasibility_notes
