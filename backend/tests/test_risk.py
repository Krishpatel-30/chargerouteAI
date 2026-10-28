from datetime import datetime, timezone, timedelta
from app.services.risk_engine import RiskEngine


def test_risk_score_boundaries_and_categories():
    now = datetime.now(timezone.utc)

    # 1. Optimal station: operational, multi-stall, verified recently, backups available
    low_risk = RiskEngine.calculate_station_risk(
        live_status="operational",
        last_refresh=now - timedelta(hours=1),
        fault_reports_count=0,
        total_plugs=4,
        access_restrictions="Public 24/7",
        opening_hours="24/7",
        nearby_backup_count=3,
        nearest_backup_detour_km=5.0,
        estimated_arrival_battery_pct=30.0,
    )
    assert 0.0 <= low_risk.score < 30.0
    assert low_risk.category == "Low Risk"
    assert len(low_risk.contributing_factors) > 0

    # 2. Elevated risk station: reported offline, stale data, single stall, no backups
    high_risk = RiskEngine.calculate_station_risk(
        live_status="offline",
        last_refresh=now - timedelta(days=5),
        fault_reports_count=4,
        total_plugs=1,
        access_restrictions="Customer only",
        opening_hours="09:00 - 18:00",
        nearby_backup_count=0,
        nearest_backup_detour_km=None,
        estimated_arrival_battery_pct=8.0,
    )
    assert high_risk.score >= 60.0
    assert high_risk.category == "Elevated Risk"
    assert any("offline" in f.lower() for f in high_risk.contributing_factors)
    assert any("no alternative backup" in f.lower() for f in high_risk.contributing_factors)


def test_staleness_penalty():
    now = datetime.now(timezone.utc)
    fresh_risk = RiskEngine.calculate_station_risk(
        live_status="unknown",
        last_refresh=now - timedelta(hours=2),
        fault_reports_count=0,
        total_plugs=2,
        access_restrictions="Public 24/7",
        opening_hours="24/7",
        nearby_backup_count=1,
    )

    stale_risk = RiskEngine.calculate_station_risk(
        live_status="unknown",
        last_refresh=now - timedelta(days=4),
        fault_reports_count=0,
        total_plugs=2,
        access_restrictions="Public 24/7",
        opening_hours="24/7",
        nearby_backup_count=1,
    )
    assert stale_risk.score > fresh_risk.score
