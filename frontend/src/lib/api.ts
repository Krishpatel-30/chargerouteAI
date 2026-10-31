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
    if (envApi && !envApi.includes("localhost") && !envApi.includes("127.0.0.1")) {
      return envApi;
    }
    // In any browser environment (whether localhost, mobile device on LAN, or domain):
    // Next.js rewrites /api/v1/:path* to FastAPI on port 8000.
    // Using relative "/api/v1" ensures all requests hit the origin serving the page,
    // eliminating cross-device network errors, firewall blocks, and CORS restrictions.
    return "/api/v1";
  }
  // Server-side (Node.js / SSR):
  return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
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
    config.baseURL = getApiBaseUrl();
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
    const res = await apiClient.post<AuthResponse>("/auth/login", credentials);
    if (typeof window !== "undefined" && res.data?.access_token) {
      localStorage.setItem("voltplan_token", res.data.access_token);
    }
    return res.data;
  },

  async register(data: { email: string; password: string; full_name?: string }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", data);
    if (typeof window !== "undefined" && res.data?.access_token) {
      localStorage.setItem("voltplan_token", res.data.access_token);
    }
    return res.data;
  },

  async loginWithGoogle(data: GoogleAuthData): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/google", data);
    if (typeof window !== "undefined" && res.data?.access_token) {
      localStorage.setItem("voltplan_token", res.data.access_token);
    }
    return res.data;
  },

  async loginWithFirebase(data: {
    id_token: string;
    email: string;
    full_name?: string;
    firebase_uid?: string;
    avatar_url?: string;
  }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/google", {
      id_token: data.id_token,
      email: data.email,
      full_name: data.full_name,
      google_id: data.firebase_uid,
      avatar_url: data.avatar_url,
    });
    if (typeof window !== "undefined" && res.data?.access_token) {
      localStorage.setItem("voltplan_token", res.data.access_token);
    }
    return res.data;
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
    try {
      const res = await apiClient.get<VehicleModel[]>("/vehicles", { params });
      return res.data;
    } catch (err) {
      console.warn("Backend unavailable, using catalog fallback:", err);
      return [
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
  },

  async getVehicle(id: string): Promise<VehicleModel> {
    const res = await apiClient.get<VehicleModel>(`/vehicles/${id}`);
    return res.data;
  },

  async createCustomVehicle(data: Partial<VehicleModel>): Promise<VehicleModel> {
    const res = await apiClient.post<VehicleModel>("/vehicles/custom", data);
    return res.data;
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
    const res = await apiClient.post<TripPlanResponse>("/trips/plan", payload);
    return res.data;
  },

  async saveTrip(title: string, planData: TripPlanResponse): Promise<any> {
    const res = await apiClient.post("/trips/save", {
      title,
      plan_data: planData,
    });
    return res.data;
  },

  async getUserSavedTrips(): Promise<any[]> {
    const res = await apiClient.get("/trips/user/saved");
    return res.data;
  },

  async getSavedTrip(id: string): Promise<any> {
    const res = await apiClient.get(`/trips/${id}`);
    return res.data;
  },

  async deleteSavedTrip(id: string): Promise<void> {
    await apiClient.delete(`/trips/user/${id}`);
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

