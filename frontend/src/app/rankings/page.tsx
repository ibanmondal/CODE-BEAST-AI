"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight, Sparkles, Crown, Medal, Award } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';
import { apiUrl } from '@/lib/api';

export default function RankingsPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch(apiUrl('/api/v1/stats/leaderboard'))
      .then(res => res.json())
      .then(data => setLeaderboard(data.leaderboard || []))
      .catch(() => {});
  }, []);

  const getRankBadgeClass = (rank: number) => {
    if (rank === 1) return 'podium-rank-gold';
    if (rank === 2) return 'podium-rank-silver';
    if (rank === 3) return 'podium-rank-bronze';
    return 'bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30';
  };

  return (
    <div className="space-y-8 pb-12 text-white">
      <ScrollReveal direction="down" distance={15}>
        <div className="flex items-center justify-between pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Consensus Podiums
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Cohort Standings &amp; Podiums
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
          
          {/* Rank 2 (Left - Silver) */}
          <StaggerItem className="order-2 md:order-1">
            <div className="podium-card-silver rounded-3xl p-6 text-center space-y-3 relative group">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 podium-pill-silver text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                <Medal className="w-3.5 h-3.5 text-slate-900" />
                <span>Runner Up</span>
              </div>
              <div className="w-14 h-14 mx-auto rounded-2xl podium-rank-silver flex items-center justify-center font-black text-xl shadow-md relative">
                <span>2</span>
                <Medal className="w-3.5 h-3.5 text-slate-800 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block">2nd Place</span>
                <h3 className="font-mono font-bold text-base text-white truncate mt-0.5">{leaderboard[1]?.repo}</h3>
              </div>
              <div className="pt-3 border-t border-slate-300/20">
                <span className="text-3xl font-black text-slate-200 font-mono drop-shadow-[0_2px_8px_rgba(203,213,225,0.3)]">{leaderboard[1]?.overall}/100</span>
              </div>
            </div>
          </StaggerItem>

          {/* Rank 1 (Center - Gold) */}
          <StaggerItem className="order-1 md:order-2">
            <div className="podium-card-gold rounded-3xl p-8 text-center space-y-4 relative group">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 podium-pill-gold text-[11px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                <span>Grand Champion</span>
              </div>
              <div className="w-16 h-16 mx-auto rounded-3xl podium-rank-gold flex items-center justify-center font-black text-2xl shadow-xl relative mt-1">
                <span>1</span>
                <Crown className="w-4 h-4 text-amber-950 absolute -top-1.5 -right-1 fill-amber-950" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Cohort Leader</span>
                <h3 className="font-mono font-bold text-lg sm:text-xl text-white truncate mt-0.5">{leaderboard[0]?.repo}</h3>
              </div>
              <div className="pt-3 border-t border-amber-400/20">
                <span className="text-4xl font-black text-amber-400 font-mono drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]">{leaderboard[0]?.overall}/100</span>
              </div>
            </div>
          </StaggerItem>

          {/* Rank 3 (Right - Bronze) */}
          <StaggerItem className="order-3">
            <div className="podium-card-bronze rounded-3xl p-6 text-center space-y-3 relative group">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 podium-pill-bronze text-[10px] font-black uppercase tracking-wider rounded-full shadow-md">
                <Award className="w-3.5 h-3.5 text-white" />
                <span>2nd Runner Up</span>
              </div>
              <div className="w-14 h-14 mx-auto rounded-2xl podium-rank-bronze flex items-center justify-center font-black text-xl shadow-md relative">
                <span>3</span>
                <Award className="w-3.5 h-3.5 text-amber-100 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">3rd Place</span>
                <h3 className="font-mono font-bold text-base text-white truncate mt-0.5">{leaderboard[2]?.repo}</h3>
              </div>
              <div className="pt-3 border-t border-amber-700/30">
                <span className="text-3xl font-black text-amber-500 font-mono drop-shadow-[0_2px_8px_rgba(180,83,9,0.3)]">{leaderboard[2]?.overall}/100</span>
              </div>
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
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-xs shadow-xs ${getRankBadgeClass(i + 1)}`}>{i + 1}</span>
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
