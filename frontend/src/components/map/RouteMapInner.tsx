"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ChargingStopDetail, BackupStopCandidate, ChargingStation } from "@/lib/types";

// Fix standard Leaflet default marker icons in webpack / Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

export const RouteMapInner: React.FC<RouteMapProps> = ({
  routeGeometry,
  origin,
  destination,
  chargingStops = [],
  backupStops = [],
  allChargers = [],
  onSelectCharger,
  className = "w-full h-[520px]",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default centered on central Gujarat (between Ahmedabad and Vadodara)
      const map = L.map(mapContainerRef.current, {
        center: [22.65, 72.85],
        zoom: 8,
        zoomControl: true,
      });

      // Add high-clarity CartoDB Positron tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update layers when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();
    const bounds = L.latLngBounds([]);

    // 1. Draw all regional chargers as subtle small dots
    if (allChargers && allChargers.length > 0) {
      allChargers.forEach((ch) => {
        const isOperational = ch.live_status === "operational";
        const circleMarker = L.circleMarker([ch.latitude, ch.longitude], {
          radius: 5,
          fillColor: isOperational ? "#10b981" : "#f59e0b",
          color: "#ffffff",
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.8,
        });

        circleMarker.bindPopup(`
          <div class="p-3 max-w-xs text-xs">
            <span class="font-bold text-slate-900 block text-sm mb-1">${ch.name}</span>
            <div class="text-slate-500 mb-1">${ch.operator} • ${ch.max_power_kw} kW</div>
            <div class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              isOperational ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }">
              Status: ${ch.live_status.toUpperCase()}
            </div>
            <div class="mt-2 text-slate-600">
              <a href="/chargers/${ch.id}" class="text-emerald-600 font-semibold hover:underline">View Station Details &rarr;</a>
            </div>
          </div>
        `);
        circleMarker.addTo(layers);
      });
    }

    // 2. Draw route polyline if coordinates available
    if (routeGeometry && routeGeometry.length > 1) {
      // Invert GeoJSON [lng, lat] to Leaflet [lat, lng]
      const latLngs: [number, number][] = routeGeometry.map((pt) => [pt[1], pt[0]]);
      
      // Shadow casing line
      L.polyline(latLngs, {
        color: "#0f172a",
        weight: 6,
        opacity: 0.25,
      }).addTo(layers);

      // Primary emerald highway route line
      const routeLine = L.polyline(latLngs, {
        color: "#059669",
        weight: 4.5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(layers);

      latLngs.forEach((ll) => bounds.extend(ll));
    }

    // 3. Origin Marker
    if (origin) {
      const originIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="background:#0f172a; color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:2px solid white; box-shadow:0 4px 6px -1px rgba(0,0,0,0.3);">
            A
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const origMarker = L.marker([origin.lat, origin.lng], { icon: originIcon }).addTo(layers);
      origMarker.bindPopup(`
        <div class="p-2 text-xs">
          <strong class="text-slate-900 block text-sm">Origin</strong>
          <span class="text-slate-600">${origin.name}</span>
        </div>
      `);
      bounds.extend([origin.lat, origin.lng]);
    }

    // 4. Destination Marker
    if (destination) {
      const destIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="background:#059669; color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; border:2px solid white; box-shadow:0 4px 6px -1px rgba(0,0,0,0.3);">
            B
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(layers);
      destMarker.bindPopup(`
        <div class="p-2 text-xs">
          <strong class="text-slate-900 block text-sm">Destination</strong>
          <span class="text-slate-600">${destination.name}</span>
        </div>
      `);
      bounds.extend([destination.lat, destination.lng]);
    }

    // 5. Recommended Charging Stops
    chargingStops.forEach((stop) => {
      const stopIcon = L.divIcon({
        className: "custom-stop-pin",
        html: `
          <div style="background:#10b981; color:white; width:34px; height:34px; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:bold; font-size:11px; border:2.5px solid white; box-shadow:0 6px 10px -2px rgba(16,185,129,0.5);">
            <span>⚡${stop.stop_number}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon }).addTo(layers);
      marker.bindPopup(`
        <div class="p-3 text-xs max-w-xs">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-slate-900 text-sm">Stop ${stop.stop_number}: ${stop.station_name}</span>
          </div>
          <p class="text-slate-500 mb-2">${stop.operator} • ${stop.charging_power_kw} kW DC Fast Charger</p>
          <div class="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200 mb-2 font-medium text-slate-700">
            <div>Arrival SoC: <strong class="text-slate-900">${stop.arrival_battery_pct}%</strong></div>
            <div>Depart SoC: <strong class="text-emerald-700">${stop.target_departure_battery_pct}%</strong></div>
            <div>Charge: <strong>${stop.energy_added_kwh} kWh</strong></div>
            <div>Time: <strong>${stop.charging_duration_min} min</strong></div>
          </div>
          <div class="text-[11px] text-slate-600">
            Risk: <span class="font-semibold text-emerald-700">${stop.station_risk.score}/100 (${stop.station_risk.category})</span>
          </div>
          ${
            stop.primary_backup
              ? `<div class="mt-1.5 text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                  Backup: ${stop.primary_backup.name} (+${stop.primary_backup.detour_km} km detour)
                </div>`
              : ""
          }
        </div>
      `);
      bounds.extend([stop.latitude, stop.longitude]);
    });

    // 6. Backup Stop Candidates
    backupStops.forEach((backup) => {
      const backupIcon = L.divIcon({
        className: "custom-backup-pin",
        html: `
          <div style="background:#f59e0b; color:white; width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; border:2px dashed white; box-shadow:0 4px 6px -1px rgba(245,158,11,0.4);">
            🛡️
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const bMarker = L.marker([backup.latitude, backup.longitude], { icon: backupIcon }).addTo(layers);
      bMarker.bindPopup(`
        <div class="p-2.5 text-xs max-w-xs">
          <div class="font-bold text-amber-900 text-sm mb-0.5">Backup: ${backup.name}</div>
          <div class="text-slate-500 mb-1">${backup.operator} • ${backup.max_power_kw} kW</div>
          <div class="bg-amber-50 p-1.5 rounded border border-amber-200 text-amber-900 text-[11px] mb-1 font-medium">
            Detour: +${backup.detour_km} km (~${backup.detour_time_min} min)
          </div>
          <div class="text-slate-600 text-[10px]">${backup.feasibility_notes}</div>
        </div>
      `);
      bounds.extend([backup.latitude, backup.longitude]);
    });

    // Fit map bounds smoothly
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [routeGeometry, origin, destination, chargingStops, backupStops, allChargers]);

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-md border border-slate-200/90 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-slate-200 text-[11px] space-y-1.5 font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" /> Origin / Destination
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500 text-[9px] text-white flex items-center justify-center font-bold">⚡</span> Recommended Stop
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500 text-[9px] text-white flex items-center justify-center font-bold">🛡️</span> Backup Option
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white inline-block" /> Gujarat Network Stalls
        </div>
      </div>
    </div>
  );
};
