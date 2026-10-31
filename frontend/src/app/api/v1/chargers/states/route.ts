import { NextResponse } from "next/server";

const FALLBACK_STATES = [
  { name: "Karnataka", code: "KA", iso: "IN-KA", type: "state", stations: 6077, chargers: 8246, dc_stations: 755, car_fast_dc_stations: 281 },
  { name: "Maharashtra", code: "MH", iso: "IN-MH", type: "state", stations: 4165, chargers: 5747, dc_stations: 1206, car_fast_dc_stations: 591 },
  { name: "Uttar Pradesh", code: "UP", iso: "IN-UP", type: "state", stations: 2317, chargers: 2621, dc_stations: 536, car_fast_dc_stations: 310 },
  { name: "Delhi", code: "DL", iso: "IN-DL", type: "ut", stations: 2190, chargers: 3410, dc_stations: 620, car_fast_dc_stations: 380 },
  { name: "Tamil Nadu", code: "TN", iso: "IN-TN", type: "state", stations: 2145, chargers: 2890, dc_stations: 580, car_fast_dc_stations: 340 },
  { name: "Gujarat", code: "GJ", iso: "IN-GJ", type: "state", stations: 1980, chargers: 2450, dc_stations: 510, car_fast_dc_stations: 290 },
  { name: "Rajasthan", code: "RJ", iso: "IN-RJ", type: "state", stations: 1450, chargers: 1820, dc_stations: 380, car_fast_dc_stations: 220 },
  { name: "Haryana", code: "HR", iso: "IN-HR", type: "state", stations: 1320, chargers: 1690, dc_stations: 350, car_fast_dc_stations: 210 },
  { name: "Kerala", code: "KL", iso: "IN-KL", type: "state", stations: 1180, chargers: 1540, dc_stations: 310, car_fast_dc_stations: 190 },
  { name: "Telangana", code: "TG", iso: "IN-TG", type: "state", stations: 1090, chargers: 1420, dc_stations: 290, car_fast_dc_stations: 175 },
  { name: "Madhya Pradesh", code: "MP", iso: "IN-MP", type: "state", stations: 980, chargers: 1240, dc_stations: 240, car_fast_dc_stations: 140 },
  { name: "West Bengal", code: "WB", iso: "IN-WB", type: "state", stations: 890, chargers: 1120, dc_stations: 220, car_fast_dc_stations: 130 },
  { name: "Andhra Pradesh", code: "AP", iso: "IN-AP", type: "state", stations: 850, chargers: 1080, dc_stations: 210, car_fast_dc_stations: 120 },
  { name: "Punjab", code: "PB", iso: "IN-PB", type: "state", stations: 740, chargers: 920, dc_stations: 180, car_fast_dc_stations: 105 },
  { name: "Odisha", code: "OR", iso: "IN-OR", type: "state", stations: 510, chargers: 630, dc_stations: 120, car_fast_dc_stations: 70 },
  { name: "Bihar", code: "BR", iso: "IN-BR", type: "state", stations: 480, chargers: 590, dc_stations: 110, car_fast_dc_stations: 65 },
  { name: "Uttarakhand", code: "UK", iso: "IN-UK", type: "state", stations: 420, chargers: 510, dc_stations: 95, car_fast_dc_stations: 55 },
  { name: "Jharkhand", code: "JH", iso: "IN-JH", type: "state", stations: 390, chargers: 470, dc_stations: 85, car_fast_dc_stations: 50 },
  { name: "Assam", code: "AS", iso: "IN-AS", type: "state", stations: 350, chargers: 420, dc_stations: 75, car_fast_dc_stations: 45 },
  { name: "Chhattisgarh", code: "CG", iso: "IN-CG", type: "state", stations: 340, chargers: 410, dc_stations: 70, car_fast_dc_stations: 40 },
  { name: "Goa", code: "GA", iso: "IN-GA", type: "state", stations: 310, chargers: 380, dc_stations: 80, car_fast_dc_stations: 50 },
  { name: "Himachal Pradesh", code: "HP", iso: "IN-HP", type: "state", stations: 260, chargers: 310, dc_stations: 60, car_fast_dc_stations: 35 },
  { name: "Chandigarh", code: "CH", iso: "IN-CH", type: "ut", stations: 240, chargers: 290, dc_stations: 55, car_fast_dc_stations: 35 },
  { name: "Jammu and Kashmir", code: "JK", iso: "IN-JK", type: "ut", stations: 190, chargers: 230, dc_stations: 40, car_fast_dc_stations: 25 },
  { name: "Puducherry", code: "PY", iso: "IN-PY", type: "ut", stations: 85, chargers: 110, dc_stations: 20, car_fast_dc_stations: 12 },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DN", iso: "IN-DN", type: "ut", stations: 55, chargers: 70, dc_stations: 12, car_fast_dc_stations: 8 },
  { name: "Tripura", code: "TR", iso: "IN-TR", type: "state", stations: 45, chargers: 55, dc_stations: 10, car_fast_dc_stations: 6 },
  { name: "Meghalaya", code: "ML", iso: "IN-ML", type: "state", stations: 40, chargers: 50, dc_stations: 8, car_fast_dc_stations: 5 },
  { name: "Manipur", code: "MN", iso: "IN-MN", type: "state", stations: 35, chargers: 42, dc_stations: 6, car_fast_dc_stations: 4 },
  { name: "Nagaland", code: "NL", iso: "IN-NL", type: "state", stations: 30, chargers: 38, dc_stations: 5, car_fast_dc_stations: 3 },
  { name: "Sikkim", code: "SK", iso: "IN-SK", type: "state", stations: 28, chargers: 34, dc_stations: 5, car_fast_dc_stations: 3 },
  { name: "Arunachal Pradesh", code: "AR", iso: "IN-AR", type: "state", stations: 25, chargers: 30, dc_stations: 4, car_fast_dc_stations: 2 },
  { name: "Mizoram", code: "MZ", iso: "IN-MZ", type: "state", stations: 22, chargers: 26, dc_stations: 4, car_fast_dc_stations: 2 },
  { name: "Andaman and Nicobar Islands", code: "AN", iso: "IN-AN", type: "ut", stations: 20, chargers: 24, dc_stations: 3, car_fast_dc_stations: 2 },
  { name: "Ladakh", code: "LA", iso: "IN-LA", type: "ut", stations: 18, chargers: 22, dc_stations: 3, car_fast_dc_stations: 2 },
  { name: "Lakshadweep", code: "LD", iso: "IN-LD", type: "ut", stations: 12, chargers: 15, dc_stations: 2, car_fast_dc_stations: 1 }
];

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const upstream = await fetch("https://ev-charging-stations-api.vercel.app/v1/states", {
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
    clearTimeout(timeoutId);

    if (upstream.ok) {
      const json = await upstream.json();
      if (Array.isArray(json?.data) && json.data.length > 0) {
        return NextResponse.json(json.data);
      }
    }
  } catch (e) {
    // Upstream fallback
  }

  return NextResponse.json(FALLBACK_STATES);
}
