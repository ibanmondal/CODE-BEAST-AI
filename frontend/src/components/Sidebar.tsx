"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  UploadCloud,
  Activity,
  BarChart2,
  Trophy,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Sun,
  ChevronsLeft,
  LogOut,
  PlayCircle,
  Swords,
  Flame,
  Radio,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState } from 'react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuGroups = [
    {
      title: "OVERVIEW",
      items: [
        { name: "Home Landing", path: "/", icon: Flame },
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      ]
    },
    {
      title: "ANALYSIS",
      items: [
        { name: "Repository Analysis", path: "/analysis", icon: Search },
        { name: "Repo Duel (A/B)", path: "/duel", icon: Swords },
        { name: "Bulk CSV Upload", path: "/upload", icon: UploadCloud },
      ]
    },
    {
      title: "LIVE",
      items: [
        { name: "Live Jobs", path: "/jobs", icon: Activity },
        { name: "Live Animation", path: "/live", icon: PlayCircle },
      ]
    },
    {
      title: "INSIGHTS",
      items: [
        { name: "Analytics", path: "/analytics", icon: BarChart2 },
        { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
        { name: "Reports", path: "/reports", icon: FileText },
      ]
    },
    {
      title: "MANAGEMENT",
      items: [
        { name: "Judges", path: "/judges", icon: Users },
        { name: "Settings", path: "/settings", icon: Settings },
      ]
    },
    {
      title: "HELP",
      items: [
        { name: "Help & Docs", path: "/help", icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside className={cn(
      "h-screen bg-[#0A0705] border-r border-[#E07A48]/20 flex flex-col text-amber-100/70 sticky top-0 transition-all duration-300 z-40 selection:bg-amber-500/30",
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#E07A48]/15">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E07A48] via-[#D96B27] to-[#FF8C42] text-[#0D0805] flex items-center justify-center font-extrabold text-sm shadow-[0_0_20px_rgba(224,122,72,0.5)]">
              <Flame className="w-5 h-5 text-[#0D0805] fill-[#0D0805]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A0705]" />
          </div>
          {!isCollapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-[#D4BC9A] font-display text-2xl tracking-wider leading-none">CODEBEAST</h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E07A48]/20 text-[#FF8C42] border border-[#E07A48]/30 font-mono font-bold">AI</span>
              </div>
              <p className="text-[9px] text-amber-200/40 uppercase tracking-widest font-semibold mt-0.5">6-Agent Swarm Console</p>
            </div>
          )}
        </Link>
      </div>

      {/* Categorized Navigation Routes */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar overscroll-contain touch-pan-y transform-gpu">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <h2 className="px-3 text-[10px] font-bold text-amber-200/40 uppercase tracking-widest font-mono mb-1.5">
                {group.title}
              </h2>
            )}
            {group.items.map((route) => {
              const isActive = pathname === route.path || (route.path !== '/' && pathname.startsWith(route.path));
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  title={isCollapsed ? route.name : undefined}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-[#E07A48]/25 via-[#D96B27]/15 to-transparent text-[#D4BC9A] border border-[#E07A48]/40 shadow-[0_0_15px_rgba(224,122,72,0.15)]"
                      : "hover:bg-white/5 hover:text-[#D4BC9A]"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-[#E07A48] to-[#FF8C42] rounded-r-full shadow-[0_0_10px_#FF8C42]" />
                  )}
                  <route.icon className={cn(
                    "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-[#FF8C42]" : "text-amber-200/50 group-hover:text-amber-100"
                  )} />
                  {!isCollapsed && <span className="truncate">{route.name}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Engine Status & Footer Profile */}
      <div className="p-3 border-t border-[#E07A48]/20 space-y-2 bg-[#120704]/90">
        {!isCollapsed && (
          <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#1A0B05] to-[#251006] border border-[#E07A48]/25 text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-100/80">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LangGraph Engine
              </span>
              <span className="text-[#FF8C42] font-mono">6 Agents</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-1 pt-1">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-amber-200/60 select-none"
            title="CodeBeast Obsidian Dark Theme"
          >
            <Flame className="w-4 h-4 shrink-0 text-[#FF8C42]" />
            {!isCollapsed && <span className="font-mono text-[11px] font-bold text-[#D4BC9A]">Dark Mode</span>}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-amber-200/50 hover:text-[#D4BC9A] hover:bg-white/5 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronsLeft className={`w-4 h-4 shrink-0 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User Badge */}
        <div className={cn(
          "flex items-center p-2.5 rounded-xl bg-white/5 border border-[#E07A48]/20 hover:border-[#E07A48]/40 transition-all",
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-[#E07A48] to-[#D96B27] text-[#0D0805] flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(224,122,72,0.4)]">
              PS
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs text-[#D4BC9A] font-semibold">Priya Sharma</span>
                <span className="text-[10px] text-amber-200/50">Head AI Auditor · SIH'25</span>
              </div>
            )}
          </div>
          {!isCollapsed && <LogOut className="w-4 h-4 shrink-0 text-amber-200/50 cursor-pointer hover:text-red-400 transition-colors" />}
        </div>
      </div>
    </aside>
  );
}
