"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatDistance, formatDuration, formatINR, getRiskColorClass } from "@/lib/utils";
import { AuthGate } from "@/components/auth/AuthGate";
import {
  Route,
  Car,
  BatteryCharging,
  Zap,
  Clock,
  Shield,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Trash2,
  LogIn,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <AuthGate
      featureTitle="Driver Dashboard & Saved Trips"
      featureDescription="Sign in to view your saved trip history, garage vehicles, and charging preferences."
      redirectUrl="/dashboard"
    >
      <DashboardContent />
    </AuthGate>
  );
}

function DashboardContent() {
  const { user, isAuthenticated } = useAuth();
  const [savedTrips, setSavedTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [trips, vehs] = await Promise.all([
          api.getUserSavedTrips().catch(() => []),
          api.getVehicles(),
        ]);
        setSavedTrips(trips);
        setVehicles(vehs);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to remove this saved trip?")) return;
    try {
      await api.deleteSavedTrip(tripId);
      setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      alert("Failed to delete trip.");
    }
  };

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isAuthenticated ? `Welcome back, ${user?.full_name || user?.email?.split("@")[0]}!` : "Driver Dashboard"}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {isAuthenticated
                ? `Signed in as ${user?.email}. Your trips and vehicles are synced to your account.`
                : "Manage your saved highway routes, vehicle garage, and community charger reports."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <Link
                href="/login?redirect=/dashboard"
                className="px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Save History</span>
              </Link>
            )}
            <Link
              href="/plan"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Plan New Trip</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Saved Trips
            </span>
            <strong className="text-2xl font-extrabold text-slate-900">{savedTrips.length}</strong>
            <span className="text-[11px] text-slate-500 block">Available offline</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Active Garage
            </span>
            <strong className="text-2xl font-extrabold text-slate-900">
              {vehicles.length > 0 ? "Tata Nexon EV" : "None"}
            </strong>
            <span className="text-[11px] text-emerald-700 font-medium block">38 kWh Usable</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Primary Corridor
            </span>
            <strong className="text-2xl font-extrabold text-slate-900">NE-1</strong>
            <span className="text-[11px] text-slate-500 block">Ahmedabad — Vadodara</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
              Reliability Reports
            </span>
            <strong className="text-2xl font-extrabold text-slate-900">3 Verified</strong>
            <span className="text-[11px] text-emerald-700 font-medium block">Community contributor</span>
          </div>
        </div>

        {/* Saved Trips Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Saved Highway Trips</h3>
              <p className="text-xs text-slate-500">Your planned routes and contingencies</p>
            </div>
            <Link
              href="/dashboard/trips"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              View All &rarr;
            </Link>
          </div>

          {savedTrips.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Route className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Saved Trips Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Plan a route with risk-aware stops, then click &quot;Save Route to My Dashboard&quot; to inspect it anytime.
              </p>
              <Link
                href="/plan"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
              >
                <span>Plan Your First Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedTrips.map((trip) => {
                const riskColor = getRiskColorClass(trip.overall_risk_category);
                return (
                  <div
                    key={trip.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{trip.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskColor.badge}`}>
                          {trip.overall_risk_score}/100 Risk
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{formatDistance(trip.total_distance_km)}</span>
                        <span>•</span>
                        <span>{formatDuration(trip.total_duration_min)} total</span>
                        <span>•</span>
                        <span>{trip.vehicle_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/trips/${trip.id}`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Open Trip</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
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

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/dashboard/vehicles"
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Vehicle Garage</h4>
            <p className="text-xs text-slate-500">
              Set custom battery degradation, consumption multiplier, and vehicle nicknames.
            </p>
          </Link>

          <Link
            href="/dashboard/reports"
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">My Reliability Reports</h4>
            <p className="text-xs text-slate-500">
              Track status of issues you reported and check station verification history.
            </p>
          </Link>

          <Link
            href="/dashboard/settings"
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-2 block"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Trip Preferences</h4>
            <p className="text-xs text-slate-500">
              Configure default minimum arrival reserve %, preferred charging networks, and highway speeds.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
