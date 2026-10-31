import React from "react";
import { BackupStopCandidate } from "@/lib/types";
import { ShieldCheck, MapPin, Zap, Clock, AlertCircle, Navigation, ExternalLink } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface BackupStopCardProps {
  backup: BackupStopCandidate;
  isPrimary?: boolean;
}

export const BackupStopCard: React.FC<BackupStopCardProps> = ({
  backup,
  isPrimary = false,
}) => {
  return (
    <div className="rounded-lg border border-amber-200/90 bg-amber-50/60 p-3 text-xs space-y-2 transition-all hover:bg-amber-50 shadow-xs flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold text-[10px]">
              🛡️
            </span>
            <div>
              <h5 className="font-bold text-slate-900 text-xs">{backup.name}</h5>
              <span className="text-[11px] text-slate-500">{backup.operator}</span>
            </div>
          </div>
          {isPrimary && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
              Recommended Backup
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 bg-white/80 p-2 rounded-md border border-amber-200/60 text-slate-700">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Detour: <strong>+{backup.detour_km} km</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Extra Time: <strong>~{backup.detour_time_min} min</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Power: <strong>{backup.max_power_kw} kW</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-slate-100 text-slate-800">
              {backup.live_status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-amber-900 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>{backup.feasibility_notes}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-amber-200/50 flex justify-end">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${backup.latitude},${backup.longitude}&travelmode=driving&dir_action=navigate`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline"
        >
          <Navigation className="w-3 h-3 text-blue-600" />
          <span>Navigate to Backup in Google Maps &rarr;</span>
        </a>
      </div>
    </div>
  );
};
