import { NextResponse } from "next/server";
import seedChargers from "@/data/seed_chargers.json";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = seedChargers as any[];
    const match = list.find((c, idx) => {
      const chargerId = c.id || c.external_id || `charger_${idx}`;
      return String(chargerId) === String(id);
    });

    if (!match) {
      return NextResponse.json({ detail: "Charging station not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...match,
      id: match.id || match.external_id || id,
      latitude: Number(match.latitude),
      longitude: Number(match.longitude),
      max_power_kw: Number(match.max_power_kw) || 50,
      total_plugs: Number(match.total_plugs) || 2,
      live_status: match.live_status || "operational",
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || "Failed to load charger" }, { status: 500 });
  }
}
