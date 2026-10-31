"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { LocationSearchResult } from "@/lib/types";
import {
  MapPin,
  Search,
  Crosshair,
  Loader2,
  X,
  Compass,
  Building,
  TreePine,
  Sparkles,
  Check,
} from "lucide-react";

export interface SelectedLocation {
  name: string;
  lat: number;
  lng: number;
}

interface LocationAutocompleteProps {
  label: string;
  icon?: React.ReactNode;
  value: SelectedLocation;
  onChange: (loc: SelectedLocation) => void;
  placeholder?: string;
  badgeLabel?: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  icon,
  value,
  onChange,
  placeholder = "Search any Indian city, town, expressway hub, or village...",
  badgeLabel,
}) => {
  const [inputValue, setInputValue] = useState(value.name || "");
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [popularVillages, setPopularVillages] = useState<LocationSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal input value if external value changes
  useEffect(() => {
    if (value.name && value.name !== inputValue && !isOpen) {
      setInputValue(value.name);
    }
  }, [value.name]);

  // Load popular rural villages on mount for empty state dropdown
  useEffect(() => {
    async function loadPopular() {
      const popular = await api.getPopularVillages();
      setPopularVillages(popular);
    }
    loadPopular();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    setIsOpen(true);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await api.searchLocations(text, 8);
        setSuggestions(results);
      } catch (err) {
        console.error("Autocomplete search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 220);
  };

  const handleSelectLocation = (loc: LocationSearchResult) => {
    const titlePart = loc.village || loc.name.split(",")[0].trim();
    const regionParts = [loc.district, loc.state].filter(Boolean);
    const cleanName = regionParts.length > 0 ? `${titlePart}, ${regionParts.join(", ")}` : titlePart;

    setInputValue(cleanName);
    onChange({
      name: cleanName,
      lat: loc.latitude,
      lng: loc.longitude,
    });
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleBlur = () => {
    // Timeout allows onMouseDown / click events on dropdown items to execute first
    setTimeout(() => {
      if (suggestions.length > 0 && inputValue.trim().length > 1) {
        const top = suggestions[0];
        const lowerInput = inputValue.trim().toLowerCase();
        if (
          top &&
          (top.village?.toLowerCase().includes(lowerInput) ||
            top.name.toLowerCase().includes(lowerInput) ||
            lowerInput.includes(top.name.split(",")[0].toLowerCase()))
        ) {
          handleSelectLocation(top);
        }
      }
      setIsOpen(false);
    }, 250);
  };

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const rev = await api.reverseGeocode(lat, lng);
          const resolvedName = rev?.name || `Current Location (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
          setInputValue(resolvedName);
          onChange({
            name: resolvedName,
            lat,
            lng,
          });
        } catch (err) {
          const fallbackName = `GPS Location (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
          setInputValue(fallbackName);
          onChange({
            name: fallbackName,
            lat,
            lng,
          });
        } finally {
          setIsDetecting(false);
          setIsOpen(false);
        }
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        setIsDetecting(false);
        alert("Could not retrieve GPS coordinates. Please type your village or city name.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = suggestions.length > 0 ? suggestions : popularVillages;
    if (!isOpen || list.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < list.length) {
        handleSelectLocation(list[selectedIndex]);
      } else if (list.length > 0) {
        handleSelectLocation(list[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    if (category.includes("village") || category.includes("smart_city")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
          <TreePine className="w-2.5 h-2.5" /> Village
        </span>
      );
    }
    if (category.includes("pilgrimage")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
          <Sparkles className="w-2.5 h-2.5" /> Pilgrimage
        </span>
      );
    }
    if (category.includes("tourism") || category.includes("ecotourism") || category.includes("hill_station")) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
          <Compass className="w-2.5 h-2.5" /> Destination
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
        <Building className="w-2.5 h-2.5" /> Town
      </span>
    );
  };

  const getProviderPill = (provider: string) => {
    if (provider === "google_maps") {
      return (
        <span className="text-[9px] font-bold tracking-tight text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          Google Maps
        </span>
      );
    }
    if (provider === "nominatim" || provider === "openstreetmap") {
      return (
        <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          OSM Village Map
        </span>
      );
    }
    return (
      <span className="text-[9px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
        India Directory
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          {icon || <MapPin className="w-3.5 h-3.5 text-slate-500" />} {label}
        </label>
        {badgeLabel && (
          <span className="text-[10px] text-slate-400 font-medium">{badgeLabel}</span>
        )}
      </div>

      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-16 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-xs"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600 mr-1" />}

          {inputValue && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                setSuggestions([]);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear location"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={isDetecting}
            className="p-1.5 rounded-md text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Use Current GPS Location"
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Lat / Lng Coordinate Pill */}
      {value.lat && value.lng && (
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 px-0.5">
          <span className="truncate max-w-[200px] font-mono text-[10px] text-slate-400">
            GPS: {value.lat.toFixed(4)}° N, {value.lng.toFixed(4)}° E
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <Check className="w-3 h-3" /> Pin Located
          </span>
        </div>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {/* Active Search Suggestions */}
          {suggestions.length > 0 ? (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span>Pan-India Locations, Towns & Villages</span>
                <span>{suggestions.length} found</span>
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectLocation(item);
                  }}
                  onClick={() => handleSelectLocation(item)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-start gap-2.5 transition-colors border-b border-slate-50 last:border-b-0 ${
                    idx === selectedIndex ? "bg-emerald-50/80" : "hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-slate-900 truncate">
                        {item.village || item.name.split(",")[0]}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {getCategoryBadge(item.category)}
                        {getProviderPill(item.provider)}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : inputValue.trim().length > 1 && !isLoading ? (
            <div className="p-4 text-center">
              <p className="text-xs font-medium text-slate-600">
                No exact village match found for &ldquo;{inputValue}&rdquo;.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Try searching with state or district name (e.g. &ldquo;Bhavnagar, Gujarat&rdquo;, &ldquo;Satara, Maharashtra&rdquo;, &ldquo;Rewari, Haryana&rdquo;) or select a destination below.
              </p>
            </div>
          ) : null}

          {/* Popular Rural / Destination Villages Quick List */}
          {suggestions.length === 0 && (
            <div className="py-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span>Popular Pan-India EV Destinations</span>
                <span className="text-[9px] text-emerald-600 font-semibold">Instant Selection</span>
              </div>
              {popularVillages.slice(0, 8).map((item, idx) => (
                <button
                  key={`pop_${item.id}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectLocation(item);
                  }}
                  onClick={() => handleSelectLocation(item)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-start gap-2.5 transition-colors border-b border-slate-50 last:border-b-0 ${
                    idx === selectedIndex ? "bg-emerald-50/80" : "hover:bg-slate-50"
                  }`}
                >
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-slate-800 truncate">
                        {item.village || item.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {getCategoryBadge(item.category)}
                        <span className="text-[10px] font-medium text-slate-400">
                          {item.state || item.district}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Provider Footer */}
          <div className="bg-slate-50/90 px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Powered by Google Maps Platform &amp; Pan-India Geocoder</span>
            <span className="font-semibold text-emerald-600">All 28 States &amp; UTs</span>
          </div>
        </div>
      )}
    </div>
  );
};
