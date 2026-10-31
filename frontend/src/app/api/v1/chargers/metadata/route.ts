import { NextResponse } from "next/server";

export async function GET() {
  const metadata = {
    source_name: "EV Public Charging Stations Data till 26th October 2025",
    publisher: "Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India",
    snapshot_label: "till 26th October 2025",
    attribution: "Data: Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India",
    total_stations_directory: 29184,
    total_stations_local_db: 29184,
    total_states_indexed: 36,
    last_sync: new Date().toISOString(),
    dataset_disclaimer: "Integrated Bureau of Energy Efficiency keyless directory records enriched with risk analytics and backup corridor discovery."
  };

  return NextResponse.json(metadata);
}
