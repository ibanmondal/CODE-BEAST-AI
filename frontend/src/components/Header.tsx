"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HelpCircle,
  ShieldCheck,
  Plus,
  Search,
  Bell
} from "lucide-react";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";

interface HeaderProps {
  onReplayIntro?: () => void;
}

export function Header({ onReplayIntro }: HeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/") return "Overview & Capabilities";
    if (pathname.startsWith("/analysis")) return "Repository Analysis";
    if (pathname.startsWith("/dashboard")) return "Executive Dashboard";
    if (pathname.startsWith("/duel")) return "Repository Duel Arena";
    if (pathname.startsWith("/matrix")) return "Code Similarity Matrix";
    if (pathname.startsWith("/upload")) return "Bulk Repository Ingestion";
    if (pathname.startsWith("/jobs")) return "Live Jobs Queue";
    if (pathname.startsWith("/live")) return "Agent Swarm Monitor";
    if (pathname.startsWith("/analytics")) return "Telemetry & Analytics";
    if (pathname.startsWith("/leaderboard")) return "Global Leaderboard";
    if (pathname.startsWith("/rankings")) return "Standings & Rankings";
    if (pathname.startsWith("/reports")) return "Executive Reports Archive";
    if (pathname.startsWith("/judges")) return "Judges Directory";
    if (pathname.startsWith("/team")) return "System & Engineering Architecture";
    if (pathname.startsWith("/settings")) return "Platform Settings";
    if (pathname.startsWith("/help")) return "Documentation & Help";
    return "CodeBeast AI";
  };

  return (
    <header className="h-16 bg-[#040914]/85 backdrop-blur-xl border-b border-[#89CFF0]/20 px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-[0_4px_24px_rgba(2,6,18,0.6)]">
      {/* Left: Global Search Bar from Reference Image */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="w-full relative flex items-center">
          <Search className="w-4 h-4 text-[#8EA6C8] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search repositories, reports, or analyses..."
            className="w-full bg-[#08132B]/90 border border-[#89CFF0]/25 text-white placeholder-[#8EA6C8] text-xs sm:text-sm pl-10 pr-16 py-2 rounded-xl focus:outline-none focus:border-[#89CFF0] focus:ring-1 focus:ring-[#89CFF0]/30 transition-all font-sans"
          />
          <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#08132B] border border-[#89CFF0]/20 text-[#8EA6C8]">
              Ctrl
            </kbd>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#08132B] border border-[#89CFF0]/20 text-[#8EA6C8]">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Notifications & Controls matching Reference Image */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell with Unread Blue Dot */}
        <button
          className="relative p-2 text-[#8EA6C8] hover:text-white hover:bg-[#0B1A3A] rounded-lg transition-colors border border-transparent hover:border-[#89CFF0]/25 cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#89CFF0] shadow-[0_0_8px_#89CFF0] animate-pulse" />
        </button>

        {/* Language Pill (EN in Baby Blue circle from reference image) */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] text-[#040914] flex items-center justify-center font-bold text-xs shadow-[0_0_12px_rgba(137,207,240,0.4)] select-none cursor-pointer hover:scale-105 transition-transform">
          EN
        </div>
      </div>
    </header>
  );
}
