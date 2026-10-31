"use client";

import React from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth/AuthGate";
import { ShieldCheck, BatteryCharging, Zap, Route, AlertTriangle, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <AuthGate
      featureTitle="Risk Engine & Methodology Architecture"
      featureDescription="Sign in to view how ChargeRoute AI calculates highway physics, AC load models, and deterministic reliability scoring."
      redirectUrl="/how-it-works"
    >
      <HowItWorksContent />
    </AuthGate>
  );
}

function HowItWorksContent() {
  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Platform Architecture & Physics
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Risk-Aware Trip Planning Works
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            ChargeRoute AI replaces guesswork with deterministic calculations and transparent, rule-based reliability scoring.
          </p>
        </div>

        {/* Section 1: The Core Question */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900">
            The Fundamental Problem with Standard EV Navigation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Standard maps answer: <em>&quot;Where is the nearest charger?&quot;</em>
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            On Indian highway corridors, that question is insufficient. If the charger is occupied, broken, or suffering a local feeder blackout, an electric car driver cannot easily detour 50 km on 6% battery.
          </p>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
            <strong>ChargeRoute AI answers:</strong> &quot;Can I complete this journey safely if one of my planned stops is unavailable?&quot;
          </div>
        </div>

        {/* Section 2: Rule-Based Risk Engine */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold text-sm">
              🛡️
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Explainable Rule-Based Risk Scoring (0–100)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We do not claim to predict charger failures with speculative AI models. Our engine applies an explainable, deterministic rule set:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <strong className="text-emerald-900 block text-sm mb-1">0 – 29: Low Risk</strong>
              <p className="text-slate-600">
                Network confirmed active recently. Multi-stall hub with 4+ guns. Reachable backup stations within 15 km.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
              <strong className="text-amber-900 block text-sm mb-1">30 – 59: Moderate Risk</strong>
              <p className="text-slate-600">
                Stale telemetry (&gt;24 hours). 2-stall location or partial occupancy. Nearest backup requires 15–25 km detour.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
              <strong className="text-rose-900 block text-sm mb-1">60 – 100: Elevated Risk</strong>
              <p className="text-slate-600">
                Reported outage, single plug, restricted access hours, or zero backup chargers reachable on remaining SoC.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Energy Math */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-900 flex items-center justify-center font-bold text-sm">
              ⚡
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Deterministic Battery Energy Formulations
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-2">
            <div className="text-emerald-400 font-bold">// 1. Segment Energy Equation:</div>
            <div>Segment Energy (kWh) = (Distance_km × Consumption_kWh/100km × Highway_Factor × AC_Factor) / 100</div>
            <div className="text-emerald-400 font-bold pt-2">// 2. Estimated Arrival SoC (%):</div>
            <div>Arrival SoC (%) = Starting SoC (%) − (Segment Energy / Usable Battery Capacity × 100)</div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Notice that we strictly use <strong>usable battery capacity</strong> as the denominator. For example, a car advertised with a 40.5 kWh battery typically provides 38.0 kWh usable net energy due to manufacturer buffer margins.
          </p>
        </div>

        {/* Section 4: CC-CV Charging Taper */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900">
            CC-CV Charging Curve Tapering Above 80%
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Lithium-ion cells fast-charge in Constant Current (CC) mode up to ~80% State of Charge (SoC). Above 80%, vehicle battery management systems enter Constant Voltage (CV) taper to protect cell chemistry.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            ChargeRoute AI automatically models this taper. Our trip planner targets 80% to 82% SoC departures for fast turnaround unless a longer leg strictly necessitates charging to 95%.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/plan"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm"
          >
            <span>Plan Your Trip with Risk Awareness</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
