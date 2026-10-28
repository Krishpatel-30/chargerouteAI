"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { VehicleModel } from "@/lib/types";
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
} from "lucide-react";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterBrand, setFilterBrand] = useState("all");
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom Vehicle Form state
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [modelYear, setModelYear] = useState(2024);
  const [grossKwh, setGrossKwh] = useState(40.0);
  const [usableKwh, setUsableKwh] = useState(38.0);
  const [consumption, setConsumption] = useState(15.0);
  const [maxDcKw, setMaxDcKw] = useState(50.0);
  const [rangeRef, setRangeRef] = useState(300.0);
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

  const filteredVehicles = vehicles.filter((v) => {
    if (filterBrand === "all") return true;
    return v.manufacturer.toLowerCase() === filterBrand.toLowerCase();
  });

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Supported Vehicle Profiles
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Deterministic consumption benchmarks distinguishing gross battery size from usable capacity.
            </p>
          </div>
          <button
            onClick={() => setShowCustomModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors w-fit"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Custom Vehicle Profile</span>
          </button>
        </div>

        {/* Brand Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["all", "Tata", "MG", "Hyundai", "BYD", "Mahindra", "Kia"].map((brand) => (
            <button
              key={brand}
              onClick={() => setFilterBrand(brand)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filterBrand === brand
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {brand === "all" ? "All Manufacturers" : brand}
            </button>
          ))}
        </div>

        {/* Vehicles Grid */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs uppercase font-bold tracking-wider">Loading Vehicle Specs...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVehicles.map((veh) => (
              <div
                key={veh.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {veh.manufacturer}
                    </span>
                    {veh.is_custom ? (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        Custom User Profile
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">
                        Model Year {veh.model_year}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{veh.model}</h3>
                    <span className="text-xs text-slate-500 font-medium">
                      Real Highway Reference: <strong className="text-slate-800">~{veh.range_reference_km} km</strong>
                    </span>
                  </div>

                  {/* Battery Specs Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Usable Battery</span>
                      <strong className="text-slate-900">{veh.usable_battery_capacity_kwh} kWh</strong>
                      <span className="text-[10px] text-slate-400 block">Gross: {veh.battery_capacity_kwh} kWh</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Consumption</span>
                      <strong className="text-slate-900">{veh.consumption_kwh_100km} kWh</strong>
                      <span className="text-[10px] text-slate-400 block">per 100 km</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Max DC Fast</span>
                      <strong className="text-emerald-700">{veh.max_dc_power_kw} kW</strong>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Connectors</span>
                      <strong className="text-slate-900 truncate block">
                        {(veh.connector_types || []).join(", ")}
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 italic line-clamp-1">
                    Source: {veh.source}
                  </p>
                </div>

                <Link
                  href={`/plan`}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Plan Trip With This EV</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Vehicle Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Create Custom Vehicle Profile</h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata, Mahindra, Hyundai"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexon EV Long Range"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gross Battery (kWh)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={grossKwh}
                    onChange={(e) => setGrossKwh(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usable Battery (kWh)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={usableKwh}
                    onChange={(e) => setUsableKwh(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consumption (kWh/100km)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={consumption}
                    onChange={(e) => setConsumption(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max DC Power (kW)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={maxDcKw}
                    onChange={(e) => setMaxDcKw(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ref Range (km)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={rangeRef}
                    onChange={(e) => setRangeRef(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specification Source / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Owner actual highway telemetry log"
                  value={sourceNote}
                  onChange={(e) => setSourceNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Vehicle Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
