import axios from "axios";
import {
  VehicleModel,
  ChargingStation,
  TripPlanRequest,
  TripPlanResponse,
  CommunityReport,
  User,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token if present in localStorage (client side)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("voltplan_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // Vehicles
  async getVehicles(): Promise<VehicleModel[]> {
    try {
      const res = await apiClient.get<VehicleModel[]>("/vehicles");
      return res.data;
    } catch (err) {
      console.warn("Backend unavailable, using catalog fallback:", err);
      return [
        {
          id: "seed_nexon",
          manufacturer: "Tata",
          model: "Nexon EV Long Range",
          model_year: 2024,
          battery_capacity_kwh: 40.5,
          usable_battery_capacity_kwh: 38.0,
          consumption_kwh_100km: 15.2,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 7.2,
          max_dc_power_kw: 50.0,
          range_reference_km: 320.0,
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
          id: "seed_mg_zs",
          manufacturer: "MG",
          model: "ZS EV",
          model_year: 2024,
          battery_capacity_kwh: 50.3,
          usable_battery_capacity_kwh: 48.0,
          consumption_kwh_100km: 16.2,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 7.4,
          max_dc_power_kw: 50.0,
          range_reference_km: 340.0,
          source: "Official Spec Sheet",
          is_custom: false,
        },
        {
          id: "seed_ioniq5",
          manufacturer: "Hyundai",
          model: "Ioniq 5",
          model_year: 2024,
          battery_capacity_kwh: 72.6,
          usable_battery_capacity_kwh: 70.0,
          consumption_kwh_100km: 17.0,
          connector_types: ["CCS2", "Type 2"],
          max_ac_power_kw: 11.0,
          max_dc_power_kw: 230.0,
          range_reference_km: 460.0,
          source: "Hyundai E-GMP 800V Architecture",
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
};
