"use client";

import React from "react";

interface SaraAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showOnlineDot?: boolean;
}

export default function SaraAvatar({
  className = "w-8 h-8",
  size = "md",
  showOnlineDot = true,
}: SaraAvatarProps) {
  const dotSizes = {
    sm: "w-2 h-2 -bottom-0.5 -right-0.5 border",
    md: "w-2.5 h-2.5 bottom-0 right-0 border-2",
    lg: "w-3 h-3 bottom-0.5 right-0.5 border-2",
  };

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      <div className="w-full h-full rounded-full overflow-hidden shadow-md ring-1 ring-white/20 bg-slate-900 flex items-center justify-center">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-cover"
        >
          {/* Background Gradient */}
          <rect width="40" height="40" rx="20" fill="url(#sara-grad)" />

          {/* Hair back layer */}
          <path
            d="M9 22C9 14 13.5 10 20 10C26.5 10 31 14 31 22V28H9V22Z"
            fill="#0F172A"
          />

          {/* Skin Face */}
          <ellipse cx="20" cy="20" rx="6.5" ry="7.5" fill="#FED7AA" />

          {/* Hair Front / Bangs */}
          <path
            d="M13.5 17.5C13.5 14 16 11.5 20 11.5C24 11.5 26.5 14 26.5 17.5C26.5 15.5 24 13.5 20 13.5C16 13.5 13.5 15.5 13.5 17.5Z"
            fill="#1E293B"
          />
          <path
            d="M13.5 16.5C15 13 18 12 20 12.5C17 13.5 14.5 15.5 13.5 16.5Z"
            fill="#334155"
          />

          {/* Eyes */}
          <ellipse cx="17.5" cy="19.2" rx="0.9" ry="1.1" fill="#0F172A" />
          <ellipse cx="22.5" cy="19.2" rx="0.9" ry="1.1" fill="#0F172A" />
          <circle cx="17.8" cy="18.9" r="0.35" fill="#FFFFFF" />
          <circle cx="22.8" cy="18.9" r="0.35" fill="#FFFFFF" />

          {/* Eyebrows */}
          <path
            d="M16 17.5C17 17 18.5 17.2 18.8 17.6"
            stroke="#1E293B"
            strokeWidth="0.75"
            strokeLinecap="round"
          />
          <path
            d="M24 17.5C23 17 21.5 17.2 21.2 17.6"
            stroke="#1E293B"
            strokeWidth="0.75"
            strokeLinecap="round"
          />

          {/* Friendly Smile */}
          <path
            d="M17.8 23.2C18.5 24.2 21.5 24.2 22.2 23.2"
            stroke="#E11D48"
            strokeWidth="1.1"
            strokeLinecap="round"
          />

          {/* Cheeks Blush */}
          <circle cx="15.8" cy="21.5" r="1.2" fill="#FB7185" opacity="0.4" />
          <circle cx="24.2" cy="21.5" r="1.2" fill="#FB7185" opacity="0.4" />

          {/* Professional Blazer Outfit */}
          <path
            d="M8 35C8 28.5 12.5 26.5 20 26.5C27.5 26.5 32 28.5 32 35V40H8V35Z"
            fill="#1E40AF"
          />
          {/* Inner Shirt V-neck */}
          <path d="M16.5 26.5L20 32L23.5 26.5" fill="#FFFFFF" />
          {/* Gold Lapel Badge */}
          <polygon points="20,29.5 21.2,32 18.8,32" fill="#F59E0B" />

          {/* Sleek Support Headset */}
          <path
            d="M13.5 19C12.8 19 12.2 19.8 12.2 21C12.2 22.2 12.8 23 13.5 23"
            stroke="#F59E0B"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M13.5 22.2L17.2 23.5"
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="17.6" cy="23.6" r="1.1" fill="#F59E0B" />

          {/* Gradients */}
          <defs>
            <linearGradient
              id="sara-grad"
              x1="0"
              y1="0"
              x2="40"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0056CA" />
              <stop offset="0.6" stopColor="#1E3A8A" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showOnlineDot && (
        <span
          className={`absolute ${dotSizes[size]} bg-emerald-400 border-slate-950 rounded-full animate-pulse shadow-sm`}
          title="Online"
        />
      )}
    </div>
  );
}
