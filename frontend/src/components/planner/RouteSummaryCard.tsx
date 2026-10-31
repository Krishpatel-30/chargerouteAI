import React from "react";
import { TripPlanResponse } from "@/lib/types";
import { formatDistance, formatDuration, formatINR, getRiskColorClass } from "@/lib/utils";
import { Route, Clock, Zap, Shield, IndianRupee, BatteryWarning, Navigation, ExternalLink } from "lucide-react";

interface RouteSummaryCardProps {
  plan: TripPlanResponse;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export const RouteSummaryCard: React.FC<RouteSummaryCardProps> = ({
  plan,
  onSave,
  isSaving = false,
  isSaved = false,
}) => {
  const riskColors = getRiskColorClass(plan.overall_risk_category);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Route Title & Top Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
            Planned Route Summary
          </span>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">{plan.title}</h3>
          <span className="text-xs text-slate-500">
            Selected Vehicle: <strong className="text-slate-700">{plan.vehicle_name}</strong> ({plan.vehicle_battery_usable_kwh} kWh Usable)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${riskColors.badge}`}>
            <Shield className="w-3.5 h-3.5" />
            <span>Overall Risk: {plan.overall_risk_score}/100</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Route className="w-3.5 h-3.5 text-slate-400" />
            <span>Distance</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{formatDistance(plan.total_distance_km)}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Drive Time</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{formatDuration(plan.total_driving_time_min)}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Charge Stops</span>
          </div>
          <div className="text-lg font-bold text-slate-900">
            {plan.charging_stops.length} <span className="text-xs font-normal text-slate-500">({formatDuration(plan.total_charging_time_min)})</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Duration</span>
          </div>
          <div className="text-lg font-bold text-emerald-950">{formatDuration(plan.total_duration_min)}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
            <span>Est. Cost</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{formatINR(plan.estimated_cost_inr)}</div>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <BatteryWarning className="w-3.5 h-3.5 text-slate-400" />
            <span>Min Reserve</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{plan.min_battery_reserve_pct}%</div>
        </div>
      </div>

      {/* Warnings if any */}
      {plan.warnings && plan.warnings.length > 0 && (
        <div className="space-y-1 bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-xs text-amber-900">
          {plan.warnings.map((w, idx) => (
            <div key={idx} className="flex items-start gap-1.5 font-medium">
              <span>⚠️</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions: Navigate in Google Maps & Save Route */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Button: Start Full EV Route Navigation (with Charging Stops) */}
          <a
            href={(() => {
              const originParam = encodeURIComponent(
                plan.origin_lat && plan.origin_lng
                  ? `${plan.origin_lat},${plan.origin_lng}`
                  : plan.origin_name
              );
              const destParam = encodeURIComponent(
                plan.destination_lat && plan.destination_lng
                  ? `${plan.destination_lat},${plan.destination_lng}`
                  : plan.destination_name
              );
              let url = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=driving&dir_action=navigate`;
              if (plan.charging_stops && plan.charging_stops.length > 0) {
                const waypoints = plan.charging_stops
                  .map((s) => `${s.latitude},${s.longitude}`)
                  .join("|");
                url += `&waypoints=${encodeURIComponent(waypoints)}`;
              }
              return url;
            })()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
            title="Open complete EV route with planned charging stops in Google Maps with automatic navigation"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Start Full Route in Google Maps</span>
            <ExternalLink className="w-3 h-3 opacity-75" />
          </a>

          {/* Quick Direct Button to Stop 1 if stops exist */}
          {plan.charging_stops && plan.charging_stops.length > 0 && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${plan.charging_stops[0].latitude},${plan.charging_stops[0].longitude}&travelmode=driving&dir_action=navigate`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
              title={`Start direct GPS turn-by-turn navigation to ${plan.charging_stops[0].station_name}`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Navigate to Stop 1 ({plan.charging_stops[0].station_name.split("-")[0].trim()})</span>
              <ExternalLink className="w-3 h-3 text-emerald-600 opacity-75" />
            </a>
          )}
        </div>

        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-xs ${
              isSaved
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {isSaving
              ? "Saving Trip..."
              : isSaved
              ? "Saved to Dashboard ✓"
              : "Save Route to My Dashboard"}
          </button>
        )}
      </div>
    </div>
  );
};
