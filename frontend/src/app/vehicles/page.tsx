"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { VehicleModel } from "@/lib/types";
import { AuthGate } from "@/components/auth/AuthGate";
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
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const POPULAR_BRANDS = ["Tata", "Mahindra", "MG", "Hyundai", "BYD", "Kia", "Citroën", "Custom"];

const QUICK_CATEGORIES = [
  { label: "🚗 Hatchback", kwh: 24, range: 200, dcKw: 35 },
  { label: "🚙 Compact SUV", kwh: 45, range: 310, dcKw: 60 },
  { label: "⚡ Mid/Large SUV", kwh: 60, range: 380, dcKw: 80 },
  { label: "🛣️ Long Range", kwh: 75, range: 460, dcKw: 120 },
];

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
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // Easy Custom EV Form state (Sensible smart defaults)
  const [manufacturer, setManufacturer] = useState("Tata");
  const [model, setModel] = useState("");
  const [grossKwh, setGrossKwh] = useState(45.0);
  const [rangeRef, setRangeRef] = useState(310);
  const [maxDcKw, setMaxDcKw] = useState(60.0);

  // Optional Advanced overrides (hidden by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customUsableOverride, setCustomUsableOverride] = useState<string>("");
  const [customConsumptionOverride, setCustomConsumptionOverride] = useState<string>("");
  const [modelYear, setModelYear] = useState(new Date().getFullYear());
  const [sourceNote, setSourceNote] = useState("Owner custom test data");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-calculated values
  const autoUsableKwh = useMemo(() => {
    if (customUsableOverride && Number(customUsableOverride) > 0) {
      return Number(customUsableOverride);
    }
    return Math.round(Number(grossKwh) * 0.94 * 10) / 10;
  }, [grossKwh, customUsableOverride]);

  const autoConsumptionRate = useMemo(() => {
    if (customConsumptionOverride && Number(customConsumptionOverride) > 0) {
      return Number(customConsumptionOverride);
    }
    if (rangeRef > 0) {
      return Math.round((autoUsableKwh / rangeRef) * 100 * 10) / 10;
    }
    return 15.0;
  }, [autoUsableKwh, rangeRef, customConsumptionOverride]);

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

  const openNewModal = () => {
    setEditingVehicleId(null);
    setManufacturer("Tata");
    setModel("");
    setGrossKwh(45.0);
    setRangeRef(310);
    setMaxDcKw(60.0);
    setCustomUsableOverride("");
    setCustomConsumptionOverride("");
    setShowAdvanced(false);
    setShowCustomModal(true);
  };

  const openEditModal = (veh: VehicleModel) => {
    setEditingVehicleId(veh.id);
    setManufacturer(veh.manufacturer);
    setModel(veh.model);
    setGrossKwh(veh.battery_capacity_kwh);
    setRangeRef(veh.range_reference_km);
    setMaxDcKw(veh.max_dc_power_kw);
    setCustomUsableOverride(String(veh.usable_battery_capacity_kwh));
    setCustomConsumptionOverride(String(veh.consumption_kwh_100km));
    setModelYear(veh.model_year || new Date().getFullYear());
    setSourceNote(veh.source || "Owner custom profile");
    setShowAdvanced(false);
    setShowCustomModal(true);
  };

  const handleCreateOrUpdateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      alert("Please enter a Model name for your vehicle (e.g. Nexon EV, Tiago EV, My EV).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<VehicleModel> = {
        id: editingVehicleId || undefined,
        manufacturer: manufacturer.trim() || "Custom",
        model: model.trim() || "Custom EV",
        model_year: Number(modelYear) || new Date().getFullYear(),
        battery_capacity_kwh: Number(grossKwh) || 45.0,
        usable_battery_capacity_kwh: autoUsableKwh,
        consumption_kwh_100km: autoConsumptionRate,
        max_dc_power_kw: Number(maxDcKw) || 60.0,
        max_ac_power_kw: 7.2,
        range_reference_km: Number(rangeRef) || 310,
        source: sourceNote || "Owner custom profile",
        connector_types: ["CCS2", "Type 2"],
        is_custom: true,
      };

      const saved = await api.createCustomVehicle(payload);
      setShowCustomModal(false);

      // Place newly saved or edited car at top of list
      setVehicles((prev) => [saved, ...prev.filter((v) => v.id !== saved.id)]);
      setFilterBrand("all");
      setSearchQuery("");
      setFeedbackMsg({
        type: "success",
        text: `Custom profile "${saved.manufacturer} ${saved.model}" saved successfully! It is now listed at the top below.`,
      });
      setTimeout(() => setFeedbackMsg(null), 6000);
      await loadVehicles();
    } catch (err) {
      console.error("Failed to save custom vehicle:", err);
      alert("Failed to save custom vehicle profile. Please check parameters.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustom = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete your custom EV profile "${name}"?`)) {
      api.deleteCustomVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setFeedbackMsg({
        type: "success",
        text: `Removed custom profile "${name}".`,
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Filter & Sort: Custom vehicles are always pinned to the top!
  const processedVehicles = useMemo(() => {
    let result = vehicles.filter((v) => {
      // "my_custom" tab filter
      if (filterBrand === "my_custom") {
        return v.is_custom === true;
      }

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

    // Sort: Pinned custom cars always come first so they are immediately visible!
    result.sort((a, b) => {
      if (a.is_custom && !b.is_custom) return -1;
      if (!a.is_custom && b.is_custom) return 1;

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

  const customVehicles = useMemo(() => {
    return vehicles.filter((v) => v.is_custom);
  }, [vehicles]);

  const brandList = useMemo(() => {
    const brands = new Set<string>();
    vehicles.forEach((v) => {
      if (!v.is_custom) brands.add(v.manufacturer);
    });
    return Array.from(brands).sort();
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
            onClick={openNewModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md w-fit shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Custom EV Profile</span>
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {feedbackMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs border ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

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
            <button
              onClick={() => setFilterBrand("all")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterBrand === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Brands
            </button>

            {/* Dedicated Custom EVs Filter Tab */}
            {customVehicles.length > 0 && (
              <button
                onClick={() => setFilterBrand("my_custom")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                  filterBrand === "my_custom"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                }`}
              >
                <span>⭐ My Custom EVs ({customVehicles.length})</span>
              </button>
            )}

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
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>
            Showing <strong>{processedVehicles.length}</strong> electric vehicle profiles
            {filterBrand === "my_custom" && <span> in <strong>My Custom EVs</strong></span>}
            {filterBrand !== "all" && filterBrand !== "my_custom" && <span> for <strong>{filterBrand}</strong></span>}
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
            {processedVehicles.map((veh) => {
              const isCustom = veh.is_custom === true;

              return (
                <div
                  key={veh.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 group overflow-hidden ${
                    isCustom
                      ? "border-emerald-400 bg-gradient-to-b from-emerald-50/30 via-white to-white shadow-sm ring-1 ring-emerald-500/30 hover:border-emerald-500 hover:shadow-lg"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
                  }`}
                >
                  {/* EV Engineering & Telemetry Header */}
                  <div
                    className={`p-4 rounded-xl text-white flex items-center justify-between border shadow-xs ${
                      isCustom
                        ? "bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/40"
                        : "bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs ${
                          isCustom
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        <Zap className="w-5 h-5 fill-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                            {veh.manufacturer}
                          </span>
                          {isCustom ? (
                            <span className="text-[9px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded shadow-2xs">
                              ⭐ CUSTOM EV
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                              {veh.model_year}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{isCustom ? "Configured by You" : "Calibrated Specs"}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Highway Range
                      </span>
                      <strong className="text-sm font-extrabold text-white">
                        ~{veh.range_reference_km} km
                      </strong>
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

                  {/* Card Actions Footer */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/plan?vehicle_id=${veh.id}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                      title={`Plan road trip with ${veh.manufacturer} ${veh.model}`}
                    >
                      <span>Plan Trip with this EV</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Dedicated Custom Actions */}
                    {isCustom && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(veh)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Edit vehicle specifications"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustom(veh.id, `${veh.manufacturer} ${veh.model}`)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Delete custom vehicle profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Easy 30-Second Custom EV Profile Builder */}
        {showCustomModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Easy 30-Second EV Setup</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingVehicleId ? "Edit Custom EV Profile" : "Create Custom EV Profile"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter your car details. We automatically calculate usable capacity &amp; real-world consumption!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleCreateOrUpdateCustom} className="p-5 overflow-y-auto space-y-4 text-xs font-medium">
                {/* 1. Brand / Manufacturer */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Brand / Manufacturer *</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {POPULAR_BRANDS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setManufacturer(b)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                          manufacturer.toLowerCase() === b.toLowerCase()
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Tata, Mahindra, MG, Hyundai"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 2. Model Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Model Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Nexon EV Long Range, Punch EV, Tiago, My EV"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 3. Quick 1-Click Category Presets (Optional) */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    1-Click Battery &amp; Range Presets (Optional):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => {
                          setGrossKwh(cat.kwh);
                          setRangeRef(cat.range);
                          setMaxDcKw(cat.dcKw);
                        }}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          grossKwh === cat.kwh && rangeRef === cat.range
                            ? "bg-emerald-50 border-emerald-400 ring-1 ring-emerald-500"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-bold text-slate-800 text-[11px]">{cat.label}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          {cat.kwh} kWh • ~{cat.range} km range
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Battery Pack (Gross kWh) with automatic Usable calculation */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Battery Pack (Gross kWh) *</span>
                    </label>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {grossKwh} kWh
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {[24, 30, 40.5, 45, 50, 60, 72.6, 80].map((kwh) => (
                      <button
                        key={kwh}
                        type="button"
                        onClick={() => {
                          setGrossKwh(kwh);
                          setRangeRef(Math.round(kwh * 6.9));
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                          grossKwh === kwh
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {kwh}
                      </button>
                    ))}
                  </div>

                  <input
                    required
                    type="number"
                    step="0.1"
                    min="10"
                    max="150"
                    value={grossKwh}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setGrossKwh(val);
                      if (val > 0) setRangeRef(Math.round(val * 6.9));
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white text-slate-900"
                  />

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
                    <span>⚡ Net Usable Capacity:</span>
                    <strong className="text-emerald-800 font-bold">{autoUsableKwh} kWh (Auto 94%)</strong>
                  </div>
                </div>

                {/* 5. Real-World Highway Range (km) with automatic consumption calculation */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Estimated Highway Range (km) *</span>
                    </label>
                    <span className="text-xs font-extrabold text-slate-900">
                      ~{rangeRef} km
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    {[180, 220, 280, 310, 350, 420, 480].map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => setRangeRef(km)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                          rangeRef === km
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {km}
                      </button>
                    ))}
                  </div>

                  <input
                    required
                    type="number"
                    step="1"
                    min="50"
                    max="800"
                    value={rangeRef}
                    onChange={(e) => setRangeRef(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white text-slate-900"
                  />

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
                    <span>⚡ Base Consumption Rate:</span>
                    <strong className="text-slate-800 font-bold">{autoConsumptionRate} kWh/100km (Auto)</strong>
                  </div>
                </div>

                {/* 6. Max DC Fast Charge Rate */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Max DC Fast Charging Rate</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 60, label: "60 kW (Standard DC)" },
                      { val: 120, label: "120 kW (Ultra Fast)" },
                      { val: 30, label: "30 kW (City DC)" },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setMaxDcKw(opt.val)}
                        className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all ${
                          maxDcKw === opt.val
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Interactive Card Preview */}
                <div className="p-3 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-xl border border-emerald-500/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                    <span>LIVE PREVIEW:</span>
                    <span className="bg-emerald-500 text-white px-1.5 py-0.2 rounded text-[9px]">⭐ CUSTOM EV</span>
                  </div>
                  <div className="font-extrabold text-sm text-white">
                    {manufacturer || "Custom"} {model || "Model Name"}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-300">
                    <span>~{rangeRef} km Range</span>
                    <span>•</span>
                    <span>{autoUsableKwh} kWh Usable</span>
                    <span>•</span>
                    <span>{maxDcKw} kW DC</span>
                  </div>
                </div>

                {/* Optional Collapsible Advanced Engineering Settings */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showAdvanced ? "Hide Advanced Engineering Settings" : "Need to adjust exact net usable kWh or model year? (Optional)"}</span>
                    {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showAdvanced && (
                    <div className="mt-2.5 p-3.5 bg-slate-100 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            Net Usable Override (kWh)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder={`${autoUsableKwh} (Auto)`}
                            value={customUsableOverride}
                            onChange={(e) => setCustomUsableOverride(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                            Consumption Override (kWh/100km)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder={`${autoConsumptionRate} (Auto)`}
                            value={customConsumptionOverride}
                            onChange={(e) => setCustomConsumptionOverride(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Model Year</label>
                          <input
                            type="number"
                            value={modelYear}
                            onChange={(e) => setModelYear(parseInt(e.target.value) || new Date().getFullYear())}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Source Note</label>
                          <input
                            type="text"
                            value={sourceNote}
                            onChange={(e) => setSourceNote(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save &amp; View in Garage</span>
                    )}
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
