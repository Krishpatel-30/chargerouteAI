"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ChargingStation } from "@/lib/types";
import { getRiskColorClass, getStatusBadgeClass } from "@/lib/utils";
import { RouteMap } from "@/components/map/RouteMap";
import {
  Search,
  Filter,
  Zap,
  MapPin,
  Clock,
  Shield,
  Layers,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function ChargersPage() {
  const [chargers, setChargers] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [operator, setOperator] = useState("");
  const [connectorType, setConnectorType] = useState("");
  const [city, setCity] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const loadChargers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getChargers({
        search: search || undefined,
        operator: operator || undefined,
        connector_type: connectorType || undefined,
        city: city || undefined,
        limit: 100,
      });
      setChargers(data);
    } catch (err) {
      console.error("Error loading chargers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChargers();
  }, [operator, connectorType, city]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadChargers();
  };

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Charging Station Discovery
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Explore verified EV charging stations along Gujarat highway corridors and urban hubs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === "grid"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === "map"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Map View
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by station name, operator, highway, or city (e.g. Anand, Statiq, Express Way)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            <select
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="">All Operators</option>
              <option value="Tata Power">Tata Power EZ Charge</option>
              <option value="Jio-bp pulse">Jio-bp pulse</option>
              <option value="Statiq">Statiq</option>
              <option value="ChargeZone">ChargeZone</option>
              <option value="Zeon">Zeon Charging</option>
              <option value="Relux">Relux Electric</option>
            </select>

            <select
              value={connectorType}
              onChange={(e) => setConnectorType(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="">All Connectors</option>
              <option value="CCS2">CCS2 (Standard DC Fast)</option>
              <option value="Type 2">Type 2 (AC Slow/Fast)</option>
              <option value="Bharat">Bharat DC-001</option>
            </select>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="">All Gujarat Cities</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Surat">Surat</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Anand">Anand / NE1</option>
              <option value="Nadiad">Nadiad</option>
              <option value="Bharuch">Bharuch</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Mehsana">Mehsana</option>
              <option value="Somnath">Somnath</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setOperator("");
                setConnectorType("");
                setCity("");
                loadChargers();
              }}
              className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium text-center"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Content View: Grid or Map */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs uppercase font-bold tracking-wider">Discovering Stations...</span>
          </div>
        ) : viewMode === "map" ? (
          <div className="space-y-4">
            <RouteMap allChargers={chargers} className="w-full h-[580px]" />
            <p className="text-xs text-slate-500 text-center">
              Displaying {chargers.length} charging stations. Click any stall marker to inspect live details and risk ratings.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
              <span>Found <strong>{chargers.length}</strong> stations matching filters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chargers.map((st) => {
                const risk = st.risk_assessment;
                const riskColor = risk ? getRiskColorClass(risk.category) : null;
                const statusBadge = getStatusBadgeClass(st.live_status);

                return (
                  <div
                    key={st.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusBadge}`}>
                          {st.live_status}
                        </span>
                        {risk && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskColor?.badge}`}>
                            Risk: {risk.score}/100
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{st.name}</h3>
                        <span className="text-xs text-slate-500 font-medium block">
                          {st.operator} • {st.city || "Gujarat"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {st.address || "Corridor highway station"}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-600" />
                          {st.max_power_kw} kW
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {st.total_plugs} Plugs
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {st.opening_hours}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Source: {st.source_provider}
                      </span>
                      <Link
                        href={`/chargers/${st.id}`}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                      >
                        <span>Details & Backups</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
