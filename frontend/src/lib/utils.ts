import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(km: number): string {
  if (km >= 1) {
    return `${km.toFixed(0)} km`;
  }
  return `${(km * 1000).toFixed(0)} m`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRiskColorClass(category: string): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  const cat = (category || "").toLowerCase();
  if (cat.includes("low")) {
    return {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    };
  }
  if (cat.includes("moderate")) {
    return {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      badge: "bg-amber-100 text-amber-900 border-amber-300",
    };
  }
  return {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
  };
}

export function getStatusBadgeClass(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "operational") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (s === "partially_available") {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  if (s === "offline") {
    return "bg-rose-100 text-rose-800 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function extractErrorMessage(err: any, fallback = "An unexpected error occurred. Please try again."): string {
  if (!err) return fallback;

  // Firebase Auth Error Code mapping
  if (err?.code) {
    if (err.code === "auth/popup-closed-by-user") {
      return "Google sign-in popup was closed before completing.";
    }
    if (err.code === "auth/cancelled-popup-request") {
      return "Another Google sign-in request was started.";
    }
    if (err.code === "auth/operation-not-allowed") {
      return "Google Sign-In is not yet enabled in your Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method -> Enable Google.";
    }
    if (err.code === "auth/unauthorized-domain") {
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "this domain";
      return `Domain (${currentHost}) is not authorized in Firebase. Add it under Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    }
    if (err.code === "auth/popup-blocked") {
      return "The Google sign-in popup was blocked by your browser. Please allow popups for this site.";
    }
    if (err.code === "auth/network-request-failed") {
      return "Network error connecting to Google servers. Please check your internet connection.";
    }
  }

  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === "string") return first;
    if (first && typeof first.msg === "string") {
      return first.msg.replace(/^Value error,\s*/i, "");
    }
  }
  if (typeof err?.response?.data?.message === "string") {
    return err.response.data.message;
  }
  if (typeof err?.message === "string") {
    return err.message;
  }
  return fallback;
}
