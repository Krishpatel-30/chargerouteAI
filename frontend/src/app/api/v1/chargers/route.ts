import { NextResponse } from "next/server";
import seedChargers from "@/data/seed_chargers.json";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const state = searchParams.get("state")?.toLowerCase();

    let list = seedChargers as any[];

    if (state) {
      list = list.filter((c) => c.state?.toLowerCase() === state);
    }

    return NextResponse.json(list.slice(0, limit));
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Failed to load charging stations" },
      { status: 500 }
    );
  }
}
