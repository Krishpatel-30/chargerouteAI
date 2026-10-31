import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface LocationResult {
  id: string;
  name: string;
  display_name: string;
  category: string;
  village?: string;
  taluka?: string;
  district?: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  provider: string;
  place_id?: string;
}

// Built-in Comprehensive Pan-India Directory (Instant zero-latency fallback)
const PAN_INDIA_DIRECTORY: Array<{
  name: string;
  category: string;
  district?: string;
  state: string;
  lat: number;
  lng: number;
}> = [
  // National Metros & Capitals
  { name: "New Delhi", category: "national_capital", district: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Delhi", category: "metro", district: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Mumbai", category: "megacity", district: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
  { name: "Bengaluru", category: "state_capital", district: "Bengaluru Urban", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", category: "state_capital", district: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", category: "state_capital", district: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867 },
  { name: "Kolkata", category: "state_capital", district: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", category: "city", district: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Jaipur", category: "state_capital", district: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Agra", category: "city", district: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { name: "Lucknow", category: "state_capital", district: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Chandigarh", category: "state_capital", district: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Bhopal", category: "state_capital", district: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Patna", category: "state_capital", district: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { name: "Thiruvananthapuram", category: "state_capital", district: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
  { name: "Kochi", category: "port_city", district: "Ernakulam", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Dehradun", category: "state_capital", district: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { name: "Shimla", category: "hill_station", district: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },

  // Gujarat Towns & Rural Villages
  { name: "Ahmedabad", category: "city", district: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Surat", category: "city", district: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", category: "city", district: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Rajkot", category: "city", district: "Rajkot", state: "Gujarat", lat: 22.3039, lng: 70.8022 },
  { name: "Gandhinagar", category: "capital_city", district: "Gandhinagar", state: "Gujarat", lat: 23.2156, lng: 72.6369 },
  { name: "Bajud", category: "village", district: "Bhavnagar", state: "Gujarat", lat: 21.7360, lng: 71.8292 },
  { name: "Kadi", category: "village", district: "Mehsana", state: "Gujarat", lat: 23.2982, lng: 72.3323 },
  { name: "Sasan Gir", category: "wildlife_ecotourism", district: "Gir Somnath", state: "Gujarat", lat: 21.1644, lng: 70.5986 },
  { name: "Chikhli", category: "village", district: "Navsari", state: "Gujarat", lat: 20.7602, lng: 73.0633 },
  { name: "Navsari", category: "city", district: "Navsari", state: "Gujarat", lat: 20.95, lng: 72.9333 },
  { name: "Bardoli", category: "town", district: "Surat", state: "Gujarat", lat: 21.1189, lng: 73.1114 },
  { name: "Kevadia", category: "tourism_wonder", district: "Narmada", state: "Gujarat", lat: 21.838, lng: 73.7191 },
  { name: "Somnath", category: "pilgrimage_city", district: "Gir Somnath", state: "Gujarat", lat: 20.888, lng: 70.4012 },
  { name: "Dwarka", category: "pilgrimage_city", district: "Devbhumi Dwarka", state: "Gujarat", lat: 22.2442, lng: 68.9685 },
  { name: "Dholera", category: "village", district: "Ahmedabad", state: "Gujarat", lat: 22.2472, lng: 72.1956 },
  { name: "Sanand", category: "auto_hub", district: "Ahmedabad", state: "Gujarat", lat: 22.9867, lng: 72.3814 },
  { name: "Modasa", category: "town", district: "Aravalli", state: "Gujarat", lat: 23.4633, lng: 73.2983 },
  { name: "Unjha", category: "town", district: "Mehsana", state: "Gujarat", lat: 23.8039, lng: 72.3925 },
  { name: "Anand", category: "city", district: "Anand", state: "Gujarat", lat: 22.5645, lng: 72.9289 },
  { name: "Nadiad", category: "city", district: "Kheda", state: "Gujarat", lat: 22.6916, lng: 72.8634 },
  { name: "Bharuch", category: "chemical_hub", district: "Bharuch", state: "Gujarat", lat: 21.7051, lng: 72.9959 },
  { name: "Vapi", category: "industrial_city", district: "Valsad", state: "Gujarat", lat: 20.37, lng: 72.91 },
  { name: "Palanpur", category: "town", district: "Banaskantha", state: "Gujarat", lat: 24.1724, lng: 72.4347 },
  { name: "Ambaji", category: "pilgrimage_town", district: "Banaskantha", state: "Gujarat", lat: 24.3314, lng: 72.8486 },
  { name: "Bhavnagar", category: "city", district: "Bhavnagar", state: "Gujarat", lat: 21.7645, lng: 72.1519 },
  { name: "Sihor", category: "town", district: "Bhavnagar", state: "Gujarat", lat: 21.7056, lng: 71.9619 },

  // Maharashtra Towns & Villages
  { name: "Navi Mumbai", category: "city", district: "Thane", state: "Maharashtra", lat: 19.033, lng: 73.0297 },
  { name: "Thane", category: "city", district: "Thane", state: "Maharashtra", lat: 19.2183, lng: 72.9781 },
  { name: "Lonavala", category: "hill_station", district: "Pune", state: "Maharashtra", lat: 18.7557, lng: 73.4091 },
  { name: "Khandala", category: "hill_station", district: "Pune", state: "Maharashtra", lat: 18.7614, lng: 73.3752 },
  { name: "Alibaug", category: "coastal_town", district: "Raigad", state: "Maharashtra", lat: 18.6414, lng: 72.8722 },
  { name: "Shirdi", category: "pilgrimage_town", district: "Ahmednagar", state: "Maharashtra", lat: 19.7645, lng: 74.4762 },
  { name: "Nashik", category: "city", district: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Mahabaleshwar", category: "hill_station", district: "Satara", state: "Maharashtra", lat: 17.9237, lng: 73.6586 },
  { name: "Satara", category: "town", district: "Satara", state: "Maharashtra", lat: 17.6805, lng: 74.0183 },
  { name: "Kolhapur", category: "city", district: "Kolhapur", state: "Maharashtra", lat: 16.705, lng: 74.2433 },
  { name: "Nagpur", category: "city", district: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },

  // North India Towns & Hubs
  { name: "Noida", category: "industrial_city", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", lat: 28.5355, lng: 77.391 },
  { name: "Greater Noida", category: "city", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", lat: 28.4744, lng: 77.504 },
  { name: "Gurugram", category: "corporate_hub", district: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Manesar", category: "auto_hub", district: "Gurugram", state: "Haryana", lat: 28.3516, lng: 76.9426 },
  { name: "Murthal", category: "village", district: "Sonipat", state: "Haryana", lat: 28.9892, lng: 77.0722 },
  { name: "Karnal", category: "town", district: "Karnal", state: "Haryana", lat: 29.6857, lng: 76.9905 },
  { name: "Amritsar", category: "pilgrimage_city", district: "Amritsar", state: "Punjab", lat: 31.634, lng: 74.8723 },
  { name: "Mathura", category: "pilgrimage_city", district: "Mathura", state: "Uttar Pradesh", lat: 27.4924, lng: 77.6737 },
  { name: "Vrindavan", category: "pilgrimage_town", district: "Mathura", state: "Uttar Pradesh", lat: 27.5806, lng: 77.7006 },
  { name: "Ayodhya", category: "pilgrimage_city", district: "Ayodhya", state: "Uttar Pradesh", lat: 26.7922, lng: 82.1998 },
  { name: "Varanasi", category: "pilgrimage_city", district: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { name: "Rishikesh", category: "pilgrimage_town", district: "Dehradun", state: "Uttarakhand", lat: 30.0869, lng: 78.2676 },
  { name: "Haridwar", category: "pilgrimage_city", district: "Haridwar", state: "Uttarakhand", lat: 29.9457, lng: 78.1642 },

  // Rajasthan Towns & Villages
  { name: "Neemrana", category: "village", district: "Kotputli-Behror", state: "Rajasthan", lat: 27.9888, lng: 76.3883 },
  { name: "Ajmer", category: "pilgrimage_city", district: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399 },
  { name: "Pushkar", category: "pilgrimage_town", district: "Ajmer", state: "Rajasthan", lat: 26.4897, lng: 74.5511 },
  { name: "Udaipur", category: "city", district: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125 },
  { name: "Jodhpur", category: "city", district: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { name: "Mount Abu", category: "hill_station", district: "Sirohi", state: "Rajasthan", lat: 24.5925, lng: 72.7156 },

  // South India Towns & Villages
  { name: "Mysuru", category: "city", district: "Mysuru", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Channapatna", category: "village", district: "Ramanagara", state: "Karnataka", lat: 12.6518, lng: 77.2089 },
  { name: "Ramanagara", category: "town", district: "Ramanagara", state: "Karnataka", lat: 12.7209, lng: 77.2799 },
  { name: "Coorg (Madikeri)", category: "hill_station", district: "Kodagu", state: "Karnataka", lat: 12.4244, lng: 75.7382 },
  { name: "Ooty", category: "hill_station", district: "Nilgiris", state: "Tamil Nadu", lat: 11.4102, lng: 76.695 },
  { name: "Hosur", category: "industrial_hub", district: "Krishnagiri", state: "Tamil Nadu", lat: 12.7409, lng: 77.8253 },
  { name: "Coimbatore", category: "city", district: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Madurai", category: "city", district: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Puducherry", category: "coastal_town", district: "Puducherry", state: "Puducherry", lat: 11.9416, lng: 79.8083 },
  { name: "Munnar", category: "hill_station", district: "Idukki", state: "Kerala", lat: 10.0889, lng: 77.0595 },
  { name: "Alappuzha", category: "backwaters", district: "Alappuzha", state: "Kerala", lat: 9.4981, lng: 76.3388 },
  { name: "Vijayawada", category: "city", district: "NTR", state: "Andhra Pradesh", lat: 16.5062, lng: 80.648 },
  { name: "Visakhapatnam", category: "port_city", district: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Tirupati", category: "pilgrimage_city", district: "Tirupati", state: "Andhra Pradesh", lat: 13.6288, lng: 79.4192 },
  { name: "Panaji", category: "capital_city", district: "North Goa", state: "Goa", lat: 15.4909, lng: 73.8278 },
];

/**
 * Searches built-in pan-India directory
 */
function searchPanIndiaDirectory(query: string, limit: number): LocationResult[] {
  const qNorm = query.toLowerCase().trim();
  if (!qNorm) {
    return PAN_INDIA_DIRECTORY.slice(0, limit).map((d) => ({
      id: `dir_${d.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: `${d.name}, ${d.district || d.state}`,
      display_name: `${d.name}, ${d.district ? d.district + ", " : ""}${d.state}, India`,
      category: d.category,
      village: d.category.includes("village") ? d.name : undefined,
      district: d.district,
      state: d.state,
      country: "India",
      latitude: d.lat,
      longitude: d.lng,
      provider: "india_directory",
    }));
  }

  const matches: Array<{ score: number; item: typeof PAN_INDIA_DIRECTORY[0] }> = [];

  for (const item of PAN_INDIA_DIRECTORY) {
    const nameLower = item.name.toLowerCase();
    const searchable = `${item.name} ${item.district || ""} ${item.state}`.toLowerCase();
    let score = 0;

    if (nameLower === qNorm) {
      score = 100;
    } else if (nameLower.startsWith(qNorm)) {
      score = 80;
    } else if (nameLower.includes(qNorm)) {
      score = 60;
    } else if (searchable.includes(qNorm)) {
      score = 40;
    }

    if (score > 0) {
      matches.push({ score, item });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, limit).map(({ item }) => ({
    id: `dir_${item.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${item.lat.toFixed(2)}`,
    name: `${item.name}, ${item.district || item.state}`,
    display_name: `${item.name}, ${item.district ? item.district + ", " : ""}${item.state}, India`,
    category: item.category,
    village: item.category.includes("village") ? item.name : undefined,
    district: item.district,
    state: item.state,
    country: "India",
    latitude: item.lat,
    longitude: item.lng,
    provider: "india_directory",
  }));
}

/**
 * Searches Google Maps Geocoding API if key is present
 */
async function searchGoogleMaps(query: string, apiKey: string, limit: number): Promise<LocationResult[]> {
  try {
    const qParam = query.toLowerCase().includes("india") ? query : `${query}, India`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      qParam
    )}&components=country:IN&region=in&key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== "OK" || !Array.isArray(data.results)) return [];

    const results: LocationResult[] = [];
    for (const item of data.results.slice(0, limit)) {
      const geom = item.geometry?.location;
      if (!geom || geom.lat == null || geom.lng == null) continue;

      let village: string | undefined;
      let taluka: string | undefined;
      let district: string | undefined;
      let state = "India";

      for (const comp of item.address_components || []) {
        const types: string[] = comp.types || [];
        const name: string = comp.long_name || "";
        if (types.includes("sublocality") || types.includes("locality")) {
          if (!village) village = name;
        } else if (types.includes("administrative_area_level_3")) {
          taluka = name;
        } else if (types.includes("administrative_area_level_2")) {
          district = name;
        } else if (types.includes("administrative_area_level_1")) {
          state = name;
        }
      }

      const shortName = village || (item.formatted_address || "").split(",")[0];
      const isVillage = item.types?.some((t: string) =>
        ["sublocality", "locality", "neighborhood", "hamlet"].includes(t)
      );

      results.push({
        id: `gmap_${item.place_id || Math.abs(geom.lat + geom.lng)}`,
        name: `${shortName}, ${district || state}`,
        display_name: item.formatted_address || `${shortName}, ${state}, India`,
        category: isVillage ? "village" : "location",
        village,
        taluka,
        district,
        state,
        country: "India",
        latitude: geom.lat,
        longitude: geom.lng,
        provider: "google_maps",
        place_id: item.place_id,
      });
    }

    return results;
  } catch (err) {
    console.warn("Google Maps geocoding error:", err);
    return [];
  }
}

/**
 * Searches OpenStreetMap / Nominatim API bounded to India
 */
async function searchNominatimIndia(query: string, limit: number): Promise<LocationResult[]> {
  try {
    const qParam = query.toLowerCase().includes("india") ? query : `${query}, India`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      qParam
    )}&format=jsonv2&addressdetails=1&countrycodes=in&limit=${limit}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ChargeRouteAI-PanIndia/1.0 (contact@chargeroute.ai)",
        "Accept-Language": "en,hi",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];

    const results: LocationResult[] = [];
    for (const item of items) {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      if (isNaN(lat) || isNaN(lng)) continue;

      const addr = item.address || {};
      const village =
        addr.village ||
        addr.hamlet ||
        addr.suburb ||
        addr.town ||
        addr.neighbourhood ||
        addr.isolated_dwelling ||
        addr.railway ||
        item.name;

      const taluka = addr.county || addr.taluk || addr.tehsil;
      const district = addr.state_district || addr.county || addr.district;
      const state = addr.state || "India";

      const titlePart = village || item.name || item.display_name?.split(",")[0] || "Location";
      const regionParts = [district, state].filter(Boolean);
      const cleanName = regionParts.length > 0 ? `${titlePart}, ${regionParts.join(", ")}` : titlePart;

      const isVillage =
        Boolean(addr.village || addr.hamlet || addr.isolated_dwelling) ||
        item.type === "village" ||
        item.type === "hamlet" ||
        item.addresstype === "village";

      results.push({
        id: `osm_${item.place_id}`,
        name: cleanName,
        display_name: item.display_name || cleanName,
        category: isVillage ? "village" : item.type || "location",
        village,
        taluka,
        district,
        state,
        country: "India",
        latitude: lat,
        longitude: lng,
        provider: "nominatim",
        place_id: String(item.place_id),
      });
    }

    return results;
  } catch (err) {
    console.warn("Nominatim India geocoding error:", err);
    return [];
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim();
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "8", 10)));

    if (!query) {
      return NextResponse.json(searchPanIndiaDirectory("", limit));
    }

    // 1. Check Directory for instant high-confidence match
    const dirMatches = searchPanIndiaDirectory(query, limit);

    // If query has exact directory match with score 100 and length >= 3, return directory results
    const exactDirMatch = dirMatches.find(
      (m) =>
        m.village?.toLowerCase() === query.toLowerCase() ||
        m.name.toLowerCase().split(",")[0].trim() === query.toLowerCase()
    );

    // 2. Check Google Maps API Key
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    let liveResults: LocationResult[] = [];

    if (googleApiKey && googleApiKey.trim().length > 10) {
      liveResults = await searchGoogleMaps(query, googleApiKey.trim(), limit);
    }

    // 3. Fallback to OpenStreetMap / Nominatim if no Google results
    if (liveResults.length === 0) {
      liveResults = await searchNominatimIndia(query, limit);
    }

    // 4. Merge results with Directory, prioritizing exact matches and eliminating duplicates
    const combined: LocationResult[] = [];
    const seenCoordinates = new Set<string>();

    // If exact directory match, put it first
    if (exactDirMatch) {
      const key = `${exactDirMatch.latitude.toFixed(2)},${exactDirMatch.longitude.toFixed(2)}`;
      seenCoordinates.add(key);
      combined.push(exactDirMatch);
    }

    // Append live results (Google Maps / Nominatim)
    for (const res of liveResults) {
      const key = `${res.latitude.toFixed(2)},${res.longitude.toFixed(2)}`;
      if (!seenCoordinates.has(key)) {
        seenCoordinates.add(key);
        combined.push(res);
      }
    }

    // Append remaining directory matches
    for (const res of dirMatches) {
      const key = `${res.latitude.toFixed(2)},${res.longitude.toFixed(2)}`;
      if (!seenCoordinates.has(key)) {
        seenCoordinates.add(key);
        combined.push(res);
      }
    }

    return NextResponse.json(combined.slice(0, limit));
  } catch (error: any) {
    console.error("Location search endpoint error:", error);
    return NextResponse.json(
      { detail: error?.message || "Location search failed" },
      { status: 500 }
    );
  }
}
