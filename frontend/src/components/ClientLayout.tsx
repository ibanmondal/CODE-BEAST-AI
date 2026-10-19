"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/NotificationToast";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="h-screen flex bg-[#040914] text-white relative overflow-hidden selection:bg-[#58A6FF]/30 selection:text-[#89CFF0]">
        
        {/* Subtle Cyberpunk Electric Ambient Background Lights */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {/* Top-Right Glowing Electric Blue Halo */}
          <div className="absolute -top-40 right-1/4 w-[42rem] h-[42rem] rounded-full bg-gradient-to-br from-[#1E50AA]/20 via-[#0A1A3A]/25 to-transparent blur-3xl opacity-70" />
          
          {/* Center-Right Ambient Cyan Glow */}
          <div className="absolute top-1/3 -right-32 w-[36rem] h-[36rem] rounded-full bg-gradient-to-bl from-[#388BFD]/15 via-[#08142C]/20 to-transparent blur-3xl opacity-60" />
          
          {/* Bottom-Left Ambient Deep Navy Glow */}
          <div className="absolute -bottom-40 left-1/4 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-[#1E50AA]/15 via-transparent to-transparent blur-3xl opacity-50" />
        </div>

        {/* Global SVG Glass Filter from Reference Component */}
        <svg className="hidden" aria-hidden="true">
          <defs>
            <filter
              id="container-glass"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.05 0.05"
                numOctaves="1"
                seed="1"
                result="turbulence"
              />
              <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="blurredNoise"
                scale="70"
                xChannelSelector="R"
                yChannelSelector="B"
                result="displaced"
              />
              <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
              <feComposite in="finalBlur" in2="finalBlur" operator="over" />
            </filter>
          </defs>
        </svg>

        {/* Permanent Fixed Left-Hand Navigation Sidebar */}
        <div className="h-screen shrink-0 z-40 relative">
          <Sidebar />
        </div>

        {/* Main Content Area - Scrollable while sidebar remains permanently anchored */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 relative z-10 scroll-smooth">
          <Header />
          
          {/* Main Content Container */}
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
