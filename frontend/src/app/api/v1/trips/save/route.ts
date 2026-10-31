import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      id: `trip_${Date.now()}`,
      title: body.title || "Saved Trip",
      created_at: new Date().toISOString(),
      ...body.plan_data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Failed to save trip" },
      { status: 500 }
    );
  }
}
