"use client";
import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';

export default function RankingsPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://' + window.location.hostname + ':8000/api/v1/stats/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(data.leaderboard || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E07A48]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>Standings Matrix</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
            LEADERBOARD & <span className="text-gradient-copper">RANKINGS</span>
          </h1>
          <p className="text-amber-100/70 text-sm mt-2 max-w-xl font-normal leading-relaxed">
            Live standings across every submitted repository evaluated by CodeBeast AI multi-agent swarm.
          </p>
        </div>
      </div>

      {/* Top 3 Podiums */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end pt-2">
          
          {/* Rank 2 */}
          <TiltCard variant="primary" className="p-7 text-center flex flex-col justify-between order-2 md:order-1 shadow-2xl h-[330px]">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#261208] border border-[#E07A48]/30 text-[#D4BC9A] flex items-center justify-center font-bold mb-3 shadow-inner">
                <Medal className="w-6 h-6 text-[#D4BC9A]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-200/50 uppercase tracking-widest block">RANK #2 &bull; RUNNER UP</span>
              <h3 className="font-bold text-lg text-[#D4BC9A] font-mono mt-1 truncate">{leaderboard[1]?.repo}</h3>
              <p className="text-xs text-amber-200/50 mt-0.5 font-normal">{leaderboard[1]?.team}</p>
            </div>
            <div className="pt-4 border-t border-[#E07A48]/20">
              <span className="font-display text-4xl text-[#D4BC9A]">{leaderboard[1]?.overall}</span>
              <span className="text-[10px] text-amber-200/40 block font-mono">/100 PTS</span>
            </div>
          </TiltCard>

          {/* Rank 1 - Champion */}
          <TiltCard variant="hero" className="p-8 sm:p-9 text-center flex flex-col justify-between order-1 md:order-2 shadow-[0_20px_50px_rgba(224,122,72,0.35)] relative h-[380px]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#E07A48] to-[#FF8C42] text-[#0D0805] text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5 font-mono">
              <Crown className="w-3.5 h-3.5" /> GRAND CHAMPION
            </div>
            <div className="pt-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#E07A48] to-[#FF8C42] text-[#0D0805] flex items-center justify-center font-black mb-3 shadow-[0_0_25px_rgba(224,122,72,0.6)]">
                <Crown className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-mono font-extrabold text-[#FF8C42] uppercase tracking-widest block">RANK #1 &bull; GRAND WINNER</span>
              <h3 className="font-bold text-xl sm:text-2xl text-[#D4BC9A] font-mono mt-1 truncate">{leaderboard[0]?.repo}</h3>
              <p className="text-xs text-amber-200/60 font-semibold mt-0.5">{leaderboard[0]?.team}</p>
            </div>
            <div className="pt-4 border-t border-[#E07A48]/30">
              <span className="font-display text-5xl sm:text-6xl text-gradient-copper">{leaderboard[0]?.overall}</span>
              <span className="text-[10px] text-[#FF8C42] block font-mono font-bold">/100 PTS</span>
            </div>
          </TiltCard>

          {/* Rank 3 */}
          <TiltCard variant="primary" className="p-7 text-center flex flex-col justify-between order-3 shadow-2xl h-[330px]">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#261208] border border-[#E07A48]/30 text-amber-300 flex items-center justify-center font-bold mb-3 shadow-inner">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-200/50 uppercase tracking-widest block">RANK #3 &bull; 2ND RUNNER UP</span>
              <h3 className="font-bold text-lg text-[#D4BC9A] font-mono mt-1 truncate">{leaderboard[2]?.repo}</h3>
              <p className="text-xs text-amber-200/50 mt-0.5 font-normal">{leaderboard[2]?.team}</p>
            </div>
            <div className="pt-4 border-t border-[#E07A48]/20">
              <span className="font-display text-4xl text-[#D4BC9A]">{leaderboard[2]?.overall}</span>
              <span className="text-[10px] text-amber-200/40 block font-mono">/100 PTS</span>
            </div>
          </TiltCard>

        </div>
      )}
      
      {/* Table */}
      <TiltCard variant="secondary" className="overflow-hidden shadow-2xl p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#120703] border-b border-[#E07A48]/20">
                <th className="p-5 text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider w-24 text-center">Rank</th>
                <th className="p-5 text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider">Team / Repository</th>
                <th className="p-5 text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider text-center">Overall Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E07A48]/10 text-xs">
              {leaderboard.map((row: any) => (
                <tr key={row.rank} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5 text-center font-mono font-bold text-amber-200/60">{row.rank}</td>
                  <td className="p-5">
                    <div className="font-bold text-sm sm:text-base text-[#D4BC9A] font-mono group-hover:text-[#FF8C42] transition-colors">{row.repo}</div>
                    <div className="text-xs text-amber-200/50 mt-1 font-normal">{row.team}</div>
                  </td>
                  <td className="p-5 text-center font-display text-3xl sm:text-4xl text-gradient-copper">{row.overall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TiltCard>

    </div>
  );
}
