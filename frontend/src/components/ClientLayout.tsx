"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { AtmosphericBackground3D } from "@/components/AtmosphericBackground3D";
import { BeastIntroOverlay } from "@/components/BeastIntroOverlay";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(false);
  const [isIntroActive, setIsIntroActive] = useState(true);

  useEffect(() => {
    // Enforce dark mode: reset any document CSS filter inversion
    document.documentElement.style.filter = "none";
  }, []);

  const handleStartDissolve = () => {
    setIsIntroActive(false);
  };

  const handleReplayIntro = () => {
    setIsIntroActive(true);
    setShowIntro(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0D0704] text-[#D4BC9A] relative font-sans selection:bg-amber-500/30 overflow-x-hidden">
      {/* 1. Volumetric Atmospheric 3D Canvas Background (Preserved 100% Untouched) */}
      <AtmosphericBackground3D />

      {/* 2. Cinematic 5-Phase Beast Scratch Intro Overlay */}
      <BeastIntroOverlay
        forceRun={showIntro}
        onStartDissolve={handleStartDissolve}
        onComplete={() => setIsIntroActive(false)}
      />

      {/* 3. Main Full-Width Website Wrapper with Seamless Cinematic Crossfade Entrance */}
      <motion.div
        className="min-h-screen w-full flex flex-col relative z-10"
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{
          opacity: isIntroActive ? 0 : 1,
          y: isIntroActive ? 12 : 0,
          scale: isIntroActive ? 0.99 : 1.0,
        }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Header Navigation */}
        <Header onReplayIntro={handleReplayIntro} />

        {/* Main Body Container: Fully Expanded, Responsive & Centered */}
        <main className="flex-1 w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
          {children}
        </main>
      </motion.div>
    </div>
  );
}
