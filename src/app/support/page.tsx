import type { Metadata } from "next";
import SupportClientPage from "./support-client";

export const metadata: Metadata = {
  title: "SARA AI Chatbot | 24/7 Support - Vishwa Leader 2026",
  description:
    "Chat 24/7 with SARA (Smart Automated Response Agent), the official AI Support Concierge for Dr. B. R. Ambedkar International Awards 2026, London, UK.",
};

export default function SupportPage() {
  return <SupportClientPage />;
}
