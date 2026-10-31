import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    has_google_maps_configured: true,
    primary_provider: "gujarat_rural_geocoder",
    description: "Comprehensive Pan-India & Gujarat Rural Village Directory",
    total_rural_locations_indexed: 144,
  });
}
