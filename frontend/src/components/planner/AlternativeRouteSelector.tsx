import React from "react";
import { TripAlternativeSummary } from "@/lib/types";
import { formatDistance, formatDuration, formatINR, getRiskColorClass } from "@/lib/utils";
import { Shield, Zap, Clock } from "lucide-react";

interface AlternativeRouteSelectorProps {
  alternatives: TripAlternativeSummary[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
}

export const AlternativeRouteSelector: React.FC<AlternativeRouteSelectorProps> = ({
  alternatives,
  selectedRouteId,
  onSelectRoute,
}) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Compare Route Options
        </h4>
        <span className="text-[11px] text-slate-400">
          Select an alternative strategy to inspect stops & risk
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alternatives.map((alt) => {
          const isSelected = selectedRouteId === alt.route_id;
          const riskColor = getRiskColorClass(alt.overall_risk_category);

          return (
            <button
              key={alt.route_id}
              onClick={() => onSelectRoute(alt.route_id)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-600"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-slate-900 text-sm">{alt.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${riskColor.badge}`}>
                  {alt.overall_risk_score}/100
                </span>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 mb-2.5 leading-snug">
                {alt.description}
              </p>

              <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-700 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatDuration(alt.total_duration_min)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span>{alt.charging_stops_count} stop{alt.charging_stops_count === 1 ? "" : "s"}</span>
                </div>
                <div className="col-span-2 text-[11px] text-slate-500 font-medium">
                  {formatDistance(alt.total_distance_km)} • {formatINR(alt.estimated_cost_inr)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
