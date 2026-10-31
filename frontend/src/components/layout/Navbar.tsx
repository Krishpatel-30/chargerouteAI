"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Zap,
  Menu,
  X,
  ShieldAlert,
  Route,
  BatteryCharging,
  Car,
  Layers,
  User as UserIcon,
  LogIn,
  LogOut,
  History,
} from "lucide-react";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: "Plan Trip", href: "/plan", icon: Route },
    { name: "Charging Stations", href: "/chargers", icon: BatteryCharging },
    { name: "Vehicle Profiles", href: "/vehicles", icon: Car },
    { name: "How It Works", href: "/how-it-works", icon: ShieldAlert },
    { name: "About", href: "/about", icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  ChargeRoute<span className="text-emerald-600">.AI</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  by KSVISUALSAGENCY
                </span>
              </div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-0.5">
                Risk-Aware EV Planner
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links - ONLY VISIBLE AFTER USER LOGIN */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-emerald-700 bg-emerald-50/80 font-semibold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Desktop Action CTAs & Auth */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/trips"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 border border-slate-200/80"
                  title="View your saved trip history"
                >
                  <History className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Trip History</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {(user?.full_name || user?.email || "U")[0].toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate">{user?.full_name || user?.email?.split("@")[0]}</span>
                </Link>

                <Link
                  href="/plan"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all hover:shadow-md hover:scale-[1.02]"
                >
                  Plan Trip
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>Sign In</span>
                </Link>

                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer - OPTIONS ONLY VISIBLE AFTER USER LOGIN */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium ${
                      isActive ? "text-emerald-700 bg-emerald-50" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-600" />
                    {link.name}
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 rounded-lg flex items-center justify-between">
                  <span>Signed in as <strong>{user?.full_name || user?.email}</strong></span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-red-600 font-bold hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
                <Link
                  href="/plan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center rounded-lg font-semibold bg-emerald-600 text-white shadow-sm"
                >
                  Plan Trip
                </Link>
                <Link
                  href="/dashboard/trips"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5"
                >
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>My Saved Trips History</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-center rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Driver Dashboard
                </Link>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl font-bold bg-emerald-600 text-white shadow-sm flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Unlock Platform</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center rounded-xl font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Create Free Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
