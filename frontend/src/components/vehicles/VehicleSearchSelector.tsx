"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { VehicleModel } from "@/lib/types";
import {
  Car,
  Search,
  Zap,
  BatteryCharging,
  Gauge,
  ChevronDown,
  X,
  Check,
  Sparkles,
  SlidersHorizontal,
  PlusCircle,
} from "lucide-react";
import { CustomVehicleModal } from "./CustomVehicleModal";

interface VehicleSearchSelectorProps {
  vehicles: VehicleModel[];
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
  onVehicleCreated?: (vehicle: VehicleModel) => void;
  className?: string;
}

const BRAND_FILTERS = [
  { id: "all", label: "All Brands" },
  { id: "tata", label: "Tata" },
  { id: "mahindra", label: "Mahindra" },
  { id: "mg", label: "MG" },
  { id: "byd", label: "BYD" },
  { id: "hyundai", label: "Hyundai" },
  { id: "kia", label: "Kia" },
  { id: "citroën", label: "Citroën" },
  { id: "maruti suzuki", label: "Maruti Suzuki" },
  { id: "luxury", label: "Luxury (BMW/Merc/Volvo/Audi/Porsche)" },
];

const LUXURY_BRANDS = [
  "bmw",
  "mercedes-benz",
  "audi",
  "volvo",
  "porsche",
  "mini",
  "lotus",
  "rolls-royce",
  "pravaig",
];

export const VehicleSearchSelector: React.FC<VehicleSearchSelectorProps> = ({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onVehicleCreated,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Currently selected vehicle object
  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filtered vehicles based on brand and search query
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // 1. Brand filter
      const mfgLower = v.manufacturer.toLowerCase();
      if (selectedBrand === "luxury") {
        if (!LUXURY_BRANDS.includes(mfgLower)) return false;
      } else if (selectedBrand !== "all") {
        if (mfgLower !== selectedBrand.toLowerCase()) return false;
      }

      // 2. Text search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const searchable = `${v.manufacturer} ${v.model} ${v.battery_capacity_kwh} ${v.usable_battery_capacity_kwh} ${v.range_reference_km} ${v.max_dc_power_kw} ${v.model_year}`.toLowerCase();
      return searchable.includes(q);
    });
  }, [vehicles, selectedBrand, searchQuery]);

  const handleSelect = (vehicleId: string) => {
    onSelectVehicle(vehicleId);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleCreated = (vehicle: VehicleModel) => {
    onVehicleCreated?.(vehicle);
    onSelectVehicle(vehicle.id);
    setIsCustomModalOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5 text-emerald-600" />
          Select Electric Vehicle
        </label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-normal">
            {vehicles.length} Indian Market EVs
          </span>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3 h-3 text-emerald-600" />
            <span>+ Add Manual Car</span>
          </button>
        </div>
      </div>

      {/* Trigger Button: Shows Active Vehicle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full text-left p-3 rounded-xl border border-slate-300 hover:border-emerald-500 bg-white hover:bg-slate-50/70 transition-all shadow-2xs group flex items-center justify-between gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white">
              {selectedVehicle?.manufacturer || "Tata"}
            </span>
            <span className="font-bold text-slate-900 text-sm truncate">
              {selectedVehicle?.model || "Select Vehicle"}
            </span>
            <span className="text-xs text-slate-400">({selectedVehicle?.model_year || 2024})</span>
          </div>
          {selectedVehicle && (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
              <span className="font-medium">
                🔋 <strong>{selectedVehicle.usable_battery_capacity_kwh} kWh</strong> Usable
              </span>
              <span>•</span>
              <span className="font-medium">
                🛣️ ~<strong>{selectedVehicle.range_reference_km} km</strong> Range
              </span>
              <span>•</span>
              <span className="font-medium text-emerald-700">
                ⚡ Max <strong>{selectedVehicle.max_dc_power_kw} kW</strong> DC
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 group-hover:bg-emerald-100 transition-colors">
            Search
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180 text-emerald-600" : ""
            }`}
          />
        </div>
      </button>

      {/* Quick helper line to add manual car */}
      <div className="mt-1 flex items-center justify-between text-[11px] px-1 text-slate-500">
        <span>Can&apos;t find your exact EV in the 141 models?</span>
        <button
          type="button"
          onClick={() => setIsCustomModalOpen(true)}
          className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
        >
          <PlusCircle className="w-3 h-3 text-emerald-600" />
          <span>+ Add your car specs</span>
        </button>
      </div>

      {/* Search & Selection Dropdown Modal */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header Bar */}
          <div className="p-3 bg-slate-50/90 border-b border-slate-200 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by model (e.g. Nexon, Curvv, Windsor, BE 6e, Seal, Ioniq, 45 kWh)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick banner to Add Custom / Manual Car */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCustomModalOpen(true);
              }}
              className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-300/80 text-emerald-900 text-xs font-semibold flex items-center justify-between hover:bg-emerald-100 transition-colors shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Car not in list? Add manual car specs</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 underline group-hover:text-emerald-950">
                + Add Custom EV &rarr;
              </span>
            </button>

            {/* Quick Brand Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {BRAND_FILTERS.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => setSelectedBrand(brand.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all font-semibold ${
                    selectedBrand === brand.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {brand.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="px-3.5 py-1.5 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>
              Showing {filteredVehicles.length} of {vehicles.length} Indian EV models
            </span>
            {searchQuery && (
              <span className="text-emerald-700 font-bold">Filtered for &ldquo;{searchQuery}&rdquo;</span>
            )}
          </div>

          {/* Vehicle List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
            {filteredVehicles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <Car className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No electric cars match your search.</p>
                <p className="text-[11px] text-slate-400">
                  Try searching by manufacturer name, battery size (e.g. &ldquo;55&rdquo;), or clear the search.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedBrand("all");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsCustomModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add Manual Car Details</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredVehicles.map((veh) => {
                const isSelected = veh.id === selectedVehicleId;
                return (
                  <button
                    key={veh.id}
                    type="button"
                    onClick={() => handleSelect(veh.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-emerald-50/90 border border-emerald-300"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-800 text-white tracking-wider">
                          {veh.manufacturer}
                        </span>
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {veh.model}
                        </span>
                        <span className="text-[10px] text-slate-400">({veh.model_year})</span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          🔋 {veh.usable_battery_capacity_kwh} kWh
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({veh.battery_capacity_kwh} Gross)
                          </span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-700">
                          🛣️ ~<strong>{veh.range_reference_km} km</strong>
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          ⚡ <strong>{veh.max_dc_power_kw} kW</strong> Fast Charge
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 text-[10px]">
                          {veh.consumption_kwh_100km} kWh/100km
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 hover:text-emerald-700">
                          Select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Manual / Custom Vehicle Creation Modal */}
      <CustomVehicleModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onVehicleCreated={handleCreated}
      />
    </div>
  );
};
