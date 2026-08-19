"use client";
import React, { useState } from 'react';
import { Cpu, ShieldCheck, Zap, Layers, Database, TestTube, Sparkles, Terminal } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';

export function AiCore3D() {
  const [activeStage, setActiveStage] = useState<number>(2);

  const stages = [
    { label: "CODE", desc: "Raw Git repository ingestion & AST tree parsing" },
    { label: "ANALYSIS", desc: "6-Agent parallel evaluation (Security, Architecture, Performance...)" },
    { label: "AI CORE", desc: "ConsJudge Dual-Pass supervisor synthesis (Gemini + Llama 3.3)" },
    { label: "INTELLIGENCE", desc: "Executive verdict, confidence badge & AutoReview git diff patches" }
  ];

  return (
    <TiltCard variant="hero" className="w-full h-full min-h-[380px] p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden">
      
      {/* Background Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#E07A48]/20 blur-3xl pointer-events-none animate-pulse-copper" />

      {/* Header Pipeline Tracker */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#E07A48]/20 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF8C42] animate-ping" />
          <span className="font-display tracking-wider text-[#D4BC9A] text-lg uppercase font-normal">
            AI INTELLIGENCE CORE &bull; LIVE ENGINE
          </span>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#E07A48]/20 text-[#FF8C42] border border-[#E07A48]/30">
          CODE &rarr; ANALYSIS &rarr; AI &rarr; INTELLIGENCE
        </span>
      </div>

      {/* 3D AI Core Canvas Container */}
      <div className="relative flex-1 flex items-center justify-center py-6">
        
        {/* Orbital Ring 1 (Outer Slow Clockwise) */}
        <div className="absolute w-72 h-72 rounded-full border border-dashed border-[#E07A48]/30 animate-[spin_20s_linear_infinite]" />
        
        {/* Orbital Ring 2 (Inner Fast Counter-Clockwise) */}
        <div className="absolute w-56 h-56 rounded-full border border-[#FF8C42]/40 animate-[spin_12s_linear_infinite_reverse] shadow-[0_0_20px_rgba(224,122,72,0.2)]" />
        
        {/* Orbital Ring 3 (Tilted Ring) */}
        <div className="absolute w-64 h-24 rounded-full border border-[#FFB085]/30 transform -rotate-45 animate-pulse" />

        {/* Orbiting Satellite Data Particles */}
        <div className="absolute w-64 h-64 animate-[spin_8s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#FF8C42] shadow-[0_0_15px_#FF8C42]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#FFB085] shadow-[0_0_10px_#FFB085]" />
        </div>

        {/* Glowing Central AI Core Sphere */}
        <div className="relative z-20 flex flex-col items-center justify-center cursor-pointer group">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#E07A48] via-[#FF8C42] to-[#FFB085] p-1 shadow-[0_0_60px_rgba(224,122,72,0.7)] group-hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1C0D06] to-[#0D0502] flex flex-col items-center justify-center text-center p-2 border border-[#FF8C42]/50 shadow-inner">
              <Cpu className="w-7 h-7 text-[#FF8C42] mb-1 animate-pulse" />
              <span className="font-display text-xl tracking-wider text-[#D4BC9A]">CORE v2</span>
              <span className="text-[9px] font-mono text-amber-200/60 uppercase">6-Agent Swarm</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Stage Selectors */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#E07A48]/20">
        {stages.map((stg, idx) => (
          <button
            key={stg.label}
            onClick={() => setActiveStage(idx)}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              activeStage === idx
                ? 'bg-[#28130B] border-[#FF8C42] text-[#D4BC9A] shadow-[0_0_15px_rgba(224,122,72,0.3)]'
                : 'bg-[#150A05]/80 border-[#E07A48]/20 text-amber-100/50 hover:text-amber-100 hover:border-[#E07A48]/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-base tracking-wider">{stg.label}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#E07A48]/20 text-[#FF8C42]">
                0{idx + 1}
              </span>
            </div>
            <p className="text-[10px] text-amber-200/50 truncate mt-0.5 font-normal">
              {stg.desc}
            </p>
          </button>
        ))}
      </div>

    </TiltCard>
  );
}
