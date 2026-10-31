import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mfg = (body.manufacturer || "Custom").trim();
    const model = (body.model || "Custom EV").trim();
    const grossKwh = Number(body.battery_capacity_kwh) || 50.0;
    const usableKwh =
      Number(body.usable_battery_capacity_kwh) ||
      Math.round(grossKwh * 0.94 * 10) / 10;
    const consumption = Number(body.consumption_kwh_100km) || 15.0;
    const maxDcKw = Number(body.max_dc_power_kw) || 60.0;
    const maxAcKw = Number(body.max_ac_power_kw) || 7.2;
    const rangeKm =
      Number(body.range_reference_km) ||
      Math.round((usableKwh / consumption) * 100);

    const vehicle = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      manufacturer: mfg,
      model: model,
      model_year: Number(body.model_year) || new Date().getFullYear(),
      battery_capacity_kwh: grossKwh,
      usable_battery_capacity_kwh: usableKwh,
      consumption_kwh_100km: consumption,
      connector_types: body.connector_types || ["CCS2", "Type 2"],
      max_ac_power_kw: maxAcKw,
      max_dc_power_kw: maxDcKw,
      range_reference_km: rangeKm,
      source: body.source || "Custom Profile",
      is_custom: true,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(vehicle, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Failed to create custom vehicle" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

