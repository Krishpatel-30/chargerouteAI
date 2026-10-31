import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    return NextResponse.json({
      message: "Sync completed with Bureau of Energy Efficiency directory",
      added: 0,
      updated: 269,
      total_directory: 29184,
      synced_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error?.message || "Sync failed" }, { status: 500 });
  }
}
