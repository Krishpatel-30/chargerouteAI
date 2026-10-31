"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { VehicleModel } from "@/lib/types";
import { AuthGate } from "@/components/auth/AuthGate";
import { Car, ArrowLeft, PlusCircle, Battery, Zap } from "lucide-react";

export default function UserGaragePage() {
  return (
    <AuthGate
      featureTitle="Driver Vehicle Garage"
      featureDescription="Sign in to calibrate your primary vehicle, battery degradation, and AC load multipliers."
      redirectUrl="/dashboard/vehicles"
    >
      <UserGarageContent />
    </AuthGate>
  );
}

function UserGarageContent() {
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [activeCarId, setActiveCarId] = useState<string>("seed_nexon");
  const [customMultiplier, setCustomMultiplier] = useState(1.0);
  const [customNickname, setCustomNickname] = useState("My Daily Nexon");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const vehs = await api.getVehicles();
      setVehicles(vehs);
      if (vehs.length > 0) {
        setActiveCarId(vehs[0].id);
      }
    }
    load();
  }, []);

  const handleSaveGarage = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const currentCar = vehicles.find((v) => v.id === activeCarId) || vehicles[0];

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicle Garage & Calibration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Set your primary vehicle and adjust your real-world consumption multiplier.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
            Garage vehicle preferences successfully updated!
          </div>
        )}

        <form onSubmit={handleSaveGarage} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Vehicle Model
            </label>
            <select
              value={activeCarId}
              onChange={(e) => setActiveCarId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.manufacturer} {v.model} ({v.usable_battery_capacity_kwh} kWh Usable)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vehicle Nickname
              </label>
              <input
                type="text"
                value={customNickname}
                onChange={(e) => setCustomNickname(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 font-bold text-slate-700 uppercase tracking-wider">
                <span>Consumption Multiplier</span>
                <span className="text-emerald-700">{customMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.30"
                step="0.05"
                value={customMultiplier}
                onChange={(e) => setCustomMultiplier(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-[10px] text-slate-400">
                Adjust if your driving style or luggage racks increase consumption
              </span>
            </div>
          </div>

          {currentCar && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Active Vehicle Specifications
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>Usable Capacity: <strong>{currentCar.usable_battery_capacity_kwh} kWh</strong></div>
                <div>Max DC Power: <strong>{currentCar.max_dc_power_kw} kW</strong></div>
                <div>Base Rate: <strong>{currentCar.consumption_kwh_100km} kWh/100km</strong></div>
                <div>Calibrated Rate: <strong>{(currentCar.consumption_kwh_100km * customMultiplier).toFixed(1)} kWh/100km</strong></div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Save Garage Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
