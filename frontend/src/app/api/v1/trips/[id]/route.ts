import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    id: params.id,
    title: "Saved Road Trip",
    total_distance_km: 228,
    total_driving_time_min: 201,
    total_charging_time_min: 35,
    total_duration_min: 236,
    total_energy_kwh: 34,
    estimated_cost_inr: 234,
    min_battery_reserve_pct: 18,
    overall_risk_score: 12,
    overall_risk_category: "Low Risk",
    charging_stops: [],
    route_geometry: [],
  });
}

