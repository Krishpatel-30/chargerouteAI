import pytest
from app.services.energy_calculator import EnergyCalculator


def test_segment_energy_calculation():
    # 100 km at 15.0 kWh/100km should consume 15.0 kWh
    energy = EnergyCalculator.calculate_segment_energy_kwh(
        distance_km=100.0,
        base_consumption_kwh_100km=15.0,
        highway_factor=1.0,
        ac_factor=1.0,
    )
    assert energy == 15.0

    # With 15% highway speed factor and 10% AC climate factor
    adjusted_energy = EnergyCalculator.calculate_segment_energy_kwh(
        distance_km=100.0,
        base_consumption_kwh_100km=15.0,
        highway_factor=1.15,
        ac_factor=1.10,
    )
    # 100 * (15 * 1.15 * 1.10) / 100 = 18.975 -> 18.98
    assert round(adjusted_energy, 1) == 19.0


def test_arrival_battery_estimation():
    # Start at 90%, 19 kWh consumed on a 38 kWh usable battery (50% drop) -> 40% arrival
    arrival_pct = EnergyCalculator.estimate_arrival_battery_pct(
        start_battery_pct=90.0,
        segment_energy_kwh=19.0,
        usable_battery_capacity_kwh=38.0,
    )
    assert arrival_pct == 40.0


def test_charging_time_and_taper():
    # Charge from 20% to 80% (60% of 40 kWh = 24 kWh) on 60 kW DC charger
    energy_added, duration_min, power_kw = EnergyCalculator.estimate_charging_time_and_energy(
        current_battery_pct=20.0,
        target_battery_pct=80.0,
        usable_battery_capacity_kwh=40.0,
        station_power_kw=60.0,
        vehicle_max_dc_kw=50.0,  # vehicle limits to 50 kW
    )
    assert energy_added == 24.0
    assert power_kw == 50.0
    # 24 kWh / (50 * 0.90 kW) * 60 min = 32.0 minutes
    assert 30.0 <= duration_min <= 35.0


def test_charging_cost_calculation():
    cost = EnergyCalculator.calculate_charging_cost_inr(energy_kwh=20.0, tariff_per_kwh=20.0)
    assert cost == 400.0
