"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, X, Mail, User, ShieldCheck, Laptop, Sparkles, Trash2 } from "lucide-react";
import { extractErrorMessage } from "@/lib/utils";

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
  const [googleEmail, setGoogleEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Strictly empty by default - NO HARDCODED USER ACCOUNTS
  const [savedDeviceAccounts, setSavedDeviceAccounts] = useState<SavedDeviceAccount[]>([]);

  // Load only what this specific browser has legitimately saved
  useEffect(() => {
    try {
      const stored = localStorage.getItem("voltplan_device_google_accounts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Clean out any previously hardcoded developer placeholder accounts
          const cleaned = parsed.filter(
            (a) => a && typeof a.email === "string" && !a.email.toLowerCase().includes("krishbodara")
          );
          setSavedDeviceAccounts(cleaned);
          if (cleaned.length !== parsed.length) {
            localStorage.setItem("voltplan_device_google_accounts", JSON.stringify(cleaned));
          }
        }
      }
    } catch (e) {
      console.warn("Could not read device accounts", e);
    }
  }, []);

  const saveAccountToDevice = (email: string, name?: string) => {
    try {
      const currentList = savedDeviceAccounts.filter(
        (a) => a.email.toLowerCase() !== email.toLowerCase()
      );
      const updated = [
        { email, full_name: name, last_used: new Date().toISOString() },
        ...currentList,
      ].slice(0, 3);
      localStorage.setItem("voltplan_device_google_accounts", JSON.stringify(updated));
      setSavedDeviceAccounts(updated);
    } catch (e) {
      console.warn("Could not save account to device storage", e);
    }
  };

  const removeAccountFromDevice = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    try {
      const updated = savedDeviceAccounts.filter(
        (a) => a.email.toLowerCase() !== email.toLowerCase()
      );
      localStorage.setItem("voltplan_device_google_accounts", JSON.stringify(updated));
      setSavedDeviceAccounts(updated);
    } catch (err) {
      console.warn("Could not remove account", err);
    }
  };

  const executeGoogleSignIn = async (email: string, name?: string) => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid Google or Gmail address.");
      return;
    }
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
      setError(extractErrorMessage(err, "Google authentication failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceAccountClick = (acc: SavedDeviceAccount) => {
    executeGoogleSignIn(acc.email, acc.full_name);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                  Sign In or Create Account with Google
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
                Enter your Google account credentials to sign in or register instantly.
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* If and ONLY if this specific browser previously signed in, show that user's saved account */}
            {savedDeviceAccounts.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Saved on this browser:</span>
                  <span className="text-emerald-600 font-semibold text-[10px]">1-Click Sign In</span>
                </div>

                <div className="space-y-2">
                  {savedDeviceAccounts.map((acc) => (
                    <div
                      key={acc.email}
                      className="w-full p-2.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/70 hover:bg-emerald-100 transition-all flex items-center justify-between group shadow-sm"
                    >
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDeviceAccountClick(acc)}
                        className="flex items-center gap-2.5 truncate flex-1 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {(acc.full_name || acc.email)[0].toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {acc.full_name || acc.email.split("@")[0]}
                          </div>
                          <div className="text-[11px] text-slate-600 font-medium truncate">{acc.email}</div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleDeviceAccountClick(acc)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-1"
                        >
                          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Sign In</span>}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => removeAccountFromDevice(e, acc.email)}
                          title="Remove from this device"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    or use another Google account
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            {/* Google ID Form - Clean, empty inputs for any user */}
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
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Sign In with Google</span>
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
    </>
  );
}
