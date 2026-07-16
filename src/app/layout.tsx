import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import GlobalPreloader from "@/components/GlobalPreloader";

import GoogleTranslate from "@/components/GoogleTranslate";
import SiteHeader from "@/components/SiteHeader";
import UISoundProvider from "@/components/UISoundProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vishwa Leader | Dr. B. R. Ambedkar International Awards 2026",
  description:
    "Vishwa Leader Techmedia Private Limited — Dr. B. R. Ambedkar International Awards 2026. Academic Conference, Business Summit & Award Ceremony. London, UK | September 18–20, 2026.",
  alternates: {
    canonical: "https://vishwaleader.com",
  },
  icons: {
    icon: [
      { url: "/assets/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/assets/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome", url: "/assets/images/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "android-chrome", url: "/assets/images/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
  openGraph: {
    type: "website",
    url: "https://www.vishwaleader.com",
    siteName: "Vishwa Leader",
    title: "Vishwa Leader | Dr. B. R. Ambedkar International Awards 2026",
    description:
      "Dr. B. R. Ambedkar International Awards 2026 — Academic Conference at SOAS, Business Summit & Award Ceremony at Greenwood Theatre, King's College London. September 18–20, 2026.",
    images: [
      {
        url: "https://www.vishwaleader.com/assets/images/og-card.png",
        width: 1024,
        height: 1024,
        alt: "Vishwa Leader — Dr. B. R. Ambedkar International Awards 2026, London",
      },
    ],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vishwa Leader | Dr. B. R. Ambedkar International Awards 2026",
    description:
      "Academic Conference, Business Summit & Award Ceremony. London, UK | September 18–20, 2026.",
    images: ["https://www.vishwaleader.com/assets/images/og-card.png"],
  },
  verification: {
    google: [
      "q4N3KTI45z79rdxu0McdajvAh4hQG3v4IjnIhMMCYyE",
      "KRXML02ICZ_2HeuT9VZ2RtAbeZrYog9Hlxygc9Llup8",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="min-h-full flex flex-col relative">
        <UISoundProvider>
          <GlobalPreloader />
          <TooltipProvider>
              <div className="flex-grow flex flex-col animate-in fade-in duration-1000">
                <SiteHeader />
                {children}
              </div>
              <GoogleTranslate />
          </TooltipProvider>
        </UISoundProvider>
      </body>
    </html>
  );
}
