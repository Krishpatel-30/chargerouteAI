"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Loader2 } from "lucide-react";
import { ChargingStopDetail, BackupStopCandidate, ChargingStation } from "@/lib/types";

const RouteMapInner = dynamic(
  () => import("./RouteMapInner").then((mod) => mod.RouteMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-xl bg-slate-100 flex flex-col items-center justify-center border border-slate-200 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading Google Maps...
        </span>
      </div>
    ),
  }
);

interface RouteMapProps {
  routeGeometry?: [number, number][]; // [[lng, lat], ...]
  origin?: { name: string; lat: number; lng: number };
  destination?: { name: string; lat: number; lng: number };
  chargingStops?: ChargingStopDetail[];
  backupStops?: BackupStopCandidate[];
  allChargers?: ChargingStation[];
  onSelectCharger?: (chargerId: string) => void;
  className?: string;
}

export const RouteMap: React.FC<RouteMapProps> = (props) => {
  return <RouteMapInner {...props} />;
};
