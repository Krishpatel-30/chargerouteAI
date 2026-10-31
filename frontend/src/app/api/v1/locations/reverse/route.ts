import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ detail: "Valid lat and lng required" }, { status: 400 });
    }

    // 1. Google Maps Reverse Geocode if key configured
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (googleApiKey && googleApiKey.trim().length > 10) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&region=in&key=${googleApiKey.trim()}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          if (data.status === "OK" && data.results?.[0]) {
            const first = data.results[0];
            return NextResponse.json({
              id: `gmap_rev_${first.place_id}`,
              name: first.formatted_address?.split(",")[0] || "Located Pin",
              display_name: first.formatted_address,
              category: "location",
              latitude: lat,
              longitude: lng,
              provider: "google_maps",
              place_id: first.place_id,
            });
          }
        }
      } catch (err) {
        console.warn("Google reverse geocode error:", err);
      }
    }

    // 2. OpenStreetMap / Nominatim Reverse Geocode
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1`;
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

      if (res.ok) {
        const item = await res.json();
        const addr = item.address || {};
        const village =
          addr.village ||
          addr.hamlet ||
          addr.town ||
          addr.suburb ||
          addr.city ||
          item.name;
        const district = addr.state_district || addr.county;
        const state = addr.state || "India";
        const shortName = village ? `${village}, ${district || state}` : (item.display_name?.split(",")[0] || "Located Pin");

        return NextResponse.json({
          id: `osm_rev_${item.place_id || "pin"}`,
          name: shortName,
          display_name: item.display_name || shortName,
          category: addr.village ? "village" : "location",
          village,
          district,
          state,
          country: "India",
          latitude: lat,
          longitude: lng,
          provider: "nominatim",
          place_id: String(item.place_id),
        });
      }
    } catch (err) {
      console.warn("Nominatim reverse geocode error:", err);
    }

    // Fallback: Return raw coordinates
    return NextResponse.json({
      id: `coord_${lat.toFixed(4)}_${lng.toFixed(4)}`,
      name: `GPS (${lat.toFixed(3)}° N, ${lng.toFixed(3)}° E)`,
      display_name: `Location at ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E, India`,
      category: "location",
      state: "India",
      country: "India",
      latitude: lat,
      longitude: lng,
      provider: "gps",
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Reverse geocode failed" },
      { status: 500 }
    );
  }
}
