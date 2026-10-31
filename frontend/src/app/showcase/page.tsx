"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles, Layers, ShieldCheck, Zap } from "lucide-react";

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col">
      {/* Top Banner Navigation */}
      <div className="bg-[#0B1120]/90 border-b border-cyan-500/20 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-mono font-semibold text-cyan-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            SHOWCASE & PRODUCT PORTFOLIO
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/showcase/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors"
          >
            Open Standalone Window <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/"
            className="text-xs font-bold text-slate-900 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 px-4 py-1.5 rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Launch Evaluator
          </Link>
        </div>
      </div>

      {/* Embedded Showcase Viewport */}
      <div className="flex-1 w-full relative">
        <iframe
          src="/showcase/index.html"
          title="Code Beast AI Showcase"
          className="w-full h-[calc(100vh-53px)] border-0"
        />
      </div>
    </div>
  );
}
