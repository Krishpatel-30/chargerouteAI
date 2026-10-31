"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, X, Mail, User, ShieldCheck, Sparkles } from "lucide-react";
import { extractErrorMessage } from "@/lib/utils";

interface GoogleAuthButtonProps {
  redirectUrl?: string;
  buttonText?: string;
}

export function GoogleAuthButton({
  redirectUrl = "/plan",
  buttonText = "Continue with Google",
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const { loginWithGoogle, loginWithFirebaseGoogle, isFirebaseEnabled } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Clear any legacy saved accounts from device storage to guarantee strict user privacy
  useEffect(() => {
    try {
      localStorage.removeItem("voltplan_device_google_accounts");
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleOpenModal = () => {
    setError(null);
    setGoogleEmail("");
    setFullName("");
    setIsModalOpen(true);
  };

  // Direct 1-Click Google Sign-In via Firebase
  const handleDirectGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginWithFirebaseGoogle();
      setIsModalOpen(false);
      try {
        router.push(redirectUrl || "/plan");
      } catch (e) {}
      if (typeof window !== "undefined") {
        window.location.href = redirectUrl || "/plan";
      }
    } catch (err: any) {
      console.warn("Direct Google popup sign-in did not complete:", err);
      const errorMsg = extractErrorMessage(
        err,
        "Google sign-in was closed or unavailable. Enter your Google email below to continue directly."
      );
      setError(errorMsg);
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Main button click: Attempt 1-click Google Sign-In directly, or open modal if unavailable
  const handleMainButtonClick = async () => {
    if (isFirebaseEnabled) {
      await handleDirectGoogleSignIn();
    } else {
      handleOpenModal();
    }
  };

  // Manual Entry of Google Email credentials
  const executeGoogleSignIn = async (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid Google or Gmail address.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email: cleanEmail,
        full_name: name?.trim() || undefined,
      });
      setIsModalOpen(false);
      // Immediately open main trip planner model page
      try {
        router.push(redirectUrl || "/plan");
      } catch (e) {}
      if (typeof window !== "undefined") {
        window.location.href = redirectUrl || "/plan";
      }
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      setError(extractErrorMessage(err, "Google authentication failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeGoogleSignIn(googleEmail, fullName);
  };

  return (
    <div className="space-y-1.5 w-full">
      <button
        type="button"
        disabled={isLoading}
        onClick={handleMainButtonClick}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-3 disabled:opacity-60 hover:border-slate-400 group"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
            <span>Connecting with Google...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Direct link to open manual entry modal if needed */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="w-full text-center text-[10px] text-slate-400 hover:text-emerald-700 font-medium transition-colors"
      >
        or enter Google email manually
      </button>

      {/* Google Authentication Dialog - Direct and Manual Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  Sign In with Google
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Choose 1-click Google popup or enter your Google email directly to launch the Trip Planner.
            </p>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Direct 1-Click Google OAuth Option */}
            {isFirebaseEnabled && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleDirectGoogleSignIn}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2.5 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                      <span>Connecting with Google...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>1-Click Google Sign-In</span>
                    </>
                  )}
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    or enter google email manually
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            {/* Manual Entry Form */}
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Google Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="device-google-email-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="e.g. driver@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Display Name (Optional)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Driver Name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In &amp; Launching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Sign In &amp; Open Trip Planner →</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-1 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Private &amp; Secure session • Platform by KSVISUALSAGENCY</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
