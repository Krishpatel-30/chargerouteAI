import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, MapPin, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Zap className="w-4 h-4 fill-slate-950" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                ChargeRoute<span className="text-emerald-400">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Risk-aware electric vehicle trip planner engineered for Indian highway corridors.
              Plan your EV journey, understand true battery range, and prepare for unexpected charger outages.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 rounded-md px-2.5 py-1 w-fit">
              <MapPin className="w-3.5 h-3.5" />
              Initial Focus: Gujarat, India
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/plan" className="hover:text-emerald-400 transition-colors">
                  Interactive Trip Planner
                </Link>
              </li>
              <li>
                <Link href="/chargers" className="hover:text-emerald-400 transition-colors">
                  Corridor Charging Stations
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="hover:text-emerald-400 transition-colors">
                  Supported EV Models
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  Risk Engine & Battery Math
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Driver Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Corridor Highlights */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Active Corridors</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between text-slate-300">
                <span>NE-1 Ahmedabad — Vadodara</span>
                <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-1.5 py-0.5 rounded">High Density</span>
              </li>
              <li className="flex items-center justify-between text-slate-300">
                <span>NH-48 Vadodara — Surat</span>
                <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-1.5 py-0.5 rounded">Fast Chargers</span>
              </li>
              <li className="flex items-center justify-between text-slate-300">
                <span>NH-27 Ahmedabad — Rajkot</span>
                <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-1.5 py-0.5 rounded">Express</span>
              </li>
              <li className="flex items-center justify-between text-slate-300">
                <span>NH-41 Gandhinagar — Mehsana</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Active</span>
              </li>
              <li className="pt-2">
                <Link href="/admin/data-quality" className="text-emerald-400 hover:underline flex items-center gap-1">
                  Data Quality & Telemetry Dashboard <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Transparency & Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Transparency</h4>
            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] leading-relaxed text-slate-400">
              <span className="font-semibold text-slate-200 block mb-1">Sample Data Disclaimer:</span>
              Demonstration stations reflect verified corridor coordinates and typical tariffs. Battery figures are deterministic approximations. Always verify live operator apps before embarking on highway trips.
            </div>
            <div className="flex gap-4 text-xs pt-1">
              <Link href="/privacy" className="hover:text-slate-200 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-200 transition-colors">Terms of Service</Link>
              <Link href="/about" className="hover:text-slate-200 transition-colors">About Us</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ChargeRoute AI. Built with transparent, explainable EV trip routing.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Deterministic Physics & Rule-Based Risk Scoring</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
