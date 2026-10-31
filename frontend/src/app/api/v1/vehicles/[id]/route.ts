import { NextResponse } from "next/server";
import seedVehicles from "@/data/seed_vehicles.json";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const list = seedVehicles as any[];
    const vehicle = list.find((v) => v.id === params.id);
    if (!vehicle) {
      return NextResponse.json(
        { detail: "Vehicle not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(vehicle);
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Error retrieving vehicle" },
      { status: 500 }
    );
  }
}

