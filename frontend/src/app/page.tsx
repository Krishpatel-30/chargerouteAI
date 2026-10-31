"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
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
  Compass,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  Check,
  History,
  Gauge,
  SlidersHorizontal,
  Flame,
  Award,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, logout, isLoading: authLoading } = useAuth();

  // Inline Sign-In state for unauthenticated users on homepage
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      await login({ email, password });
      router.push("/plan");
    } catch (err: any) {
      console.error("Login failed:", err);
      setLoginError(err?.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Featured Indian Electric Vehicle Models with verified images and engineering benchmarks
  const featuredModels = [
    {
      id: "curvv-55",
      name: "Tata Curvv EV 55 (Empowered+)",
      brand: "TATA",
      category: "Coupe SUV",
      tag: "New Flagship 2024",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80",
      grossKwh: "55.0 kWh",
      usableKwh: "51.8 kWh",
      highwayRange: "~450 km",
      claimedRange: "585 km MIDC",
      dcSpeed: "70 kW DC",
      chargeTime: "10–80% in 40 min",
      consumption: "13.8 kWh / 100km",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      id: "nexon-45",
      name: "Tata Nexon EV 45 (Long Range)",
      brand: "TATA",
      category: "Compact SUV",
      tag: "India's #1 Best-Seller",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
      grossKwh: "45.0 kWh",
      usableKwh: "42.5 kWh",
      highwayRange: "~365 km",
      claimedRange: "465 km MIDC",
      dcSpeed: "60 kW DC",
      chargeTime: "10–80% in 45 min",
      consumption: "14.5 kWh / 100km",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    },
    {
      id: "xuv400-el",
      name: "Mahindra XUV400 EL Pro",
      brand: "MAHINDRA",
      category: "Electric SUV",
      tag: "Dual-Zone Climate Pack",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80",
      grossKwh: "39.4 kWh",
      usableKwh: "37.2 kWh",
      highwayRange: "~310 km",
      claimedRange: "456 km MIDC",
      dcSpeed: "50 kW DC",
      chargeTime: "10–80% in 50 min",
      consumption: "14.8 kWh / 100km",
      badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
    },
    {
      id: "mg-zs-ev",
      name: "MG ZS EV (Exclusive Plus)",
      brand: "MG MOTOR",
      category: "Premium EV",
      tag: "Panoramic Glass Roof",
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80",
      grossKwh: "50.3 kWh",
      usableKwh: "47.5 kWh",
      highwayRange: "~380 km",
      claimedRange: "461 km MIDC",
      dcSpeed: "50 kW DC",
      chargeTime: "10–80% in 54 min",
      consumption: "15.0 kWh / 100km",
      badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
    },
    {
      id: "ioniq-5",
      name: "Hyundai Ioniq 5 RWD",
      brand: "HYUNDAI",
      category: "800V Luxury Crossover",
      tag: "Ultra-Fast 800V Architecture",
      image: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=600&q=80",
      grossKwh: "72.6 kWh",
      usableKwh: "70.0 kWh",
      highwayRange: "~510 km",
      claimedRange: "631 km ARAI",
      dcSpeed: "350 kW Ultra DC",
      chargeTime: "10–80% in 18 min",
      consumption: "16.2 kWh / 100km",
      badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
    },
    {
      id: "byd-atto3",
      name: "BYD Atto 3 (Extended Range)",
      brand: "BYD",
      category: "Blade Battery EV",
      tag: "Ultra-Safe Blade Cells",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
      grossKwh: "60.5 kWh",
      usableKwh: "58.0 kWh",
      highwayRange: "~430 km",
      claimedRange: "521 km ARAI",
      dcSpeed: "80 kW DC",
      chargeTime: "10–80% in 45 min",
      consumption: "14.9 kWh / 100km",
      badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION WITH EMBEDDED AUTHENTICATION & AGENCY ATTRIBUTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-12 sm:py-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Attribution Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-950 border border-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Made by <strong>KSVISUALSAGENCY</strong> • Pan-India EV Planning Platform</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Plan Your EV Journey.{" "}
                <span className="text-emerald-600 block mt-1">Predict Range &amp; Outage Backups.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl leading-relaxed">
                India&apos;s intelligent electric vehicle navigation platform. Calculate deterministic battery range, discover verified charging stations across 35 states, and secure safe backup stops before you hit the road.
              </p>

              {/* Key Features Quick Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-slate-200/80 text-xs">
                <div className="space-y-1">
                  <div className="text-emerald-600 font-extrabold text-lg sm:text-xl">141+</div>
                  <strong className="block text-slate-900 font-bold text-xs">Indian EV Models</strong>
                  <span className="text-slate-500 text-[11px] block">With custom car builder</span>
                </div>
                <div className="space-y-1">
                  <div className="text-emerald-600 font-extrabold text-lg sm:text-xl">269</div>
                  <strong className="block text-slate-900 font-bold text-xs">City &amp; Highway Hubs</strong>
                  <span className="text-slate-500 text-[11px] block">Verified 24/7 chargers</span>
                </div>
                <div className="space-y-1">
                  <div className="text-emerald-600 font-extrabold text-lg sm:text-xl">0–100</div>
                  <strong className="block text-slate-900 font-bold text-xs">Explainable Risk</strong>
                  <span className="text-slate-500 text-[11px] block">Outage &amp; queue safety</span>
                </div>
              </div>

              {/* Secondary links - ONLY VISIBLE AFTER USER LOGIN */}
              {isAuthenticated && (
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  <Link
                    href="/chargers"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Browse 269 Charging Stations</span>
                  </Link>
                  <Link
                    href="/vehicles"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 hover:border-slate-300 transition-colors shadow-2xs flex items-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5 text-emerald-600" />
                    <span>141 EV Directory &amp; Specs</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Right: DRIVER AUTHENTICATION & ACCESS CARD */}
            <div className="lg:col-span-5">
              {!isAuthenticated ? (
                /* Unauthenticated View: Sign In with Google Device ID or Email */
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-7 space-y-5 relative">
                  <div className="text-center space-y-1.5 pb-1">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30 mb-1">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Sign In to Access Trip Planner
                    </h2>
                    <p className="text-xs text-slate-500">
                      Sign in with Google credentials on this device or your driver email to unlock planning.
                    </p>
                  </div>

                  {/* Google 1-Click Sign-In (Direct Device Account Chooser) */}
                  <div className="space-y-3">
                    <GoogleAuthButton redirectUrl="/plan" buttonText="Continue with Device Google ID" />

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        or sign in with driver email
                      </span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-1.5 font-medium">
                      <span>⚠️ {loginError}</span>
                    </div>
                  )}

                  {/* Inline Email / Password Form */}
                  <form onSubmit={handleInlineLogin} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Driver Email
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="driver@example.com"
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-8 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/30 hover:shadow-emerald-600/40 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Signing In &amp; Launching...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In &amp; Launch Trip Planner</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Don&apos;t have an account?</span>
                    <Link
                      href="/register?redirect=/plan"
                      className="font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : (
                /* Authenticated View: Active Driver Command Center */
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-7 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-600/30">
                        {(user?.full_name || user?.email || "D")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Driver Authenticated</span>
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                          {user?.full_name || user?.email?.split("@")[0]}
                        </h2>
                        <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Primary CTA: Launch Trip Planner */}
                  <div className="space-y-3">
                    <Link
                      href="/plan"
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-600/30 hover:shadow-emerald-600/40 flex items-center justify-center gap-2 group"
                    >
                      <Zap className="w-4 h-4 fill-white transition-transform group-hover:scale-110" />
                      <span>Launch Interactive Trip Planner</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href="/dashboard/trips"
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <History className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View My Saved Trips &amp; History</span>
                    </Link>
                  </div>

                  {/* Quick Route Starters */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Popular Corridors Ready:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {[
                        { label: "Delhi → Agra", route: "Yamuna Expwy" },
                        { label: "Mumbai → Pune", route: "Mumbai Expwy" },
                        { label: "Bengaluru → Mysuru", route: "10-Lane Expwy" },
                        { label: "Ahmedabad → Surat", route: "NE-1 Expressway" },
                      ].map((c) => (
                        <Link
                          key={c.label}
                          href="/plan"
                          className="p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-colors"
                        >
                          <div className="font-bold text-slate-800">{c.label}</div>
                          <div className="text-[10px] text-slate-500">{c.route}</div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                    <Link href="/dashboard" className="text-emerald-700 hover:underline font-semibold">
                      Driver Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="text-slate-400 hover:text-rose-600 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOWCASE OF INDIAN EV CAR MODELS (WITH IMAGES & BENCHMARK SPECS) */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-200">
              <Car className="w-3.5 h-3.5 text-emerald-700" />
              <span>141+ Indian Market EV Models Index</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Calibrated Electric Vehicle Models
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every vehicle profile is modeled with deterministic battery physics, differentiating nominal gross pack size from real-world net usable capacity on Indian highway speeds (100+ km/h) and air-conditioning loads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredModels.map((m) => (
              <div
                key={m.id}
                className="group rounded-3xl border border-slate-200/90 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Vehicle Image Header */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={m.image}
                    alt={m.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-extrabold text-white tracking-wider uppercase border border-white/20">
                      {m.brand}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/90 backdrop-blur-md text-[10px] font-bold text-white shadow-xs">
                      {m.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-800 shadow-xs border border-slate-200">
                      {m.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base sm:text-lg font-bold drop-shadow-md truncate">
                      {m.name}
                    </h3>
                  </div>
                </div>

                {/* Vehicle Specs Grid */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <BatteryCharging className="w-3 h-3 text-emerald-600" />
                        <span>Battery Pack</span>
                      </div>
                      <div className="font-extrabold text-slate-900">{m.usableKwh}</div>
                      <div className="text-[10px] text-slate-400">{m.grossKwh} gross</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Route className="w-3 h-3 text-emerald-600" />
                        <span>Highway Range</span>
                      </div>
                      <div className="font-extrabold text-emerald-700">{m.highwayRange}</div>
                      <div className="text-[10px] text-slate-400">{m.claimedRange}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-600" />
                        <span>DC Fast Speed</span>
                      </div>
                      <div className="font-extrabold text-slate-900">{m.dcSpeed}</div>
                      <div className="text-[10px] text-slate-400">{m.chargeTime}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-emerald-600" />
                        <span>Consumption</span>
                      </div>
                      <div className="font-extrabold text-slate-900">{m.consumption}</div>
                      <div className="text-[10px] text-slate-400">Indian 40°C AC load</div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href={isAuthenticated ? "/plan" : "/login?redirect=/plan"}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 group-hover:bg-emerald-600 group-hover:text-white"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAuthenticated ? "Select & Simulate Route" : "Sign In to Plan with this EV"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DETAILS HOW IT WORKS (PHYSICS, RISK ENGINE, AC MULTIPLIERS, BACKUPS) */}
      <section className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Deterministic Engineering Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Details: How the Model Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              ChargeRoute AI eliminates the #1 cause of Indian EV highway breakdowns: optimistic range ratings and unannounced charger outages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-lg flex items-center justify-center shadow-xs">
                  01
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  True Usable Battery Math
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Advertised range uses gross capacity under unreal laboratory conditions. We calculate segment range exclusively against <strong>net usable capacity</strong> (e.g. 42.5 kWh out of a 45 kWh pack) to guarantee safety reserves.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 block mb-0.5">Formula:</span>
                Usable kWh = Gross kWh × Buffer Ratio (92-95%)
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 font-extrabold text-lg flex items-center justify-center shadow-xs">
                  02
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Highway Speed &amp; 40°C AC Load
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cruising at 100+ km/h on expressways like NE-1 or Yamuna increases aerodynamic drag quadratically. Combined with heavy Indian summer air-conditioning, consumption rises up to 1.35× normal city rates.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 block mb-0.5">Dynamic Factors:</span>
                Speed multiplier (1.15-1.35×) + AC cabin load
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-extrabold text-lg flex items-center justify-center shadow-xs">
                  03
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  0–100 Outage Risk Engine
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Stations are transparently scored from 0 (lowest risk) to 100 (high risk). Telemetry checks multi-gun redundancy, verified community check-ins, feeder reliability, and 24/7 access.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 block mb-0.5">Scoring Bands:</span>
                0-29 Low Risk • 30-59 Moderate • 60+ High
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-900 font-extrabold text-lg flex items-center justify-center shadow-xs">
                  04
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Automatic Backup Allocation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every recommended charging stop is dynamically paired with a secondary backup station within reachable diversion distance. If a station is down or blocked, your fallback is pre-calculated.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 block mb-0.5">Contingency:</span>
                Reachable on arrival reserve buffer (15-25%)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MADE BY KSVISUALSAGENCY AGENCY SHOWCASE BANNER */}
      <section className="py-14 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>Product Engineering &amp; Design Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Made with Precision by <span className="text-emerald-400">KSVISUALSAGENCY</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                ChargeRoute AI was engineered and designed by <strong>KSVISUALSAGENCY</strong> to bring world-class deterministic EV telemetry, mathematical route modeling, and emergency contingency infrastructure to Indian electric vehicle owners.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href={isAuthenticated ? "/plan" : "/login?redirect=/plan"}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{isAuthenticated ? "Open Trip Planner" : "Sign In to Start"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LOCKED PLATFORM NOTICE FOR GUESTS OR ACTIVE TOOLS FOR LOGGED-IN USERS */}
      {!isAuthenticated ? (
        <section className="py-16 bg-slate-100/70 border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full Platform Unlocks After User Login</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              All Planning Options &amp; Telemetry Available Upon Sign-In
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              To preserve your trip history, vehicle profiles, and custom car configurations, all planning tools and station directories require an authenticated driver account.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Route className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Interactive Trip Planner</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Deterministic range simulation, real elevation &amp; AC load math, and instant outage backups.
                </p>
                <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pt-1">
                  <Lock className="w-3 h-3" />
                  <span>Unlocks on sign-in</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">269+ Charging Stations</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pan-India city and expressway charger directory with live connector statuses and tariffs.
                </p>
                <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pt-1">
                  <Lock className="w-3 h-3" />
                  <span>Unlocks on sign-in</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Car className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">141+ EV Catalog &amp; Custom</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Indian market battery ratings, highway consumption rates, plus add your own custom car.
                </p>
                <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pt-1">
                  <Lock className="w-3 h-3" />
                  <span>Unlocks on sign-in</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Saved History &amp; Dashboard</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Save routes to your profile, review historical stops, and manage your vehicle fleet.
                </p>
                <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pt-1">
                  <Lock className="w-3 h-3" />
                  <span>Unlocks on sign-in</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In with Google or Email to Unlock All Options</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* Authenticated: Popular Highway & Expressways Overview */
        <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                National EV Coverage
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Supported Highway &amp; City Corridors
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Pan-India deployment covering national expressways, golden quadrilateral arteries, and urban charging networks across 35 States &amp; UTs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-900">Yamuna &amp; Agra-Lucknow Expwy</div>
                <div className="text-xs text-slate-600">Delhi — Noida — Mathura — Agra — Lucknow</div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  120kW Superfast Hubs
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-900">Mumbai — Pune Expressway</div>
                <div className="text-xs text-slate-600">Kalamboli — Khalapur — Lonavala — Talegaon — Wakad</div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  Ultra-High Density Plazas
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-900">Bengaluru — Mysuru Expressway</div>
                <div className="text-xs text-slate-600">Kengeri — Bidadi — Ramanagara — Maddur — Mandya</div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  10-Lane Access-Controlled
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-900">National Expressway 1 (NE-1)</div>
                <div className="text-xs text-slate-600">Ahmedabad — Nadiad — Anand — Vadodara — Surat</div>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  Dual-Corridor Coverage
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
