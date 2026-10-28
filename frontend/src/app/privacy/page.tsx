import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: October 2026 • India Digital Personal Data Protection Compliance</p>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            ChargeRoute AI is designed to minimize personal data collection. When you use the platform, we collect:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Trip route endpoints (origin, destination, and optional waypoints) solely to calculate routes and identify chargers.</li>
            <li>Selected vehicle profile and user consumption adjustments.</li>
            <li>Account credentials (email, name, hashed password) when you voluntarily register to save routes.</li>
            <li>Crowdsourced charger reliability reports submitted by you.</li>
          </ul>

          <h2 className="text-base font-bold text-slate-900 pt-2">2. Geolocation Data</h2>
          <p>
            Your browser location is accessed only when you explicitly click &quot;Use my current location&quot; and is never stored permanently on our servers or shared with advertisers.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">3. Third-Party Provider APIs</h2>
          <p>
            Geocoding and road routing queries are routed through backend proxy adapters (such as OSRM or Open Charge Map) to protect your IP address and credentials. Private API keys are never exposed in your browser.
          </p>

          <h2 className="text-base font-bold text-slate-900 pt-2">4. Data Security & Storage</h2>
          <p>
            All network communication is encrypted over HTTPS. Database records are stored securely with cryptographic salting (bcrypt) for user authentication credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
