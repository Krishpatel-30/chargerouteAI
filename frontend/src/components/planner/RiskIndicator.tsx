import React, { useState } from "react";
import { RiskBreakdown } from "@/lib/types";
import { getRiskColorClass } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, ShieldAlert, Info, ChevronDown, ChevronUp } from "lucide-react";

interface RiskIndicatorProps {
  risk: RiskBreakdown;
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  risk,
  size = "md",
  showBreakdown = true,
}) => {
  const [expanded, setExpanded] = useState(false);
  const colors = getRiskColorClass(risk.category);

  const getRiskIcon = () => {
    if (risk.category === "Low Risk") {
      return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
    }
    if (risk.category === "Moderate Risk") {
      return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
    return <ShieldAlert className="w-5 h-5 text-rose-600" />;
  };

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100">
            {getRiskIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                {risk.score}
                <span className="text-xs font-normal text-slate-500">/100</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${colors.badge}`}>
                {risk.category}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {risk.confidence_label}
            </p>
          </div>
        </div>

        {showBreakdown && risk.contributing_factors.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md hover:bg-white/70 transition-colors border border-slate-200/60"
          >
            <span>{expanded ? "Hide Factors" : "Why this score?"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Contributing Factors Accordion */}
      {showBreakdown && expanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-200/80 space-y-2 text-xs">
          <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
            Explainable Risk Scoring Factors:
          </div>
          <ul className="space-y-1.5 pl-1">
            {risk.contributing_factors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-200/60 mt-2">
            <div>
              Backups nearby: <strong className="text-slate-800">{risk.backup_count}</strong>
            </div>
            {risk.nearest_backup_detour_km !== null && risk.nearest_backup_detour_km !== undefined && (
              <div>
                Nearest detour: <strong className="text-slate-800">{risk.nearest_backup_detour_km} km</strong>
              </div>
            )}
            <div>
              Status weight: <strong className="text-slate-800">{risk.operational_status_weight}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
