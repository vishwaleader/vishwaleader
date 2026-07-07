import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewTransition } from "react";
import GlobalPreloader from "@/components/GlobalPreloader";
import GoogleTranslate from "@/components/GoogleTranslate";
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
  title: "Vishwa Leader",
  description: "Vishwa Leader Techmedia Private Limited",
  alternates: {
    canonical: "https://vishwaleader.com",
  },
  verification: {
    google: [
      "q4N3KTI45z79rdxu0McdajvAh4hQG3v4IjnIhMMCYyE",
      "KRXML02ICZ_2HeuT9VZ2RtAbeZrYog9Hlxygc9Llup8"
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
        <GlobalPreloader />
        <TooltipProvider>
          <ViewTransition>
            <div className="animate-global-fade-in flex-grow flex flex-col">
              {children}
            </div>
            <GoogleTranslate />
          </ViewTransition>
        </TooltipProvider>
      </body>
    </html>
  );
}
