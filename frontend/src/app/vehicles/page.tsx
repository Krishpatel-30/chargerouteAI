"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { VehicleModel } from "@/lib/types";
import { AuthGate } from "@/components/auth/AuthGate";
import { getVehicleImage } from "@/lib/vehicleImages";
import {
  Car,
  Zap,
  Battery,
  Gauge,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Search,
  X,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

export default function VehiclesPage() {
  return (
    <AuthGate
      featureTitle="Indian Market EV Catalog & Custom Builder"
      featureDescription="Sign in to browse 141+ Indian EV models, compare usable battery sizes, and analyze your custom vehicle."
      redirectUrl="/vehicles"
    >
      <VehiclesContent />
    </AuthGate>
  );
}

function VehiclesContent() {
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [sortBy, setSortBy] = useState<"range" | "battery" | "dc_speed" | "name">("range");
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom Vehicle Form state
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [modelYear, setModelYear] = useState(2024);
  const [grossKwh, setGrossKwh] = useState(45.0);
  const [usableKwh, setUsableKwh] = useState(42.5);
  const [consumption, setConsumption] = useState(15.0);
  const [maxDcKw, setMaxDcKw] = useState(60.0);
  const [rangeRef, setRangeRef] = useState(350.0);
  const [sourceNote, setSourceNote] = useState("Owner custom test data");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const data = await api.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error("Error loading vehicles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createCustomVehicle({
        manufacturer,
        model,
        model_year: modelYear,
        battery_capacity_kwh: grossKwh,
        usable_battery_capacity_kwh: usableKwh,
        consumption_kwh_100km: consumption,
        max_dc_power_kw: maxDcKw,
        range_reference_km: rangeRef,
        source: sourceNote,
        connector_types: ["CCS2", "Type 2"],
      });
      setShowCustomModal(false);
      loadVehicles();
    } catch (err) {
      alert("Failed to create custom vehicle profile. Please check parameters.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort
  const processedVehicles = useMemo(() => {
    let result = vehicles.filter((v) => {
      // Brand filter
      if (filterBrand !== "all") {
        if (v.manufacturer.toLowerCase() !== filterBrand.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const full = `${v.manufacturer} ${v.model} ${v.battery_capacity_kwh} ${v.usable_battery_capacity_kwh} ${v.range_reference_km} ${v.max_dc_power_kw}`.toLowerCase();
        if (!full.includes(q)) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === "range") {
        return b.range_reference_km - a.range_reference_km;
      } else if (sortBy === "battery") {
        return b.usable_battery_capacity_kwh - a.usable_battery_capacity_kwh;
      } else if (sortBy === "dc_speed") {
        return b.max_dc_power_kw - a.max_dc_power_kw;
      } else {
        return `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`);
      }
    });

    return result;
  }, [vehicles, filterBrand, searchQuery, sortBy]);

  const brandList = useMemo(() => {
    const brands = new Set<string>();
    vehicles.forEach((v) => brands.add(v.manufacturer));
    return ["all", ...Array.from(brands).sort()];
  }, [vehicles]);

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{vehicles.length} Indian Market Electric Cars Indexed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Indian Market EV Directory &amp; Range Specs
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Deterministic consumption benchmarks distinguishing gross battery pack from net usable capacity, calibrated for Indian highway temperatures and AC loads.
            </p>
          </div>
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors w-fit shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Custom EV Profile</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search any EV car by name, brand, battery size (e.g. Nexon, Curvv, Windsor, BE 6e, Seal, 55 kWh)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="range">Range (Highest First)</option>
                <option value="battery">Battery Size (Largest)</option>
                <option value="dc_speed">DC Fast Charge Rate</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Brand Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {brandList.map((brand) => (
              <button
                key={brand}
                onClick={() => setFilterBrand(brand)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterBrand === brand
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {brand === "all" ? "All Brands" : brand}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>
            Showing <strong>{processedVehicles.length}</strong> electric vehicle profiles
            {filterBrand !== "all" && <span> for <strong>{filterBrand}</strong></span>}
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-emerald-700 hover:underline font-semibold"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* Vehicles Grid */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs uppercase font-bold tracking-wider">Loading Indian Market EV Catalog...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedVehicles.map((veh) => (
              <div
                key={veh.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group overflow-hidden"
              >
                {/* Real Vehicle Image Header */}
                <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-100">
                  <img
                    src={getVehicleImage(veh.manufacturer, veh.model)}
                    alt={`${veh.manufacturer} ${veh.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
                      {veh.manufacturer}
                    </span>
                  </div>
                  {veh.is_custom ? (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded shadow-xs">
                        Custom
                      </span>
                    </div>
                  ) : (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-semibold text-white/90 bg-black/50 px-2 py-0.5 rounded">
                        Model Year {veh.model_year}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    <span className="font-extrabold text-emerald-400">~{veh.range_reference_km} km Highway</span>
                    <span className="text-[10px] bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded border border-white/20">
                      {veh.max_dc_power_kw} kW DC
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {veh.model}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">
                      Real Highway Reference: <strong className="text-slate-800">~{veh.range_reference_km} km</strong>
                    </span>
                  </div>

                  {/* Battery Specs Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Net Usable</span>
                      <strong className="text-slate-900 text-sm">{veh.usable_battery_capacity_kwh} kWh</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gross Pack</span>
                      <strong className="text-slate-700">{veh.battery_capacity_kwh} kWh</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Max DC Fast Charge</span>
                      <strong className="text-emerald-700">{veh.max_dc_power_kw} kW</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Base Consumption</span>
                      <strong className="text-slate-700">{veh.consumption_kwh_100km} kWh/100km</strong>
                    </div>
                  </div>

                  {/* Connectors */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Plugs:</span>
                    {(veh.connector_types || ["CCS2"]).map((conn) => (
                      <span
                        key={conn}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                      >
                        {conn}
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    {veh.source}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/plan"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Plan Trip with this EV</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Creating Custom Vehicle */}
        {showCustomModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">Create Custom EV Profile</h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustom} className="space-y-4 text-xs font-medium">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Manufacturer</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Tata, Mahindra"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Model Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Nexon EV Custom"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Gross Battery Pack (kWh)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={grossKwh}
                      onChange={(e) => setGrossKwh(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Net Usable Capacity (kWh)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={usableKwh}
                      onChange={(e) => setUsableKwh(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Max DC (kW)</label>
                    <input
                      required
                      type="number"
                      step="1"
                      value={maxDcKw}
                      onChange={(e) => setMaxDcKw(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Base Rate (kWh/100km)</label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      value={consumption}
                      onChange={(e) => setConsumption(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Real Range (km)</label>
                    <input
                      required
                      type="number"
                      step="1"
                      value={rangeRef}
                      onChange={(e) => setRangeRef(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Source / Modification Note</label>
                  <input
                    type="text"
                    value={sourceNote}
                    onChange={(e) => setSourceNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
