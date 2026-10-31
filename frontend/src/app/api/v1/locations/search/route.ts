import { NextResponse } from "next/server";

const INDIAN_LOCATIONS = [
  {
    id: "loc_delhi",
    name: "New Delhi, Delhi",
    display_name: "New Delhi, National Capital Region, India",
    category: "national_capital",
    district: "New Delhi",
    state: "Delhi",
    country: "India",
    latitude: 28.6139,
    longitude: 77.209,
    provider: "india_directory",
  },
  {
    id: "loc_agra",
    name: "Agra, Uttar Pradesh",
    display_name: "Agra (Yamuna Expressway / Taj Mahal), Uttar Pradesh, India",
    category: "city",
    district: "Agra",
    state: "Uttar Pradesh",
    country: "India",
    latitude: 27.1767,
    longitude: 78.0081,
    provider: "india_directory",
  },
  {
    id: "loc_jaipur",
    name: "Jaipur, Rajasthan",
    display_name: "Jaipur (Pink City / Delhi-Mumbai Expressway), Rajasthan, India",
    category: "state_capital",
    district: "Jaipur",
    state: "Rajasthan",
    country: "India",
    latitude: 26.9124,
    longitude: 75.7873,
    provider: "india_directory",
  },
  {
    id: "loc_mumbai",
    name: "Mumbai, Maharashtra",
    display_name: "Mumbai, Maharashtra, India",
    category: "megacity",
    district: "Mumbai",
    state: "Maharashtra",
    country: "India",
    latitude: 19.076,
    longitude: 72.8777,
    provider: "india_directory",
  },
  {
    id: "loc_pune",
    name: "Pune, Maharashtra",
    display_name: "Pune (Mumbai-Pune Expressway), Maharashtra, India",
    category: "city",
    district: "Pune",
    state: "Maharashtra",
    country: "India",
    latitude: 18.5204,
    longitude: 73.8567,
    provider: "india_directory",
  },
  {
    id: "loc_ahmedabad",
    name: "Ahmedabad, Gujarat",
    display_name: "Ahmedabad, Gujarat, India",
    category: "city",
    district: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    latitude: 23.0225,
    longitude: 72.5714,
    provider: "india_directory",
  },
  {
    id: "loc_surat",
    name: "Surat, Gujarat",
    display_name: "Surat, Gujarat, India",
    category: "city",
    district: "Surat",
    state: "Gujarat",
    country: "India",
    latitude: 21.1702,
    longitude: 72.8311,
    provider: "india_directory",
  },
  {
    id: "loc_bengaluru",
    name: "Bengaluru, Karnataka",
    display_name: "Bengaluru (Silicon Valley of India), Karnataka, India",
    category: "state_capital",
    district: "Bengaluru Urban",
    state: "Karnataka",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946,
    provider: "india_directory",
  },
  {
    id: "loc_hyderabad",
    name: "Hyderabad, Telangana",
    display_name: "Hyderabad (Outer Ring Road), Telangana, India",
    category: "state_capital",
    district: "Hyderabad",
    state: "Telangana",
    country: "India",
    latitude: 17.385,
    longitude: 78.4867,
    provider: "india_directory",
  },
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
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").toLowerCase().trim();
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    if (!query) {
      return NextResponse.json(INDIAN_LOCATIONS.slice(0, limit));
    }

    const filtered = INDIAN_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.display_name.toLowerCase().includes(query) ||
        (loc.district && loc.district.toLowerCase().includes(query)) ||
        (loc.state && loc.state.toLowerCase().includes(query))
    );

    return NextResponse.json(filtered.slice(0, limit));
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Location search failed" },
      { status: 500 }
    );
  }
}

