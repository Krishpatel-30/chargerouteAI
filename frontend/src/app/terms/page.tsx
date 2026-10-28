import React from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-400">Last updated: October 2026</p>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <strong className="block font-bold">Important Driver Disclaimer:</strong>
          <span>
            ChargeRoute AI provides deterministic estimations and rule-based risk evaluations based on public sources and driver reports. Actual real-world battery discharge depends on speed, temperature, vehicle load, and battery degradation. ChargeRoute AI is not a guarantee against battery depletion.
          </span>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ChargeRoute AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">2. Driver Responsibility & Road Safety</h2>
          <p>
            You are solely responsible for operating your vehicle safely and in compliance with all Indian traffic regulations. Never interact with the application while actively driving. Always verify station availability and opening hours before departing on long highway segments.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">3. Community Reporting Guidelines</h2>
          <p>
            Users who submit charging station reliability reports must provide honest, factual observations. Submitting fraudulent reports or attempting to manipulate station risk scores is prohibited and will result in account suspension.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">4. Limitation of Liability</h2>
          <p>
            ChargeRoute AI and its operators shall not be liable for any indirect, incidental, or consequential damages resulting from charger outages, towing expenses, travel delays, or battery depletion.
          </p>
        </div>
      </div>
    </div>
  );
}
