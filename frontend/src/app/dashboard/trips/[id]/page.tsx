"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { RouteMap } from "@/components/map/RouteMap";
import { ChargingStopCard } from "@/components/planner/ChargingStopCard";
import { RiskIndicator } from "@/components/planner/RiskIndicator";
import { formatDistance, formatDuration, formatINR, getRiskColorClass } from "@/lib/utils";
import { ArrowLeft, Route, Clock, Zap, Shield, IndianRupee, BatteryWarning, Loader2 } from "lucide-react";

export default function SavedTripDetailPage() {
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTrip() {
      setIsLoading(true);
      try {
        const data = await api.getSavedTrip(tripId);
        setTrip(data);
      } catch (err) {
        console.error("Error loading saved trip:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (tripId) {
      loadTrip();
    }
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-16 gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs uppercase font-bold tracking-wider">Loading Saved Trip...</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex-1 max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Trip Not Found</h2>
        <p className="text-xs text-slate-500">The requested trip could not be located in your saved archive.</p>
        <Link
          href="/dashboard/trips"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Saved Trips</span>
        </Link>
      </div>
    );
  }

  const riskColors = getRiskColorClass(trip.overall_risk_category);
  const chargingStops = trip.charging_stops || [];
  const backups = trip.backup_stops || [];

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/trips"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Saved Trips</span>
          </Link>
          <span className="text-xs text-slate-400">
            Saved on {new Date(trip.created_at).toLocaleString()}
          </span>
        </div>

        {/* Header Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Saved EV Trip Plan
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {trip.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Vehicle: <strong className="text-slate-800">{trip.vehicle_name || "EV"}</strong> • Optimization: <span className="capitalize font-semibold">{trip.preference?.replace("_", " ")}</span>
              </p>
            </div>

            <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${riskColors.badge}`}>
              <Shield className="w-3.5 h-3.5" />
              <span>Overall Risk: {trip.overall_risk_score}/100 ({trip.overall_risk_category})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Distance</span>
              <strong className="text-slate-900 text-sm">{formatDistance(trip.total_distance_km)}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Drive Time</span>
              <strong className="text-slate-900 text-sm">{formatDuration(trip.total_driving_time_min)}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Charge Stops</span>
              <strong className="text-slate-900 text-sm">{chargingStops.length} stops</strong>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-emerald-950">
              <span className="text-emerald-700 text-[10px] uppercase font-bold block mb-0.5">Total Duration</span>
              <strong className="text-sm">{formatDuration(trip.total_duration_min)}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Est. Cost</span>
              <strong className="text-slate-900 text-sm">{formatINR(trip.estimated_cost_inr)}</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Min Reserve</span>
              <strong className="text-slate-900 text-sm">{trip.min_battery_reserve_pct}%</strong>
            </div>
          </div>
        </div>

        {/* Map */}
        <RouteMap
          routeGeometry={trip.route_geometry}
          origin={{ name: trip.origin_name, lat: trip.origin_lat, lng: trip.origin_lng }}
          destination={{ name: trip.destination_name, lat: trip.destination_lat, lng: trip.destination_lng }}
          chargingStops={chargingStops}
          backupStops={backups}
          className="w-full h-[480px]"
        />

        {/* Stops List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Planned Charging Stops & Backups</h3>
          {chargingStops.length === 0 ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              This trip is completed direct without charging stops required.
            </div>
          ) : (
            chargingStops.map((s: any) => (
              <ChargingStopCard key={s.stop_number} stop={s} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
