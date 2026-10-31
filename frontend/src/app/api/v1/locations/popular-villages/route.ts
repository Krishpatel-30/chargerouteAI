import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "loc_kadi",
      name: "Kadi, Mehsana, Gujarat",
      display_name: "Kadi, Taluka Kadi, District Mehsana, Gujarat",
      category: "village",
      village: "Kadi",
      district: "Mehsana",
      state: "Gujarat",
      country: "India",
      latitude: 23.2982,
      longitude: 72.3323,
      provider: "gujarat_directory",
    },
    {
      id: "loc_sasangir",
      name: "Sasan Gir, Gir Somnath, Gujarat",
      display_name: "Sasan Gir National Park & Sanctuary, Gir Somnath, Gujarat",
      category: "wildlife_ecotourism",
      village: "Sasan Gir",
      district: "Gir Somnath",
      state: "Gujarat",
      country: "India",
      latitude: 21.1644,
      longitude: 70.5986,
      provider: "gujarat_directory",
    },
  ]);
}
