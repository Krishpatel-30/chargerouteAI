"use client";

import React from "react";
import Link from "next/link";
import { AuthGate } from "@/components/auth/AuthGate";
import { Zap, MapPin, Compass, ShieldCheck, ArrowRight, ExternalLink, Sparkles, Award, Globe } from "lucide-react";

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
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Vision & Product Architecture
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About ChargeRoute AI
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Empowering EV drivers to venture onto intercity highways with confidence and contingency planning.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">Why Gujarat First?</h2>
          <p>
            Gujarat is one of India&apos;s most active electric mobility corridors, connecting the industrial and commercial nodes of Ahmedabad, Gandhinagar, Vadodara, Bharuch, Surat, and Rajkot. High-speed expressways like NE-1 and National Highways NH-48 and NH-27 provide growing charger density, yet drivers still experience charger downtime and unexpected queuing during peak holiday travel.
          </p>
          <p>
            ChargeRoute AI addresses this reality with transparent data quality tracking, provider adapters, and verified backup suggestions.
          </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">Engineering Principles</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>No fake AI claims:</strong> We use explainable rule-based scoring rather than speculative machine-learning guesses.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Net usable capacity:</strong> We distinguish gross advertised battery pack size from usable energy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Open Adapter Architecture:</strong> Decoupled from any single mapping or charging operator API.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">India Expansion Roadmap</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Phase 1 (Active):</strong> Gujarat Golden & Saurashtra Corridors.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Phase 2:</strong> Mumbai — Pune — Bengaluru Western Expressway.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Phase 3:</strong> Delhi — Jaipur — Agra Golden Triangle.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span><strong>Phase 4:</strong> Commercial EV Fleet Management API & Dashboard.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/plan"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-xs"
          >
            <span>Explore Trip Planner</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
