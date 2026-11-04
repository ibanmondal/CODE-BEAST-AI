"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Swords,
  Award,
  Menu,
  X,
  Trophy,
  LayoutDashboard,
  Activity,
  BarChart2,
  FileText,
  UserCheck,
  Settings,
  UploadCloud,
  Scale,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function MobileNav({ isOpen, onOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Bottom Navigation primary quick-access items
  const bottomNavItems = [
    { name: "Overview", path: "/", icon: Home },
    { name: "Analysis", path: "/analysis", icon: Search },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Trophies", path: "/judges", icon: Award },
  ];

  // Full Drawer Sections matching Desktop Sidebar
  const drawerSections = [
    {
      title: "PLATFORM",
      items: [
        { name: "Overview", path: "/", icon: Home, desc: "Platform Capabilities & Metrics" },
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, desc: "Executive KPI Telemetry" },
        { name: "Repository Analysis", path: "/analysis", icon: Search, desc: "Multi-Agent Repository Audit" },
      ],
    },
    {
      title: "EVALUATION",
      items: [
        { name: "Repo Duel", path: "/duel", icon: Swords, desc: "A/B Benchmark Arena" },
        { name: "Bulk Analysis", path: "/upload", icon: UploadCloud, desc: "5-at-a-time Batch Ingest" },
        { name: "Human + AI Hybrid", path: "/human-ai", icon: Scale, desc: "Faculty & AI Scoring" },
      ],
    },
    {
      title: "MONITORING",
      items: [
        { name: "Live Jobs", path: "/jobs", icon: Activity, desc: "Background Worker Queue" },
        { name: "Analytics", path: "/analytics", icon: BarChart2, desc: "Cluster Performance Data" },
      ],
    },
    {
      title: "RECORDS & GOVERNANCE",
      items: [
        { name: "Leaderboard", path: "/leaderboard", icon: Trophy, desc: "Global All-Time Rankings" },
        { name: "Reports Archive", path: "/reports", icon: FileText, desc: "Verified Audit History" },
        { name: "Trophy Hall", path: "/judges", icon: Award, desc: "Official Academic Certificates" },
        { name: "Our Team", path: "/team", icon: UserCheck, desc: "System Engineering Laureates" },
      ],
    },
    {
      title: "PREFERENCES",
      items: [
        { name: "Settings", path: "/settings", icon: Settings, desc: "API Keys & Environment" },
      ],
    },
  ];

  return (
    <>
      {/* =========================================================================
          1. MOBILE BOTTOM APP BAR (Fixed on Mobile/Tablet < lg)
          ========================================================================= */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-[#040914]/95 backdrop-blur-2xl border-t border-[#89CFF0]/25 z-50 flex items-center justify-around px-2 shadow-[0_-8px_32px_rgba(2,6,18,0.85)] select-none"
      >
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 min-h-[48px] touch-manipulation relative",
                isActive ? "text-[#89CFF0]" : "text-[#8EA6C8] hover:text-white"
              )}
            >
              <div className="relative">
                <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110 text-[#89CFF0]")} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#89CFF0] shadow-[0_0_8px_#89CFF0]" />
                )}
              </div>
              <span className={cn(
                "text-[10px] tracking-tight mt-1 transition-colors leading-none font-medium",
                isActive ? "font-bold text-[#89CFF0]" : "text-[#8EA6C8]"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* 5th Button: Open Mobile Drawer with All 14 Routes */}
        <button
          onClick={onOpen}
          type="button"
          aria-label="Open Navigation Menu"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 min-h-[48px] touch-manipulation cursor-pointer",
            isOpen ? "text-[#89CFF0]" : "text-[#8EA6C8] hover:text-white"
          )}
        >
          <div className="relative">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-1 leading-none font-medium">
            Menu
          </span>
        </button>
      </nav>

      {/* =========================================================================
          2. SLIDE-OUT MOBILE DRAWER OVERLAY & PANEL
          ========================================================================= */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Drawer"
        >
          {/* Backdrop Blur Layer */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Drawer Sidebar Content */}
          <div 
            className="relative w-[85vw] max-w-sm h-full bg-[#040914] border-r border-[#89CFF0]/25 shadow-2xl flex flex-col justify-between z-10 overflow-hidden animate-in slide-in-from-left duration-300 ease-out"
          >
            {/* Drawer Header */}
            <div className="h-16 px-4 border-b border-[#89CFF0]/20 flex items-center justify-between bg-[#08132B]/80 backdrop-blur-md shrink-0">
              <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#08132B] border border-[#89CFF0]/40 text-[#89CFF0] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  CB
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-sm tracking-wider text-white uppercase leading-tight">
                    CODE <span className="text-[#89CFF0]">BEAST</span>
                  </span>
                  <span className="text-[8px] text-[#8EA6C8] font-mono tracking-wider uppercase">
                    AI REPOSITORY INTELLIGENCE
                  </span>
                </div>
              </Link>

              <button
                onClick={onClose}
                type="button"
                aria-label="Close Navigation Menu"
                className="p-2 rounded-lg text-[#8EA6C8] hover:text-white hover:bg-[#0B1A3A] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Pill */}
            <div className="px-4 py-2 bg-[#08132B]/40 border-b border-[#89CFF0]/15 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Cluster Operational
              </span>
              <span className="font-mono text-[#8EA6C8]">ConsJudge v2.5</span>
            </div>

            {/* Navigation Scroll Area */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
              {drawerSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1.5">
                  <h3 className="px-3 text-[10px] font-bold tracking-widest text-[#8EA6C8] uppercase font-mono">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive =
                        pathname === item.path ||
                        (item.path !== "/" && pathname.startsWith(item.path));

                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={onClose}
                          className={cn(
                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] touch-manipulation",
                            isActive
                              ? "bg-[#89CFF0]/15 text-white font-bold border border-[#89CFF0]/40 shadow-[0_4px_16px_rgba(137,207,240,0.15)]"
                              : "text-[#8EA6C8] hover:bg-[#89CFF0]/10 hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <item.icon
                              className={cn(
                                "w-4 h-4 shrink-0",
                                isActive ? "text-[#89CFF0]" : "text-[#8EA6C8]"
                              )}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="truncate">{item.name}</span>
                              <span className="text-[10px] text-[#6C85AA] font-normal truncate leading-tight">
                                {item.desc}
                              </span>
                            </div>
                          </div>
                          {isActive ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#89CFF0] ml-2 shrink-0 shadow-[0_0_8px_#89CFF0]" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-[#6C85AA] opacity-50 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer with Academic Institution Notice */}
            <div className="p-4 border-t border-[#89CFF0]/20 bg-[#08132B]/90 backdrop-blur-md shrink-0 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#89CFF0] shrink-0" />
                <span className="text-[11px] font-mono text-white font-semibold truncate">
                  HKBKCE &bull; Department of AI &amp; ML
                </span>
              </div>
              <p className="text-[10px] text-[#8EA6C8] leading-tight">
                National Capstone Hackathon &amp; Autonomous Multi-Agent Defense Core.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

