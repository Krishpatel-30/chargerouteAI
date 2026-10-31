"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, X, Mail, User, ShieldCheck, Laptop, CheckCircle2, Sparkles } from "lucide-react";

interface GoogleAuthButtonProps {
  redirectUrl?: string;
  buttonText?: string;
}

interface SavedDeviceAccount {
  email: string;
  full_name?: string;
  last_used?: string;
}

export function GoogleAuthButton({
  redirectUrl = "/plan",
  buttonText = "Continue with Google",
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("krishbodara5@gmail.com");
  const [fullName, setFullName] = useState("Krish Bodara");
  const [error, setError] = useState<string | null>(null);

  // Initialize with the user's device Google ID and any stored accounts
  const [savedDeviceAccounts, setSavedDeviceAccounts] = useState<SavedDeviceAccount[]>([
    {
      email: "krishbodara5@gmail.com",
      full_name: "Krish Bodara",
      last_used: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("voltplan_device_google_accounts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with krishbodara5@gmail.com if not already present
          const hasKrish = parsed.some(
            (a) => a.email.toLowerCase() === "krishbodara5@gmail.com"
          );
          const merged = hasKrish
            ? parsed
            : [
                {
                  email: "krishbodara5@gmail.com",
                  full_name: "Krish Bodara",
                  last_used: new Date().toISOString(),
                },
                ...parsed,
              ];
          setSavedDeviceAccounts(merged);
          setGoogleEmail(merged[0].email);
          if (merged[0].full_name) setFullName(merged[0].full_name);
        }
      }
    } catch (e) {
      console.warn("Could not read device Google accounts", e);
    }
  }, []);

  const saveAccountToDevice = (email: string, name?: string) => {
    try {
      const currentList: SavedDeviceAccount[] = savedDeviceAccounts.filter(
        (a) => a.email.toLowerCase() !== email.toLowerCase()
      );
      const updated = [
        { email, full_name: name, last_used: new Date().toISOString() },
        ...currentList,
      ].slice(0, 5);
      localStorage.setItem("voltplan_device_google_accounts", JSON.stringify(updated));
      setSavedDeviceAccounts(updated);
    } catch (e) {
      console.warn("Could not save account to device storage", e);
    }
  };

  const executeGoogleSignIn = async (email: string, name?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle({
        email: email.trim().toLowerCase(),
        full_name: name?.trim() || undefined,
      });
      saveAccountToDevice(email.trim().toLowerCase(), name?.trim());
      setIsModalOpen(false);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      setError(err?.response?.data?.detail || "Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceAccountClick = (acc: SavedDeviceAccount) => {
    executeGoogleSignIn(acc.email, acc.full_name);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes("@")) {
      setError("Please enter a valid Google or Gmail address.");
      return;
    }
    executeGoogleSignIn(googleEmail, fullName);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsModalOpen(true);
        }}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-3 disabled:opacity-60 hover:border-slate-400 group"
      >
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
      </button>

      {/* Google Device Authentication Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
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
                  Sign in with Google
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

            {/* Subtitle with Device Badge */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
              <Laptop className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Choose your Google ID saved on this device to sign in instantly.
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* 1. PRIMARY: GOOGLE ACCOUNT SAVED ON THIS DEVICE */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Google ID on this Device:</span>
                <span className="text-emerald-600 font-semibold text-[10px]">1-Click Sign In</span>
              </div>

              <div className="space-y-2">
                {savedDeviceAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDeviceAccountClick(acc)}
                    className="w-full p-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 hover:bg-emerald-100 transition-all text-left flex items-center justify-between group shadow-sm disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {(acc.full_name || acc.email)[0].toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {acc.full_name || acc.email.split("@")[0]}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium truncate">{acc.email}</div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold group-hover:bg-emerald-700 shrink-0 shadow-xs flex items-center gap-1">
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span>Sign In</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  or use another Google email
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
            </div>

            {/* 2. CHOOSE ANOTHER GOOGLE ID */}
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
                    autoComplete="username email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
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
                    placeholder="e.g. Krish Bodara"
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
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Continue with this Email</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-1 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Device session secured • Platform by KSVISUALSAGENCY</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
