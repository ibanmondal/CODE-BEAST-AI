"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  HelpCircle,
  ShieldCheck,
  Plus,
  Search,
  Menu,
  Sparkles
} from "lucide-react";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";

interface HeaderProps {
  onReplayIntro?: () => void;
  onOpenMobileMenu?: () => void;
}

export function Header({ onReplayIntro, onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    router.push(`/analysis?repo=${encodeURIComponent(searchVal.trim())}`);
  };

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
    if (pathname.startsWith("/judges")) return "Digital Trophy Hall";
    if (pathname.startsWith("/team")) return "System Engineering";
    if (pathname.startsWith("/settings")) return "Platform Settings";
    if (pathname.startsWith("/help")) return "Documentation & Help";
    return "CodeBeast AI";
  };

  return (
    <header className="h-16 bg-[#040914]/90 backdrop-blur-xl border-b border-[#89CFF0]/20 px-3 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-[0_4px_24px_rgba(2,6,18,0.6)]">
      
      {/* Mobile-Only Left Section: Hamburger + Brand Icon */}
      <div className="flex items-center gap-2 lg:hidden shrink-0">
        <button
          onClick={onOpenMobileMenu}
          type="button"
          aria-label="Open Navigation Menu"
          className="p-2 -ml-1 text-[#8EA6C8] hover:text-[#89CFF0] hover:bg-[#08132B] rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#08132B] border border-[#89CFF0]/40 text-[#89CFF0] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            CB
          </div>
          <span className="font-heading font-bold text-xs tracking-wider text-white uppercase hidden sm:inline-block">
            CODE <span className="text-[#89CFF0]">BEAST</span>
          </span>
        </Link>
      </div>

      {/* Global Search Bar (Responsive across all screens) */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 flex-1 max-w-xl min-w-0">
        <div className="w-full relative flex items-center">
          <Search className="w-4 h-4 text-[#8EA6C8] absolute left-3 pointer-events-none shrink-0" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search repositories, reports..."
            className="w-full bg-[#08132B]/90 border border-[#89CFF0]/25 text-white placeholder-[#8EA6C8] text-xs sm:text-sm pl-9 sm:pl-10 pr-4 sm:pr-16 py-2 rounded-xl focus:outline-none focus:border-[#89CFF0] focus:ring-1 focus:ring-[#89CFF0]/30 transition-all font-sans"
          />
          <div className="absolute right-2.5 hidden sm:flex items-center gap-1 pointer-events-none">
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#08132B] border border-[#89CFF0]/20 text-[#8EA6C8]">
              Ctrl
            </kbd>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#08132B] border border-[#89CFF0]/20 text-[#8EA6C8]">
              K
            </kbd>
          </div>
        </div>
      </form>

      {/* Right Header Status Pill */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/25 text-[#89CFF0] text-[11px] font-semibold rounded-full shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="truncate max-w-[160px]">{getPageTitle()}</span>
        </div>
      </div>

    </header>
  );
}
