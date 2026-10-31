"use client";

import React, { useState } from "react";
import { VehicleModel } from "@/lib/types";
import { api } from "@/lib/api";
import {
  X,
  PlusCircle,
  Zap,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Car,
  AlertCircle,
  Gauge,
  Battery,
} from "lucide-react";

interface CustomVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleCreated: (vehicle: VehicleModel) => void;
}

const CAR_CATEGORIES = [
  {
    id: "hatch",
    label: "Hatchback / City",
    icon: "🚗",
    example: "Tiago EV, Comet, eC3",
    defaultKwh: 28,
    defaultRange: 200,
    defaultDcKw: 35,
  },
  {
    id: "suv_compact",
    label: "Compact SUV",
    icon: "🚙",
    example: "Nexon EV, Punch, Curvv",
    defaultKwh: 45,
    defaultRange: 310,
    defaultDcKw: 65,
  },
  {
    id: "suv_mid",
    label: "Mid / Large SUV",
    icon: "⚡",
    example: "Harrier EV, BE 6e, ZS EV",
    defaultKwh: 60,
    defaultRange: 380,
    defaultDcKw: 90,
  },
  {
    id: "premium",
    label: "Long Range / Luxury",
    icon: "🛣️",
    example: "Ioniq 5, Seal, EV6, Model 3/Y",
    defaultKwh: 75,
    defaultRange: 460,
    defaultDcKw: 150,
  },
];

export const CustomVehicleModal: React.FC<CustomVehicleModalProps> = ({
  isOpen,
  onClose,
  onVehicleCreated,
}) => {
  // Simple primary inputs
  const [carName, setCarName] = useState("");
  const [batteryKwh, setBatteryKwh] = useState<number>(45);
  const [expectedRangeKm, setExpectedRangeKm] = useState<number>(310);
  const [chargingSpeedType, setChargingSpeedType] = useState<"standard" | "fast" | "ac_only">("standard");

  // Advanced toggles (hidden by default)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modelYear, setModelYear] = useState<number>(2025);
  const [customUsableKwh, setCustomUsableKwh] = useState<number | "">("");
  const [customConsumption, setCustomConsumption] = useState<number | "">("");
  const [customDcKw, setCustomDcKw] = useState<number | "">("");
  const [customAcKw, setCustomAcKw] = useState<number>(7.2);
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>(["CCS2", "Type 2"]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle 1-click category selection
  const handleSelectCategory = (cat: typeof CAR_CATEGORIES[0]) => {
    setBatteryKwh(cat.defaultKwh);
    setExpectedRangeKm(cat.defaultRange);
    if (cat.defaultDcKw >= 100) {
      setChargingSpeedType("fast");
    } else if (cat.defaultDcKw === 0) {
      setChargingSpeedType("ac_only");
    } else {
      setChargingSpeedType("standard");
    }
    if (!carName) {
      setCarName(cat.label);
    }
  };

  // Derive charging power based on speed selection or advanced override
  const getEffectiveDcKw = (): number => {
    if (typeof customDcKw === "number" && customDcKw >= 0) return customDcKw;
    if (chargingSpeedType === "ac_only") return 0.0;
    if (chargingSpeedType === "fast") return 120.0;
    return 60.0; // standard DC
  };

  // Auto calculate usable capacity (~93% of gross pack)
  const effectiveUsableKwh =
    typeof customUsableKwh === "number" && customUsableKwh > 0
      ? customUsableKwh
      : parseFloat((batteryKwh * 0.93).toFixed(1));

  // Auto calculate consumption: (Usable kWh / Range km) * 100
  const effectiveConsumption =
    typeof customConsumption === "number" && customConsumption > 0
      ? customConsumption
      : expectedRangeKm > 0
      ? parseFloat(((effectiveUsableKwh / expectedRangeKm) * 100).toFixed(1))
      : 15.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = carName.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter your Car Model Name (e.g. Harrier EV, Mahindra BE 6e, Tesla Model 3).");
      return;
    }

    if (!batteryKwh || batteryKwh <= 0) {
      setErrorMessage("Please enter a valid battery size (e.g. 45 kWh).");
      return;
    }

    if (!expectedRangeKm || expectedRangeKm <= 0) {
      setErrorMessage("Please enter an estimated full-charge range (e.g. 300 km).");
      return;
    }

    setIsLoading(true);

    try {
      const nameParts = trimmedName.split(" ");
      let mfg = "Custom";
      let modelStr = trimmedName;
      if (nameParts.length > 1) {
        mfg = nameParts[0];
        modelStr = nameParts.slice(1).join(" ");
      }

      const created = await api.createCustomVehicle({
        manufacturer: mfg,
        model: modelStr,
        model_year: modelYear,
        battery_capacity_kwh: batteryKwh,
        usable_battery_capacity_kwh: effectiveUsableKwh,
        consumption_kwh_100km: effectiveConsumption,
        max_dc_power_kw: getEffectiveDcKw(),
        max_ac_power_kw: customAcKw > 0 ? customAcKw : 7.2,
        range_reference_km: expectedRangeKm,
        connector_types: selectedConnectors,
        source: "Manual Easy Entry",
      });

      onVehicleCreated(created);
      onClose();
    } catch (err: any) {
      console.error("Failed to add custom vehicle:", err);
      setErrorMessage(err?.response?.data?.detail || "Could not save vehicle. Please check inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Fixed Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Easy 30-Second Setup</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Add Your Car for Trip Analysis
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Pick your vehicle category or enter battery &amp; range. We auto-calculate the rest!
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-xl p-1.5 hover:bg-slate-100 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* Quick Category Presets */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              1. Quick Category (Optional):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CAR_CATEGORIES.map((cat) => {
                const isSelected = batteryKwh === cat.defaultKwh && expectedRangeKm === cat.defaultRange;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/80 shadow-2xs ring-1 ring-emerald-500"
                        : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-900 truncate">{cat.label}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          {cat.defaultKwh} kWh • ~{cat.defaultRange} km
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Question 1: Car Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Car Model / Name *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Harrier EV, Mahindra BE 6e, Tesla Model 3"
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Question 2: Battery Capacity */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Battery Size (kWh)</span>
              </label>
              <div className="text-xs sm:text-sm font-extrabold text-emerald-700">
                {batteryKwh} kWh
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {[25, 30, 40, 45, 50, 60, 75, 90].map((kwh) => (
                <button
                  key={kwh}
                  type="button"
                  onClick={() => {
                    setBatteryKwh(kwh);
                    setExpectedRangeKm(Math.round(kwh * 6.8));
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                    batteryKwh === kwh
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {kwh}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="15"
              max="120"
              step="1"
              value={batteryKwh}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setBatteryKwh(val);
                setExpectedRangeKm(Math.round(val * 6.8));
              }}
              className="w-full accent-emerald-600 cursor-pointer h-1.5"
            />
          </div>

          {/* Question 3: Estimated Range */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                <span>4. Estimated Full-Tank Range (km)</span>
              </label>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                ~{expectedRangeKm} km
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {[200, 250, 300, 350, 400, 450, 500].map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setExpectedRangeKm(km)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                    expectedRangeKm === km
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {km}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="100"
              max="700"
              step="10"
              value={expectedRangeKm}
              onChange={(e) => setExpectedRangeKm(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5"
            />
          </div>

          {/* Question 4: Charging Speed Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>5. Fast Charging Speed:</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => setChargingSpeedType("standard")}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                  chargingSpeedType === "standard"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>⚡ Standard Fast</div>
                <div className="text-[9px] font-normal opacity-80">50–60 kW DC</div>
              </button>

              <button
                type="button"
                onClick={() => setChargingSpeedType("fast")}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                  chargingSpeedType === "fast"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>🚀 Ultra Fast</div>
                <div className="text-[9px] font-normal opacity-80">100–150 kW DC</div>
              </button>

              <button
                type="button"
                onClick={() => setChargingSpeedType("ac_only")}
                className={`p-1.5 rounded-xl border text-xs font-bold transition-all ${
                  chargingSpeedType === "ac_only"
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div>🔌 AC Only</div>
                <div className="text-[9px] font-normal opacity-80">3.3–7.2 kW</div>
              </button>
            </div>
          </div>

          {/* Optional: Collapsible Advanced Settings */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <span>{showAdvanced ? "Hide Advanced Engineering Settings" : "Need to adjust exact net usable kWh or AC charger? (Optional)"}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-2 p-3 bg-slate-100/70 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Net Usable Battery (kWh)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder={`${effectiveUsableKwh} (Auto)`}
                      value={customUsableKwh}
                      onChange={(e) => setCustomUsableKwh(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Consumption (kWh/100km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder={`${effectiveConsumption} (Auto)`}
                      value={customConsumption}
                      onChange={(e) => setCustomConsumption(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Max DC Rate (kW)
                    </label>
                    <input
                      type="number"
                      step="1"
                      placeholder={`${getEffectiveDcKw()} (Auto)`}
                      value={customDcKw}
                      onChange={(e) => setCustomDcKw(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                      Model Year
                    </label>
                    <input
                      type="number"
                      value={modelYear}
                      onChange={(e) => setModelYear(parseInt(e.target.value) || 2025)}
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-medium text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Summary Card */}
          <div className="py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="space-y-0.5 min-w-0 pr-2">
              <div className="font-extrabold text-emerald-950 truncate">
                {carName.trim() || "Your EV"} ({batteryKwh} kWh)
              </div>
              <div className="text-[10px] text-emerald-700 font-medium">
                Highway Range: <strong>~{expectedRangeKm} km</strong> • DC: <strong>{getEffectiveDcKw()} kW</strong>
              </div>
            </div>
            <div className="shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                Ready to Analyze
              </span>
            </div>
          </div>
        </form>

        {/* Fixed Modal Footer - Always Visible! */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50/90">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 hover:shadow-emerald-600/40 transition-all flex items-center gap-1.5 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Adding Vehicle...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Add Car &amp; Analyze Route</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
