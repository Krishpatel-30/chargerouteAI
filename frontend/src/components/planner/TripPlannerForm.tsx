"use client";

import React, { useState } from "react";
import { VehicleModel, TripPlanRequest } from "@/lib/types";
import { LocationAutocomplete, SelectedLocation } from "./LocationAutocomplete";
import { VehicleSearchSelector } from "../vehicles/VehicleSearchSelector";
import {
  MapPin,
  Battery,
  Shield,
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  Loader2,
  Globe2,
  Sparkles,
} from "lucide-react";

interface TripPlannerFormProps {
  vehicles: VehicleModel[];
  onPlanTrip: (payload: TripPlanRequest) => void;
  isLoading: boolean;
  onVehicleCreated?: (vehicle: VehicleModel) => void;
}

export const TripPlannerForm: React.FC<TripPlannerFormProps> = ({
  vehicles,
  onPlanTrip,
  isLoading,
  onVehicleCreated,
}) => {
  const [origin, setOrigin] = useState<SelectedLocation>({
    name: "New Delhi, Delhi",
    lat: 28.6139,
    lng: 77.2090,
  });
  const [destination, setDestination] = useState<SelectedLocation>({
    name: "Agra, Uttar Pradesh",
    lat: 27.1767,
    lng: 78.0081,
  });
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || "");
  const [startBatteryPct, setStartBatteryPct] = useState(90);
  const [minArrivalBatteryPct, setMinArrivalBatteryPct] = useState(15);
  const [preference, setPreference] = useState<"lowest_risk" | "fastest" | "lowest_cost" | "more_alternatives">("lowest_risk");
  const [highwayFactor, setHighwayFactor] = useState(1.15);
  const [acFactor, setAcFactor] = useState(1.10);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [routePresetTab, setRoutePresetTab] = useState<"highway" | "city">("highway");

  // Sync default vehicle id if props load asynchronously
  React.useEffect(() => {
    if (!selectedVehicleId && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: TripPlanRequest = {
      origin_name: origin.name,
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      destination_name: destination.name,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      vehicle_id: selectedVehicleId || (vehicles[0]?.id || "seed_nexon_45"),
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
          <p className="text-xs text-slate-500">Whole India coverage &amp; Google Maps — calculated with battery physics &amp; backup stations</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
          <Globe2 className="w-3 h-3 text-emerald-700" /> Pan-India EV Network
        </span>
      </div>

      {/* Google Maps / India Search Banner */}
      <div className="rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/70 p-3 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 font-semibold">Google Maps &amp; Pan-India Geocoding Active:</strong> Search any Indian city, town, expressway toll, or highway hub across Delhi-NCR, Maharashtra, Karnataka, Tamil Nadu, Telangana, Rajasthan, Gujarat, etc.
        </div>
      </div>

      {/* Origin & Destination Autocomplete Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LocationAutocomplete
          label="Origin"
          icon={<MapPin className="w-3.5 h-3.5 text-slate-500" />}
          value={origin}
          onChange={setOrigin}
          placeholder="Type origin city, highway or town (e.g. New Delhi, Mumbai, Bengaluru)..."
        />

        <LocationAutocomplete
          label="Destination"
          icon={<MapPin className="w-3.5 h-3.5 text-emerald-600" />}
          value={destination}
          onChange={setDestination}
          placeholder="Type destination city or hub (e.g. Agra, Jaipur, Pune, Mysuru)..."
        />
      </div>

      {/* Popular Route & City Commute Quick Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" /> Quick Trip Presets:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setRoutePresetTab("highway")}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                routePresetTab === "highway"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🛣️ Highway Corridors
            </button>
            <button
              type="button"
              onClick={() => setRoutePresetTab("city")}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                routePresetTab === "city"
                  ? "bg-white text-emerald-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏙️ City Commutes
            </button>
          </div>
        </div>

        {routePresetTab === "highway" ? (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { label: "Delhi → Agra (Yamuna Expwy)", o: { name: "New Delhi, Delhi", lat: 28.6139, lng: 77.2090 }, d: { name: "Agra, Uttar Pradesh", lat: 27.1767, lng: 78.0081 } },
              { label: "Delhi → Jaipur (NH-48)", o: { name: "New Delhi, Delhi", lat: 28.6139, lng: 77.2090 }, d: { name: "Jaipur, Rajasthan", lat: 26.9124, lng: 75.7873 } },
              { label: "Mumbai → Pune (Expwy)", o: { name: "Mumbai, Maharashtra", lat: 19.0760, lng: 72.8777 }, d: { name: "Pune, Maharashtra", lat: 18.5204, lng: 73.8567 } },
              { label: "Bengaluru → Mysuru (Expwy)", o: { name: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 }, d: { name: "Mysuru, Karnataka", lat: 12.2958, lng: 76.6394 } },
              { label: "Bengaluru → Chennai (NH-48)", o: { name: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 }, d: { name: "Chennai, Tamil Nadu", lat: 13.0827, lng: 80.2707 } },
              { label: "Mumbai → Goa (NH-48/66)", o: { name: "Mumbai, Maharashtra", lat: 19.0760, lng: 72.8777 }, d: { name: "Panaji, Goa", lat: 15.4909, lng: 73.8278 } },
              { label: "Ahmedabad → Surat (NE-1)", o: { name: "Ahmedabad, Gujarat", lat: 23.0225, lng: 72.5714 }, d: { name: "Surat, Gujarat", lat: 21.1702, lng: 72.8311 } },
              { label: "Hyderabad → Vijayawada (NH-65)", o: { name: "Hyderabad, Telangana", lat: 17.3850, lng: 78.4867 }, d: { name: "Vijayawada, Andhra Pradesh", lat: 16.5062, lng: 80.6480 } },
            ].map((route) => (
              <button
                key={route.label}
                type="button"
                onClick={() => {
                  setOrigin(route.o);
                  setDestination(route.d);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-colors border border-slate-200/60"
              >
                {route.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { label: "Delhi: Connaught Place → Gurugram Cyber Hub", o: { name: "Connaught Place, New Delhi", lat: 28.6315, lng: 77.2167 }, d: { name: "DLF Cyber Hub, Gurugram", lat: 28.4950, lng: 77.0895 } },
              { label: "Mumbai: Nariman Point → Thane Viviana Mall", o: { name: "Nariman Point, Mumbai", lat: 18.9280, lng: 72.8225 }, d: { name: "Viviana Mall, Thane West", lat: 19.2085, lng: 72.9715 } },
              { label: "Bengaluru: Electronic City → Airport Plaza", o: { name: "Electronic City Phase 1, Bengaluru", lat: 12.8495, lng: 77.6635 }, d: { name: "Kempegowda Airport T1/T2, Bengaluru", lat: 13.1985, lng: 77.7065 } },
              { label: "Hyderabad: Secunderabad → Gachibowli WaveRock", o: { name: "Secunderabad, Hyderabad", lat: 17.4399, lng: 78.4983 }, d: { name: "WaveRock Financial District, Gachibowli", lat: 17.4190, lng: 78.3480 } },
              { label: "Pune: Hinjewadi Ph 3 → Viman Nagar Phoenix", o: { name: "Hinjewadi Phase 3, Pune", lat: 18.5910, lng: 73.7380 }, d: { name: "Phoenix Marketcity, Viman Nagar, Pune", lat: 18.5615, lng: 73.9168 } },
              { label: "Ahmedabad: GIFT City → Prahladnagar / SBR", o: { name: "GIFT City, Gandhinagar", lat: 23.1605, lng: 72.6845 }, d: { name: "Prahladnagar, Ahmedabad", lat: 23.0125, lng: 72.5110 } },
              { label: "Chennai: Anna Nagar → TIDEL Park OMR", o: { name: "Anna Nagar, Chennai", lat: 13.0850, lng: 80.2115 }, d: { name: "TIDEL Park OMR, Chennai", lat: 12.9895, lng: 80.2475 } },
              { label: "Kolkata: Howrah Station → New Town Rajarhat", o: { name: "Howrah Railway Station, Kolkata", lat: 22.5850, lng: 88.3420 }, d: { name: "City Centre 2, New Town Rajarhat", lat: 22.6225, lng: 88.4550 } },
            ].map((route) => (
              <button
                key={route.label}
                type="button"
                onClick={() => {
                  setOrigin(route.o);
                  setDestination(route.d);
                }}
                className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium transition-colors border border-emerald-200"
              >
                {route.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Searchable Indian Market EV Selector */}
      <VehicleSearchSelector
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
        onVehicleCreated={(created) => {
          setSelectedVehicleId(created.id);
          onVehicleCreated?.(created);
        }}
      />

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
            min="10"
            max="100"
            step="5"
            value={startBatteryPct}
            onChange={(e) => setStartBatteryPct(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <span className="text-[10px] text-slate-400">Departure battery (e.g. 15-25% for city recharge, 80-100% for highway)</span>
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
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            Highway Speed &amp; AC Weather Modifiers
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                <span>Cruising Speed Multiplier (f_highway)</span>
                <strong className="text-slate-900">{highwayFactor.toFixed(2)}x</strong>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.35"
                step="0.05"
                value={highwayFactor}
                onChange={(e) => setHighwayFactor(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.9x (60-70 km/h)</span>
                <span>1.15x (100 km/h Expressway)</span>
                <span>1.35x (120+ km/h aggressive)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1">
                <span>Cabin Climate / AC Load Multiplier (f_ac)</span>
                <strong className="text-slate-900">{acFactor.toFixed(2)}x</strong>
              </div>
              <input
                type="range"
                min="1.0"
                max="1.25"
                step="0.05"
                value={acFactor}
                onChange={(e) => setAcFactor(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>1.0x (AC Off / Winter)</span>
                <span>1.10x (Normal Climate)</span>
                <span>1.25x (Peak 45°C Indian Summer)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plan Journey Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Calculating Multi-Factor Route &amp; Backups...</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 fill-white" />
            <span>Calculate EV Route &amp; Safe Stops</span>
          </>
        )}
      </button>
    </form>
  );
};
