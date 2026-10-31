"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { extractErrorMessage } from "@/lib/utils";
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/plan";

  const {
    login,
    loginWithFirebaseEmail,
    sendPasswordResetEmail,
    isFirebaseEnabled,
    isAuthenticated,
  } = useAuth();
  const [view, setView] = useState<"login" | "forgot_password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password state
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSuccessInfo, setResetSuccessInfo] = useState<{ message: string; reset_url_dev?: string } | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = redirectUrl || "/plan";
    }
  }, [isAuthenticated, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isFirebaseEnabled) {
        await loginWithFirebaseEmail(email.trim().toLowerCase(), password);
      } else {
        await login({ email: email.trim().toLowerCase(), password });
      }
      window.location.href = redirectUrl || "/plan";
    } catch (err: any) {
      console.error("Login failed:", err);
      const detail = extractErrorMessage(err, "Invalid email or password. Please try again.");
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessInfo(null);
    setIsSendingReset(true);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid driver email address.");
      setIsSendingReset(false);
      return;
    }

    try {
      if (isFirebaseEnabled) {
        await sendPasswordResetEmail(cleanEmail);
        setResetSuccessInfo({
          message: `Password reset instructions have been sent to ${cleanEmail} directly via Google Firebase. Please check your inbox or spam folder.`,
        });
      } else {
        const res = await api.forgotPassword(cleanEmail);
        setResetSuccessInfo(res);
      }
    } catch (err: any) {
      console.error("Forgot password failed:", err);
      const msg = extractErrorMessage(err, "Failed to send reset link. Please check your email.");
      setErrorMessage(msg);
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-[calc(100vh-140px)]">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/30">
            {view === "login" ? <Zap className="w-6 h-6 fill-white" /> : <KeyRound className="w-6 h-6 text-white" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {view === "login" ? "Sign In to VoltPlan" : "Reset Your Password"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {view === "login"
              ? "Access your saved highway & city trip history, EV models, and route backups."
              : "We will send a password reset request directly to your driver mail ID."}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 font-medium space-y-1">
            <div className="flex items-start gap-1.5">
              <span className="shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </div>
            {view === "login" && errorMessage.toLowerCase().includes("password") && (
              <button
                type="button"
                onClick={() => {
                  setView("forgot_password");
                  setErrorMessage(null);
                }}
                className="text-left text-emerald-700 font-bold hover:underline text-[11px] block pt-1"
              >
                → Forgot your password? Click here to send a reset link to your email
              </button>
            )}
          </div>
        )}

        {/* Success Alert for Password Reset */}
        {view === "forgot_password" && resetSuccessInfo && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-xs text-emerald-950 space-y-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold text-emerald-950 mb-1">
                  Reset Request Sent to Your Mail!
                </strong>
                <p className="text-emerald-800 leading-relaxed">
                  {resetSuccessInfo.message}
                </p>
              </div>
            </div>

            {resetSuccessInfo.reset_url_dev && (
              <div className="p-3 bg-white/95 rounded-xl border border-emerald-300 text-xs text-slate-800 space-y-1">
                <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-700 block">
                  ⚡ 1-Click Reset Link (Instant Preview):
                </span>
                <Link
                  href={resetSuccessInfo.reset_url_dev}
                  className="font-mono text-[11px] text-emerald-700 hover:text-emerald-800 underline break-all block"
                >
                  {resetSuccessInfo.reset_url_dev}
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setView("login");
                setResetSuccessInfo(null);
                setErrorMessage(null);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </button>
          </div>
        )}

        {/* Card Body */}
        {view === "login" ? (
          /* 1. SIGN IN VIEW */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
            {/* Continue with Google */}
            <GoogleAuthButton redirectUrl={redirectUrl} buttonText="Continue with Google" />

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                or sign in with email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot_password");
                      setErrorMessage(null);
                      setResetSuccessInfo(null);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Secure indicator */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Encrypted Session &amp; Secure JWT Authentication</span>
            </div>
          </div>
        ) : (
          /* 2. FORGOT PASSWORD VIEW (INLINE IN LOGIN) */
          (!resetSuccessInfo && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Driver Email Address
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
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    We will send a secure password reset request directly to this mail ID.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSendingReset ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Request to Your Mail...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link to My Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setErrorMessage(null);
                  }}
                  className="font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>

                <Link
                  href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
                  className="font-bold text-emerald-600 hover:text-emerald-700 underline"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          ))
        )}

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          {view === "login" ? (
            <>
              Don&apos;t have an account yet?{" "}
              <Link
                href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
                className="font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                Create an Account
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setView("login");
                setErrorMessage(null);
                setResetSuccessInfo(null);
              }}
              className="font-bold text-slate-600 hover:text-slate-900 underline"
            >
              Cancel and Return to Sign In
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
