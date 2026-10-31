import { NextResponse } from "next/server";
import seedVehicles from "@/data/seed_vehicles.json";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase();
    const manufacturer = searchParams.get("manufacturer")?.toLowerCase();

    let list = seedVehicles as any[];

    if (manufacturer) {
      list = list.filter((v) => v.manufacturer?.toLowerCase() === manufacturer);
    }
    if (search) {
      list = list.filter(
        (v) =>
          v.model?.toLowerCase().includes(search) ||
          v.manufacturer?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Failed to load vehicle catalog" },
      { status: 500 }
    );
  }
}
