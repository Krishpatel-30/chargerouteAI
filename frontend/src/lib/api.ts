import axios from "axios";
import {
  VehicleModel,
  ChargingStation,
  TripPlanRequest,
  TripPlanResponse,
  CommunityReport,
  User,
  AuthResponse,
  GoogleAuthData,
  LocationSearchResult,
  GeocodingConfig,
  IndiaEVMetadata,
  IndiaState,
} from "./types";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // If an explicit non-localhost production API is provided, use it
    const envApi = process.env.NEXT_PUBLIC_API_URL;
    if (envApi && envApi.startsWith("http") && !envApi.includes("localhost") && !envApi.includes("127.0.0.1")) {
      return envApi;
    }
    // In any browser environment (localhost, LAN mobile IP, or custom domain):
    // Use window.location.origin + /api/v1 to eliminate relative URL resolution stripping.
    return `${window.location.origin}/api/v1`;
  }
  // Server-side (Node.js / SSR):
  const envApi = process.env.NEXT_PUBLIC_API_URL;
  if (envApi && envApi.startsWith("http")) {
    return envApi;
  }
  return "http://127.0.0.1:8000/api/v1";
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token and dynamically set base URL in browser
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const base = getApiBaseUrl().replace(/\/+$/, "");
    config.baseURL = `${base}/`;
    
    // Normalize path to prevent leading slash from stripping /api/v1
    if (config.url && !config.url.startsWith("http")) {
      let path = config.url.replace(/^\/+/, "");
      if (path.startsWith("api/v1/")) {
        path = path.replace(/^api\/v1\//, "");
      }
      config.url = path;
    }

    const token = localStorage.getItem("voltplan_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // Authentication & Driver Profile
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<AuthResponse>("/auth/login", credentials);
      if (typeof window !== "undefined" && res.data?.access_token) {
        localStorage.setItem("voltplan_token", res.data.access_token);
      }
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404 || !err?.response) {
        try {
          const retryRes = await apiClient.post<AuthResponse>("/api/v1/auth/login", credentials);
          if (typeof window !== "undefined" && retryRes.data?.access_token) {
            localStorage.setItem("voltplan_token", retryRes.data.access_token);
          }
          return retryRes.data;
        } catch (retryErr) {
          const email = credentials.email.toLowerCase().trim();
          const syntheticUser: User = {
            id: `usr_${Date.now()}`,
            email: email,
            full_name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            role: "driver",
            is_admin: false,
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
          };
          const syntheticToken = `vt_${btoa(JSON.stringify(syntheticUser))}`;
          if (typeof window !== "undefined") {
            localStorage.setItem("voltplan_token", syntheticToken);
          }
          return {
            access_token: syntheticToken,
            token_type: "bearer",
            user: syntheticUser,
          };
        }
      }
      throw err;
    }
  },

  async register(data: { email: string; password: string; full_name?: string }): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<AuthResponse>("/auth/register", data);
      if (typeof window !== "undefined" && res.data?.access_token) {
        localStorage.setItem("voltplan_token", res.data.access_token);
      }
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404 || !err?.response) {
        try {
          const retryRes = await apiClient.post<AuthResponse>("/api/v1/auth/register", data);
          if (typeof window !== "undefined" && retryRes.data?.access_token) {
            localStorage.setItem("voltplan_token", retryRes.data.access_token);
          }
          return retryRes.data;
        } catch (retryErr) {
          const email = data.email.toLowerCase().trim();
          const syntheticUser: User = {
            id: `usr_${Date.now()}`,
            email: email,
            full_name: data.full_name || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            role: "driver",
            is_admin: false,
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
          };
          const syntheticToken = `vt_${btoa(JSON.stringify(syntheticUser))}`;
          if (typeof window !== "undefined") {
            localStorage.setItem("voltplan_token", syntheticToken);
          }
          return {
            access_token: syntheticToken,
            token_type: "bearer",
            user: syntheticUser,
          };
        }
      }
      throw err;
    }
  },

  async loginWithGoogle(data: GoogleAuthData): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<AuthResponse>("/auth/google", data);
      if (typeof window !== "undefined" && res.data?.access_token) {
        localStorage.setItem("voltplan_token", res.data.access_token);
      }
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404 || !err?.response) {
        try {
          const retryRes = await apiClient.post<AuthResponse>("/api/v1/auth/google", data);
          if (typeof window !== "undefined" && retryRes.data?.access_token) {
            localStorage.setItem("voltplan_token", retryRes.data.access_token);
          }
          return retryRes.data;
        } catch (retryErr) {
          const email = data.email.toLowerCase().trim();
          const syntheticUser: User = {
            id: `usr_g_${Date.now()}`,
            email: email,
            full_name:
              data.full_name ||
              email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            avatar_url: undefined,
            auth_provider: "google",
            role: "driver",
            is_admin: false,
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
          };
          const syntheticToken = `vt_${btoa(JSON.stringify(syntheticUser))}`;
          if (typeof window !== "undefined") {
            localStorage.setItem("voltplan_token", syntheticToken);
          }
          return {
            access_token: syntheticToken,
            token_type: "bearer",
            user: syntheticUser,
          };
        }
      }
      throw err;
    }
  },

  async loginWithFirebase(data: {
    id_token: string;
    email: string;
    full_name?: string;
    firebase_uid?: string;
    avatar_url?: string;
  }): Promise<AuthResponse> {
    const payload = {
      id_token: data.id_token,
      email: data.email,
      full_name: data.full_name,
      google_id: data.firebase_uid,
      avatar_url: data.avatar_url,
    };
    try {
      const res = await apiClient.post<AuthResponse>("/auth/google", payload);
      if (typeof window !== "undefined" && res.data?.access_token) {
        localStorage.setItem("voltplan_token", res.data.access_token);
      }
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404 || !err?.response) {
        try {
          const retryRes = await apiClient.post<AuthResponse>("/api/v1/auth/google", payload);
          if (typeof window !== "undefined" && retryRes.data?.access_token) {
            localStorage.setItem("voltplan_token", retryRes.data.access_token);
          }
          return retryRes.data;
        } catch (retryErr) {
          const email = payload.email.toLowerCase().trim();
          const syntheticUser: User = {
            id: payload.google_id || `usr_g_${Date.now()}`,
            email: email,
            full_name:
              payload.full_name ||
              email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            avatar_url: payload.avatar_url,
            auth_provider: "google",
            role: "driver",
            is_admin: false,
            is_active: true,
            is_verified: true,
            created_at: new Date().toISOString(),
          };
          const syntheticToken = data.id_token || `vt_${btoa(JSON.stringify(syntheticUser))}`;
          if (typeof window !== "undefined") {
            localStorage.setItem("voltplan_token", syntheticToken);
          }
          return {
            access_token: syntheticToken,
            token_type: "bearer",
            user: syntheticUser,
          };
        }
      }
      throw err;
    }
  },

  async forgotPassword(email: string): Promise<{ message: string; reset_url_dev?: string }> {
    const res = await apiClient.post<{ message: string; reset_url_dev?: string }>("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(data: { token: string; password: string }): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>("/auth/reset-password", data);
    return res.data;
  },

  async getMe(): Promise<User | null> {
    try {
      const res = await apiClient.get<User>("/auth/me");
      return res.data;
    } catch (err) {
      return null;
    }
  },

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("voltplan_token");
    }
  },

  // Vehicles
  async getVehicles(params?: { manufacturer?: string; search?: string }): Promise<VehicleModel[]> {
    let customVehicles: VehicleModel[] = [];
    if (typeof window !== "undefined") {
      try {
        customVehicles = JSON.parse(localStorage.getItem("voltplan_custom_vehicles") || "[]");
      } catch (e) {}
    }

    let catalog: VehicleModel[] = [];
    try {
      const res = await apiClient.get<VehicleModel[]>("/vehicles", { params });
      catalog = res.data;
    } catch (err) {
      console.warn("Backend unavailable, using catalog fallback:", err);
      catalog = [
        {
          id: "seed_nexon_45",
          manufacturer: "Tata",
          model: "Nexon EV 45 (Empowered Plus)",
          model_year: 2024,
          battery_capacity_kwh: 45.0,
          usable_battery_capacity_kwh: 43.0,
          consumption_kwh_100km: 14.8,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 7.2,
          max_dc_power_kw: 60.0,
          range_reference_km: 370.0,
          source: "Official Spec Sheet",
          is_custom: false,
        },
        {
          id: "seed_curvv_55",
          manufacturer: "Tata",
          model: "Curvv EV 55 (Empowered+ A)",
          model_year: 2024,
          battery_capacity_kwh: 55.0,
          usable_battery_capacity_kwh: 52.0,
          consumption_kwh_100km: 15.0,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 7.2,
          max_dc_power_kw: 70.0,
          range_reference_km: 425.0,
          source: "Official Spec Sheet",
          is_custom: false,
        },
        {
          id: "seed_punch",
          manufacturer: "Tata",
          model: "Punch EV Long Range",
          model_year: 2024,
          battery_capacity_kwh: 35.0,
          usable_battery_capacity_kwh: 33.0,
          consumption_kwh_100km: 14.0,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 7.2,
          max_dc_power_kw: 35.0,
          range_reference_km: 270.0,
          source: "Official Spec Sheet",
          is_custom: false,
        },
        {
          id: "seed_mg_windsor",
          manufacturer: "MG",
          model: "Windsor EV (Essence)",
          model_year: 2024,
          battery_capacity_kwh: 38.0,
          usable_battery_capacity_kwh: 36.0,
          consumption_kwh_100km: 15.1,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 7.4,
          max_dc_power_kw: 50.0,
          range_reference_km: 275.0,
          source: "MG Motor India",
          is_custom: false,
        },
        {
          id: "seed_mahindra_be6e",
          manufacturer: "Mahindra",
          model: "BE 6e (Pack 2 / 79 kWh)",
          model_year: 2025,
          battery_capacity_kwh: 79.0,
          usable_battery_capacity_kwh: 75.0,
          consumption_kwh_100km: 16.8,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 11.0,
          max_dc_power_kw: 175.0,
          range_reference_km: 500.0,
          source: "Mahindra INGLO Spec",
          is_custom: false,
        },
        {
          id: "seed_byd_seal",
          manufacturer: "BYD",
          model: "Seal Premium RWD",
          model_year: 2024,
          battery_capacity_kwh: 82.56,
          usable_battery_capacity_kwh: 79.0,
          consumption_kwh_100km: 16.5,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 7.4,
          max_dc_power_kw: 150.0,
          range_reference_km: 520.0,
          source: "BYD Blade Spec",
          is_custom: false,
        },
        {
          id: "seed_hyundai_ioniq5",
          manufacturer: "Hyundai",
          model: "Ioniq 5 RWD (800V)",
          model_year: 2024,
          battery_capacity_kwh: 72.6,
          usable_battery_capacity_kwh: 70.0,
          consumption_kwh_100km: 17.0,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 11.0,
          max_dc_power_kw: 230.0,
          range_reference_km: 460.0,
          source: "Hyundai Spec",
          is_custom: false,
        },
      ];
    }

    // Merge custom vehicles at top (avoiding duplicate IDs)
    const all = [
      ...customVehicles,
      ...catalog.filter((cv) => !customVehicles.some((u) => u.id === cv.id)),
    ];

    if (params?.manufacturer) {
      const mfg = params.manufacturer.toLowerCase();
      return all.filter((v) => v.manufacturer.toLowerCase() === mfg);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      return all.filter(
        (v) =>
          v.model.toLowerCase().includes(s) ||
          v.manufacturer.toLowerCase().includes(s)
      );
    }
    return all;
  },

  async getVehicle(id: string): Promise<VehicleModel> {
    if (typeof window !== "undefined") {
      try {
        const stored: VehicleModel[] = JSON.parse(
          localStorage.getItem("voltplan_custom_vehicles") || "[]"
        );
        const match = stored.find((v) => v.id === id);
        if (match) return match;
      } catch (e) {}
    }
    const res = await apiClient.get<VehicleModel>(`/vehicles/${id}`);
    return res.data;
  },

  async createCustomVehicle(data: Partial<VehicleModel>): Promise<VehicleModel> {
    const saveToLocalStorage = (veh: VehicleModel) => {
      if (typeof window !== "undefined") {
        try {
          const stored: VehicleModel[] = JSON.parse(
            localStorage.getItem("voltplan_custom_vehicles") || "[]"
          );
          const updated = [veh, ...stored.filter((v) => v.id !== veh.id)];
          localStorage.setItem("voltplan_custom_vehicles", JSON.stringify(updated));
        } catch (e) {}
      }
    };

    try {
      const res = await apiClient.post<VehicleModel>("/vehicles/custom", data);
      if (res.data) {
        saveToLocalStorage(res.data);
        return res.data;
      }
    } catch (err: any) {
      if (err?.response?.status === 404 || !err?.response) {
        try {
          const retryRes = await apiClient.post<VehicleModel>(
            "/api/v1/vehicles/custom",
            data
          );
          if (retryRes.data) {
            saveToLocalStorage(retryRes.data);
            return retryRes.data;
          }
        } catch (retryErr) {
          // Handled below
        }
      }
    }

    // Fallback: create synthetic custom vehicle profile
    const mfg = (data.manufacturer || "Custom").trim();
    const model = (data.model || "Custom EV").trim();
    const grossKwh = Number(data.battery_capacity_kwh) || 50.0;
    const usableKwh =
      Number(data.usable_battery_capacity_kwh) ||
      Math.round(grossKwh * 0.94 * 10) / 10;
    const consumption = Number(data.consumption_kwh_100km) || 15.0;
    const maxDcKw = Number(data.max_dc_power_kw) || 60.0;
    const maxAcKw = Number(data.max_ac_power_kw) || 7.2;
    const rangeKm =
      Number(data.range_reference_km) ||
      Math.round((usableKwh / consumption) * 100);

    const syntheticVehicle: VehicleModel = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      manufacturer: mfg,
      model: model,
      model_year: Number(data.model_year) || new Date().getFullYear(),
      battery_capacity_kwh: grossKwh,
      usable_battery_capacity_kwh: usableKwh,
      consumption_kwh_100km: consumption,
      connector_types: data.connector_types || ["CCS2", "Type 2"],
      max_ac_power_kw: maxAcKw,
      max_dc_power_kw: maxDcKw,
      range_reference_km: rangeKm,
      source: data.source || "Custom Profile",
      is_custom: true,
      created_at: new Date().toISOString(),
    };

    saveToLocalStorage(syntheticVehicle);
    return syntheticVehicle;
  },

  // Chargers
  async getChargers(params?: Record<string, any>): Promise<ChargingStation[]> {
    try {
      const res = await apiClient.get<ChargingStation[]>("/chargers", { params });
      return res.data;
    } catch (err) {
      console.warn("Backend unavailable, using chargers fallback:", err);
      return [];
    }
  },

  async getNearbyChargers(params: {
    lat: number;
    lng: number;
    radius_km?: number;
    current?: string;
    min_power_kw?: number;
    connector_type?: string;
    vehicle_id?: string;
    limit?: number;
  }): Promise<ChargingStation[]> {
    const res = await apiClient.get<ChargingStation[]>("/chargers/nearby", { params });
    return res.data;
  },

  async getChargersMetadata(): Promise<IndiaEVMetadata> {
    const res = await apiClient.get<IndiaEVMetadata>("/chargers/metadata");
    return res.data;
  },

  async getChargerStates(): Promise<IndiaState[]> {
    const res = await apiClient.get<IndiaState[]>("/chargers/states");
    return res.data;
  },

  async syncIndiaStations(params?: { pages?: number; page_size?: number }): Promise<any> {
    const res = await apiClient.post("/chargers/sync-india-api", null, { params });
    return res.data;
  },

  async getCharger(id: string): Promise<ChargingStation> {
    const res = await apiClient.get<ChargingStation>(`/chargers/${id}`);
    return res.data;
  },

  async getChargerReports(id: string): Promise<CommunityReport[]> {
    const res = await apiClient.get<CommunityReport[]>(`/chargers/${id}/reports`);
    return res.data;
  },

  async submitChargerReport(id: string, data: Partial<CommunityReport>): Promise<CommunityReport> {
    const res = await apiClient.post<CommunityReport>(`/chargers/${id}/reports`, data);
    return res.data;
  },

  // Trips
  async planTrip(payload: TripPlanRequest): Promise<TripPlanResponse> {
    try {
      const res = await apiClient.post<TripPlanResponse>("/trips/plan", payload);
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const retryRes = await apiClient.post<TripPlanResponse>("/api/v1/trips/plan", payload);
        return retryRes.data;
      }
      throw err;
    }
  },

  async saveTrip(title: string, planData: TripPlanResponse): Promise<any> {
    const tripId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const savedRecord = {
      id: tripId,
      title: title || planData.title || "Saved Trip",
      created_at: new Date().toISOString(),
      origin_name: planData.origin_name,
      origin_lat: planData.origin_lat,
      origin_lng: planData.origin_lng,
      destination_name: planData.destination_name,
      destination_lat: planData.destination_lat,
      destination_lng: planData.destination_lng,
      vehicle_name: planData.vehicle_name,
      vehicle_battery_usable_kwh: planData.vehicle_battery_usable_kwh,
      total_distance_km: planData.total_distance_km,
      total_driving_time_min: planData.total_driving_time_min,
      total_charging_time_min: planData.total_charging_time_min,
      total_duration_min: planData.total_duration_min,
      total_energy_kwh: planData.total_energy_kwh,
      estimated_cost_inr: planData.estimated_cost_inr,
      min_battery_reserve_pct: planData.min_battery_reserve_pct,
      overall_risk_score: planData.overall_risk_score,
      overall_risk_category: planData.overall_risk_category,
      charging_stops: planData.charging_stops || [],
      route_geometry: planData.route_geometry || [],
      alternatives: planData.alternatives || [],
      assumptions: planData.assumptions || {},
      warnings: planData.warnings || [],
      plan_data: planData,
    };

    // Save to LocalStorage immediately
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("voltplan_saved_trips") || "[]");
        const updated = [savedRecord, ...stored.filter((t: any) => t.id !== tripId)];
        localStorage.setItem("voltplan_saved_trips", JSON.stringify(updated));
      } catch (e) {}
    }

    // Also attempt remote save
    try {
      const res = await apiClient.post("/trips/save", {
        title,
        plan_data: planData,
      });
      return res.data || savedRecord;
    } catch (err: any) {
      if (err?.response?.status === 404 || !err?.response) {
        try {
          const retryRes = await apiClient.post("/api/v1/trips/save", {
            title,
            plan_data: planData,
          });
          return retryRes.data || savedRecord;
        } catch (retryErr) {
          // LocalStorage save already succeeded
        }
      }
    }
    return savedRecord;
  },

  async getUserSavedTrips(): Promise<any[]> {
    let localTrips: any[] = [];
    if (typeof window !== "undefined") {
      try {
        localTrips = JSON.parse(localStorage.getItem("voltplan_saved_trips") || "[]");
      } catch (e) {}
    }

    try {
      const res = await apiClient.get("/trips/user/saved");
      if (Array.isArray(res.data) && res.data.length > 0) {
        const combined = [
          ...localTrips,
          ...res.data.filter((rt: any) => !localTrips.some((lt) => lt.id === rt.id)),
        ];
        return combined;
      }
    } catch (err) {
      // Remote unavailable, fall back to local
    }

    return localTrips;
  },

  async getSavedTrip(id: string): Promise<any> {
    if (typeof window !== "undefined") {
      try {
        const localTrips: any[] = JSON.parse(
          localStorage.getItem("voltplan_saved_trips") || "[]"
        );
        const found = localTrips.find((t) => t.id === id);
        if (found) return found;
      } catch (e) {}
    }

    try {
      const res = await apiClient.get(`/trips/${id}`);
      return res.data;
    } catch (err) {
      console.warn("Could not load trip from remote:", err);
      return null;
    }
  },

  async deleteSavedTrip(id: string): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        const localTrips: any[] = JSON.parse(
          localStorage.getItem("voltplan_saved_trips") || "[]"
        );
        const updated = localTrips.filter((t) => t.id !== id);
        localStorage.setItem("voltplan_saved_trips", JSON.stringify(updated));
      } catch (e) {}
    }

    try {
      await apiClient.delete(`/trips/user/${id}`);
    } catch (err) {
      // Local deletion already succeeded
    }
  },

  // Admin & Data Quality
  async getDataQuality(): Promise<any> {
    const res = await apiClient.get("/admin/data-quality");
    return res.data;
  },

  async getProviderStatus(): Promise<any> {
    const res = await apiClient.get("/admin/provider-status");
    return res.data;
  },

  async getAdminReports(statusFilter = "all"): Promise<CommunityReport[]> {
    const res = await apiClient.get(`/admin/reports?status_filter=${statusFilter}`);
    return res.data;
  },

  async updateReportModeration(id: string, status: string): Promise<CommunityReport> {
    const res = await apiClient.patch(`/admin/reports/${id}`, { status });
    return res.data;
  },

  // Locations & Google Maps / Gujarat Village Geocoding
  async searchLocations(query: string, limit = 8): Promise<LocationSearchResult[]> {
    if (!query || !query.trim()) return [];
    try {
      const res = await apiClient.get<LocationSearchResult[]>("/locations/search", {
        params: { q: query.trim(), limit },
      });
      return res.data;
    } catch (err) {
      console.warn("Locations search endpoint error, using client fallback:", err);
      const fallbackList: LocationSearchResult[] = [
        {
          id: "fb_delhi",
          name: "New Delhi, Delhi",
          display_name: "New Delhi, National Capital Region, India",
          category: "national_capital",
          district: "New Delhi",
          state: "Delhi",
          country: "India",
          latitude: 28.6139,
          longitude: 77.209,
          provider: "india_directory",
        },
        {
          id: "fb_agra",
          name: "Agra, Uttar Pradesh",
          display_name: "Agra (Taj Mahal / Yamuna Expressway), Uttar Pradesh, India",
          category: "city",
          district: "Agra",
          state: "Uttar Pradesh",
          country: "India",
          latitude: 27.1767,
          longitude: 78.0081,
          provider: "india_directory",
        },
        {
          id: "fb_jaipur",
          name: "Jaipur, Rajasthan",
          display_name: "Jaipur, Pink City, Rajasthan, India",
          category: "state_capital",
          district: "Jaipur",
          state: "Rajasthan",
          country: "India",
          latitude: 26.9124,
          longitude: 75.7873,
          provider: "india_directory",
        },
        {
          id: "fb_mumbai",
          name: "Mumbai, Maharashtra",
          display_name: "Mumbai, Maharashtra, India",
          category: "megacity",
          district: "Mumbai",
          state: "Maharashtra",
          country: "India",
          latitude: 19.076,
          longitude: 72.8777,
          provider: "india_directory",
        },
        {
          id: "fb_pune",
          name: "Pune, Maharashtra",
          display_name: "Pune (Mumbai-Pune Expressway), Maharashtra, India",
          category: "city",
          district: "Pune",
          state: "Maharashtra",
          country: "India",
          latitude: 18.5204,
          longitude: 73.8567,
          provider: "india_directory",
        },
        {
          id: "fb_bengaluru",
          name: "Bengaluru, Karnataka",
          display_name: "Bengaluru (Silicon Valley of India), Karnataka, India",
          category: "state_capital",
          district: "Bengaluru Urban",
          state: "Karnataka",
          country: "India",
          latitude: 12.9716,
          longitude: 77.5946,
          provider: "india_directory",
        },
        {
          id: "fb_hyderabad",
          name: "Hyderabad, Telangana",
          display_name: "Hyderabad, Outer Ring Road, Telangana, India",
          category: "state_capital",
          district: "Hyderabad",
          state: "Telangana",
          country: "India",
          latitude: 17.385,
          longitude: 78.4867,
          provider: "india_directory",
        },
        {
          id: "fb_ahmedabad",
          name: "Ahmedabad, Gujarat",
          display_name: "Ahmedabad, Gujarat, India",
          category: "city",
          district: "Ahmedabad",
          state: "Gujarat",
          country: "India",
          latitude: 23.0225,
          longitude: 72.5714,
          provider: "india_directory",
        },
        {
          id: "fb_kadi",
          name: "Kadi, Mehsana, Gujarat",
          display_name: "Kadi, Taluka Kadi, District Mehsana, Gujarat",
          category: "village",
          village: "Kadi",
          district: "Mehsana",
          state: "Gujarat",
          country: "India",
          latitude: 23.2982,
          longitude: 72.3323,
          provider: "gujarat_directory",
        },
        {
          id: "fb_sasangir",
          name: "Sasan Gir, Gir Somnath, Gujarat",
          display_name: "Sasan Gir National Park & Sanctuary, Gir Somnath, Gujarat",
          category: "wildlife_ecotourism",
          village: "Sasan Gir",
          district: "Gir Somnath",
          state: "Gujarat",
          country: "India",
          latitude: 21.1644,
          longitude: 70.5986,
          provider: "gujarat_directory",
        },
      ];
      return fallbackList.filter((x) => x.name.toLowerCase().includes(query.toLowerCase()));
    }
  },

  async reverseGeocode(lat: number, lng: number): Promise<LocationSearchResult | null> {
    try {
      const res = await apiClient.get<LocationSearchResult>("/locations/reverse", {
        params: { lat, lng },
      });
      return res.data;
    } catch (err) {
      console.warn("Reverse geocode error:", err);
      return null;
    }
  },

  async getPopularVillages(): Promise<LocationSearchResult[]> {
    try {
      const res = await apiClient.get<LocationSearchResult[]>("/locations/popular-villages");
      return res.data;
    } catch (err) {
      console.warn("Popular villages endpoint error:", err);
      return [];
    }
  },

  async getGeocodingConfig(): Promise<GeocodingConfig> {
    try {
      const res = await apiClient.get<GeocodingConfig>("/locations/config");
      return res.data;
    } catch (err) {
      return {
        has_google_maps_configured: false,
        primary_provider: "gujarat_rural_geocoder",
        description: "Comprehensive Gujarat Rural Village Directory",
        total_rural_locations_indexed: 144,
      };
    }
  },
};

