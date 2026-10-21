"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Swords,
  UploadCloud,
  Activity,
  BarChart2,
  Trophy,
  FileText,
  Users,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuSections = [
    {
      title: "PLATFORM",
      items: [
        { name: "Overview", path: "/", icon: Home },
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Repository Analysis", path: "/analysis", icon: Search },
      ],
    },
    {
      title: "EVALUATION",
      items: [
        { name: "Repo Duel", path: "/duel", icon: Swords },
        { name: "Bulk Analysis", path: "/upload", icon: UploadCloud },
        { name: "Human + AI Hybrid", path: "/human-ai", icon: Scale },
      ],
    },
    {
      title: "MONITORING",
      items: [
        { name: "Live Jobs", path: "/jobs", icon: Activity },
        { name: "Analytics", path: "/analytics", icon: BarChart2 },
      ],
    },
    {
      title: "RECORDS & GOVERNANCE",
      items: [
        { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
        { name: "Reports", path: "/reports", icon: FileText },
        { name: "Judges", path: "/judges", icon: Users },
        { name: "Our Team", path: "/team", icon: UserCheck },
      ],
    },
    {
      title: "PREFERENCES",
      items: [
        { name: "Settings", path: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-[#040914]/95 backdrop-blur-xl border-r border-[#89CFF0]/20 flex flex-col justify-between shrink-0 sticky top-0 transition-all duration-200 z-40 select-none shadow-[4px_0_30px_rgba(2,6,18,0.7)]",
        isCollapsed ? "w-18" : "w-64"
      )}
    >
      {/* Top Header / Brand Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#89CFF0]/20 bg-[#040914]/80 backdrop-blur-md">
        <Link href="/" className="flex flex-col min-w-0 overflow-hidden group">
          {!isCollapsed ? (
            <div className="flex flex-col">
              <span className="font-heading font-bold text-[16px] tracking-wider text-white uppercase leading-tight group-hover:text-[#89CFF0] transition-colors">
                CODE <span className="text-[#89CFF0]">BEAST</span>
              </span>
              <span className="text-[8.5px] text-[#8EA6C8] font-mono tracking-wider uppercase mt-0.5 whitespace-nowrap">
                AI-POWERED REPOSITORY INTELLIGENCE
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#08132B] border border-[#89CFF0]/40 text-[#89CFF0] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              CB
            </div>
          )}
        </Link>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 text-[#8EA6C8] hover:text-[#89CFF0] hover:bg-[#0B1A3A]/70 rounded-lg transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold tracking-widest text-[#8EA6C8] uppercase">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.path ||
                  (item.path !== "/" && pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-xs font-bold transition-all group relative rounded-lg",
                      isActive
                        ? "bg-[#89CFF0]/15 text-white font-bold border-l-[3px] border-l-[#89CFF0] border border-[#89CFF0]/30 shadow-[0_4px_16px_rgba(137,207,240,0.15)]"
                        : "text-[#8EA6C8] hover:bg-[#89CFF0]/10 hover:text-white"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        isActive
                          ? "text-[#89CFF0]"
                          : "text-[#8EA6C8] group-hover:text-[#89CFF0]"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                    {isActive && !isCollapsed && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#89CFF0] ml-auto shrink-0 shadow-[0_0_8px_#89CFF0]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User / Workspace Footer */}
      <div className="p-3 border-t border-[#89CFF0]/20 bg-[#040914]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5 p-2 bg-[#08132B]/80 backdrop-blur-md border border-[#89CFF0]/30 rounded-xl shadow-[0_4px_12px_rgba(2,6,18,0.5)]">
          <div className="w-7 h-7 rounded-lg bg-[#08132B] border border-[#89CFF0]/40 text-[#89CFF0] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            CB
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">
                Enterprise Node
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#89CFF0] shadow-[0_0_6px_#89CFF0] shrink-0" />
                <span className="text-[10px] text-[#8EA6C8] truncate">ConsJudge v2.5</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
