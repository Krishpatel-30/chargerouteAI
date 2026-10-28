export interface VehicleModel {
  id: string;
  manufacturer: string;
  model: string;
  model_year: number;
  battery_capacity_kwh: number;
  usable_battery_capacity_kwh: number;
  consumption_kwh_100km: number;
  connector_types: string[];
  max_ac_power_kw: number;
  max_dc_power_kw: number;
  charging_curve?: Record<string, number>;
  range_reference_km: number;
  source: string;
  is_custom: boolean;
  created_at?: string;
}

export interface UserVehicle {
  id: string;
  user_id: string;
  vehicle_model_id: string;
  custom_nickname?: string;
  custom_consumption_multiplier: number;
  created_at: string;
  vehicle_model: VehicleModel;
}

export interface ConnectorDetail {
  type: string;
  power_kw: number;
  count: number;
}

export interface RiskBreakdown {
  score: number; // 0 to 100
  category: "Low Risk" | "Moderate Risk" | "Elevated Risk";
  confidence_label: string;
  contributing_factors: string[];
  backup_count: number;
  nearest_backup_detour_km?: number | null;
  staleness_hours: number;
  operational_status_weight: string;
}

export interface ChargingStation {
  id: string;
  external_id?: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state: string;
  country: string;
  operator: string;
  connector_types: ConnectorDetail[];
  total_plugs: number;
  max_power_kw: number;
  access_restrictions: string;
  opening_hours: string;
  payment_network: string;
  live_status: "operational" | "partially_available" | "offline" | "unknown";
  source_provider: string;
  confidence_score: number;
  last_data_refresh: string;
  last_successful_verification?: string;
  fault_report_count: number;
  external_url?: string;
  risk_assessment?: RiskBreakdown;
}

export interface BackupStopCandidate {
  station_id: string;
  name: string;
  operator: string;
  latitude: number;
  longitude: number;
  detour_km: number;
  detour_time_min: number;
  max_power_kw: number;
  live_status: string;
  risk_score: number;
  risk_category: string;
  feasibility_notes: string;
}

export interface ChargingStopDetail {
  stop_number: number;
  station_id: string;
  station_name: string;
  operator: string;
  latitude: number;
  longitude: number;
  distance_from_start_km: number;
  segment_distance_km: number;
  arrival_battery_pct: number;
  target_departure_battery_pct: number;
  energy_added_kwh: number;
  charging_duration_min: number;
  charging_power_kw: number;
  estimated_cost_inr: number;
  station_risk: RiskBreakdown;
  primary_backup?: BackupStopCandidate | null;
  all_backups: BackupStopCandidate[];
}

export interface TripAlternativeSummary {
  route_id: string;
  name: string;
  description: string;
  total_distance_km: number;
  total_driving_time_min: number;
  total_charging_time_min: number;
  total_duration_min: number;
  charging_stops_count: number;
  overall_risk_score: number;
  overall_risk_category: string;
  estimated_cost_inr: number;
  min_battery_reserve_pct: number;
  charging_stops: ChargingStopDetail[];
  route_geometry: [number, number][];
}

export interface TripPlanResponse {
  trip_id?: string;
  title: string;
  origin_name: string;
  destination_name: string;
  vehicle_name: string;
  vehicle_battery_usable_kwh: number;
  total_distance_km: number;
  total_driving_time_min: number;
  total_charging_time_min: number;
  total_duration_min: number;
  total_energy_kwh: number;
  estimated_cost_inr: number;
  min_battery_reserve_pct: number;
  overall_risk_score: number;
  overall_risk_category: "Low Risk" | "Moderate Risk" | "Elevated Risk";
  risk_breakdown: RiskBreakdown;
  charging_stops: ChargingStopDetail[];
  route_geometry: [number, number][]; // [[lng, lat], ...]
  alternatives: TripAlternativeSummary[];
  assumptions: Record<string, any>;
  warnings: string[];
}

export interface TripPlanRequest {
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  vehicle_id: string;
  start_battery_pct: number;
  min_arrival_battery_pct: number;
  preference?: "fastest" | "lowest_risk" | "lowest_cost" | "more_alternatives";
  highway_factor?: number;
  ac_factor?: number;
  waypoints?: { name: string; lat: number; lng: number }[];
}

export interface CommunityReport {
  id: string;
  station_id: string;
  user_id?: string;
  problem_type: string;
  is_operational: boolean;
  successful_charge: boolean;
  comment?: string;
  photo_url?: string;
  status: string;
  observed_at: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_admin: boolean;
  created_at: string;
}
