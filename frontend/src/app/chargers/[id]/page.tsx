"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { ChargingStation, CommunityReport } from "@/lib/types";
import { RiskIndicator } from "@/components/planner/RiskIndicator";
import { BackupStopCard } from "@/components/planner/BackupStopCard";
import { RouteMap } from "@/components/map/RouteMap";
import { getStatusBadgeClass } from "@/lib/utils";
import {
  Zap,
  MapPin,
  Clock,
  Shield,
  Layers,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Navigation,
  MessageSquare,
  PlusCircle,
  Loader2,
} from "lucide-react";

export default function ChargerDetailPage() {
  const params = useParams();
  const stationId = params.id as string;

  const [station, setStation] = useState<ChargingStation | null>(null);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("working");
  const [reportComment, setReportComment] = useState("");
  const [isOperational, setIsOperational] = useState(true);
  const [successfulCharge, setSuccessfulCharge] = useState(true);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const loadStationData = async () => {
    setIsLoading(true);
    try {
      const [st, reps] = await Promise.all([
        api.getCharger(stationId),
        api.getChargerReports(stationId),
      ]);
      setStation(st);
      setReports(reps);
    } catch (err) {
      console.error("Failed to load charger:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (stationId) {
      loadStationData();
    }
  }, [stationId]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      await api.submitChargerReport(stationId, {
        problem_type: reportType,
        is_operational: isOperational,
        successful_charge: successfulCharge,
        comment: reportComment,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
        loadStationData();
      }, 1500);
    } catch (err) {
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmittingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-16 gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs uppercase font-bold tracking-wider">Loading Station Details...</span>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="flex-1 max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Charging Station Not Found</h2>
        <p className="text-xs text-slate-500">The requested station ID does not exist or has been relocated.</p>
        <Link
          href="/chargers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Charger Directory</span>
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadgeClass(station.live_status);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/chargers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Charging Stations</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: station.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Station link copied to clipboard!");
                }
              }}
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Navigate in Google Maps</span>
            </a>
          </div>
        </div>

        {/* Station Top Hero Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${statusBadge}`}>
                  {station.live_status}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Network: <strong className="text-slate-800">{station.operator}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {station.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{station.address || "Highway Location"}, {station.city || "Gujarat"}, India</span>
              </p>
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors flex items-center gap-1.5 w-fit shadow-xs"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Report a Station Issue</span>
            </button>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Max Output</span>
              <strong className="text-slate-900 text-base">{station.max_power_kw} kW</strong>
              <span className="text-[10px] text-slate-500 block">DC Fast Charging</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Hardware Capacity</span>
              <strong className="text-slate-900 text-base">{station.total_plugs} Stalls</strong>
              <span className="text-[10px] text-slate-500 block">Simultaneous charging</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Operating Hours</span>
              <strong className="text-slate-900 text-sm block truncate">{station.opening_hours}</strong>
              <span className="text-[10px] text-slate-500">{station.access_restrictions}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">Payment Method</span>
              <strong className="text-slate-900 text-sm block truncate">{station.payment_network}</strong>
              <span className="text-[10px] text-slate-500">Fastag / App / RFID</span>
            </div>
          </div>
        </div>

        {/* Mid Section: Map + Risk Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Preview */}
          <div className="lg:col-span-7 space-y-4">
            <RouteMap
              allChargers={[station]}
              origin={{ name: station.name, lat: station.latitude, lng: station.longitude }}
              className="w-full h-[400px]"
            />
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Connector Hardware Specifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {station.connector_types.map((conn, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 block">{conn.type}</strong>
                      <span className="text-[11px] text-slate-500">{conn.power_kw} kW • {conn.count} plug{conn.count > 1 ? "s" : ""}</span>
                    </div>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      COMPATIBLE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Scoring & Factors */}
          <div className="lg:col-span-5 space-y-4">
            {station.risk_assessment && (
              <RiskIndicator risk={station.risk_assessment} showBreakdown={true} />
            )}

            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs space-y-2.5">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Data Freshness & Provenance
              </h4>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Data Source:</span>
                  <strong className="text-slate-900">{station.source_provider}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Last Refreshed:</span>
                  <strong className="text-slate-900">
                    {new Date(station.last_data_refresh).toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Reported Faults:</span>
                  <strong className={station.fault_report_count > 0 ? "text-rose-600" : "text-emerald-700"}>
                    {station.fault_report_count} incident(s)
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Data Confidence Score:</span>
                  <strong className="text-emerald-700">{(station.confidence_score * 100).toFixed(0)}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community Reports Section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Driver Reliability Log ({reports.length})</h3>
              <p className="text-xs text-slate-500">Crowdsourced reports from drivers who visited this charging point</p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Report</span>
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent driver issues filed for this station. Be the first to verify this charger!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 capitalize">{rep.problem_type.replace("_", " ")}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rep.is_operational ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {rep.is_operational ? "Charging Successful" : "Unsuccessful / Outage"}
                    </span>
                  </div>
                  {rep.comment && <p className="text-slate-600 italic">&quot;{rep.comment}&quot;</p>}
                  <span className="text-[10px] text-slate-400 block">
                    Reported on {new Date(rep.observed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Submit Reliability Report</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs text-emerald-800 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <strong className="block text-sm">Thank You!</strong>
                <span>Your report has been logged and factored into station risk scoring.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Observed Status</label>
                  <select
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value);
                      if (e.target.value === "working") {
                        setIsOperational(true);
                        setSuccessfulCharge(true);
                      } else {
                        setIsOperational(false);
                        setSuccessfulCharge(false);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="working">Charger Working Correctly</option>
                    <option value="not_working">Station Completely Offline / No Power</option>
                    <option value="connector_unavailable">Broken Connector Gun / Damaged Cable</option>
                    <option value="station_inaccessible">Gate Locked / Parking Blocked</option>
                    <option value="charger_occupied">All Stalls Occupied / Long Queue</option>
                    <option value="pricing_issue">Billing or App Payment Issue</option>
                    <option value="other">Other Incident</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={successfulCharge}
                      onChange={(e) => setSuccessfulCharge(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Successfully charged vehicle</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Details & Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Describe gun condition, charging speed achieved, or gate instructions..."
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
                  >
                    {submittingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Submit Verification</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
