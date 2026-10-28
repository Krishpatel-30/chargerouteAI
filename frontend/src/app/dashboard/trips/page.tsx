"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatDistance, formatDuration, getRiskColorClass } from "@/lib/utils";
import { Route, ArrowLeft, ExternalLink, Trash2, Zap } from "lucide-react";

export default function TripsListPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrips = async () => {
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
    loadTrips();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this saved trip?")) return;
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
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Plan New Route</span>
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Saved Highway Trips</h1>
          <p className="text-xs text-slate-500">Access saved charging stops and backup plans</p>
        </div>

        {trips.length === 0 && !isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
            <Route className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No Saved Trips</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t saved any trip plans yet. Plan a trip between cities and save it for easy access on the road.
            </p>
            <Link
              href="/plan"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
            >
              Go to Trip Planner
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => {
              const riskColor = getRiskColorClass(trip.overall_risk_category);
              return (
                <div
                  key={trip.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">{trip.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskColor.badge}`}>
                        {trip.overall_risk_score}/100 Risk
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{formatDistance(trip.total_distance_km)}</span>
                      <span>•</span>
                      <span>{formatDuration(trip.total_duration_min)} total</span>
                      <span>•</span>
                      <span>Vehicle: {trip.vehicle_name}</span>
                      <span>•</span>
                      <span>Saved on {new Date(trip.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/trips/${trip.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Open Plan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete trip"
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
