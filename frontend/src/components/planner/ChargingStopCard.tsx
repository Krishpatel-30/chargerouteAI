import React, { useState } from "react";
import Link from "next/link";
import { ChargingStopDetail } from "@/lib/types";
import { formatDuration, formatINR, getRiskColorClass } from "@/lib/utils";
import { BackupStopCard } from "./BackupStopCard";
import { Zap, Clock, Battery, BatteryCharging, ChevronDown, ChevronUp, Shield, ExternalLink } from "lucide-react";

interface ChargingStopCardProps {
  stop: ChargingStopDetail;
}

export const ChargingStopCard: React.FC<ChargingStopCardProps> = ({ stop }) => {
  const [showBackups, setShowBackups] = useState(false);
  const riskColors = getRiskColorClass(stop.station_risk.category);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-emerald-600/30">
            {stop.stop_number}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base">{stop.station_name}</h4>
            <span className="text-xs font-medium text-slate-500">
              {stop.operator} • Located at km {stop.distance_from_start_km}
            </span>
          </div>
        </div>

        {/* Risk Badge */}
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${riskColors.badge}`}>
            Stop Risk: {stop.station_risk.score}/100
          </span>
        </div>
      </div>

      {/* Battery & Charging Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3.5 my-1">
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Battery className="w-4 h-4 text-slate-400" />
            <span>Arrival SoC</span>
          </div>
          <div className="text-base font-bold text-slate-900">{stop.arrival_battery_pct}%</div>
        </div>

        <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mb-1">
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
            <span>Depart SoC</span>
          </div>
          <div className="text-base font-bold text-emerald-900">{stop.target_departure_battery_pct}%</div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>Charge Duration</span>
          </div>
          <div className="text-base font-bold text-slate-900">{formatDuration(stop.charging_duration_min)}</div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Zap className="w-4 h-4 text-slate-400" />
            <span>Energy & Cost</span>
          </div>
          <div className="text-base font-bold text-slate-900">
            {stop.energy_added_kwh} kWh <span className="text-xs font-normal text-slate-500">({formatINR(stop.estimated_cost_inr)})</span>
          </div>
        </div>
      </div>

      {/* Backup Summary & Accordion Toggle */}
      <div className="pt-2 border-t border-slate-100">
        {stop.primary_backup ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>
                  Primary Backup: <strong className="text-slate-900">{stop.primary_backup.name}</strong> (+{stop.primary_backup.detour_km} km)
                </span>
              </div>
              <button
                onClick={() => setShowBackups(!showBackups)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>{showBackups ? "Hide Backups" : `View ${stop.all_backups.length} Backups`}</span>
                {showBackups ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showBackups && (
              <div className="space-y-2.5 pt-2">
                <p className="text-[11px] text-slate-500 font-medium">
                  If {stop.station_name} is broken, occupied, or inaccessible, divert to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {stop.all_backups.map((b) => (
                    <BackupStopCard
                      key={b.station_id}
                      backup={b}
                      isPrimary={b.station_id === stop.primary_backup?.station_id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center gap-2">
            <span>⚠️ <strong>Attention:</strong> No compatible backup charger located within a 35 km detour radius of this stop.</span>
          </div>
        )}
      </div>
    </div>
  );
};
