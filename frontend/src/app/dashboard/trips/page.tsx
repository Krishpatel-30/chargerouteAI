"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatDistance, formatDuration, getRiskColorClass } from "@/lib/utils";
import { AuthGate } from "@/components/auth/AuthGate";
import { Route, ArrowLeft, ExternalLink, Trash2, Zap, LogIn, Navigation, Shield, Clock } from "lucide-react";

export default function TripsListPage() {
  return (
    <AuthGate
      featureTitle="Saved EV Trip History"
      featureDescription="Sign in to view your past road trips, planned charging stops, and simulation reports."
      redirectUrl="/dashboard/trips"
    >
      <TripsListContent />
    </AuthGate>
  );
}

function TripsListContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrips = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.getUserSavedTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadTrips();
    }
  }, [authLoading, isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved trip from your history?")) return;
    try {
      await api.deleteSavedTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete trip.");
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <Link
            href="/plan"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Plan New Route</span>
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Driver Trip History &amp; Saved Routes</h1>
          <p className="text-xs text-slate-500">Access your saved highway and city EV routes, charging stop plans, and backup telemetry</p>
        </div>

        {!isAuthenticated && !authLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-slate-900 text-base">Sign In to View Trip History</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log in to sync your planned routes, monitor battery reserves, and keep historical EV telemetry across your devices.
              </p>
            </div>
            <Link
              href="/login?redirect=/dashboard/trips"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Your Account</span>
            </Link>
          </div>
        ) : trips.length === 0 && !isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-xs">
            <Route className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Saved Trips Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Plan any city commute or national highway journey and click <strong>&quot;Save Route to My Dashboard&quot;</strong> to record it here.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Plan an EV Trip Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => {
              const riskColor = getRiskColorClass(trip.overall_risk_category || "Low Risk");
              
              // Direct Google Maps navigation deep link
              const googleNavUrl = (() => {
                const originParam = encodeURIComponent(
                  trip.origin_lat && trip.origin_lng
                    ? `${trip.origin_lat},${trip.origin_lng}`
                    : trip.origin_name
                );
                const destParam = encodeURIComponent(
                  trip.destination_lat && trip.destination_lng
                    ? `${trip.destination_lat},${trip.destination_lng}`
                    : trip.destination_name
                );
                let url = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=driving&dir_action=navigate`;
                if (trip.charging_stops && trip.charging_stops.length > 0) {
                  const waypoints = trip.charging_stops
                    .map((s: any) => `${s.latitude},${s.longitude}`)
                    .join("|");
                  url += `&waypoints=${encodeURIComponent(waypoints)}`;
                }
                return url;
              })();

              return (
                <div
                  key={trip.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{trip.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${riskColor.badge}`}>
                        {trip.overall_risk_score}/100 Risk
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="text-slate-800 font-bold">{formatDistance(trip.total_distance_km)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDuration(trip.total_duration_min)}
                      </span>
                      <span>•</span>
                      <span>Vehicle: <strong className="text-slate-700">{trip.vehicle_name}</strong></span>
                      <span>•</span>
                      <span>{new Date(trip.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
                    </div>

                    {trip.charging_stops && trip.charging_stops.length > 0 && (
                      <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        <span>{trip.charging_stops.length} Charging Stop(s) Planned</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={googleNavUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Open turn-by-turn navigation in Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>

                    <Link
                      href={`/dashboard/trips/${trip.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete trip from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
