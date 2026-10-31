import { NextResponse } from "next/server";
import seedChargers from "@/data/seed_chargers.json";

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radiusKm = parseFloat(searchParams.get("radius_km") || "50");
    const current = searchParams.get("current")?.toUpperCase();
    const minPowerKw = parseFloat(searchParams.get("min_power_kw") || "0");
    const connectorType = searchParams.get("connector_type")?.toLowerCase();
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    let list = (seedChargers as any[]).map((c, idx) => {
      const cLat = Number(c.latitude);
      const cLng = Number(c.longitude);
      const dist = haversineDistanceKm(lat, lng, cLat, cLng);
      return {
        ...c,
        id: c.id || c.external_id || `charger_${idx}`,
        latitude: cLat,
        longitude: cLng,
        max_power_kw: Number(c.max_power_kw) || 50,
        total_plugs: Number(c.total_plugs) || 2,
        live_status: c.live_status || "operational",
        distance_km: dist,
      };
    });

    // Proximity filter
    let nearby = list.filter((c) => c.distance_km <= radiusKm);
    if (nearby.length < 5) {
      // If none or very few within exact radius, sort all by distance and return top matches
      list.sort((a, b) => a.distance_km - b.distance_km);
      nearby = list.slice(0, 15);
    } else {
      nearby.sort((a, b) => a.distance_km - b.distance_km);
    }

    if (current === "DC") {
      nearby = nearby.filter((c) => (c.max_power_kw || 0) >= 25);
    } else if (current === "AC") {
      nearby = nearby.filter((c) => (c.max_power_kw || 0) < 25);
    }

    if (minPowerKw > 0) {
      nearby = nearby.filter((c) => (c.max_power_kw || 0) >= minPowerKw);
    }

    if (connectorType) {
      nearby = nearby.filter((c) =>
        c.connector_types?.some((ct: any) => {
          const s = typeof ct === "object" ? ct.type : ct;
          return s?.toLowerCase().includes(connectorType);
        })
      );
    }

    return NextResponse.json(nearby.slice(0, limit));
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || "Failed nearby search" }, { status: 500 });
  }
}
