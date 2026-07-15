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
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const toggleLightMode = () => {
    const nextMode = !isLightMode;
    setIsLightMode(nextMode);
    if (nextMode) {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
    } else {
      document.documentElement.style.filter = 'none';
    }
  };

  const routes = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Repository Analysis", path: "/analysis", icon: Search },
    { name: "Bulk CSV Upload", path: "/upload", icon: UploadCloud },
    { name: "Live Animation", path: "/live", icon: PlayCircle },
    { name: "Live Jobs", path: "/jobs", icon: Activity },
    { name: "Analytics", path: "/analytics", icon: BarChart2 },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Reports", path: "/reports", icon: FileText },
    { name: "Judges", path: "/judges", icon: Users },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Help", path: "/help", icon: HelpCircle },
  ];

  return (
    <div className={`h-screen bg-[#0A0E17] border-r border-gray-800 flex flex-col text-gray-400 sticky top-0 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
          CB
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-white font-bold tracking-tight text-lg leading-tight">CodeBeast</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Judge Console</p>
          </div>
        )}
      </div>

      <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {routes.map((route) => {
          const isActive = pathname === route.path || (pathname === '/' && route.path === '/dashboard');
          return (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#141C2F] text-blue-400 border border-blue-900/50"
                  : "hover:bg-[#141C2F] hover:text-white"
              )}
            >
              <route.icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{route.name}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-800 space-y-1">
        <button 
          onClick={toggleLightMode}
          className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm hover:text-white transition-colors"
        >
          <Sun className="w-4 h-4 shrink-0" />
          {!isCollapsed && (isLightMode ? 'Dark mode' : 'Light mode')}
        </button>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm hover:text-white transition-colors"
        >
          <ChevronsLeft className={`w-4 h-4 shrink-0 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          {!isCollapsed && 'Collapse'}
        </button>
        
        <div className={`mt-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-lg bg-[#141C2F]`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center text-xs font-bold">
              PS
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm text-white font-medium">Priya Sharma</span>
                <span className="text-[10px]">Head Judge · SIH'25</span>
              </div>
            )}
          </div>
          {!isCollapsed && <LogOut className="w-4 h-4 shrink-0 cursor-pointer hover:text-white" />}
        </div>
      </div>
    </div>
  );
}
