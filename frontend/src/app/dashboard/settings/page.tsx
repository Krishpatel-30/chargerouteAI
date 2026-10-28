"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Shield, Sliders, Bell } from "lucide-react";

export default function UserSettingsPage() {
  const [defaultReserve, setDefaultReserve] = useState(15);
  const [preferredNetworks, setPreferredNetworks] = useState<string[]>([
    "Tata Power",
    "Jio-bp pulse",
    "Statiq",
  ]);
  const [notifyOutages, setNotifyOutages] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleNetwork = (net: string) => {
    if (preferredNetworks.includes(net)) {
      setPreferredNetworks(preferredNetworks.filter((n) => n !== net));
    } else {
      setPreferredNetworks([...preferredNetworks, net]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Driver Preferences & Trip Defaults</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure default routing margins, preferred operators, and contingency tolerances.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
            Preferences successfully saved!
          </div>
        )}

        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-xs">
          {/* Reserve Margin */}
          <div className="space-y-2 pb-5 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-800 uppercase tracking-wider">
                Default Arrival Battery Reserve Buffer
              </label>
              <span className="text-emerald-700 font-bold text-sm">{defaultReserve}% SoC</span>
            </div>
            <input
              type="range"
              min="10"
              max="25"
              step="1"
              value={defaultReserve}
              onChange={(e) => setDefaultReserve(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
            />
            <p className="text-[11px] text-slate-500">
              Trip planning will never schedule a route that arrives at a destination with less than this buffer margin.
            </p>
          </div>

          {/* Preferred Charging Operators */}
          <div className="space-y-2 pb-5 border-b border-slate-100">
            <label className="font-bold text-slate-800 uppercase tracking-wider block">
              Preferred Charging Networks
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              The route optimizer will give preference to these networks when multiple options exist:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {["Tata Power", "Jio-bp pulse", "Statiq", "ChargeZone", "Zeon Charging", "Relux Electric"].map((net) => {
                const checked = preferredNetworks.includes(net);
                return (
                  <button
                    key={net}
                    type="button"
                    onClick={() => toggleNetwork(net)}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                      checked
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{checked ? "✓ " : ""}{net}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 uppercase tracking-wider block">
              Contingency & Outage Alerts
            </label>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={notifyOutages}
                onChange={(e) => setNotifyOutages(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="text-slate-700 font-medium">
                Notify me if a scheduled charging stop on my saved trips is reported broken
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
