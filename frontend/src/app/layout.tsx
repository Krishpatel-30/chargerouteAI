import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ChargeRoute AI — Risk-Aware EV Trip Planner | Made by KSVISUALSAGENCY",
  description:
    "Plan your EV journey, understand real battery consumption, discover compatible charging stations, and prepare for unexpected charger outages across India. Engineered & designed by KSVISUALSAGENCY.",
  keywords: [
    "EV trip planner",
    "electric vehicle route planner",
    "Gujarat EV chargers",
    "Tata Power EZ Charge",
    "Jio-bp pulse",
    "EV charging risk",
    "Ahmedabad Surat EV route",
    "KSVISUALSAGENCY",
  ],
  authors: [{ name: "KSVISUALSAGENCY" }],
  creator: "KSVISUALSAGENCY",
  publisher: "KSVISUALSAGENCY",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
