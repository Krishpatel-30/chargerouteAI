"""
Rule-Based Explainable Charging Risk Scoring Engine.

Produces an explainable risk score (0-100) with categorical breakdown:
- 0 to 29: Low Risk (Green)
- 30 to 59: Moderate Risk (Amber)
- 60 to 100: Elevated Risk (Red)

Evaluates:
- Freshness of status data
- Confirmed live operational status
- Recent community fault reports
- Connector redundancy & stall count
- Backup availability & detour distance
- Expected arrival battery reserve buffer
- Access and opening hours restrictions
"""

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.schemas.charger import RiskBreakdown


class RiskEngine:
    @staticmethod
    def calculate_station_risk(
        live_status: str,
        last_refresh: datetime,
        fault_reports_count: Optional[int] = 0,
        total_plugs: Optional[int] = 2,
        access_restrictions: Optional[str] = "Public 24/7",
        opening_hours: Optional[str] = "24/7",
        nearby_backup_count: int = 0,
        nearest_backup_detour_km: Optional[float] = None,
        estimated_arrival_battery_pct: Optional[float] = None,
    ) -> RiskBreakdown:
        score = 10.0  # Base nominal risk for any public roadside charger
        factors: List[str] = []

        fault_reports_count = fault_reports_count or 0
        total_plugs = total_plugs or 2
        access_restrictions = access_restrictions or "Public 24/7"
        opening_hours = opening_hours or "24/7"

        now = datetime.now(timezone.utc)
        if last_refresh.tzinfo is None:
            last_refresh = last_refresh.replace(tzinfo=timezone.utc)
        staleness_hours = max(0.0, (now - last_refresh).total_seconds() / 3600.0)

        # 1. Operational status
        status_norm = (live_status or "unknown").lower()
        if status_norm == "operational":
            score -= 5.0
            factors.append("Verified operational status from network")
            status_weight = "Network confirmed active"
        elif status_norm == "partially_available":
            score += 15.0
            factors.append("Some stalls are occupied or degraded")
            status_weight = "Partial capacity"
        elif status_norm == "offline":
            score += 65.0
            factors.append("Charger currently reported OFFLINE")
            status_weight = "Offline outage"
        else:  # unknown
            score += 18.0
            factors.append("Status unknown / no live telemetry integration")
            status_weight = "Unknown status"

        # 2. Data Freshness
        if staleness_hours > 72.0:
            score += 20.0
            factors.append(f"Data is stale ({int(staleness_hours / 24)} days since last verification)")
        elif staleness_hours > 24.0:
            score += 10.0
            factors.append(f"Data last verified {int(staleness_hours)} hours ago")
        else:
            factors.append("Data verified within last 24 hours")

        # 3. Recent fault reports
        if fault_reports_count >= 3:
            score += 30.0
            factors.append(f"Multiple recent fault reports ({fault_reports_count} reports)")
        elif fault_reports_count >= 1:
            score += 15.0
            factors.append(f"Recent issue reported by driver ({fault_reports_count} report)")

        # 4. Stall redundancy
        if total_plugs >= 4:
            score -= 8.0
            factors.append(f"Multi-stall charging hub ({total_plugs} plugs reduce queue risk)")
        elif total_plugs <= 1:
            score += 12.0
            factors.append("Single plug location with no on-site hardware redundancy")

        # 5. Backup availability
        if nearby_backup_count == 0:
            score += 25.0
            factors.append("CRITICAL: No alternative backup chargers found within 35 km")
        elif nearest_backup_detour_km is not None and nearest_backup_detour_km > 20.0:
            score += 12.0
            factors.append(f"Nearest backup requires a {nearest_backup_detour_km:.1f} km detour")
        elif nearby_backup_count >= 2:
            score -= 5.0
            factors.append(f"{nearby_backup_count} alternative backup stations reachable nearby")

        # 6. Arrival battery buffer (if provided)
        if estimated_arrival_battery_pct is not None:
            if estimated_arrival_battery_pct < 10.0:
                score += 25.0
                factors.append(f"Tight battery margin: arrival at only {estimated_arrival_battery_pct:.1f}%")
            elif estimated_arrival_battery_pct < 15.0:
                score += 10.0
                factors.append(f"Low reserve buffer: arrival at {estimated_arrival_battery_pct:.1f}%")

        # 7. Access & Opening restrictions
        if "24/7" not in opening_hours and "24 hours" not in opening_hours.lower():
            score += 8.0
            factors.append(f"Restricted hours ({opening_hours})")
        if "customer" in access_restrictions.lower() or "private" in access_restrictions.lower():
            score += 15.0
            factors.append("Access restricted to patrons or authorized users")

        # Clamp score to [0, 100]
        final_score = max(0.0, min(100.0, round(score, 1)))

        # Determine Category
        if final_score < 30.0:
            category = "Low Risk"
            confidence = "High Confidence (Safe Stop)"
        elif final_score < 60.0:
            category = "Moderate Risk"
            confidence = "Moderate Confidence (Check Backup)"
        else:
            category = "Elevated Risk"
            confidence = "Elevated Risk (Plan Alternatives)"

        return RiskBreakdown(
            score=final_score,
            category=category,
            confidence_label=confidence,
            contributing_factors=factors,
            backup_count=nearby_backup_count,
            nearest_backup_detour_km=round(nearest_backup_detour_km, 1) if nearest_backup_detour_km else None,
            staleness_hours=round(staleness_hours, 1),
            operational_status_weight=status_weight,
        )

    @staticmethod
    def calculate_overall_trip_risk(stop_risks: List[RiskBreakdown]) -> RiskBreakdown:
        """
        Calculates overall route risk. A route is as risky as its most vulnerable bottleneck stop,
        with a composite weighting.
        """
        if not stop_risks:
            return RiskBreakdown(
                score=12.0,
                category="Low Risk",
                confidence_label="Direct Non-Stop Journey",
                contributing_factors=["Route completed within single battery charge without charging stops"],
                backup_count=0,
                nearest_backup_detour_km=None,
                staleness_hours=0.0,
                operational_status_weight="Non-stop",
            )

        max_stop_risk = max(r.score for r in stop_risks)
        avg_stop_risk = sum(r.score for r in stop_risks) / len(stop_risks)
        # Composite score gives 65% weight to worst bottleneck and 35% to average
        trip_score = round(0.65 * max_stop_risk + 0.35 * avg_stop_risk, 1)

        factors = []
        worst_stop = max(stop_risks, key=lambda x: x.score)
        factors.append(f"Route bottleneck stop risk is {worst_stop.score}/100 ({worst_stop.category})")
        for f in worst_stop.contributing_factors[:3]:
            factors.append(f"Bottleneck factor: {f}")

        if trip_score < 30.0:
            category = "Low Risk"
            confidence = "High Journey Reliability"
        elif trip_score < 60.0:
            category = "Moderate Risk"
            confidence = "Moderate Journey Reliability"
        else:
            category = "Elevated Risk"
            confidence = "High Risk of Journey Disruption"

        min_backups = min(r.backup_count for r in stop_risks)

        return RiskBreakdown(
            score=trip_score,
            category=category,
            confidence_label=confidence,
            contributing_factors=factors,
            backup_count=min_backups,
            nearest_backup_detour_km=worst_stop.nearest_backup_detour_km,
            staleness_hours=worst_stop.staleness_hours,
            operational_status_weight=worst_stop.operational_status_weight,
        )
