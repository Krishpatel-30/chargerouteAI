"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { extractErrorMessage } from "@/lib/utils";
import { Zap, Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; reset_url_dev?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);
    setIsLoading(true);

    try {
      const res = await api.forgotPassword(email.trim().toLowerCase());
      setSuccessInfo(res);
    } catch (err: any) {
      console.error("Forgot password request failed:", err);
      const msg = extractErrorMessage(err, "Failed to submit password reset request. Please check your email.");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Forgot Your Password?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Enter your driver email address below and we will send you a secure link to reset your password.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Success Alert */}
        {successInfo && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-xs text-emerald-900 space-y-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-emerald-950 mb-1">
                  Password Reset Instructions Sent
                </strong>
                <p className="text-emerald-800 leading-relaxed">
                  {successInfo.message} Please check your inbox and spam folder.
                </p>
              </div>
            </div>

            {/* Development One-Click Reset Helper if SMTP is unconfigured */}
            {successInfo.reset_url_dev && (
              <div className="p-3 bg-white/90 rounded-xl border border-emerald-300 text-xs text-slate-800 space-y-1.5">
                <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-700 block">
                  ⚡ 1-Click Reset Link (Instant Preview):
                </span>
                <Link
                  href={successInfo.reset_url_dev}
                  className="font-mono text-[11px] text-emerald-700 hover:text-emerald-800 underline break-all block"
                >
                  {successInfo.reset_url_dev}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Driver Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/30 hover:shadow-emerald-600/40 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Request...</span>
                </>
              ) : (
                <>
                  <span>Send Password Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/login"
              className="font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>

            <Link
              href="/register"
              className="font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
