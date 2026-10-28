import React from "react";
import { ChargingStopDetail } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/utils";
import { MapPin, BatteryCharging, Flag, ArrowDown } from "lucide-react";

interface TripTimelineProps {
  originName: string;
  destinationName: string;
  startBatteryPct: number;
  finalReservePct: number;
  stops: ChargingStopDetail[];
  totalDistanceKm: number;
}

export const TripTimeline: React.FC<TripTimelineProps> = ({
  originName,
  destinationName,
  startBatteryPct,
  finalReservePct,
  stops,
  totalDistanceKm,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
          Journey Hop Sequence & Battery SoC
        </h4>
        <span className="text-xs text-slate-500 font-medium">
          Start: <strong className="text-slate-900">{startBatteryPct}%</strong> &rarr; Arrive: <strong className="text-emerald-700">{finalReservePct}%</strong>
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {/* Origin Hop */}
        <div className="relative flex items-start gap-3">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-900 border-2 border-white shadow-xs flex items-center justify-center text-[10px] text-white font-bold">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{originName}</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                Depart at {startBatteryPct}% SoC
              </span>
            </div>
            <span className="text-xs text-slate-500">Departure point • km 0.0</span>
          </div>
        </div>

        {/* Intermediate Stops */}
        {stops.map((stop) => (
          <div key={stop.stop_number} className="relative flex items-start gap-3">
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-xs flex items-center justify-center text-[10px] text-white font-bold">
              {stop.stop_number}
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 w-full space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  Stop {stop.stop_number}: {stop.station_name}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded w-fit">
                  Charge for {formatDuration(stop.charging_duration_min)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span>At km {stop.distance_from_start_km}</span>
                <span>•</span>
                <span>
                  Battery: <strong className="text-slate-900">{stop.arrival_battery_pct}%</strong> &rarr; <strong className="text-emerald-700">{stop.target_departure_battery_pct}%</strong>
                </span>
                <span>•</span>
                <span>Added: <strong>{stop.energy_added_kwh} kWh</strong></span>
              </div>
            </div>
          </div>
        ))}

        {/* Destination Hop */}
        <div className="relative flex items-start gap-3">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-700 border-2 border-white shadow-xs flex items-center justify-center text-[10px] text-white font-bold">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{destinationName}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                Arrival at ~{finalReservePct}% SoC
              </span>
            </div>
            <span className="text-xs text-slate-500">Destination reached • km {formatDistance(totalDistanceKm)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
