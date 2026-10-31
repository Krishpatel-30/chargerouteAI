"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  VehicleModel,
  ChargingStation,
  TripPlanRequest,
  TripPlanResponse,
  ChargingStopDetail,
} from "@/lib/types";
import { TripPlannerForm } from "@/components/planner/TripPlannerForm";
import { RouteSummaryCard } from "@/components/planner/RouteSummaryCard";
import { ChargingStopCard } from "@/components/planner/ChargingStopCard";
import { AlternativeRouteSelector } from "@/components/planner/AlternativeRouteSelector";
import { RiskIndicator } from "@/components/planner/RiskIndicator";
import { TripTimeline } from "@/components/planner/TripTimeline";
import { RouteMap } from "@/components/map/RouteMap";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import {
  ShieldCheck,
  Info,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function PlanTripPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [allChargers, setAllChargers] = useState<ChargingStation[]>([]);
  const [planResponse, setPlanResponse] = useState<TripPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRouteId, setActiveRouteId] = useState<string>("primary");
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auth gate states
  const [gateEmail, setGateEmail] = useState("");
  const [gatePassword, setGatePassword] = useState("");
  const [gateShowPassword, setGateShowPassword] = useState(false);
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  const handleGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    setGateLoading(true);
    try {
      await login({ email: gateEmail, password: gatePassword });
    } catch (err: any) {
      setGateError(err?.response?.data?.detail || "Invalid email or password.");
    } finally {
      setGateLoading(false);
    }
  };

  // Load initial vehicles and regional chargers only after authentication
  useEffect(() => {
    if (!isAuthenticated) return;
    async function initData() {
      try {
        const [vehs, chargers] = await Promise.all([
          api.getVehicles(),
          api.getChargers({ limit: 100 }),
        ]);
        setVehicles(vehs);
        setAllChargers(chargers);

        // Run default demonstration plan: New Delhi to Agra on Yamuna Expressway
        if (vehs.length > 0) {
          handlePlanTrip({
            origin_name: "New Delhi, Delhi",
            origin_lat: 28.6139,
            origin_lng: 77.2090,
            destination_name: "Agra, Uttar Pradesh",
            destination_lat: 27.1767,
            destination_lng: 78.0081,
            vehicle_id: vehs[0].id,
            start_battery_pct: 85,
            min_arrival_battery_pct: 15,
            preference: "lowest_risk",
          });
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    }
    initData();
  }, [isAuthenticated]);

  const handleVehicleCreated = (newVehicle: VehicleModel) => {
    setVehicles((prev) => [newVehicle, ...prev.filter((v) => v.id !== newVehicle.id)]);
    setSavedSuccessMessage(`Custom vehicle "${newVehicle.manufacturer} ${newVehicle.model}" configured and selected for trip analysis!`);
    setTimeout(() => setSavedSuccessMessage(null), 6000);
  };

  const handlePlanTrip = async (payload: TripPlanRequest) => {
    setIsLoading(true);
    setSavedSuccessMessage(null);
    try {
      const res = await api.planTrip(payload);
      setPlanResponse(res);
      setActiveRouteId("primary");
    } catch (err: any) {
      console.error("Trip planning error:", err);
      alert(err?.response?.data?.detail || "Failed to calculate route. Please check origin and destination.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!planResponse) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/plan`);
      return;
    }
    setIsSaving(true);
    try {
      await api.saveTrip(planResponse.title, planResponse);
      setSavedSuccessMessage("Trip saved to your permanent Driver History! View under Trip History.");
      setTimeout(() => setSavedSuccessMessage(null), 5000);
    } catch (err) {
      setSavedSuccessMessage("Could not save trip. Please try again.");
      setTimeout(() => setSavedSuccessMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Determine currently active route to render (either primary or an alternative)
  const currentAlternative = planResponse?.alternatives?.find((a) => a.route_id === activeRouteId);
  const displayedStops: ChargingStopDetail[] = currentAlternative
    ? currentAlternative.charging_stops
    : planResponse?.charging_stops || [];
  const displayedGeometry = currentAlternative
    ? currentAlternative.route_geometry
    : planResponse?.route_geometry || [];
  const displayedRisk = currentAlternative
    ? {
        score: currentAlternative.overall_risk_score,
        category: currentAlternative.overall_risk_category as any,
        confidence_label: "Alternative Strategy Risk Profile",
        contributing_factors: [
          `Route strategy: ${currentAlternative.name}`,
          `Charging stops required: ${currentAlternative.charging_stops_count}`,
          `Minimum reserve reached: ${currentAlternative.min_battery_reserve_pct}%`,
        ],
        backup_count: 2,
        staleness_hours: 12.0,
        operational_status_weight: "Verified corridor",
      }
    : planResponse?.risk_breakdown;

  // Origin & destination coordinates for map
  const originCoord = planResponse
    ? {
        name: planResponse.origin_name,
        lat: planResponse.origin_lat ?? (planResponse.route_geometry?.[0]?.[1] ?? 28.6139),
        lng: planResponse.origin_lng ?? (planResponse.route_geometry?.[0]?.[0] ?? 77.2090),
      }
    : undefined;
  const destCoord = planResponse
    ? {
        name: planResponse.destination_name,
        lat: planResponse.destination_lat ?? (planResponse.route_geometry?.[planResponse.route_geometry.length - 1]?.[1] ?? 27.1767),
        lng: planResponse.destination_lng ?? (planResponse.route_geometry?.[planResponse.route_geometry.length - 1]?.[0] ?? 78.0081),
      }
    : undefined;

  // Collect all backup candidates across stops for map
  const allBackups = displayedStops.flatMap((s) => s.all_backups || []);

  if (authLoading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Checking driver credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Driver Sign-In Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Sign in with Google or your driver account to access the Pan-India EV Trip Planner, simulate battery range, and view backup chargers.
            </p>
          </div>

          <GoogleAuthButton redirectUrl="/plan" buttonText="Continue with Google" />

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              or continue with driver email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {gateError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              ⚠️ {gateError}
            </div>
          )}

          <form onSubmit={handleGateLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={gateEmail}
                  onChange={(e) => setGateEmail(e.target.value)}
                  placeholder="driver@example.com"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type={gateShowPassword ? "text" : "password"}
                  required
                  value={gatePassword}
                  onChange={(e) => setGatePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-8 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setGateShowPassword(!gateShowPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {gateShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={gateLoading}
              className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/30 hover:shadow-emerald-600/40 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {gateLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In &amp; Open Trip Planner</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>New driver?</span>
            <Link
              href="/register?redirect=/plan"
              className="font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Risk-Aware EV Trip Planner
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Select your vehicle, customize battery assumptions, and discover verified charging stops with safe backups across all India.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-3 py-1.5 rounded-lg w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pan-India Corridor Telemetry Active</span>
          </div>
        </div>

        {savedSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{savedSuccessMessage}</span>
          </div>
        )}

        {/* Top Grid: Planner Form + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <TripPlannerForm
              vehicles={vehicles}
              onPlanTrip={handlePlanTrip}
              isLoading={isLoading}
              onVehicleCreated={handleVehicleCreated}
            />

            {/* Assumptions Box */}
            {planResponse && (
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  <Info className="w-3.5 h-3.5 text-slate-500" /> Calculation Assumptions
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>Base Consumption: <strong>{planResponse.assumptions?.vehicle_consumption_kwh_100km} kWh/100km</strong></div>
                  <div>Highway Factor: <strong>{planResponse.assumptions?.highway_speed_multiplier}x</strong></div>
                  <div>AC Climate Factor: <strong>{planResponse.assumptions?.ac_climate_multiplier}x</strong></div>
                  <div>Effective Rate: <strong>{planResponse.assumptions?.effective_consumption_kwh_100km} kWh/100km</strong></div>
                </div>
                <p className="text-[10px] text-slate-400 pt-1 leading-snug">
                  *Battery predictions are deterministic approximations based on distance and load factors. Actual performance varies with driving style, wind, and ambient heat.
                </p>
              </div>
            )}
          </div>

          {/* Right Map (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <RouteMap
              routeGeometry={displayedGeometry}
              origin={originCoord}
              destination={destCoord}
              chargingStops={displayedStops}
              backupStops={allBackups}
              allChargers={allChargers}
              className="w-full h-[460px] sm:h-[530px]"
            />

            {/* Overall Risk Scorer Card */}
            {displayedRisk && (
              <RiskIndicator risk={displayedRisk} showBreakdown={true} />
            )}
          </div>
        </div>

        {/* Bottom Details Section when Plan Exists */}
        {planResponse && (
          <div className="space-y-6 pt-2">
            {/* Route Summary Metrics Card */}
            <RouteSummaryCard
              plan={planResponse}
              onSave={handleSaveTrip}
              isSaving={isSaving}
            />

            {/* Alternative Strategies Comparison */}
            {planResponse.alternatives && planResponse.alternatives.length > 0 && (
              <AlternativeRouteSelector
                alternatives={planResponse.alternatives}
                selectedRouteId={activeRouteId}
                onSelectRoute={(id) => setActiveRouteId(id)}
              />
            )}

            {/* Hop Sequence Timeline & Charging Stops Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Charging Stops Detail List */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Recommended Charging Stops ({displayedStops.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Each stop includes verified backup fallback options
                  </span>
                </div>

                {displayedStops.length === 0 ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 text-center space-y-2">
                    <span className="text-2xl">🎉</span>
                    <h4 className="font-bold text-emerald-900 text-sm">Direct Journey Feasible!</h4>
                    <p className="text-xs text-emerald-700 max-w-md mx-auto">
                      This journey can be safely completed within your vehicle&apos;s usable battery range without requiring intermediate roadside charging stops.
                    </p>
                  </div>
                ) : (
                  displayedStops.map((stop) => (
                    <ChargingStopCard key={stop.stop_number} stop={stop} />
                  ))
                )}
              </div>

              {/* Journey Timeline Progression */}
              <div className="lg:col-span-5">
                <TripTimeline
                  originName={planResponse.origin_name}
                  destinationName={planResponse.destination_name}
                  startBatteryPct={planResponse.assumptions?.start_battery_pct || 85}
                  finalReservePct={planResponse.min_battery_reserve_pct}
                  stops={displayedStops}
                  totalDistanceKm={planResponse.total_distance_km}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
