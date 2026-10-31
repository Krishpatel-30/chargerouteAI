"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ChargingStation, IndiaEVMetadata, IndiaState, VehicleModel } from "@/lib/types";
import { getRiskColorClass, getStatusBadgeClass } from "@/lib/utils";
import { RouteMap } from "@/components/map/RouteMap";
import { AuthGate } from "@/components/auth/AuthGate";
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
  Navigation,
  RefreshCw,
  Info,
  Car,
  Building2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

export default function ChargersPage() {
  return (
    <AuthGate
      featureTitle="Pan-India EV Charging Stations Directory"
      featureDescription="Sign in to explore 29,000+ Bureau of Energy Efficiency (BEE) verified highway & city charging hubs, live tariffs, and backup stations."
      redirectUrl="/chargers"
    >
      <ChargersContent />
    </AuthGate>
  );
}

function ChargersContent() {
  const [chargers, setChargers] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState<IndiaEVMetadata | null>(null);
  const [statesList, setStatesList] = useState<IndiaState[]>([]);
  const [vehiclesList, setVehiclesList] = useState<VehicleModel[]>([]);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [operator, setOperator] = useState("");
  const [connectorType, setConnectorType] = useState("");
  const [currentType, setCurrentType] = useState<"all" | "DC" | "AC">("all");
  const [minPowerKw, setMinPowerKw] = useState<number | "">("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [hubType, setHubType] = useState<"all" | "city" | "highway">("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // GPS Proximity Discovery
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsRadiusKm, setGpsRadiusKm] = useState<number>(25);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Dataset Sync Status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Load Initial Metadata, States, and Vehicles Catalog
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [metaData, statesData, vehData] = await Promise.all([
          api.getChargersMetadata().catch(() => null),
          api.getChargerStates().catch(() => []),
          api.getVehicles().catch(() => []),
        ]);
        if (metaData) setMetadata(metaData);
        if (statesData) setStatesList(statesData);
        if (vehData) setVehiclesList(vehData);
      } catch (e) {
        console.warn("Could not load supplementary metadata:", e);
      }
    };
    fetchInitialData();
  }, []);

  // Main Station Loader
  const loadChargers = async () => {
    setIsLoading(true);
    setLocationError(null);
    try {
      if (userLocation) {
        // GPS Proximity Query
        const data = await api.getNearbyChargers({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius_km: gpsRadiusKm,
          current: currentType === "all" ? undefined : currentType,
          min_power_kw: minPowerKw ? Number(minPowerKw) : undefined,
          connector_type: connectorType || undefined,
          vehicle_id: selectedVehicleId || undefined,
          limit: 100,
        });
        setChargers(data);
      } else {
        // Standard Parametric Query
        const data = await api.getChargers({
          search: search || undefined,
          state: selectedState || undefined,
          city: selectedCity || undefined,
          operator: operator || undefined,
          connector_type: connectorType || undefined,
          current: currentType === "all" ? undefined : currentType,
          min_power_kw: minPowerKw ? Number(minPowerKw) : undefined,
          vehicle_id: selectedVehicleId || undefined,
          limit: 500,
        });
        setChargers(data);
      }
    } catch (err) {
      console.error("Error loading charging stations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChargers();
  }, [
    selectedState,
    selectedCity,
    operator,
    connectorType,
    currentType,
    minPowerKw,
    selectedVehicleId,
    userLocation,
    gpsRadiusKm,
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadChargers();
  };

  // GPS "Find Near Me" Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        setLocationError("Location access denied. Please allow location permissions or search by state/city.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setLocationError(null);
  };

  // On-demand Dataset Refresh / Sync with India EV API
  const handleSyncDataset = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.syncIndiaStations({ pages: 5, page_size: 100 });
      setSyncMessage(`Successfully refreshed ${res.added || 0} new and updated ${res.updated || 0} charging station records from BEE directory!`);
      const updatedMeta = await api.getChargersMetadata().catch(() => null);
      if (updatedMeta) setMetadata(updatedMeta);
      await loadChargers();
    } catch (err) {
      setSyncMessage("Sync error. Using cached government dataset.");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 8000);
    }
  };

  // Dynamically extract unique cities from active list
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    chargers.forEach((c) => {
      if (c.city && c.city.trim() !== "") set.add(c.city.trim());
    });
    return Array.from(set).sort();
  }, [chargers]);

  // Hub Type Filter (City vs Expressway)
  const filteredChargers = useMemo(() => {
    if (hubType === "all") return chargers;
    if (hubType === "city") {
      return chargers.filter(
        (c) =>
          c.source_provider?.toLowerCase().includes("city") ||
          c.access_restrictions?.toLowerCase().includes("mall") ||
          c.access_restrictions?.toLowerCase().includes("parking") ||
          c.access_restrictions?.toLowerCase().includes("hub") ||
          c.address?.toLowerCase().includes("mall") ||
          c.address?.toLowerCase().includes("park") ||
          c.address?.toLowerCase().includes("road")
      );
    } else {
      return chargers.filter(
        (c) =>
          c.source_provider?.toLowerCase().includes("corridor") ||
          c.name?.toLowerCase().includes("expressway") ||
          c.name?.toLowerCase().includes("highway") ||
          c.address?.toLowerCase().includes("nh-") ||
          c.address?.toLowerCase().includes("expressway") ||
          c.address?.toLowerCase().includes("ne-1") ||
          c.address?.toLowerCase().includes("toll")
      );
    }
  }, [chargers, hubType]);

  const selectedVehicleObj = useMemo(() => {
    return vehiclesList.find((v) => v.id === selectedVehicleId);
  }, [vehiclesList, selectedVehicleId]);

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. OFFICIAL GOVERNMENT DATASET & ATTRIBUTION BANNER */}
        <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bureau of Energy Efficiency (BEE) • Ministry of Power, Govt. of India</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  Snapshot: {metadata?.snapshot_label || "till 26th October 2025"}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                India-Wide EV Public Charging Stations Directory
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Integrated keyless REST directory of <strong>29,184+</strong> verified stations across 36 Indian states and union territories. 
                Historical government directory records are enriched with deterministic risk analytics and backup corridor discovery.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-emerald-300/80 font-medium">
                <span>✓ 70+ Charging Operators</span>
                <span>✓ 5,300+ Indian Cities &amp; Talukas</span>
                <span>✓ Verified DC Fast (CCS2) &amp; AC Stalls</span>
                <span>⚠️ Static government directory records; not live socket ping</span>
              </div>
            </div>

            {/* Refresh / Sync Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch md:items-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleSyncDataset}
                disabled={isSyncing}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing from BEE API..." : "Refresh Dataset"}</span>
              </button>
            </div>
          </div>

          {/* Sync Success Alert */}
          {syncMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncMessage}</span>
            </div>
          )}
        </div>

        {/* 2. CONTROLS HEADER (VIEW TOGGLE & GPS BUTTON) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLocating}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                userLocation
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Detecting GPS Location...</span>
                </>
              ) : userLocation ? (
                <>
                  <Navigation className="w-3.5 h-3.5 fill-white" />
                  <span>📍 GPS Active (within {gpsRadiusKm} km)</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Find Stations Near Me (GPS)</span>
                </>
              )}
            </button>

            {userLocation && (
              <button
                type="button"
                onClick={handleClearLocation}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
              >
                Clear GPS
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "map"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Interactive Map
            </button>
          </div>
        </div>

        {/* Location Error Warning */}
        {locationError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <span>⚠️ {locationError}</span>
          </div>
        )}

        {/* 3. COMPREHENSIVE FILTER & SEARCH BAR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
          {/* Main Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search station name, highway (e.g. NH-48, NE-1, Expressway), operator, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Quick Filter Tabs: Current (All / DC Fast / AC) & Network */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Current Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Current:</span>
              {[
                { id: "all", label: "All Currents" },
                { id: "DC", label: "⚡ DC Fast Chargers" },
                { id: "AC", label: "🔌 AC Destination" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setCurrentType(pill.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    currentType === pill.id
                      ? "bg-emerald-50 text-emerald-800 border-emerald-400 shadow-2xs font-bold"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Network Type Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Network:</span>
              {[
                { id: "all", label: "All Network" },
                { id: "city", label: "🏙️ Urban Hubs" },
                { id: "highway", label: "🛣️ Expressways & NH" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHubType(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    hubType === tab.id
                      ? "bg-emerald-50 text-emerald-800 border-emerald-400 shadow-2xs font-bold"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Dropdown Filter Grid: State, City, Operator, Connector, Power, Vehicle */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
            {/* 1. Indian State / UT Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">STATE / UT</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity("");
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-semibold"
              >
                <option value="">All States ({statesList.length || 36})</option>
                {statesList.map((st) => (
                  <option key={st.code || st.name} value={st.name}>
                    {st.name} {st.stations ? `(${st.stations.toLocaleString()})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Indian City Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CITY / HUB</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option value="">All Cities ({availableCities.length})</option>
                {availableCities.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Operator Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OPERATOR</label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option value="">All Operators</option>
                <option value="Tata Power">Tata Power EZ Charge</option>
                <option value="IOCL">IOCL EV Hubs</option>
                <option value="BPCL">BPCL e-Drive</option>
                <option value="HPCL">HPCL</option>
                <option value="Jio-bp pulse">Jio-bp pulse</option>
                <option value="Statiq">Statiq</option>
                <option value="ChargeZone">ChargeZone</option>
                <option value="Zeon">Zeon Charging</option>
                <option value="Relux">Relux Electric</option>
              </select>
            </div>

            {/* 4. Connector Standard */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CONNECTOR</label>
              <select
                value={connectorType}
                onChange={(e) => setConnectorType(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option value="">All Connectors</option>
                <option value="CCS2">CCS2 (DC Fast)</option>
                <option value="Type 2">Type 2 (AC)</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Bharat">Bharat DC-001</option>
              </select>
            </div>

            {/* 5. Charging Power kW */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MIN POWER</label>
              <select
                value={minPowerKw}
                onChange={(e) => setMinPowerKw(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
              >
                <option value="">Any Power (kW)</option>
                <option value="25">25+ kW</option>
                <option value="50">50+ kW (DC Fast)</option>
                <option value="60">60+ kW</option>
                <option value="120">120+ kW (Ultra-Fast)</option>
              </select>
            </div>

            {/* 6. Vehicle Compatibility Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MY EV MODEL</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-semibold"
              >
                <option value="">All EV Models</option>
                {vehiclesList.slice(0, 30).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.manufacturer} {v.model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Summary & Reset Button */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2">
              {selectedVehicleObj && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                  <Car className="w-3 h-3 text-emerald-700" />
                  <span>Filtered for: {selectedVehicleObj.manufacturer} {selectedVehicleObj.model} ({selectedVehicleObj.connector_types.join(", ")})</span>
                </span>
              )}

              {userLocation && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-blue-700" />
                  <span>Within {gpsRadiusKm} km of your GPS location</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedState("");
                setSelectedCity("");
                setOperator("");
                setConnectorType("");
                setCurrentType("all");
                setMinPowerKw("");
                setSelectedVehicleId("");
                setHubType("all");
                setUserLocation(null);
                loadChargers();
              }}
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>

        {/* 4. CONTENT VIEW: INTERACTIVE MAP OR GRID */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-600">
              Querying Pan-India Charging Stalls...
            </span>
          </div>
        ) : viewMode === "map" ? (
          /* INTERACTIVE INDIA-WIDE MAP VIEW */
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Showing <strong>{filteredChargers.length}</strong> charging stations on interactive map</span>
              <span>Dataset Snapshot: {metadata?.snapshot_label || "26th October 2025"}</span>
            </div>

            <RouteMap allChargers={filteredChargers} className="w-full h-[620px]" />

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                Click any charging marker on the map to inspect live connector guns, power (kW), distance from your location, and risk scores.
                To plot a route between cities with automatic EV recharge stops, use our <Link href="/plan" className="font-bold text-emerald-700 underline">Trip Planner &rarr;</Link>
              </p>
            </div>
          </div>
        ) : (
          /* GRID VIEW */
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-1">
              <span>Found <strong>{filteredChargers.length}</strong> stations matching your criteria</span>
              <span className="text-[11px] text-slate-400">Bureau of Energy Efficiency National Dataset</span>
            </div>

            {filteredChargers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Zap className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No charging stations matched your filter criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your search, resetting connector/power filters, or increasing your GPS radius.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedState("");
                    setSelectedCity("");
                    setConnectorType("");
                    setMinPowerKw("");
                    setSearch("");
                    loadChargers();
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Clear Filters &amp; View All
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChargers.map((st) => {
                  const risk = st.risk_assessment;
                  const riskColor = risk ? getRiskColorClass(risk.category) : null;
                  const statusBadge = getStatusBadgeClass(st.live_status);
                  const isFastDC = (st.max_power_kw || 0) >= 50;

                  return (
                    <div
                      key={st.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between space-y-3.5"
                    >
                      <div className="space-y-2.5">
                        {/* Badges Bar: Status, Distance, Risk */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${statusBadge}`}>
                            {st.live_status === "verified_directory" ? "Directory Verified" : st.live_status}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {st.distance_km != null && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                                <Navigation className="w-2.5 h-2.5" />
                                <span>{st.distance_km} km away</span>
                              </span>
                            )}
                            {risk && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskColor?.badge}`}>
                                Risk: {risk.score}/100
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Station Name & City */}
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
                            {st.name}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium block mt-0.5">
                            {st.operator} • {st.city || st.district || "Hub"}, {st.state || "India"}
                          </span>
                        </div>

                        {/* Address */}
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {st.address || "Highway corridor charging facility"}
                        </p>

                        {/* Specifications Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                            isFastDC
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-teal-50 text-teal-800 border border-teal-200"
                          }`}>
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>{st.max_power_kw} kW {st.currents?.join("/") || (isFastDC ? "DC Fast" : "AC")}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                            {st.total_plugs || 2} Plugs
                          </span>

                          {st.connector_types && st.connector_types.length > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                              {st.connector_types.map((c) => (typeof c === "object" ? c.type : c)).join(", ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {st.dataset_snapshot || "BEE Directory 2025"}
                        </span>

                        <div className="flex items-center gap-3">
                          <Link
                            href={`/plan?destination_lat=${st.latitude}&destination_lng=${st.longitude}&destination_name=${encodeURIComponent(st.name)}`}
                            className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px]"
                            title="Plan route to this station"
                          >
                            <span>Plan Route</span>
                          </Link>

                          <Link
                            href={`/chargers/${st.id}`}
                            className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                          >
                            <span>Details &amp; Backups</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
