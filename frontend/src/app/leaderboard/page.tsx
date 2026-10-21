"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Crown, 
  Search, 
  ArrowRight,
  Sparkles,
  Medal,
  Award,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';
import { apiUrl } from '@/lib/api';

export default function LeaderboardPage() {
  const [viewMode, setViewMode] = useState<'recent' | 'batch' | 'global'>('recent');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [recentLeaderboard, setRecentLeaderboard] = useState<any[]>([]);
  const [recentCohortName, setRecentCohortName] = useState<string>('Recent Evaluation Session');
  const [batchData, setBatchData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 0. Fetch Recent Standings (Default active view)
    fetch(apiUrl('/api/v1/stats/recent-leaderboard'))
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data?.leaderboard) setRecentLeaderboard(data.leaderboard);
        if (data?.cohort_name) setRecentCohortName(data.cohort_name);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // 1. Fetch Global Standings
    fetch(apiUrl('/api/v1/stats/leaderboard'))
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data?.leaderboard) setLeaderboard(data.leaderboard);
      })
      .catch(() => {});

    // 2. Fetch Latest Batch Leaderboard (Curated by BatchLeaderboardAgent)
    fetch(apiUrl('/api/v1/stats/batch-leaderboard'))
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data?.leaderboard) setBatchData(data);
      })
      .catch(() => {});
  }, []);

  const handleTabChange = (mode: 'recent' | 'global' | 'batch') => {
    setViewMode(mode);
    if (mode === 'batch' && !batchData) {
      setBatchLoading(true);
      fetch(apiUrl('/api/v1/stats/batch-leaderboard'))
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => {
          if (data?.leaderboard) setBatchData(data);
          setBatchLoading(false);
        })
        .catch(() => {
          setBatchLoading(false);
        });
    }
  };

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
    if (rank === 1) return 'podium-rank-gold';
    if (rank === 2) return 'podium-rank-silver';
    if (rank === 3) return 'podium-rank-bronze';
    return 'bg-[#08132B] text-[#89CFF0] font-bold border border-[#89CFF0]/30 shadow-xs';
  };

  const activeLeaderboardList = viewMode === 'recent' ? recentLeaderboard : leaderboard;
  const filteredLeaderboard = activeLeaderboardList.filter((row) => 
    (row.repo && row.repo.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (row.team && row.team.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const top3 = activeLeaderboardList.slice(0, 3);

  // Batch specific items
  const batchReport = batchData?.leaderboard || null;
  const batchRankings: any[] = batchReport?.rankings || [];
  const filteredBatchRankings = batchRankings.filter((row: any) =>
    (row.repo_name && row.repo_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (row.team_name && row.team_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const batchTop3 = batchRankings.slice(0, 3);

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Header, Tab Selector & Search Bar */}
      <ScrollReveal direction="down" distance={15}>
        <div className="space-y-4 pb-6 border-b border-[#89CFF0]/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
                <Trophy className="w-3.5 h-3.5" />
                Consensus Verified Standings
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {viewMode === 'recent'
                  ? `Recent Evaluation Standings • ${recentCohortName}`
                  : viewMode === 'global' 
                  ? "Global Benchmark Leaderboard" 
                  : "AI Batch Cohort Leaderboard"}
              </h1>
              <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
                {viewMode === 'recent'
                  ? `Filtered strictly to the latest evaluation session (${recentLeaderboard.length} repositories). Older historical audits are excluded.`
                  : viewMode === 'global' 
                  ? "All-time repository rankings verified by ConsJudge multi-pass consensus."
                  : "Batch cohort analyzed, ranked, and awarded by the autonomous BatchLeaderboardAgent."}
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

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => handleTabChange('recent')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'recent'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-[#040914] shadow-md font-bold'
                  : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/25'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recent Standings ({recentLeaderboard.length})</span>
              <span className={`w-2 h-2 rounded-full ${viewMode === 'recent' ? 'bg-[#040914] animate-pulse' : 'bg-emerald-400'}`} />
            </button>

            <button
              onClick={() => handleTabChange('batch')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'batch'
                  ? 'bg-gradient-to-r from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] shadow-md font-bold'
                  : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/25'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Batch Cohort (Agent Curated)</span>
              {batchReport && (
                <span className="px-1.5 py-0.2 bg-[#040914]/40 text-[#040914] text-[10px] rounded-full font-bold">
                  {batchRankings.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('global')}
              className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                viewMode === 'global'
                  ? 'bg-gradient-to-r from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] shadow-md font-bold'
                  : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/25'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Global All-Time ({leaderboard.length})</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* ========================================================= */}
      {/* VIEW MODE 1: RECENT OR GLOBAL STANDINGS                   */}
      {/* ========================================================= */}
      {(viewMode === 'recent' || viewMode === 'global') && (
        <>
          {/* Top 3 Podium Cards with Gold, Silver, Bronze Luxury Glass */}
          {top3.length >= 3 && (
            <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              
              {/* Rank 2 (Left - Silver Runner Up) */}
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
                    <h3 className="font-mono font-bold text-base text-white truncate mt-0.5">{top3[1].repo}</h3>
                    <span className="text-xs text-slate-300 font-medium">{top3[1].team || "Team"}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-300/20 flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-black text-slate-200 font-mono drop-shadow-[0_2px_8px_rgba(203,213,225,0.3)]">{top3[1].overall}</span>
                      <span className="text-xs text-slate-400"> / 100</span>
                    </div>
                    <Link
                      href={`/analysis?repo=${encodeURIComponent(top3[1].repo)}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-full bg-slate-300/15 hover:bg-slate-300/25 text-slate-100 border border-slate-300/30 transition-all"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </StaggerItem>

              {/* Rank 1 (Center Prominent Gold Champion) */}
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
                    <h3 className="font-mono font-bold text-lg sm:text-xl text-white truncate mt-0.5">{top3[0].repo}</h3>
                    <span className="text-xs text-amber-200 font-semibold">{top3[0].team || "Team"}</span>
                  </div>
                  <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between">
                    <div>
                      <span className="text-4xl font-black text-amber-400 font-mono drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]">{top3[0].overall}</span>
                      <span className="text-xs text-amber-400/80"> / 100</span>
                    </div>
                    <Link
                      href={`/analysis?repo=${encodeURIComponent(top3[0].repo)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black rounded-full podium-pill-gold hover:scale-105 transition-transform shadow-md"
                    >
                      <span>Inspect Repository</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </StaggerItem>

              {/* Rank 3 (Right - Bronze 2nd Runner Up) */}
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
                    <h3 className="font-mono font-bold text-base text-white truncate mt-0.5">{top3[2].repo}</h3>
                    <span className="text-xs text-amber-300/80 font-medium">{top3[2].team || "Team"}</span>
                  </div>
                  <div className="pt-3 border-t border-amber-700/30 flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-black text-amber-500 font-mono drop-shadow-[0_2px_8px_rgba(180,83,9,0.3)]">{top3[2].overall}</span>
                      <span className="text-xs text-amber-500/80"> / 100</span>
                    </div>
                    <Link
                      href={`/analysis?repo=${encodeURIComponent(top3[2].repo)}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-600/30 transition-all"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </StaggerItem>

            </StaggerContainer>
          )}

          {/* Standings Table Liquid Glass Card */}
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
                          <th className="py-3 px-4">Repository &amp; Team</th>
                          <th className="py-3 px-4">Score</th>
                          <th className="py-3 px-4">Special Citations</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#89CFF0]/15">
                        {filteredLeaderboard.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${getRankBadge(idx + 1)}`}>
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
                                {row.overall ?? 0}
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
        </>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 2: AI BATCH COHORT (AGENT CURATED)              */}
      {/* ========================================================= */}
      {viewMode === 'batch' && (
        <div className="space-y-8">
          {batchLoading ? (
            <div className="liquid-glass-card rounded-3xl p-16 text-center text-[#89CFF0] text-sm space-y-3">
              <Sparkles className="w-8 h-8 animate-spin mx-auto text-[#89CFF0]" />
              <p className="font-bold">Loading AI Batch Cohort Leaderboard...</p>
            </div>
          ) : !batchReport ? (
            <div className="liquid-glass-card rounded-3xl p-16 text-center text-[#8EA6C8] text-sm space-y-4">
              <Trophy className="w-10 h-10 mx-auto text-[#8EA6C8]/60" />
              <p className="font-semibold text-white">No batch evaluation cohort found yet.</p>
              <p className="text-xs max-w-md mx-auto">
                Upload a batch of repositories on the Upload page to run the 5-at-a-time pipeline. 
                The BatchLeaderboardAgent will automatically generate this comparative report!
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 liquid-btn-primary text-[#040914] font-bold text-xs rounded-full"
              >
                <span>Upload Batch Repositories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Batch Cohort Header & Executive Summary */}
              <ScrollReveal distance={20}>
                <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border-2 border-[#89CFF0]/40 shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#89CFF0]/20">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-tr from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] rounded-2xl shadow-md">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#89CFF0] font-bold block">
                          AI Cohort Synthesis &bull; Generated by {batchReport.agent_name || "BatchLeaderboardAgent"}
                        </span>
                        <h2 className="text-lg sm:text-xl font-bold text-white">
                          {batchReport.batch_name || "Bulk Evaluation Cohort"}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 bg-[#08132B] border border-[#89CFF0]/30 rounded-2xl text-center">
                        <span className="text-[10px] text-[#8EA6C8] uppercase font-mono block">Cohort Size</span>
                        <span className="text-base font-bold font-mono text-[#89CFF0]">{batchReport.total_evaluated} Repos</span>
                      </div>
                      <div className="px-3.5 py-1.5 bg-[#08132B] border border-[#89CFF0]/30 rounded-2xl text-center">
                        <span className="text-[10px] text-[#8EA6C8] uppercase font-mono block">Cohort Average</span>
                        <span className="text-base font-bold font-mono text-emerald-400">{batchReport.cohort_average_score}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Executive Commentary */}
                  <div className="p-4 bg-[#08132B]/80 rounded-2xl border border-[#89CFF0]/20 text-xs text-[#D8E6F8] leading-relaxed">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89CFF0] block mb-1">
                      Executive Arbiter Verdict:
                    </span>
                    {batchReport.executive_summary}
                  </div>

                  {/* Standout Innovations & Common Flaws */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Strengths */}
                    {batchReport.standout_innovations && batchReport.standout_innovations.length > 0 && (
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Standout Cohort Innovations</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-emerald-200/90">
                          {batchReport.standout_innovations.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-400 shrink-0">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Flaws */}
                    {batchReport.common_systemic_flaws && batchReport.common_systemic_flaws.length > 0 && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/25 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Common Systemic Gaps</span>
                        </div>
                        <ul className="space-y-1.5 text-xs text-amber-200/90">
                          {batchReport.common_systemic_flaws.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-400 shrink-0">&bull;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>

              {/* Top 3 Cohort Champions Podium (Gold, Silver, Bronze) */}
              {batchTop3.length >= 3 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#89CFF0] uppercase tracking-wider">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Cohort Top 3 Podium Champions</span>
                  </div>
                  <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    
                    {/* Rank 2 (Left - Silver Runner Up) */}
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
                          <h3 className="font-mono font-bold text-base text-white truncate mt-0.5">{batchTop3[1].repo_name}</h3>
                          <span className="text-xs text-slate-300 font-medium">{batchTop3[1].team_name || "Team"}</span>
                        </div>

                        {batchTop3[1].badge && (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-slate-300/15 text-slate-200 border border-slate-300/30 max-w-full truncate">
                              {batchTop3[1].badge}
                            </span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-300/20 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-3xl font-black text-slate-200 font-mono drop-shadow-[0_2px_8px_rgba(203,213,225,0.3)]">{batchTop3[1].overall_score}</span>
                            <span className="text-xs text-slate-400"> / 100</span>
                            {batchTop3[1].grade && (
                              <span className="px-1.5 py-0.2 rounded-md font-mono text-[10px] font-bold bg-slate-300/20 text-slate-100 border border-slate-300/30">
                                {batchTop3[1].grade}
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/analysis?repo=${encodeURIComponent(batchTop3[1].repo_name)}`}
                            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-full bg-slate-300/15 hover:bg-slate-300/25 text-slate-100 border border-slate-300/30 transition-all"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </StaggerItem>

                    {/* Rank 1 (Center Prominent Gold Champion) */}
                    <StaggerItem className="order-1 md:order-2">
                      <div className="podium-card-gold rounded-3xl p-8 text-center space-y-4 relative group">
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 podium-pill-gold text-[11px] font-black uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                          <span>Cohort Grand Champion</span>
                        </div>
                        <div className="w-16 h-16 mx-auto rounded-3xl podium-rank-gold flex items-center justify-center font-black text-2xl shadow-xl relative mt-1">
                          <span>1</span>
                          <Crown className="w-4 h-4 text-amber-950 absolute -top-1.5 -right-1 fill-amber-950" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Cohort Leader</span>
                          <h3 className="font-mono font-bold text-lg sm:text-xl text-white truncate mt-0.5">{batchTop3[0].repo_name}</h3>
                          <span className="text-xs text-amber-200 font-semibold">{batchTop3[0].team_name || "Team"}</span>
                        </div>

                        {batchTop3[0].badge && (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center px-3 py-0.5 text-[11px] font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs max-w-full truncate">
                              {batchTop3[0].badge}
                            </span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-4xl font-black text-amber-400 font-mono drop-shadow-[0_2px_12px_rgba(245,158,11,0.4)]">{batchTop3[0].overall_score}</span>
                            <span className="text-xs text-amber-400/80"> / 100</span>
                            {batchTop3[0].grade && (
                              <span className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-amber-400/25 text-amber-200 border border-amber-400/40">
                                {batchTop3[0].grade}
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/analysis?repo=${encodeURIComponent(batchTop3[0].repo_name)}`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black rounded-full podium-pill-gold hover:scale-105 transition-transform shadow-md"
                          >
                            <span>Inspect Repository</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </StaggerItem>

                    {/* Rank 3 (Right - Bronze 2nd Runner Up) */}
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
                          <h3 className="font-mono font-bold text-base text-white truncate mt-0.5">{batchTop3[2].repo_name}</h3>
                          <span className="text-xs text-amber-300/80 font-medium">{batchTop3[2].team_name || "Team"}</span>
                        </div>

                        {batchTop3[2].badge && (
                          <div className="pt-0.5">
                            <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-amber-700/20 text-amber-200 border border-amber-600/30 max-w-full truncate">
                              {batchTop3[2].badge}
                            </span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-amber-700/30 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-3xl font-black text-amber-500 font-mono drop-shadow-[0_2px_8px_rgba(180,83,9,0.3)]">{batchTop3[2].overall_score}</span>
                            <span className="text-xs text-amber-500/80"> / 100</span>
                            {batchTop3[2].grade && (
                              <span className="px-1.5 py-0.2 rounded-md font-mono text-[10px] font-bold bg-amber-700/25 text-amber-200 border border-amber-600/30">
                                {batchTop3[2].grade}
                              </span>
                            )}
                          </div>
                          <Link
                            href={`/analysis?repo=${encodeURIComponent(batchTop3[2].repo_name)}`}
                            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold rounded-full bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-600/30 transition-all"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </StaggerItem>

                  </StaggerContainer>
                </div>
              )}

              {/* Special Category Awards Grid */}
              {batchReport.awards && batchReport.awards.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Special Category Citations &amp; Honors</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {batchReport.awards.map((award: any, idx: number) => (
                      <div key={idx} className="p-4 bg-[#08132B] rounded-2xl border border-[#89CFF0]/25 shadow-sm space-y-2">
                        <span className="text-xs font-bold text-[#89CFF0] block truncate">
                          {award.title}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-sm text-white block truncate">
                            {award.recipient_repo || award.winner_repo}
                          </span>
                          <span className="text-[11px] text-[#8EA6C8] block truncate">
                            {award.recipient_team || award.winner_team || "Team"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8EA6C8] leading-tight pt-1 border-t border-[#89CFF0]/15">
                          {award.citation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cohort Ranked Table */}
              <ScrollReveal distance={20}>
                <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-[#89CFF0]/20">
                    <h3 className="text-sm font-bold text-white">
                      Cohort Comparative Standings
                    </h3>
                    <span className="text-xs font-mono text-[#89CFF0] bg-[#08132B] px-3 py-1 rounded-full border border-[#89CFF0]/30 shadow-xs">
                      {filteredBatchRankings.length} repositories ranked
                    </span>
                  </div>

                  <div className="border border-[#89CFF0]/25 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#08132B]/90 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold">
                          <tr>
                            <th className="py-3 px-4 w-14 text-center">Rank</th>
                            <th className="py-3 px-4">Repository &amp; Team</th>
                            <th className="py-3 px-4 text-center">Score &amp; Grade</th>
                            <th className="py-3 px-4">Primary Citation</th>
                            <th className="py-3 px-4">Key Differentiator</th>
                            <th className="py-3 px-4 text-right">Inspect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#89CFF0]/15">
                          {filteredBatchRankings.map((row: any, idx: number) => {
                            const rank = row.rank || idx + 1;
                            const isPodium = rank <= 3;
                            return (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="py-3.5 px-4 text-center">
                                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${getRankBadge(rank)}`}>
                                    {rank}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="font-mono font-bold text-white block">
                                    {row.repo_name}
                                  </span>
                                  <span className="text-[11px] text-[#89CFF0] font-medium">
                                    {row.team_name}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className="font-bold text-white font-mono text-sm">
                                      {row.overall_score}
                                    </span>
                                    {row.grade && (
                                      <span className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] font-bold ${
                                        row.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                        row.grade.startsWith('B') ? 'bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/30' :
                                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      }`}>
                                        {row.grade}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#89CFF0]/15 text-[#89CFF0] border border-[#89CFF0]/30">
                                    {row.badge || "Certified"}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-[#8EA6C8] text-[11px] max-w-xs">
                                  <span className="line-clamp-2">
                                    {row.key_differentiator || row.verdict}
                                  </span>
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <Link
                                    href={`/analysis?repo=${encodeURIComponent(row.repo_name)}`}
                                    className="inline-flex items-center gap-1 px-3.5 py-1.5 liquid-btn-primary text-[#040914] font-bold text-xs rounded-full shadow-sm hover:scale-105 transition-transform"
                                  >
                                    <span>Inspect</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </>
          )}
        </div>
      )}

    </div>
  );
}
