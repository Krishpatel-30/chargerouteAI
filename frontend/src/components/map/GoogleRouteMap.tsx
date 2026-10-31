"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ChargingStopDetail, BackupStopCandidate, ChargingStation } from "@/lib/types";
import {
  ExternalLink,
  Navigation,
  Layers,
  Sparkles,
  KeyRound,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface GoogleRouteMapProps {
  routeGeometry?: [number, number][]; // [[lng, lat], ...]
  origin?: { name: string; lat: number; lng: number };
  destination?: { name: string; lat: number; lng: number };
  chargingStops?: ChargingStopDetail[];
  backupStops?: BackupStopCandidate[];
  allChargers?: ChargingStation[];
  onSelectCharger?: (chargerId: string) => void;
  className?: string;
  onSwitchToLeaflet?: () => void;
}

export const GoogleRouteMap: React.FC<GoogleRouteMapProps> = ({
  routeGeometry,
  origin,
  destination,
  chargingStops = [],
  backupStops = [],
  allChargers = [],
  onSelectCharger,
  className = "w-full h-[520px]",
  onSwitchToLeaflet,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const activeInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [apiKey, setApiKey] = useState<string>(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  );
  const [inputKey, setInputKey] = useState<string>("");
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [trafficEnabled, setTrafficEnabled] = useState<boolean>(false);

  // Check if API key is stored in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("voltplan_google_maps_key");
      if (storedKey) {
        setApiKey(storedKey);
      }
    }
  }, []);

  // Dynamically load Google Maps script
  useEffect(() => {
    if (!apiKey) return;

    if (typeof window !== "undefined" && (window as any).google?.maps) {
      setIsScriptLoaded(true);
      return;
    }

    const scriptId = "google-maps-js-sdk";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (existingScript) {
      if ((window as any).google?.maps) {
        setIsScriptLoaded(true);
      } else {
        existingScript.onload = () => setIsScriptLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      setScriptError(null);
    };
    script.onerror = () => {
      setScriptError("Failed to load Google Maps JavaScript API. Please check your API key or network.");
    };

    document.head.appendChild(script);
  }, [apiKey]);

  // Save manual API key
  const handleSaveApiKey = () => {
    if (inputKey.trim()) {
      localStorage.setItem("voltplan_google_maps_key", inputKey.trim());
      setApiKey(inputKey.trim());
      setShowKeyModal(false);
    }
  };

  // Toggle Traffic Layer
  const toggleTraffic = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !(window as any).google?.maps) return;

    if (trafficEnabled) {
      trafficLayerRef.current?.setMap(null);
      setTrafficEnabled(false);
    } else {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new google.maps.TrafficLayer();
      }
      trafficLayerRef.current.setMap(map);
      setTrafficEnabled(true);
    }
  }, [trafficEnabled]);

  // Build Turn-by-Turn Google Maps Navigation Link
  const googleMapsNavUrl = useMemo(() => {
    if (!origin || !destination) return "https://www.google.com/maps";

    const originParam = encodeURIComponent(`${origin.lat},${origin.lng}`);
    const destParam = encodeURIComponent(`${destination.lat},${destination.lng}`);

    let url = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=driving`;

    if (chargingStops && chargingStops.length > 0) {
      const waypoints = chargingStops.map((s) => `${s.latitude},${s.longitude}`).join("|");
      url += `&waypoints=${encodeURIComponent(waypoints)}`;
    }

    return url;
  }, [origin, destination, chargingStops]);

  // Initialize Google Map once script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = new google.maps.Map(mapContainerRef.current, {
        center: { lat: 22.5, lng: 78.5 }, // Central India
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: google.maps.ControlPosition.TOP_LEFT,
        },
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: "greedy",
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.error("Google Maps initialization error:", err);
    }
  }, [isScriptLoaded]);

  // Update Markers, Polylines and Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isScriptLoaded || !(window as any).google?.maps) return;

    // Clear existing markers and lines
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
    }

    const bounds = new google.maps.LatLngBounds();

    // 1. Draw regional charging stalls as subtle dots
    if (allChargers && allChargers.length > 0) {
      allChargers.forEach((ch) => {
        const isOperational = ch.live_status === "operational";
        const marker = new google.maps.Marker({
          position: { lat: ch.latitude, lng: ch.longitude },
          map,
          title: ch.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: isOperational ? "#10b981" : "#f59e0b",
            fillOpacity: 0.85,
            strokeColor: "#ffffff",
            strokeWeight: 1.5,
          },
        });

        marker.addListener("click", () => {
          activeInfoWindowRef.current?.close();
          const info = new google.maps.InfoWindow({
            content: `
              <div style="font-family:sans-serif; padding:4px 6px; font-size:12px; max-width:240px;">
                <strong style="color:#0f172a; font-size:13px; display:block; margin-bottom:2px;">${ch.name}</strong>
                <div style="color:#64748b; margin-bottom:4px;">${ch.operator} • ${ch.max_power_kw} kW</div>
                <div style="margin-bottom:6px;">
                  <span style="background:${isOperational ? "#d1fae5" : "#fef3c7"}; color:${isOperational ? "#065f46" : "#92400e"}; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">
                    ${ch.live_status.toUpperCase()}
                  </span>
                </div>
                <a href="/plan?destination_lat=${ch.latitude}&destination_lng=${ch.longitude}&destination_name=${encodeURIComponent(ch.name)}" style="color:#059669; font-weight:600; text-decoration:none;">Plan Route &rarr;</a>
              </div>
            `,
          });
          info.open(map, marker);
          activeInfoWindowRef.current = info;
          if (onSelectCharger) onSelectCharger(ch.id);
        });

        markersRef.current.push(marker);
      });
    }

    // 2. Draw Polyline
    if (routeGeometry && routeGeometry.length > 1) {
      const path = routeGeometry.map((pt) => ({ lat: pt[1], lng: pt[0] }));

      // Casing line
      const casingLine = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#0f172a",
        strokeOpacity: 0.3,
        strokeWeight: 7,
        map,
      });
      polylinesRef.current.push(casingLine);

      // Main route line (Emerald green)
      const routeLine = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#059669",
        strokeOpacity: 0.95,
        strokeWeight: 5,
        map,
      });
      polylinesRef.current.push(routeLine);

      path.forEach((pt) => bounds.extend(pt));
    }

    // 3. Origin Marker
    if (origin) {
      const origMarker = new google.maps.Marker({
        position: { lat: origin.lat, lng: origin.lng },
        map,
        title: origin.name,
        label: {
          text: "A",
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: "12px",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: "#0f172a",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      origMarker.addListener("click", () => {
        activeInfoWindowRef.current?.close();
        const info = new google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif; padding:4px 6px; font-size:12px;"><strong>Origin:</strong> ${origin.name}</div>`,
        });
        info.open(map, origMarker);
        activeInfoWindowRef.current = info;
      });

      markersRef.current.push(origMarker);
      bounds.extend({ lat: origin.lat, lng: origin.lng });
    }

    // 4. Destination Marker
    if (destination) {
      const destMarker = new google.maps.Marker({
        position: { lat: destination.lat, lng: destination.lng },
        map,
        title: destination.name,
        label: {
          text: "B",
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: "12px",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: "#059669",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      destMarker.addListener("click", () => {
        activeInfoWindowRef.current?.close();
        const info = new google.maps.InfoWindow({
          content: `<div style="font-family:sans-serif; padding:4px 6px; font-size:12px;"><strong>Destination:</strong> ${destination.name}</div>`,
        });
        info.open(map, destMarker);
        activeInfoWindowRef.current = info;
      });

      markersRef.current.push(destMarker);
      bounds.extend({ lat: destination.lat, lng: destination.lng });
    }

    // 5. Recommended Charging Stops
    chargingStops.forEach((stop) => {
      const stopMarker = new google.maps.Marker({
        position: { lat: stop.latitude, lng: stop.longitude },
        map,
        title: stop.station_name,
        label: {
          text: `⚡${stop.stop_number}`,
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: "11px",
        },
        icon: {
          path: "M -16,-16 L 16,-16 L 16,16 L -16,16 Z", // square pin
          scale: 1,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2.5,
        },
      });

      stopMarker.addListener("click", () => {
        activeInfoWindowRef.current?.close();
        const info = new google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif; padding:6px; font-size:12px; max-width:260px;">
              <strong style="color:#0f172a; font-size:13px; display:block; margin-bottom:2px;">
                Stop ${stop.stop_number}: ${stop.station_name}
              </strong>
              <div style="color:#64748b; font-size:11px; margin-bottom:6px;">
                ${stop.operator} • ${stop.charging_power_kw} kW DC Fast Charger
              </div>
              <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:6px; border-radius:6px; margin-bottom:6px; font-size:11px;">
                <div>Arrival SoC: <strong>${stop.arrival_battery_pct}%</strong></div>
                <div>Depart SoC: <strong style="color:#059669;">${stop.target_departure_battery_pct}%</strong></div>
                <div>Energy Added: <strong>${stop.energy_added_kwh} kWh</strong></div>
                <div>Duration: <strong>${stop.charging_duration_min} min</strong></div>
              </div>
              <div style="font-size:11px; color:#475569;">
                Reliability Risk: <strong>${stop.station_risk.score}/100 (${stop.station_risk.category})</strong>
              </div>
              ${
                stop.primary_backup
                  ? `<div style="margin-top:6px; background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:4px 6px; border-radius:4px; font-size:10px;">
                      🛡️ Primary Backup: ${stop.primary_backup.name} (+${stop.primary_backup.detour_km} km)
                    </div>`
                  : ""
              }
            </div>
          `,
        });
        info.open(map, stopMarker);
        activeInfoWindowRef.current = info;
      });

      markersRef.current.push(stopMarker);
      bounds.extend({ lat: stop.latitude, lng: stop.longitude });
    });

    // 6. Backup Stop Candidates
    backupStops.forEach((backup) => {
      const backupMarker = new google.maps.Marker({
        position: { lat: backup.latitude, lng: backup.longitude },
        map,
        title: backup.name,
        label: {
          text: "🛡️",
          fontSize: "11px",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: "#f59e0b",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      backupMarker.addListener("click", () => {
        activeInfoWindowRef.current?.close();
        const info = new google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif; padding:6px; font-size:12px; max-width:240px;">
              <strong style="color:#78350f; font-size:13px; display:block;">Backup: ${backup.name}</strong>
              <div style="color:#64748b; font-size:11px; margin-bottom:4px;">${backup.operator} • ${backup.max_power_kw} kW</div>
              <div style="background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:4px; border-radius:4px; font-size:11px; margin-bottom:4px;">
                Detour: +${backup.detour_km} km (~${backup.detour_time_min} min)
              </div>
              <div style="font-size:10px; color:#475569;">${backup.feasibility_notes}</div>
            </div>
          `,
        });
        info.open(map, backupMarker);
        activeInfoWindowRef.current = info;
      });

      markersRef.current.push(backupMarker);
      bounds.extend({ lat: backup.latitude, lng: backup.longitude });
    });

    // Fit map bounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 50);
    }
  }, [
    isScriptLoaded,
    routeGeometry,
    origin,
    destination,
    chargingStops,
    backupStops,
    allChargers,
    onSelectCharger,
  ]);

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-md border border-slate-200/90 ${className}`}>
      {/* Google Map Div */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px]" />

      {/* When no API key is set, show seamless activate banner or prompt */}
      {!apiKey && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-20">
          <div className="max-w-md bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Google Maps Platform</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Connect your Google Maps API key to render vector Google Maps with real-time traffic and Places search.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Paste Google Maps API Key (AIzaSy...)"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={!inputKey.trim()}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-colors"
                >
                  Activate Google Maps
                </button>
                {onSwitchToLeaflet && (
                  <button
                    type="button"
                    onClick={onSwitchToLeaflet}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Use OpenStreetMap
                  </button>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Key is stored locally in your browser. You can also configure <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code>.env</code>.
            </p>
          </div>
        </div>
      )}

      {/* Loading Script State */}
      {apiKey && !isScriptLoaded && !scriptError && (
        <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-500 gap-3 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Loading Google Maps Engine...
          </span>
        </div>
      )}

      {/* Script Loading Error */}
      {scriptError && (
        <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center text-slate-700 gap-3 z-10">
          <AlertCircle className="w-8 h-8 text-amber-600" />
          <p className="text-xs font-semibold max-w-sm">{scriptError}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("voltplan_google_maps_key");
                setApiKey("");
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
            >
              Change Key
            </button>
            {onSwitchToLeaflet && (
              <button
                type="button"
                onClick={onSwitchToLeaflet}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Switch to OpenStreetMap
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Floating Controls Overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-2">
        {/* Real-time Traffic Toggle */}
        {isScriptLoaded && (
          <button
            type="button"
            onClick={toggleTraffic}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 backdrop-blur-sm ${
              trafficEnabled
                ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                : "bg-white/90 text-slate-700 hover:bg-white"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                trafficEnabled ? "bg-white animate-pulse" : "bg-emerald-500"
              }`}
            />
            <span>Traffic {trafficEnabled ? "ON" : "OFF"}</span>
          </button>
        )}

        {/* Turn-by-turn Navigation in Google Maps App */}
        <a
          href={googleMapsNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-1.5 hover:scale-102"
          title="Open complete route with charging stops in Google Maps"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Navigate in Google Maps</span>
          <ExternalLink className="w-3 h-3 opacity-75" />
        </a>

        {/* Switch Map Provider Button */}
        {onSwitchToLeaflet && (
          <button
            type="button"
            onClick={onSwitchToLeaflet}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all border border-slate-200 flex items-center gap-1.5"
            title="Switch map rendering engine"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Map Engine</span>
          </button>
        )}
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg shadow-md border border-slate-200 text-[11px] space-y-1.5 font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" /> Origin / Destination
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-500 text-[9px] text-white flex items-center justify-center font-bold">⚡</span> Recommended EV Stop
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500 text-[9px] text-white flex items-center justify-center font-bold">🛡️</span> Verified Backup Option
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white inline-block" /> Pan-India Highway Stalls
        </div>
      </div>
    </div>
  );
};
