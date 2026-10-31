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
  Globe,
  ExternalLink,
  Layers,
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION WITH CLEAR CINEMATIC EV BACKGROUND (ZERO FADE) */}
      <section className="relative overflow-hidden py-14 sm:py-24 border-b border-slate-800 bg-slate-950">
        {/* Real Authentic Background Image with Zero Fade */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.jpg"
            alt="ChargeRoute AI EV Highway Corridor Sunset"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Hero Copy - Sleek frosted glass panel showcasing clear image behind */}
            <div className="lg:col-span-7 space-y-6 text-left bg-slate-950/65 backdrop-blur-md p-6 sm:p-9 rounded-3xl border border-white/15 shadow-2xl">
              {/* Attribution Pill */}
              <a
                href="https://ksvisualsagency.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-lg transition-colors group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Made by <strong className="underline group-hover:text-emerald-200">KSVISUALSAGENCY</strong> ↗ • Pan-India EV Planning Platform</span>
              </a>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-md">
                Plan Your EV Journey.{" "}
                <span className="text-emerald-400 block mt-1">Predict Range &amp; Outage Backups.</span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl leading-relaxed drop-shadow-xs">
                India&apos;s intelligent electric vehicle navigation platform. Calculate deterministic battery range, discover verified charging stations across 35 states, and secure safe backup stops before you hit the road.
              </p>

              {/* Key Features Quick Grid */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-slate-700/80 text-xs">
                <div className="space-y-1">
                  <div className="text-emerald-400 font-extrabold text-lg sm:text-xl">141+</div>
                  <strong className="block text-white font-bold text-xs">Indian EV Models</strong>
                  <span className="text-slate-400 text-[11px] block">With custom car builder</span>
                </div>
                <div className="space-y-1">
                  <div className="text-emerald-400 font-extrabold text-lg sm:text-xl">269</div>
                  <strong className="block text-white font-bold text-xs">City &amp; Highway Hubs</strong>
                  <span className="text-slate-400 text-[11px] block">Verified 24/7 chargers</span>
                </div>
                <div className="space-y-1">
                  <div className="text-emerald-400 font-extrabold text-lg sm:text-xl">0–100</div>
                  <strong className="block text-white font-bold text-xs">Explainable Risk</strong>
                  <span className="text-slate-400 text-[11px] block">Outage &amp; queue safety</span>
                </div>
              </div>

              {/* Secondary links - ONLY VISIBLE AFTER USER LOGIN */}
              {isAuthenticated && (
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                  <Link
                    href="/chargers"
                    className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-700 hover:border-slate-600 transition-colors shadow-sm flex items-center gap-1.5 backdrop-blur-md"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Browse 269 Charging Stations</span>
                  </Link>
                  <Link
                    href="/vehicles"
                    className="px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-700 hover:border-slate-600 transition-colors shadow-sm flex items-center gap-1.5 backdrop-blur-md"
                  >
                    <Car className="w-3.5 h-3.5 text-emerald-400" />
                    <span>141 EV Directory &amp; Specs</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Right: DRIVER AUTHENTICATION & ACCESS CARD */}
            <div className="lg:col-span-5">
              {!isAuthenticated ? (
                /* Unauthenticated View: Sign In with Google Device ID or Email */
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-6 sm:p-7 space-y-5 relative">
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
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-6 sm:p-7 space-y-5">
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

      {/* 2. HIGH-TECH PLATFORM MODEL SHOWCASE (UNLOCKED AFTER DRIVER LOGIN) */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inside The System Model • Unlocked After Driver Login</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              The Planning Model We Built
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Explore the deterministic engineering platform unlocked once you sign in. Engineered with mathematical battery telemetry, real-time charger outage scoring, and custom electric vehicle physics by <strong>KSVISUALSAGENCY</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Studio Window 1: Interactive Corridor Route Planner & Outage Risk Engine */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl flex flex-col group hover:border-emerald-500/50 transition-all">
              {/* Studio Window Header */}
              <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>chargeroute.ai/plan?route=delhi-agra</span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                  Active Model
                </span>
              </div>

              {/* Console Body */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                        01 • Deterministic Route Engine
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        Delhi ──▶ Agra (Yamuna Expressway)
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">Corridor Length</span>
                      <span className="text-sm font-extrabold text-white">214 km</span>
                    </div>
                  </div>

                  {/* Outage Risk Pill & Status */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-sm">
                        12
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-300">Low Outage Risk • Direct Corridor</div>
                        <div className="text-[10px] text-slate-400">Zero feeder outages detected • 24/7 highway patrol</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/60 px-2 py-1 rounded-lg border border-emerald-700/60">
                      Safe Non-Stop
                    </span>
                  </div>

                  {/* Battery Progression Matrix */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Departure Battery: <strong className="text-white">90% (38.2 kWh)</strong></span>
                      <span className="text-slate-400">Arrival Reserve: <strong className="text-emerald-400">28% (11.9 kWh)</strong></span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[62%]" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Reserve Buffer: <strong className="text-white">+28 km cushion</strong></span>
                      <span>AC Factor: <strong className="text-emerald-400">1.25× Summer Draw</strong></span>
                    </div>
                  </div>

                  {/* Charging & Backup Allocation */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Fast Stop</span>
                      <strong className="text-white text-xs block truncate">Noida Expwy Superhub</strong>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>120 kW • 4/4 Available</span>
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contingency Backup</span>
                      <strong className="text-white text-xs block truncate">Jewar Toll Plaza Hub</strong>
                      <span className="text-[10px] text-teal-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3 h-3 text-teal-400" />
                        <span>60 kW • 2/2 Backup Ready</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Accessible at <code className="text-emerald-400 font-mono">/plan</code> after sign-in
                  </span>
                  <Link
                    href={isAuthenticated ? "/plan" : "/login?redirect=/plan"}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
                  >
                    <span>{isAuthenticated ? "Launch Interactive Planner" : "Sign In to Test Model"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Studio Window 2: Custom Vehicle Builder & Engineering Physics */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl flex flex-col group hover:border-emerald-500/50 transition-all">
              {/* Studio Window Header */}
              <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
                    <span>chargeroute.ai/builder/custom-physics</span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded-md">
                  User Requested Tool
                </span>
              </div>

              {/* Console Body */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                        02 • Custom Vehicle Builder
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        Calibrate Any Electric Vehicle
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                      Real Physics Math
                    </span>
                  </div>

                  {/* Quick Pick Categories Matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5 opacity-80">
                      <span className="font-bold text-white block">City Hatchback</span>
                      <span className="text-[10px] text-slate-400">28 kWh • ~200 km</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 space-y-0.5 relative shadow-xs">
                      <span className="font-bold text-emerald-300 block">Compact SUV</span>
                      <span className="text-[10px] text-emerald-400 font-medium">45 kWh • ~310 km</span>
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5 opacity-80">
                      <span className="font-bold text-white block">Mid / Large SUV</span>
                      <span className="text-[10px] text-slate-400">60 kWh • ~380 km</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-0.5 opacity-80">
                      <span className="font-bold text-white block">Long Range Luxury</span>
                      <span className="text-[10px] text-slate-400">75+ kWh • ~460 km</span>
                    </div>
                  </div>

                  {/* Engineering Parameters Breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Gross Battery Pack:</span>
                      <strong className="text-white">45.0 kWh</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Usable Capacity (94.4% Buffer):</span>
                      <strong className="text-emerald-400 font-extrabold">42.5 kWh Net</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Highway Range (100 km/h + AC):</span>
                      <strong className="text-white">~310 km Reference</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                      <span className="text-slate-400">DC Fast Charge Rating:</span>
                      <strong className="text-teal-400">60 kW DC (10–80% in 45m)</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                    💡 If your electric car is modified or not yet listed in our database, configure it in under 30 seconds using the builder modal inside the trip planner.
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Use <code className="text-emerald-400 font-mono">+ Add Manual Car</code> in planner
                  </span>
                  <Link
                    href={isAuthenticated ? "/plan" : "/login?redirect=/plan"}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/20"
                  >
                    <span>{isAuthenticated ? "Configure Custom EV" : "Sign In to Build EV"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Bar 3: Pan-India Corridor Telemetry & Verified Infrastructure */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-white">
                  269+ Verified Charging Stations Across 35 States &amp; National Expressways
                </h4>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  Real-time multi-gun telemetry, explainable 0–100 outage risk scoring, and zero speculative AI claims. Built with precision by <strong>KSVISUALSAGENCY</strong>.
                </p>
              </div>
            </div>
            <Link
              href={isAuthenticated ? "/chargers" : "/login?redirect=/chargers"}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shrink-0 flex items-center gap-2 transition-colors"
            >
              <span>{isAuthenticated ? "Explore Charging Hubs" : "Sign In to Browse Hubs"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
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
              <a
                href="https://ksvisualsagency.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Visit KSVISUALSAGENCY ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

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
