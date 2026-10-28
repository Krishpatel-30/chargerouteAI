"""
Deterministic EV Energy & Charging Calculations Service.

Formulas:
- Segment energy (kWh) = Distance (km) * Effective Consumption (kWh/100 km) / 100
- Arrival battery (%) = Starting battery (%) - (Segment energy / Usable battery capacity * 100)
- Charging time: accounts for min(charger_power, vehicle_max_dc_power), CC-CV taper above 80%, and efficiency.
"""

from typing import Tuple, Dict, Any


class EnergyCalculator:
    CHARGING_EFFICIENCY = 0.90  # 90% AC-to-DC / thermal efficiency
    TAPER_SOC_THRESHOLD = 80.0  # CC-CV charging curve taper above 80%
    TAPER_POWER_RATIO = 0.45    # power drops to 45% when above 80%

    @staticmethod
    def calculate_segment_energy_kwh(
        distance_km: float,
        base_consumption_kwh_100km: float,
        highway_factor: float = 1.0,
        ac_factor: float = 1.0,
    ) -> float:
        """
        Calculates energy consumed over a segment in kWh.
        """
        if distance_km <= 0 or base_consumption_kwh_100km <= 0:
            return 0.0

        effective_consumption = base_consumption_kwh_100km * highway_factor * ac_factor
        energy_kwh = (distance_km * effective_consumption) / 100.0
        return round(energy_kwh, 2)

    @staticmethod
    def estimate_arrival_battery_pct(
        start_battery_pct: float,
        segment_energy_kwh: float,
        usable_battery_capacity_kwh: float,
    ) -> float:
        """
        Estimates remaining battery percentage upon arrival.
        Arrival battery (%) = Starting battery (%) - (Segment energy / Usable capacity * 100)
        """
        if usable_battery_capacity_kwh <= 0:
            return 0.0

        pct_consumed = (segment_energy_kwh / usable_battery_capacity_kwh) * 100.0
        remaining_pct = start_battery_pct - pct_consumed
        return round(remaining_pct, 1)

    @staticmethod
    def estimate_charging_time_and_energy(
        current_battery_pct: float,
        target_battery_pct: float,
        usable_battery_capacity_kwh: float,
        station_power_kw: float,
        vehicle_max_dc_kw: float,
    ) -> Tuple[float, float, float]:
        """
        Estimates:
        1. Energy added (kWh)
        2. Charging duration in minutes
        3. Effective charging power (kW)

        Accounts for charging taper above 80% SoC.
        """
        if target_battery_pct <= current_battery_pct or usable_battery_capacity_kwh <= 0:
            return 0.0, 0.0, 0.0

        energy_to_add_kwh = ((target_battery_pct - current_battery_pct) / 100.0) * usable_battery_capacity_kwh
        max_deliverable_power = min(station_power_kw, vehicle_max_dc_kw)
        if max_deliverable_power <= 0:
            max_deliverable_power = 22.0  # safe default

        # Split charging into two phases: below 80% and above 80%
        minutes_total = 0.0

        # Phase 1: from current_battery_pct up to min(target_battery_pct, 80%)
        if current_battery_pct < EnergyCalculator.TAPER_SOC_THRESHOLD:
            phase1_target = min(target_battery_pct, EnergyCalculator.TAPER_SOC_THRESHOLD)
            phase1_energy = ((phase1_target - current_battery_pct) / 100.0) * usable_battery_capacity_kwh
            power1 = max_deliverable_power * EnergyCalculator.CHARGING_EFFICIENCY
            minutes1 = (phase1_energy / power1) * 60.0
            minutes_total += minutes1

        # Phase 2: from max(current_battery_pct, 80%) to target_battery_pct
        if target_battery_pct > EnergyCalculator.TAPER_SOC_THRESHOLD:
            phase2_start = max(current_battery_pct, EnergyCalculator.TAPER_SOC_THRESHOLD)
            phase2_energy = ((target_battery_pct - phase2_start) / 100.0) * usable_battery_capacity_kwh
            # Tapered power
            power2 = (max_deliverable_power * EnergyCalculator.TAPER_POWER_RATIO) * EnergyCalculator.CHARGING_EFFICIENCY
            minutes2 = (phase2_energy / power2) * 60.0
            minutes_total += minutes2

        return round(energy_to_add_kwh, 2), round(minutes_total, 1), round(max_deliverable_power, 1)

    @staticmethod
    def calculate_charging_cost_inr(
        energy_kwh: float,
        tariff_per_kwh: float = 19.5,  # Typical Gujarat fast charger tariff ~18-22 INR/kWh incl. GST
    ) -> float:
        """Estimates charging tariff in INR."""
        return round(energy_kwh * tariff_per_kwh, 2)
