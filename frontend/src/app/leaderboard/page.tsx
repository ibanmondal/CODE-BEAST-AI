"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Crown, 
  Search, 
  ArrowRight,
  Sparkles,
  Medal
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';

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
    if (row.sec >= 90) badges.push({ name: 'Fort Knox', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-400/30' });
    if (row.arch >= 90) badges.push({ name: 'Clean Architecture', color: 'bg-[#89CFF0]/15 text-[#89CFF0] border-[#89CFF0]/40' });
    if (row.perf >= 90) badges.push({ name: 'High Throughput', color: 'bg-[#BAE6FD]/15 text-[#BAE6FD] border-[#BAE6FD]/40' });
    if (row.testing_score >= 90) badges.push({ name: 'Test Driven', color: 'bg-[#89CFF0]/20 text-white border-[#89CFF0]/50' });
    if (row.db_score >= 90) badges.push({ name: 'Schema Master', color: 'bg-[#89CFF0]/15 text-[#89CFF0] border-[#89CFF0]/40' });
    
    if (badges.length === 0) return <span className="text-[#4A6B94] text-xs italic">Standard Evaluation</span>;
    
    return (
      <div className="flex gap-1.5 flex-wrap">
        {badges.map((b, i) => (
          <span key={i} className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold rounded-full border shadow-xs ${b.color}`}>
            {b.name}
          </span>
        ))}
      </div>
    );
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] text-[#040914] font-bold shadow-xs';
    if (rank === 2) return 'bg-[#08132B] text-white font-bold border border-[#89CFF0]/25 shadow-xs';
    if (rank === 3) return 'bg-[#08132B] text-[#8EA6C8] font-bold border border-[#89CFF0]/20 shadow-xs';
    return 'bg-[#08132B] text-[#89CFF0] font-bold border border-[#89CFF0]/30';
  };

  const filteredLeaderboard = leaderboard.filter((row) => 
    (row.repo && row.repo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (row.team && row.team.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Header & Search Bar */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <Trophy className="w-3.5 h-3.5" />
              Consensus Verified Standings
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Global Benchmark Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
              Standings across all evaluated repositories verified by ConsJudge multi-pass consensus.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 rounded-full focus-within:border-[#89CFF0] focus-within:ring-2 focus-within:ring-[#89CFF0]/20 transition-all shadow-inner">
              <Search className="w-4 h-4 text-[#8EA6C8] shrink-0" />
              <input 
                type="text"
                placeholder="Search repository or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-white placeholder-[#8EA6C8] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. Top 3 Podium Cards with Liquid Glass */}
      {top3.length >= 3 && (
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          
          {/* Rank 2 (Left) */}
          <StaggerItem className="order-2 md:order-1">
            <div className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)] text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#08132B] border border-[#89CFF0]/30 text-white flex items-center justify-center font-bold text-base shadow-xs">
                2
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8EA6C8] uppercase tracking-wider block">Runner Up</span>
                <h3 className="font-mono font-bold text-base text-white truncate mt-0.5">{top3[1].repo}</h3>
                <span className="text-xs text-[#89CFF0] font-medium">{top3[1].team || "Team"}</span>
              </div>
              <div className="pt-3 border-t border-[#89CFF0]/20">
                <span className="text-3xl font-bold text-white font-mono">{top3[1].overall}</span>
                <span className="text-xs text-[#89CFF0]"> / 100</span>
              </div>
            </div>
          </StaggerItem>

          {/* Rank 1 (Center Prominent Liquid Glass Champion) */}
          <StaggerItem className="order-1 md:order-2">
            <div className="liquid-glass-card rounded-3xl p-8 border-2 border-[#89CFF0]/40 shadow-[0_20px_50px_rgba(2,6,18,0.9)] text-center space-y-4 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 liquid-btn-primary text-[#040914] text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md">
                Grand Champion
              </div>
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] flex items-center justify-center font-bold text-2xl shadow-lg shadow-[rgba(137,207,240,0.35)]">
                1
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#89CFF0] uppercase tracking-wider block">Cohort Leader</span>
                <h3 className="font-mono font-bold text-lg sm:text-xl text-white truncate mt-0.5">{top3[0].repo}</h3>
                <span className="text-xs text-[#89CFF0] font-semibold">{top3[0].team || "Team"}</span>
              </div>
              <div className="pt-3 border-t border-[#89CFF0]/20">
                <span className="text-4xl font-bold text-[#89CFF0] font-mono">{top3[0].overall}</span>
                <span className="text-xs text-[#89CFF0]"> / 100</span>
              </div>
            </div>
          </StaggerItem>

          {/* Rank 3 (Right) */}
          <StaggerItem className="order-3">
            <div className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)] text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#08132B] border border-[#89CFF0]/30 text-[#8EA6C8] flex items-center justify-center font-bold text-base shadow-xs">
                3
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8EA6C8] uppercase tracking-wider block">2nd Runner Up</span>
                <h3 className="font-mono font-bold text-base text-white truncate mt-0.5">{top3[2].repo}</h3>
                <span className="text-xs text-[#89CFF0] font-medium">{top3[2].team || "Team"}</span>
              </div>
              <div className="pt-3 border-t border-[#89CFF0]/20">
                <span className="text-3xl font-bold text-white font-mono">{top3[2].overall}</span>
                <span className="text-xs text-[#89CFF0]"> / 100</span>
              </div>
            </div>
          </StaggerItem>

        </StaggerContainer>
      )}

      {/* 3. Standings Table Liquid Glass Card */}
      <ScrollReveal direction="up" distance={20} delay={0.15}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#89CFF0]/20">
            <h2 className="text-sm font-bold text-white">
              Verified Standings Directory
            </h2>
            <span className="text-xs font-mono text-[#89CFF0] bg-[#08132B] px-3 py-1 rounded-full border border-[#89CFF0]/30 shadow-xs">
              {filteredLeaderboard.length} submissions recorded
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[#89CFF0] text-xs font-medium">
              Loading leaderboard standings...
            </div>
          ) : filteredLeaderboard.length === 0 ? (
            <div className="py-16 text-center text-[#8EA6C8] text-xs">
              No repositories found matching search query.
            </div>
          ) : (
            <div className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#08132B]/80 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold">
                    <tr>
                      <th className="py-3 px-4 w-16 text-center">Rank</th>
                      <th className="py-3 px-4">Repository & Team</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Special Citations</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#89CFF0]/15">
                    {filteredLeaderboard.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${getRankBadge(idx + 1)}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-white block">
                            {row.repo}
                          </span>
                          <span className="text-[11px] text-[#89CFF0] font-medium">
                            {row.team || "Engineering"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white font-mono text-sm">
                            {row.overall || 88}
                          </span>
                          <span className="text-[10px] text-[#89CFF0]">/100</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {renderBadges(row)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/analysis?repo=${encodeURIComponent(row.repo)}`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 liquid-btn-primary text-[#040914] font-bold text-xs rounded-full shadow-sm hover:scale-105 transition-transform"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

    </div>
  );
}
