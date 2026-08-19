"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Flame, 
  LayoutDashboard, 
  Search, 
  Swords, 
  UploadCloud, 
  Activity, 
  BarChart2, 
  Trophy, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Bell,
  Play,
  Code2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HeaderProps {
  onReplayIntro?: () => void;
}

export function Header({ onReplayIntro }: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home Landing", path: "/", icon: Flame },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Repository Analysis", path: "/analysis", icon: Search },
    { name: "Repo Duel (A/B)", path: "/duel", icon: Swords },
    { name: "Bulk CSV Upload", path: "/upload", icon: UploadCloud },
    { name: "Live Jobs Queue", path: "/jobs", icon: Activity },
    { name: "Platform Analytics", path: "/analytics", icon: BarChart2 },
    { name: "Global Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Executive Reports", path: "/reports", icon: FileText },
    { name: "The Creators (Team)", path: "/team", icon: Code2 },
    { name: "Judges Directory", path: "/judges", icon: Users },
    { name: "Platform Settings", path: "/settings", icon: Settings },
    { name: "Documentation & Help", path: "/help", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#140804]/95 border-b border-[#E07A48]/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] px-4 lg:px-8 py-2.5">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E07A48] via-[#D96B27] to-[#FF8C42] flex items-center justify-center shadow-[0_0_20px_rgba(224,122,72,0.6)] group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-[#0D0805] fill-[#0D0805]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display tracking-wider text-xl text-[#D4BC9A] font-bold uppercase leading-none">CODEBEAST</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E07A48]/25 text-[#FF8C42] border border-[#E07A48]/40 font-mono font-bold">AI</span>
          </div>
        </Link>

        {/* Center: Sleek Icon-Only Navigation Buttons with Tooltips */}
        <nav className="flex items-center gap-2 p-1.5 bg-[#1F0F08]/90 border border-[#E07A48]/30 rounded-full shadow-inner">
          {navLinks.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            return (
              <div key={item.path} className="relative group">
                <Link
                  href={item.path}
                  aria-label={item.name}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative",
                    isActive
                      ? "bg-gradient-to-tr from-[#E07A48] to-[#FF8C42] text-[#0D0805] shadow-[0_0_20px_rgba(224,122,72,0.6)] scale-105"
                      : "text-amber-200/60 hover:text-[#D4BC9A] hover:bg-[#2A130A] hover:scale-110 border border-transparent hover:border-[#E07A48]/30"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-transform group-hover:scale-110",
                    isActive ? "text-[#0D0805]" : "text-amber-100/70"
                  )} />
                </Link>

                {/* Floating Tooltip */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                  <div className="bg-[#180A04] text-[#D4BC9A] text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[#E07A48]/50 shadow-[0_10px_25px_rgba(0,0,0,0.9)] whitespace-nowrap flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C42]"></span>
                    {item.name}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Replay Intro Button */}
          {onReplayIntro && (
            <div className="hidden lg:block">
              <CodeBeastLiquidButton
                variant="secondary"
                size="sm"
                label="REPLAY INTRO"
                icon={<Play className="w-3.5 h-3.5 text-[#FF8C42] fill-[#FF8C42]" />}
                onClick={onReplayIntro}
              />
            </div>
          )}

          {/* ConsJudge Status Badge (Unified Palette: Warm Beige Text + Neon Orange Shield Icon) */}
          <div className="hidden xl:block">
            <CodeBeastLiquidButton
              variant="status"
              size="sm"
              label="CONSJUDGE VERIFIED"
              icon={<ShieldCheck className="w-3.5 h-3.5 text-[#FF8C42]" />}
            />
          </div>

          {/* Quick Analyze Button (Primary CTA) */}
          <Link href="/analysis" className="hidden sm:inline-block">
            <CodeBeastLiquidButton
              variant="primary"
              size="sm"
              label="ANALYZE"
              hasArrow
              icon={<Sparkles className="w-3.5 h-3.5 text-[#FF8C42]" />}
            />
          </Link>

          {/* Notifications Button */}
          <div className="relative flex items-center justify-center">
            <CodeBeastLiquidButton
              variant="secondary"
              size="sm"
              viewMode="icon"
              icon={<Bell className="w-4 h-4 text-amber-200/80" />}
              aria-label="Notifications"
            />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF8C42] animate-pulse pointer-events-none z-40" />
          </div>

          {/* User Profile Avatar */}
          <div 
            title="Priya Sharma · Head AI Auditor"
            className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-tr from-[#E07A48] via-[#D96B27] to-[#FF8C42] text-[#0D0805] flex items-center justify-center text-xs font-extrabold shadow-[0_0_15px_rgba(224,122,72,0.4)] cursor-pointer hover:ring-2 hover:ring-[#FF8C42] hover:scale-105 transition-all"
          >
            PS
          </div>
        </div>

      </div>
    </header>
  );
}
