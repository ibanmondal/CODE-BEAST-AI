"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Database, Layout, Code2, Zap, Medal, Crown, Search, Award, Sparkles } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    fetch(`http://${host}:8000/api/v1/stats/leaderboard`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data?.leaderboard) setLeaderboard(data.leaderboard);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const renderBadges = (row: any) => {
    const badges = [];
    if (row.sec >= 90) badges.push({ name: 'Fort Knox', icon: Shield, color: 'text-[#FF8C42] bg-[#E07A48]/15 border-[#E07A48]/30' });
    if (row.arch >= 90) badges.push({ name: 'Clean Coder', icon: Layout, color: 'text-[#FF8C42] bg-[#E07A48]/15 border-[#E07A48]/30' });
    if (row.perf >= 90) badges.push({ name: 'Perf Master', icon: Zap, color: 'text-[#FF8C42] bg-[#E07A48]/15 border-[#E07A48]/30' });
    if (row.testing_score >= 90) badges.push({ name: 'Test Driven', icon: Code2, color: 'text-[#FF8C42] bg-[#E07A48]/15 border-[#E07A48]/30' });
    if (row.db_score >= 90) badges.push({ name: 'Data Wizard', icon: Database, color: 'text-[#FF8C42] bg-[#E07A48]/15 border-[#E07A48]/30' });
    
    if (badges.length === 0) return <span className="text-amber-200/40 text-xs italic font-mono">No Badges</span>;
    
    return (
      <div className="flex gap-2 flex-wrap">
        {badges.map((b, i) => (
          <div key={i} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${b.color} shadow-sm font-mono`}>
            <b.icon className="w-3 h-3" />
            {b.name}
          </div>
        ))}
      </div>
    );
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-[#FF8C42] bg-[#E07A48]/30 border-[#FF8C42] shadow-[0_0_20px_rgba(224,122,72,0.6)]';
    if (rank === 2) return 'text-[#D4BC9A] bg-[#221008] border-[#E07A48]/40';
    if (rank === 3) return 'text-amber-300 bg-[#1D0C06] border-[#E07A48]/30';
    return 'text-amber-200/50 bg-[#150904] border-[#E07A48]/15';
  };

  const filteredLeaderboard = leaderboard.filter((row) => 
    (row.repo && row.repo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (row.team && row.team.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* SECTION 1: Page Header & Global Search */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E07A48]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-3">
            <Trophy className="w-3.5 h-3.5" />
            <span>ConsJudge Verified Global Rankings</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
            GLOBAL <span className="text-gradient-copper">LEADERBOARD</span>
          </h1>
          <p className="text-amber-100/70 text-sm mt-2 max-w-xl font-normal leading-relaxed">
            Live rankings of evaluated hackathon codebases across 6 parallel LangGraph evaluations and dual-pass consensus supervisor verification.
          </p>
        </div>

        <div className="relative w-full md:w-88">
          <Search className="w-4 h-4 text-amber-200/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search repository or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0502] border border-[#E07A48]/30 rounded-2xl pl-11 pr-4 py-3 text-xs text-[#D4BC9A] placeholder-amber-200/30 outline-none focus:border-[#FF8C42] font-mono shadow-inner"
          />
        </div>
      </section>

      {/* SECTION 2: Top 3 Staggered Podium Pavilion */}
      {top3.length >= 3 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end pt-2">
          
          {/* Rank 2 - Runner Up (Left) */}
          <TiltCard variant="primary" className="p-7 text-center flex flex-col justify-between order-2 md:order-1 shadow-2xl h-[330px]">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#261208] border border-[#E07A48]/30 text-[#D4BC9A] flex items-center justify-center font-bold mb-3 shadow-inner">
                <Medal className="w-6 h-6 text-[#D4BC9A]" />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-200/50 uppercase tracking-widest block">RUNNER UP &bull; RANK #2</span>
              <h3 className="font-bold text-lg text-[#D4BC9A] font-mono mt-1 truncate">{top3[1].repo}</h3>
              <p className="text-xs text-amber-200/50 mt-0.5 font-normal">{top3[1].team}</p>
            </div>
            <div className="pt-4 border-t border-[#E07A48]/20">
              <span className="font-display text-4xl text-[#D4BC9A]">{top3[1].overall}</span>
              <span className="text-[10px] text-amber-200/40 block font-mono">/100 PTS</span>
            </div>
          </TiltCard>

          {/* Rank 1 - Champion (Center Prominent) */}
          <TiltCard variant="hero" className="p-8 sm:p-9 text-center flex flex-col justify-between order-1 md:order-2 shadow-[0_20px_50px_rgba(224,122,72,0.35)] relative h-[380px]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#E07A48] to-[#FF8C42] text-[#0D0805] text-[10px] font-extrabold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5 font-mono">
              <Crown className="w-3.5 h-3.5" /> GRAND CHAMPION
            </div>
            <div className="pt-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#E07A48] to-[#FF8C42] text-[#0D0805] flex items-center justify-center font-black mb-3 shadow-[0_0_25px_rgba(224,122,72,0.6)]">
                <Crown className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-mono font-extrabold text-[#FF8C42] uppercase tracking-widest block">GRAND WINNER &bull; RANK #1</span>
              <h3 className="font-bold text-xl sm:text-2xl text-[#D4BC9A] font-mono mt-1 truncate">{top3[0].repo}</h3>
              <p className="text-xs text-amber-200/60 font-semibold mt-0.5">{top3[0].team}</p>
            </div>
            <div className="pt-4 border-t border-[#E07A48]/30">
              <span className="font-display text-5xl sm:text-6xl text-gradient-copper">{top3[0].overall}</span>
              <span className="text-[10px] text-[#FF8C42] block font-mono font-bold">/100 PTS</span>
            </div>
          </TiltCard>

          {/* Rank 3 - 2nd Runner Up (Right) */}
          <TiltCard variant="primary" className="p-7 text-center flex flex-col justify-between order-3 shadow-2xl h-[330px]">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#261208] border border-[#E07A48]/30 text-amber-300 flex items-center justify-center font-bold mb-3 shadow-inner">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-200/50 uppercase tracking-widest block">2ND RUNNER UP &bull; RANK #3</span>
              <h3 className="font-bold text-lg text-[#D4BC9A] font-mono mt-1 truncate">{top3[2].repo}</h3>
              <p className="text-xs text-amber-200/50 mt-0.5 font-normal">{top3[2].team}</p>
            </div>
            <div className="pt-4 border-t border-[#E07A48]/20">
              <span className="font-display text-4xl text-[#D4BC9A]">{top3[2].overall}</span>
              <span className="text-[10px] text-amber-200/40 block font-mono">/100 PTS</span>
            </div>
          </TiltCard>

        </section>
      )}

      {/* SECTION 3: Main Standings Matrix Table */}
      <section>
        <TiltCard variant="secondary" className="overflow-hidden shadow-2xl p-0">
          <div className="p-6 sm:p-7 border-b border-[#E07A48]/15 flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] tracking-wider uppercase font-normal">Official Standings</h3>
              <p className="text-xs text-amber-200/50 mt-0.5 font-normal">Ranked by synthesized ConsJudge consensus telemetry</p>
            </div>
            <span className="text-xs font-mono text-amber-200/50 bg-[#0E0602] px-3 py-1.5 rounded-xl border border-[#E07A48]/20">
              {filteredLeaderboard.length} Submissions
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-amber-200/50 flex flex-col items-center">
              <div className="w-10 h-10 border-2 border-[#E07A48]/30 border-t-[#FF8C42] rounded-full animate-spin mb-4" />
              <span className="font-mono text-sm">Loading Global Leaderboard...</span>
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="p-16 text-center text-amber-200/50 font-mono text-sm">
              No evaluated repositories match your search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#120703] border-b border-[#E07A48]/20">
                    <th className="p-5 text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider w-24 text-center">Rank</th>
                    <th className="p-5 text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider">Repository / Team</th>
                    <th className="p-5 text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider text-center">Score</th>
                    <th className="p-5 text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider">Special Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E07A48]/10 text-xs">
                  {filteredLeaderboard.map((row) => (
                    <tr key={row.rank} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5 text-center">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full border text-sm font-bold font-mono ${getRankStyle(row.rank)}`}>
                          {row.rank}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-[#D4BC9A] text-sm sm:text-base font-mono group-hover:text-[#FF8C42] transition-colors">{row.repo}</div>
                        <div className="text-xs text-amber-200/50 mt-1 font-normal">Team: <span className="text-[#FF8C42] font-semibold">{row.team}</span></div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="font-display text-3xl sm:text-4xl text-[#D4BC9A] text-gradient-copper">{row.overall}</span>
                        <span className="text-[9px] text-amber-200/40 block font-mono">pts</span>
                      </td>
                      <td className="p-5">
                        {renderBadges(row)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TiltCard>
      </section>

    </div>
  );
}
