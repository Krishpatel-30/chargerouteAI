"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth/AuthGate";
import { ArrowLeft, Shield, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

export default function UserReportsPage() {
  return (
    <AuthGate
      featureTitle="Community Charger Reports"
      featureDescription="Sign in to view your submitted station reports and live crowd-sourced telemetry."
      redirectUrl="/dashboard/reports"
    >
      <UserReportsContent />
    </AuthGate>
  );
}

function UserReportsContent() {
  const [reports] = useState([
    {
      id: "rep_1",
      station_name: "Tata Power - Highway Food Mall, Anand",
      problem_type: "working",
      is_operational: true,
      comment: "Charged Nexon EV at 58kW. Excellent highway food court.",
      status: "approved",
      date: "2026-10-24",
    },
    {
      id: "rep_2",
      station_name: "VR Mall, Dumas Road, Surat",
      problem_type: "connector_unavailable",
      is_operational: false,
      comment: "Gun 2 latch broken, could not lock onto car port. Gun 1 occupied.",
      status: "approved",
      date: "2026-10-21",
    },
    {
      id: "rep_3",
      station_name: "Jio-bp pulse - Highway Nest Plaza, Nadiad Bypass",
      problem_type: "working",
      is_operational: true,
      comment: "Seamless app authorization, 60kW full speed delivery.",
      status: "approved",
      date: "2026-10-18",
    },
  ]);

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Community Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            History of charger reliability reports submitted from your account.
          </p>
        </div>

        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">{r.station_name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    r.is_operational ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}>
                    {r.is_operational ? "Operational" : "Issue Reported"}
                  </span>
                </div>
                <p className="text-slate-600 italic">&quot;{r.comment}&quot;</p>
                <span className="text-[10px] text-slate-400 block">Submitted on {r.date} • Moderation: Approved</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
