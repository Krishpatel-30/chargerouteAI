"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Menu, X, ShieldAlert, Route, BatteryCharging, Car, Layers, User } from "lucide-react";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                ChargeRoute<span className="text-emerald-600">.AI</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-1">
                Risk-Aware EV Planner
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
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

          {/* Desktop Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-slate-500" />
              Dashboard
            </Link>
            <Link
              href="/plan"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all hover:shadow-md hover:scale-[1.02]"
            >
              Plan Trip
            </Link>
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
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
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-center rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Driver Dashboard
            </Link>
            <Link
              href="/admin/data-quality"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-center rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              Admin & Data Quality
            </Link>
            <Link
              href="/plan"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center rounded-lg font-semibold bg-emerald-600 text-white shadow-sm"
            >
              Plan My Trip
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
