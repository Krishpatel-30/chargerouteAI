import { NextResponse } from "next/server";
import seedChargers from "@/data/seed_chargers.json";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "1000", 10);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const state = searchParams.get("state")?.toLowerCase().trim();
    const city = searchParams.get("city")?.toLowerCase().trim();
    const operator = searchParams.get("operator")?.toLowerCase().trim();
    const connectorType = searchParams.get("connector_type")?.toLowerCase().trim();
    const current = searchParams.get("current")?.toUpperCase().trim();
    const minPowerKw = parseFloat(searchParams.get("min_power_kw") || "0");

    let list = seedChargers as any[];

    // 1. State filter
    if (state) {
      list = list.filter((c) => c.state?.toLowerCase() === state);
    }

    // 2. City filter
    if (city) {
      list = list.filter((c) => c.city?.toLowerCase() === city);
    }

    // 3. Operator filter
    if (operator) {
      list = list.filter((c) => c.operator?.toLowerCase().includes(operator));
    }

    // 4. Connector type filter
    if (connectorType) {
      list = list.filter((c) => {
        if (!c.connector_types) return false;
        return c.connector_types.some((conn: any) => {
          const typeStr = typeof conn === "object" ? conn.type : conn;
          return typeStr?.toLowerCase().includes(connectorType);
        });
      });
    }

    // 5. Current filter (DC vs AC)
    if (current === "DC") {
      list = list.filter((c) => {
        if ((c.max_power_kw || 0) >= 25) return true;
        if (c.currents && c.currents.includes("DC")) return true;
        if (c.connector_types) {
          return c.connector_types.some((conn: any) => {
            const typeStr = typeof conn === "object" ? conn.type : conn;
            return ["ccs2", "chademo", "dc"].some((t) =>
              typeStr?.toLowerCase().includes(t)
            );
          });
        }
        return false;
      });
    } else if (current === "AC") {
      list = list.filter((c) => {
        if ((c.max_power_kw || 0) < 25) return true;
        if (c.currents && c.currents.includes("AC")) return true;
        if (c.connector_types) {
          return c.connector_types.some((conn: any) => {
            const typeStr = typeof conn === "object" ? conn.type : conn;
            return ["type 2", "ac"].some((t) =>
              typeStr?.toLowerCase().includes(t)
            );
          });
        }
        return false;
      });
    }

    // 6. Min Power filter
    if (minPowerKw > 0) {
      list = list.filter((c) => (c.max_power_kw || 0) >= minPowerKw);
    }

    // 7. General search query (name, address, city, state, operator)
    if (search) {
      list = list.filter((c) => {
        const full = `${c.name || ""} ${c.address || ""} ${c.city || ""} ${
          c.district || ""
        } ${c.state || ""} ${c.operator || ""}`.toLowerCase();
        return full.includes(search);
      });
    }

    // Ensure each station has an id and valid coordinates
    const formatted = list.map((c, idx) => ({
      ...c,
      id: c.id || c.external_id || `charger_${idx}`,
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
      max_power_kw: Number(c.max_power_kw) || 50,
      total_plugs: Number(c.total_plugs) || 2,
      live_status: c.live_status || "operational",
    }));

    return NextResponse.json(formatted.slice(0, limit));
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Failed to load charging stations" },
      { status: 500 }
    );
  }
}
