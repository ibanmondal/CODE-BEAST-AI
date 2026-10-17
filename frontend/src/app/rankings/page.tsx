"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';

export default function RankingsPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    fetch(`http://${host}:8000/api/v1/stats/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8 pb-12 text-white">
      <ScrollReveal direction="down" distance={15}>
        <div className="flex items-center justify-between pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <Trophy className="w-3.5 h-3.5" />
              Consensus Podiums
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Cohort Standings & Podiums
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
              Global evaluation standings across evaluated open-source and hackathon repositories.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 rounded-full shadow-xs hover:shadow-md transition-all"
          >
            <span>Full Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </ScrollReveal>

      {leaderboard.length >= 3 && (
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          <StaggerItem className="order-2 md:order-1">
            <div className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)] text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] flex items-center justify-center font-bold text-base shadow-xs">
                2
              </div>
              <span className="text-[10px] font-bold text-[#8EA6C8] uppercase tracking-wider block">Runner Up</span>
              <h3 className="font-mono font-bold text-base text-white truncate">{leaderboard[1]?.repo}</h3>
              <span className="text-3xl font-bold text-white font-mono block">{leaderboard[1]?.overall}/100</span>
            </div>
          </StaggerItem>

          <StaggerItem className="order-1 md:order-2">
            <div className="liquid-glass-card rounded-3xl p-8 border-2 border-[#89CFF0]/40 shadow-[0_20px_50px_rgba(137,207,240,0.18)] text-center space-y-4 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 liquid-btn-primary text-[#040914] text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md">
                Grand Champion
              </div>
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#08132B] via-[#0E2248] to-[#89CFF0] text-white flex items-center justify-center font-bold text-2xl shadow-lg border border-[#89CFF0]/40">
                1
              </div>
              <span className="text-[10px] font-bold text-[#89CFF0] uppercase tracking-wider block">Cohort Leader</span>
              <h3 className="font-mono font-bold text-lg sm:text-xl text-white truncate">{leaderboard[0]?.repo}</h3>
              <span className="text-4xl font-bold text-[#89CFF0] font-mono block">{leaderboard[0]?.overall}/100</span>
            </div>
          </StaggerItem>

          <StaggerItem className="order-3">
            <div className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)] text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#08132B] border border-[#89CFF0]/30 text-[#8EA6C8] flex items-center justify-center font-bold text-base shadow-xs">
                3
              </div>
              <span className="text-[10px] font-bold text-[#8EA6C8] uppercase tracking-wider block">2nd Runner Up</span>
              <h3 className="font-mono font-bold text-base text-white truncate">{leaderboard[2]?.repo}</h3>
              <span className="text-3xl font-bold text-white font-mono block">{leaderboard[2]?.overall}/100</span>
            </div>
          </StaggerItem>
        </StaggerContainer>
      )}

      <ScrollReveal direction="up" distance={20} delay={0.15}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] space-y-4">
          <h3 className="text-sm font-bold text-white">Top 10 Benchmark Cohort</h3>
          <div className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden shadow-xs divide-y divide-[#89CFF0]/15">
            {leaderboard.slice(0, 10).map((r, i) => (
              <div key={i} className="py-3.5 flex items-center justify-between text-xs hover:bg-white/5 px-4 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 flex items-center justify-center font-mono font-bold text-xs shadow-xs">{i + 1}</span>
                  <span className="font-mono font-semibold text-white">{r.repo}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-white font-mono">{r.overall}/100</span>
                  <Link href={`/analysis?repo=${encodeURIComponent(r.repo)}`} className="text-xs text-[#89CFF0] font-bold hover:underline">
                    Report &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
