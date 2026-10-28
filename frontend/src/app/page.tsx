import React from "react";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  ShieldAlert,
  BatteryCharging,
  Route,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  HelpCircle,
  Users,
  Compass,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-16 sm:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-900 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Initial Launch: Gujarat EV Highway Corridors</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Plan Your EV Journey.{" "}
                <span className="text-emerald-600 block mt-1">Prepare for the Unexpected.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Find charging stops, understand your true battery range, and plan backup options before you hit the road. Never get stranded by a broken or occupied roadside charger.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/plan"
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Plan My Trip</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/chargers"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition-all hover:border-slate-400 flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Explore Charging Stations</span>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 text-xs">
                <div>
                  <strong className="block text-slate-900 font-bold text-sm">Explainable Risk</strong>
                  <span className="text-slate-500">Transparent 0-100 reliability scoring</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold text-sm">Verified Backups</strong>
                  <span className="text-slate-500">Automatic fallback stations for every stop</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold text-sm">Deterministic Math</strong>
                  <span className="text-slate-500">True usable battery capacity modeling</span>
                </div>
              </div>
            </div>

            {/* Right: 2. INTERACTIVE TRIP-PLANNING PREVIEW */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Live Trip Simulation Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Sample Route
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Route</span>
                      <strong className="text-slate-900">Ahmedabad &rarr; Surat</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle</span>
                      <strong className="text-slate-900">Tata Nexon EV 40.5 kWh</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Distance</span>
                      <strong className="text-slate-900 text-sm">265 km</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-500 block">Stops</span>
                      <strong className="text-slate-900 text-sm">1 Stop</strong>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-emerald-900">
                      <span className="text-[10px] text-emerald-700 block">Risk Score</span>
                      <strong className="text-emerald-800 text-sm">18/100 (Low)</strong>
                    </div>
                  </div>

                  {/* Recommended Stop Preview */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                        Tata Power - Anand Food Plaza
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-200/70 px-1.5 py-0.5 rounded">
                        60 kW DC
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Arrive: <strong>32% SoC</strong></span>
                      <span>Charge: <strong>28 min (+19 kWh)</strong></span>
                      <span>Depart: <strong>82% SoC</strong></span>
                    </div>
                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-amber-800 font-medium">🛡️ Backup: Jio-bp Nadiad (+6.2 km detour)</span>
                      <span className="text-emerald-700 font-semibold">Reachable</span>
                    </div>
                  </div>

                  <Link
                    href="/plan"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Open Interactive Planner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW RISK-AWARE PLANNING WORKS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Methodology & Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How Risk-Aware Trip Planning Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              ChargeRoute AI answers: &quot;Can I complete this journey safely if one of my planned stops fails?&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Deterministic Battery Physics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We calculate segment consumption using net usable battery capacity, not advertised gross ratings. Load multipliers account for highway speeds (100+ km/h on expressways) and heavy cabin AC usage.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Explainable 0-100 Risk Engine</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No black-box machine learning hype. Stations are transparently scored on data freshness, recent outage reports, stall count redundancy, opening hours, and arrival reserve margins.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Automatic Backup Allocation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every recommended stop is paired with at least one viable fallback station within practical detour reach. If a planned charger is down, you already know where to divert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EXAMPLE CHARGER RELIABILITY TRANSPARENCY */}
      <section className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Data Integrity
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Transparent Station Reliability
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              We never assume a charger is operational merely because a pin exists on a map.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-emerald-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Verified Operational
                </span>
                <span className="text-xs font-bold text-emerald-700">Risk: 12/100</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Multi-Stall Fast Hub (4+ Plugs)</h4>
              <p className="text-xs text-slate-600">
                Network confirmed active within the last 4 hours. Multiple CCS2 stalls eliminate single point of failure risk.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-amber-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  Status Unknown / Stale
                </span>
                <span className="text-xs font-bold text-amber-700">Risk: 48/100</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Telemetry Stale (&gt;48 Hours)</h4>
              <p className="text-xs text-slate-600">
                Data has not refreshed recently. Single gun station with restricted mall parking hours. Backup recommended.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-rose-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  Reported Outage
                </span>
                <span className="text-xs font-bold text-rose-700">Risk: 82/100</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Community Reported Offline</h4>
              <p className="text-xs text-slate-600">
                Recent user verification confirmed hardware power outage. Routing engine automatically skips this stop.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VEHICLE COMPATIBILITY */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                Supported Fleet
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Tested with Indian Market EVs
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Pre-configured with real battery capacities, charging curves, and highway consumption benchmarks.
              </p>
            </div>
            <Link
              href="/vehicles"
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 w-fit"
            >
              <span>Explore All Vehicles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Tata Nexon EV Long Range", bat: "38.0 kWh Usable", dc: "50 kW DC", range: "320 km" },
              { name: "Tata Punch EV Long Range", bat: "33.0 kWh Usable", dc: "35 kW DC", range: "270 km" },
              { name: "MG ZS EV Exclusive", bat: "48.0 kWh Usable", dc: "50 kW DC", range: "340 km" },
              { name: "Hyundai Ioniq 5 (800V)", bat: "70.0 kWh Usable", dc: "230 kW DC", range: "460 km" },
              { name: "BYD Atto 3 Blade", bat: "58.0 kWh Usable", dc: "80 kW DC", range: "410 km" },
              { name: "Mahindra XUV400 Pro", bat: "37.5 kWh Usable", dc: "50 kW DC", range: "290 km" },
              { name: "Tata Tiago EV Medium", bat: "18.0 kWh Usable", dc: "25 kW DC", range: "160 km" },
              { name: "Custom EV Builder", bat: "Configurable kWh", dc: "Custom DC", range: "Custom" },
            ].map((v, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-1.5">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">{v.range} Ref</span>
                <h4 className="font-bold text-slate-900 text-sm leading-tight">{v.name}</h4>
                <div className="text-[11px] text-slate-500">{v.bat} • {v.dc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BACKUP CHARGING & ALTERNATIVES */}
      <section className="py-16 sm:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Core Differentiator
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                What if your planned charger is down?
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Traditional navigators lead you to a charger and leave you stranded if there&apos;s a power outage, broken connector latch, or a 45-minute queue.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                ChargeRoute AI continuously monitors fallback options. For every scheduled charging stop, our backup engine verifies whether you can reach alternative stations within a short detour on your remaining battery.
              </p>
              <div className="pt-2">
                <Link
                  href="/how-it-works"
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-colors"
                >
                  <span>Learn How Backups Are Selected</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Corridor Divert Demonstration
              </div>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-400 font-bold">Planned Stop: Statiq Chhani, Vadodara</span>
                  <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800">
                    Outage Reported
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>🛡️ Auto-Assigned Fallback:</span>
                    <span className="text-white">Zeon Suba Elite (4.2 km detour)</span>
                  </div>
                  <div className="text-[11px] text-amber-300">
                    Remaining battery upon detour: <strong>24% SoC</strong>. Reachable safely!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. COMMUNITY CHARGER REPORTS */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Crowdsourced Reliability
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Community Charger Reports
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Contribute to driver reliability. Report broken guns, payment errors, or confirm successful charging sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Tata Power - Anand Food Mall</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                  Successful Charge
                </span>
              </div>
              <p className="text-xs text-slate-600">
                &quot;Charged Nexon EV from 28% to 80% at 55kW. Clean food court and working washrooms.&quot;
              </p>
              <span className="text-[10px] text-slate-400 block">Verified driver • 2 hours ago</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Jio-bp pulse - Nadiad Bypass</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                  Successful Charge
                </span>
              </div>
              <p className="text-xs text-slate-600">
                &quot;Both CCS2 guns active. Plug & charge activated quickly via app.&quot;
              </p>
              <span className="text-[10px] text-slate-400 block">Verified driver • 5 hours ago</span>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">VR Mall - Surat</span>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                  Connector Issue
                </span>
              </div>
              <p className="text-xs text-slate-600">
                &quot;Gun 2 latch loose. Gun 1 working fine. Paid parking required at entrance.&quot;
              </p>
              <span className="text-[10px] text-slate-400 block">Verified driver • Yesterday</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SUPPORTED REGIONS */}
      <section className="py-16 sm:py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Regional Coverage
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Supported Highway Corridors
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Initial high-density deployment across Gujarat with modular architecture ready for national rollout.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-900">NE-1 Expressway</div>
              <div className="text-xs text-slate-600">Ahmedabad — Anand — Nadiad — Vadodara</div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                Ultra-High Density Hubs
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-900">NH-48 Golden Corridor</div>
              <div className="text-xs text-slate-600">Vadodara — Bharuch — Ankleshwar — Surat</div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                120kW Superfast Chargers
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-900">NH-27 Saurashtra Corridor</div>
              <div className="text-xs text-slate-600">Ahmedabad — Limbdi — Sayla — Rajkot</div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                Highway Oasis Plazas
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-900">NH-41 North Gujarat</div>
              <div className="text-xs text-slate-600">Ahmedabad — Gandhinagar — Mehsana</div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                Tech & Industrial Hubs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Honest Answers About EV Trip Planning
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <h4 className="font-bold text-slate-900">How is the Charging Risk Score calculated?</h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                The score (0 to 100) is transparent and rule-based. It evaluates status freshness, recent fault reports, connector count (multi-stall vs single gun), detour distance to alternative stations, and expected arrival SoC. We do not use unvalidated AI predictions.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <h4 className="font-bold text-slate-900">Why does battery consumption differ from ARAI / MIDC claims?</h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                Official test cycles are conducted at moderate speeds in laboratory conditions without air conditioning. Real highway driving at 100 km/h with Indian summer AC increases consumption by 20% to 30%. ChargeRoute AI uses net usable capacity and realistic highway multipliers.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <h4 className="font-bold text-slate-900">What happens if my planned charger is occupied?</h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                Every stop card in ChargeRoute AI highlights primary and secondary backup stations. The planner calculates whether you have sufficient remaining battery to detour without running out of charge.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <h4 className="font-bold text-slate-900">Is this data sample data or live?</h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                In development mode, stations reflect verified coordinates and typical tariffs of operating Gujarat highway charging plazas. Data confidence levels and timestamps are clearly labeled on every card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-emerald-600 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to plan your intercity journey?</h2>
          <p className="text-sm text-emerald-100 max-w-lg mx-auto">
            Choose your electric car, calculate true highway range, and ensure peace of mind with verified fallback stations.
          </p>
          <div className="pt-2">
            <Link
              href="/plan"
              className="px-6 py-3.5 rounded-xl bg-white text-emerald-950 font-bold text-sm shadow-md transition-all hover:bg-slate-100 hover:scale-105 inline-flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-emerald-900" />
              <span>Start Trip Planning Now</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
