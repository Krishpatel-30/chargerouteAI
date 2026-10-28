"use client";

import React, { useState } from "react";
import { VehicleModel, TripPlanRequest } from "@/lib/types";
import { MapPin, Battery, Shield, Zap, Sliders, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface TripPlannerFormProps {
  vehicles: VehicleModel[];
  onPlanTrip: (payload: TripPlanRequest) => void;
  isLoading: boolean;
}

const GUJARAT_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Vadodara": { lat: 22.3072, lng: 73.1812 },
  "Surat": { lat: 21.1702, lng: 72.8311 },
  "Rajkot": { lat: 22.3039, lng: 70.8022 },
  "Gandhinagar": { lat: 23.2156, lng: 72.6369 },
  "Bhavnagar": { lat: 21.7645, lng: 72.1519 },
  "Junagadh": { lat: 21.5222, lng: 70.4579 },
  "Somnath": { lat: 20.9082, lng: 70.3644 },
  "Mehsana": { lat: 23.5880, lng: 72.3693 },
  "Bharuch": { lat: 21.7051, lng: 72.9959 },
  "Anand": { lat: 22.5645, lng: 72.9289 },
};

export const TripPlannerForm: React.FC<TripPlannerFormProps> = ({
  vehicles,
  onPlanTrip,
  isLoading,
}) => {
  const [originName, setOriginName] = useState("Ahmedabad");
  const [destinationName, setDestinationName] = useState("Surat");
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || "");
  const [startBatteryPct, setStartBatteryPct] = useState(90);
  const [minArrivalBatteryPct, setMinArrivalBatteryPct] = useState(15);
  const [preference, setPreference] = useState<"lowest_risk" | "fastest" | "lowest_cost" | "more_alternatives">("lowest_risk");
  const [highwayFactor, setHighwayFactor] = useState(1.15);
  const [acFactor, setAcFactor] = useState(1.10);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync default vehicle id if props load asynchronously
  React.useEffect(() => {
    if (!selectedVehicleId && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const origCoord = GUJARAT_CITY_COORDINATES[originName] || { lat: 23.0225, lng: 72.5714 };
    const destCoord = GUJARAT_CITY_COORDINATES[destinationName] || { lat: 21.1702, lng: 72.8311 };

    const payload: TripPlanRequest = {
      origin_name: `${originName}, Gujarat`,
      origin_lat: origCoord.lat,
      origin_lng: origCoord.lng,
      destination_name: `${destinationName}, Gujarat`,
      destination_lat: destCoord.lat,
      destination_lng: destCoord.lng,
      vehicle_id: selectedVehicleId || (vehicles[0]?.id || "seed_nexon"),
      start_battery_pct: startBatteryPct,
      min_arrival_battery_pct: minArrivalBatteryPct,
      preference,
      highway_factor: highwayFactor,
      ac_factor: acFactor,
    };

    onPlanTrip(payload);
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Plan EV Journey</h2>
          <p className="text-xs text-slate-500">Accounts for charging risk, backup stations, and true battery range</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
          Gujarat Corridors
        </span>
      </div>

      {/* Origin & Destination Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" /> Origin
          </label>
          <select
            value={originName}
            onChange={(e) => setOriginName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            {Object.keys(GUJARAT_CITY_COORDINATES).map((city) => (
              <option key={`orig_${city}`} value={city}>
                {city}, Gujarat
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Destination
          </label>
          <select
            value={destinationName}
            onChange={(e) => setDestinationName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            {Object.keys(GUJARAT_CITY_COORDINATES).map((city) => (
              <option key={`dest_${city}`} value={city} disabled={city === originName}>
                {city}, Gujarat
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Popular Route Quick Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] text-slate-400 font-medium">Quick routes:</span>
        {[
          ["Ahmedabad", "Surat"],
          ["Ahmedabad", "Vadodara"],
          ["Ahmedabad", "Rajkot"],
          ["Vadodara", "Surat"],
          ["Ahmedabad", "Somnath"],
        ].map(([orig, dest]) => (
          <button
            key={`${orig}-${dest}`}
            type="button"
            onClick={() => {
              setOriginName(orig);
              setDestinationName(dest);
            }}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors"
          >
            {orig} &rarr; {dest}
          </button>
        ))}
      </div>

      {/* Vehicle Profile Selection */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Select Electric Vehicle
        </label>
        <select
          value={selectedVehicleId}
          onChange={(e) => setSelectedVehicleId(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.manufacturer} {v.model} ({v.usable_battery_capacity_kwh} kWh Usable • ~{v.range_reference_km} km Ref)
            </option>
          ))}
        </select>
        {selectedVehicle && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span>Gross: <strong>{selectedVehicle.battery_capacity_kwh} kWh</strong></span>
            <span>•</span>
            <span>Usable: <strong>{selectedVehicle.usable_battery_capacity_kwh} kWh</strong></span>
            <span>•</span>
            <span>Max DC: <strong>{selectedVehicle.max_dc_power_kw} kW</strong></span>
            <span>•</span>
            <span>Base: <strong>{selectedVehicle.consumption_kwh_100km} kWh/100km</strong></span>
          </div>
        )}
      </div>

      {/* Battery SoC Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-emerald-600" /> Starting Battery
            </span>
            <span className="text-emerald-700 font-bold">{startBatteryPct}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="5"
            value={startBatteryPct}
            onChange={(e) => setStartBatteryPct(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-[10px] text-slate-400">Typical departure charge: 80% to 100%</span>
        </div>

        <div>
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-600" /> Desired Min Arrival Buffer
            </span>
            <span className="text-amber-800 font-bold">{minArrivalBatteryPct}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="30"
            step="5"
            value={minArrivalBatteryPct}
            onChange={(e) => setMinArrivalBatteryPct(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[10px] text-slate-400">Safety reserve cushion at destination</span>
        </div>
      </div>

      {/* Routing Preferences (Section 9) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Route Optimization Goal
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { id: "lowest_risk", label: "Lowest Risk", desc: "Prioritizes verified multi-stall hubs with backups" },
            { id: "fastest", label: "Fastest Trip", desc: "Favors 120kW+ fast chargers to minimize downtime" },
            { id: "lowest_cost", label: "Lowest Cost", desc: "Calculates optimal top-up energy" },
            { id: "more_alternatives", label: "Max Backups", desc: "Selects stops with highest backup density" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreference(item.id as any)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                preference === item.id
                  ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <div className="font-bold text-xs mb-0.5">{item.label}</div>
              <div className="text-[10px] text-slate-500 font-normal leading-snug">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Environmental Modifiers Accordion */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>Advanced Highway & Weather Conditions</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>Speed Factor (NE1 / Expressways):</span>
                <strong>{Math.round((highwayFactor - 1) * 100)}% extra</strong>
              </div>
              <input
                type="range"
                min="1.0"
                max="1.35"
                step="0.05"
                value={highwayFactor}
                onChange={(e) => setHighwayFactor(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Accounts for higher aerodynamic drag at 100+ km/h</span>
            </div>

            <div>
              <div className="flex justify-between font-medium text-slate-700 mb-1">
                <span>HVAC & Summer Factor:</span>
                <strong>{Math.round((acFactor - 1) * 100)}% extra</strong>
              </div>
              <input
                type="range"
                min="1.0"
                max="1.30"
                step="0.05"
                value={acFactor}
                onChange={(e) => setAcFactor(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">Accounts for Gujarat climate cabin AC usage</span>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Calculating Risk-Aware Route...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-white" />
            <span>Calculate Route & Safe Charging Plan</span>
          </>
        )}
      </button>
    </form>
  );
};
