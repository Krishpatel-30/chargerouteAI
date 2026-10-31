"use client";

import React from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth/AuthGate";
import {
  Zap,
  MapPin,
  Compass,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Award,
  Globe,
  BatteryCharging,
  Navigation,
  CheckCircle2,
  Layers,
} from "lucide-react";

export default function AboutPage() {
  return (
    <AuthGate
      featureTitle="About ChargeRoute AI"
      featureDescription="Sign in to learn more about our corridor routing algorithms, safety margins, and engineering team."
      redirectUrl="/about"
    >
      <AboutContent />
    </AuthGate>
  );
}

function AboutContent() {
  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Pan-India Product Architecture &amp; Mission
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About ChargeRoute AI
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Empowering Indian electric vehicle drivers to venture onto intercity highways and remote rural corridors with unshakeable confidence and contingency planning.
          </p>
        </div>

        {/* Live Pan-India Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">29,184+</div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Verified EV Stations</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">36</div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">States &amp; Union Territories</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-600">70+</div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Charging Networks</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 text-center shadow-xs">
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">5,300+</div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Villages &amp; Cities Indexed</div>
          </div>
        </div>

        {/* The Core Challenge & Our Solution (Replacing Why Gujarat First) */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                The Core Problem &amp; Our Solution
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Solving India&apos;s Highway EV Reliability Challenge
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              While electric mobility across India has crossed 29,000+ public charging stations, intercity highway travel still sparks genuine range and queue anxiety. Advertised ARAI ranges drop significantly at 100 km/h with 45°C cabin AC, single-stall highway DC chargers frequently suffer offline breakdowns, and arriving at a dead plug with low battery turns a family road trip into a roadside crisis.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong className="text-slate-900 font-semibold">ChargeRoute AI</strong> is India&apos;s first contingency-first EV journey intelligence engine. We eliminate guesswork with deterministic battery physics, curved road routing, explainable outage risk scoring, and verified emergency backup charging plazas at every single scheduled stop.
            </p>
          </div>

          {/* 3 Innovation Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Verified Backup Contingency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every recommended charging stop is mathematically paired with an active fallback station within arrival battery range. If a plug is occupied or offline, you are never stranded.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Real-World Battery Physics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Distinguishes gross advertised battery size from net usable kWh. Calibrated for 90–120 km/h aerodynamic drag, Indian summer thermal AC loads, and real terrain elevation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pan-India Cartography &amp; Google Maps</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full geocoding across all 28 states &amp; 8 UTs — from expressways to rural villages (Bajud, Kadi, Neemrana, Alibaug). One-click automatic launch into Google Maps turn-by-turn navigation.
              </p>
            </div>
          </div>
        </div>

        {/* KSVISUALSAGENCY Agency Architecture Showcase */}
        <div className="rounded-3xl border border-slate-900 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Product Design &amp; Full-Stack Engineering Studio</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Crafted by <span className="text-emerald-400">KSVISUALSAGENCY</span>
              </h2>
              <p className="text-xs text-slate-400">
                Architects of intelligent digital platforms, mathematical routing tools, and mobility interfaces.
              </p>
            </div>
            <a
              href="https://ksvisualsagency.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/20 shrink-0"
            >
              <Globe className="w-4 h-4" />
              <span>Visit Agency Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">Full-Stack Engineering</div>
              <p className="text-slate-400 leading-relaxed">
                Deterministic mathematical routing, battery degradation models, real elevation physics, and RESTful Python/Next.js architectures.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">Design &amp; UI/UX Systems</div>
              <p className="text-slate-400 leading-relaxed">
                Modern, accessible product interfaces tailored for high-speed highway drivers, interactive cartography, and emergency workflows.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-emerald-400 font-bold text-sm">Clean Mobility Innovation</div>
              <p className="text-slate-400 leading-relaxed">
                Empowering India&apos;s transition to sustainable electric transportation with reliable data telemetry and zero range anxiety.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>
              Official Agency Portal:{" "}
              <a
                href="https://ksvisualsagency.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-semibold"
              >
                https://ksvisualsagency.vercel.app/
              </a>
            </span>
            <span className="text-slate-400 font-medium">Pan-India &amp; Global Delivery</span>
          </div>
        </div>

        {/* Detailed Engineering Principles & National Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Core Engineering Principles</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Zero Speculative Hallucinations:</strong> Pure deterministic physics and explainable mathematics rather than unpredictable machine-learning guesses.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Net Usable Capacity Benchmarking:</strong> Distinguishes advertised gross battery pack capacity from true net usable energy, modeling 10–80% fast-charging taper curves.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Multi-Operator Neutrality:</strong> Decoupled from any single brand; aggregates 70+ Indian networks (Tata Power, Jio-bp, Statiq, Zeon, ChargeZone, Shell, Glida) without bias.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">National Corridors &amp; Coverage</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Major Expressways:</strong> Yamuna Expwy, Delhi-Mumbai NE-4, Mumbai-Pune, Samruddhi Mahamarg, Bengaluru-Mysuru, and Ahmedabad-Vadodara NE-1.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Golden Quadrilateral &amp; National Arteries:</strong> NH-48, NH-44 (Kashmir to Kanyakumari), NH-16, NH-27, and NH-65 fully mapped with continuous charging waypoints.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Rural, Coastal &amp; Pilgrim Tourism:</strong> Full geocoded access to remote villages, wildlife sanctuaries (Sasan Gir, Jim Corbett), and pilgrimage hubs (Ayodhya, Shirdi, Dwarka, Somnath, Tirupati).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center pt-2">
          <Link
            href="/plan"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <span>Launch Pan-India Trip Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
