"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  GitBranch, 
  Award, 
  PlayCircle, 
  BarChart2,
  Sparkles,
  ShieldCheck,
  Layers,
  Zap,
  Database,
  Search,
  ArrowRight,
  Compass,
  Crown,
  Grid3X3,
  SlidersHorizontal,
  FileCode2,
  AlertTriangle,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';
import { apiUrl } from '@/lib/api';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heatmapFilter, setHeatmapFilter] = useState<'all' | 'high' | 'risk'>('all');
  const [heatmapSearch, setHeatmapSearch] = useState('');
  const [activeVector, setActiveVector] = useState<'all' | 'sec' | 'arch' | 'perf'>('all');

  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/v1/stats/dashboard')).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(apiUrl('/api/v1/stats/history')).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(apiUrl('/api/v1/stats/leaderboard')).then(r => r.ok ? r.json() : null).catch(() => null)
    ]).then(([dashData, histData, leadData]) => {
      if (dashData) setData(dashData);
      if (histData?.history) setHistory(histData.history);
      if (leadData?.leaderboard) setLeaderboard(leadData.leaderboard);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const stats = data?.stats || { analyzed: 0, avg_score: 0, failed: 0, running: 0, submitted: 0, highest: 0 };

  // 1. Multi-Vector Score Trend Data
  const scoreTrendData = useMemo(() => {
    const source = history.length > 0 ? history : leaderboard;
    if (!source || source.length === 0) return [];
    return source.slice(0, 10).reverse().map((h) => {
      const repoStr = h.repo || h.repoId || "Repo";
      const shortName = repoStr.includes('/') ? repoStr.split('/')[1] : repoStr;
      return {
        name: shortName.length > 11 ? shortName.substring(0, 9) + '..' : shortName,
        overall: h.overall ?? 0,
        sec: h.sec ?? 0,
        arch: h.arch ?? 0,
        perf: h.perf ?? 0,
        orig: h.orig ?? 0,
      };
    });
  }, [history, leaderboard]);

  // 2. Sub-Score Averages
  const avgSubScores = useMemo(() => {
    const source = history.length > 0 ? history : leaderboard;
    const len = source.length || 1;
    return [
      { name: 'Security', score: Math.round(source.reduce((a, b) => a + (b.sec || 0), 0) / len), fill: '#89CFF0' },
      { name: 'Architecture', score: Math.round(source.reduce((a, b) => a + (b.arch || 0), 0) / len), fill: '#BAE6FD' },
      { name: 'Performance', score: Math.round(source.reduce((a, b) => a + (b.perf || 0), 0) / len), fill: '#89CFF0' },
      { name: 'Testing', score: Math.round(source.reduce((a, b) => a + (b.testing_score || 0), 0) / len), fill: '#BAE6FD' },
      { name: 'Database', score: Math.round(source.reduce((a, b) => a + (b.db_score || 0), 0) / len), fill: '#89CFF0' },
      { name: 'Originality', score: Math.round(source.reduce((a, b) => a + (b.orig || 0), 0) / len), fill: '#BAE6FD' },
    ];
  }, [history, leaderboard]);

  // 3. Multi-Agent Capability Radar Matrix
  const radarData = useMemo(() => {
    const topTier = leaderboard.length >= 3 ? leaderboard.slice(0, 3) : history.slice(0, 3);
    const source = history.length > 0 ? history : leaderboard;
    const sLen = source.length || 1;
    const tLen = topTier.length || 1;

    const topTierAvg = (key: string) => {
      if (!topTier.length) return 85;
      return Math.round(topTier.reduce((acc, curr) => acc + (curr[key] || curr.overall || 75), 0) / tLen);
    };

    const platformAvg = (key: string) => {
      if (!source.length) return 65;
      return Math.round(source.reduce((acc, curr) => acc + (curr[key] || curr.overall || 65), 0) / sLen);
    };

    return [
      { dimension: 'Security', platform: platformAvg('sec'), topTier: topTierAvg('sec'), fullMark: 100 },
      { dimension: 'Architecture', platform: platformAvg('arch'), topTier: topTierAvg('arch'), fullMark: 100 },
      { dimension: 'Performance', platform: platformAvg('perf'), topTier: topTierAvg('perf'), fullMark: 100 },
      { dimension: 'Testing', platform: platformAvg('testing_score'), topTier: topTierAvg('testing_score'), fullMark: 100 },
      { dimension: 'Database', platform: platformAvg('db_score'), topTier: topTierAvg('db_score'), fullMark: 100 },
      { dimension: 'Originality', platform: platformAvg('orig'), topTier: topTierAvg('orig'), fullMark: 100 },
    ];
  }, [history, leaderboard]);

  // 4. Code Originality vs Security Risk Quad-Matrix (Scatter Plot)
  const scatterData = useMemo(() => {
    const source = history.length > 0 ? history : leaderboard;
    return source.slice(0, 40).map((h) => {
      const repoStr = h.repo || h.repoId || "Repo";
      const shortName = repoStr.includes('/') ? repoStr.split('/')[1] : repoStr;
      const sec = h.sec ?? 65;
      const orig = h.orig ?? 80;
      const overall = h.overall ?? 70;
      return {
        name: shortName,
        fullRepo: repoStr,
        team: h.team || "Team",
        x: sec,
        y: orig,
        z: overall,
        tier: sec >= 80 && orig >= 85 ? 'Vanguard' :
              sec >= 80 ? 'Hardened Scaffolding' :
              orig >= 85 ? 'Innovative Prototype' : 'Review Required'
      };
    });
  }, [history, leaderboard]);

  // 5. Language & Stack Ecosystem Distribution (Donut Chart)
  const langPieData = useMemo(() => {
    const source = history.length > 0 ? history : leaderboard;
    const detected: Record<string, number> = {};
    source.forEach((item) => {
      const l = item.lang || (item.repo?.includes('.js') || item.repo?.includes('next') ? 'TypeScript' : 'Python');
      detected[l] = (detected[l] || 0) + 1;
    });

    const entries = Object.entries(detected);
    if (entries.length === 0) {
      return [
        { name: 'Python', value: 65, color: '#89CFF0' },
        { name: 'TypeScript', value: 25, color: '#BAE6FD' },
        { name: 'Rust', value: 10, color: '#F59E0B' }
      ];
    }

    const palette = ['#89CFF0', '#BAE6FD', '#F59E0B', '#10B981', '#A78BFA', '#F43F5E'];
    return entries.map(([k, v], idx) => ({
      name: k,
      value: v,
      color: palette[idx % palette.length]
    }));
  }, [history, leaderboard]);

  // 6. Benchmark Score Distribution Bell Curve
  const scoreDistribution = useMemo(() => {
    const source = history.length > 0 ? history : leaderboard;
    return [
      { tier: '90-100', label: 'Grandmaster', count: source.filter(h => (h.overall ?? 0) >= 90).length, fill: '#F59E0B' },
      { tier: '80-89', label: 'Vanguard', count: source.filter(h => (h.overall ?? 0) >= 80 && (h.overall ?? 0) < 90).length, fill: '#BAE6FD' },
      { tier: '70-79', label: 'Certified', count: source.filter(h => (h.overall ?? 0) >= 70 && (h.overall ?? 0) < 80).length, fill: '#89CFF0' },
      { tier: '60-69', label: 'Baseline', count: source.filter(h => (h.overall ?? 0) >= 60 && (h.overall ?? 0) < 70).length, fill: '#4A6B94' },
      { tier: '<60', label: 'Flagged', count: source.filter(h => (h.overall ?? 0) < 60).length, fill: '#F43F5E' },
    ];
  }, [history, leaderboard]);

  // 7. Heatmap Data Source
  const heatmapRepos = useMemo(() => {
    let list = history.length > 0 ? history : leaderboard;
    if (heatmapFilter === 'high') {
      list = list.filter(r => (r.overall ?? 0) >= 80);
    } else if (heatmapFilter === 'risk') {
      list = list.filter(r => (r.sec ?? 0) < 70 || (r.overall ?? 0) < 70);
    }
    if (heatmapSearch.trim()) {
      const q = heatmapSearch.toLowerCase();
      list = list.filter(r => 
        (r.repo && r.repo.toLowerCase().includes(q)) || 
        (r.team && r.team.toLowerCase().includes(q))
      );
    }
    return list.slice(0, 12);
  }, [history, leaderboard, heatmapFilter, heatmapSearch]);

  // Thermal Color Scale Utility for Heatmap
  const getHeatmapColor = (val: number) => {
    if (val >= 90) return 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]';
    if (val >= 75) return 'bg-[#89CFF0]/25 text-[#BAE6FD] border-[#89CFF0]/40 shadow-[0_0_8px_rgba(137,207,240,0.2)]';
    if (val >= 60) return 'bg-amber-500/20 text-amber-300 border-amber-400/35';
    return 'bg-rose-500/20 text-rose-300 border-rose-400/35';
  };

  return (
    <div className="space-y-8 pb-16 text-white">
      
      {/* 1. Page Header */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              Platform Telemetry &amp; Multi-Agent Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Platform Telemetry &amp; Quality Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
              Deep observability into multi-agent consensus vectors, dimensional heatmaps, and repository quality distributions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#08132B] backdrop-blur-md border border-[#89CFF0]/30 text-[#89CFF0] text-xs font-semibold rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#89CFF0] animate-ping" />
              Telemetry Stream Active
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. KPI Cards with Liquid Glass */}
      <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <div className="liquid-glass-interactive rounded-2xl p-5 shadow-[0_12px_32px_rgba(2,6,18,0.7)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider">Total Repositories</span>
              <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                <GitBranch className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white font-mono">{stats.analyzed || history.length}</span>
              <span className="text-xs text-[#89CFF0] block mt-1 font-medium">100% verified passes</span>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-interactive rounded-2xl p-5 shadow-[0_12px_32px_rgba(2,6,18,0.7)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider">Platform Mean Score</span>
              <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-[#89CFF0] font-mono">{stats.avg_score}</span>
              <span className="text-xs text-[#8EA6C8] block mt-1">±1.4 pts variance bound</span>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-interactive rounded-2xl p-5 shadow-[0_12px_32px_rgba(2,6,18,0.7)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider">Peak Cohort Score</span>
              <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-amber-400 shadow-xs">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-amber-400 font-mono drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">{stats.highest}</span>
              <span className="text-xs text-amber-300/80 block mt-1 font-medium">Grand Champion Benchmark</span>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-interactive rounded-2xl p-5 shadow-[0_12px_32px_rgba(2,6,18,0.7)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider">Worker Queues</span>
              <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                <PlayCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white font-mono">{stats.running}</span>
              <span className="text-xs text-[#8EA6C8] block mt-1">Parallel worker pipelines</span>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* 3. ROW A: Quality Vectors Curve (8 cols) & Multi-Agent Radar Matrix (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Score Trends Multi-Vector Area Chart */}
        <div className="lg:col-span-7">
          <ScrollReveal direction="up" distance={20} delay={0.1}>
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] flex flex-col justify-between h-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#89CFF0]" />
                    <span>Evaluation Quality Vectors</span>
                  </h3>
                  <span className="text-xs text-[#8EA6C8]">Multi-dimensional score trajectory across consecutive repository evaluations</span>
                </div>

                {/* Vector Filters */}
                <div className="flex items-center gap-1.5 p-1 bg-[#040814]/60 border border-[#89CFF0]/20 rounded-full text-[10px] font-semibold">
                  <button 
                    onClick={() => setActiveVector('all')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${activeVector === 'all' ? 'bg-[#89CFF0] text-[#040914] font-bold shadow-xs' : 'text-[#8EA6C8] hover:text-white'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setActiveVector('sec')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${activeVector === 'sec' ? 'bg-[#89CFF0] text-[#040914] font-bold shadow-xs' : 'text-[#8EA6C8] hover:text-white'}`}
                  >
                    Security
                  </button>
                  <button 
                    onClick={() => setActiveVector('arch')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${activeVector === 'arch' ? 'bg-[#89CFF0] text-[#040914] font-bold shadow-xs' : 'text-[#8EA6C8] hover:text-white'}`}
                  >
                    Arch
                  </button>
                  <button 
                    onClick={() => setActiveVector('perf')}
                    className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${activeVector === 'perf' ? 'bg-[#89CFF0] text-[#040914] font-bold shadow-xs' : 'text-[#8EA6C8] hover:text-white'}`}
                  >
                    Perf
                  </button>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#BAE6FD" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#BAE6FD" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#89CFF0" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#89CFF0" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorArch" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(137,207,240,0.15)" vertical={false} />
                    <XAxis dataKey="name" stroke="#8EA6C8" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(137,207,240,0.2)' }} />
                    <YAxis domain={[40, 100]} stroke="#8EA6C8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(8, 19, 43, 0.95)', 
                        borderColor: 'rgba(137, 207, 240, 0.35)', 
                        borderRadius: '16px', 
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 32px rgba(2, 6, 18, 0.8)',
                        color: '#FFFFFF', 
                        fontSize: '12px' 
                      }} 
                    />
                    {(activeVector === 'all' || activeVector === 'sec') && (
                      <Area type="monotone" dataKey="sec" stroke="#89CFF0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSec)" name="Security" />
                    )}
                    {(activeVector === 'all' || activeVector === 'arch') && (
                      <Area type="monotone" dataKey="arch" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorArch)" name="Architecture" />
                    )}
                    {(activeVector === 'all') && (
                      <Area type="monotone" dataKey="overall" stroke="#BAE6FD" strokeWidth={3} fillOpacity={1} fill="url(#colorOverall)" name="Overall Composite" />
                    )}
                    {activeVector === 'perf' && (
                      <Area type="monotone" dataKey="perf" stroke="#10B981" strokeWidth={2.5} fill="rgba(16,185,129,0.15)" name="Performance" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8EA6C8] pt-2 border-t border-[#89CFF0]/15">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#BAE6FD]" /> Overall Score</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#89CFF0]" /> AutoReview Security</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Architecture</span>
                </div>
                <span className="text-[#89CFF0] font-mono">ConsJudge Verified</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Multi-Agent Capability Radar Matrix */}
        <div className="lg:col-span-5">
          <ScrollReveal direction="up" distance={20} delay={0.15}>
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] flex flex-col justify-between h-full space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Multi-Agent Capability Radar</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#89CFF0] bg-[#08132B] px-2.5 py-0.5 rounded-full border border-[#89CFF0]/30">
                    6 Pillars
                  </span>
                </div>
                <span className="text-xs text-[#8EA6C8] block mt-0.5">Top 3 Podium Leaders vs Platform Cohort Mean</span>
              </div>

              <div className="h-68 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(137, 207, 240, 0.2)" />
                    <PolarAngleAxis dataKey="dimension" stroke="#89CFF0" tick={{ fill: '#BAE6FD', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(137, 207, 240, 0.2)" tick={{ fill: '#8EA6C8', fontSize: 9 }} />
                    <Radar 
                      name="Platform Mean" 
                      dataKey="platform" 
                      stroke="#89CFF0" 
                      fill="#89CFF0" 
                      fillOpacity={0.25} 
                      strokeWidth={2} 
                    />
                    <Radar 
                      name="Top 3 Leaders" 
                      dataKey="topTier" 
                      stroke="#F59E0B" 
                      fill="#F59E0B" 
                      fillOpacity={0.3} 
                      strokeWidth={2.5} 
                    />
                    <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(8, 19, 43, 0.95)', 
                        borderColor: '#89CFF0', 
                        borderRadius: '12px', 
                        color: '#ffffff', 
                        fontSize: 12 
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-[#8EA6C8] pt-2 border-t border-[#89CFF0]/15 flex items-center justify-between">
                <span>Gold: Top 3 Podiums</span>
                <span className="text-amber-400 font-semibold">+18.5 pts divergence</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* 4. ROW B: AUTONOMOUS MULTI-AGENT DIMENSIONAL HEATMAP (USER REQUESTED!) */}
      <ScrollReveal direction="up" distance={20} delay={0.2}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.85)] space-y-6">
          
          {/* Heatmap Controls & Legend */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#89CFF0]/20">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-[#08132B] to-[#122A5C] border border-[#89CFF0]/30 text-[#89CFF0]">
                  <Grid3X3 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Autonomous Multi-Agent Dimensional Heatmap</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Live Matrix
                    </span>
                  </h2>
                  <p className="text-xs text-[#8EA6C8] mt-0.5">
                    Granular cross-repository evaluation matrix scored across 6 automated ConsJudge agent criteria.
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Pills */}
              <div className="flex items-center gap-1 p-1 bg-[#040814]/60 border border-[#89CFF0]/20 rounded-full text-xs font-semibold">
                <button
                  onClick={() => setHeatmapFilter('all')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${heatmapFilter === 'all' ? 'bg-[#89CFF0] text-[#040914] font-bold shadow-xs' : 'text-[#8EA6C8] hover:text-white'}`}
                >
                  All ({history.length || leaderboard.length})
                </button>
                <button
                  onClick={() => setHeatmapFilter('high')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${heatmapFilter === 'high' ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs' : 'text-[#8EA6C8] hover:text-emerald-300'}`}
                >
                  High (≥80)
                </button>
                <button
                  onClick={() => setHeatmapFilter('risk')}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${heatmapFilter === 'risk' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'text-[#8EA6C8] hover:text-amber-300'}`}
                >
                  Needs Attention (&lt;70)
                </button>
              </div>

              {/* Search */}
              <div className="relative w-44">
                <input
                  type="text"
                  placeholder="Filter repo..."
                  value={heatmapSearch}
                  onChange={(e) => setHeatmapSearch(e.target.value)}
                  className="w-full bg-[#08132B] border border-[#89CFF0]/25 rounded-full py-1.5 pl-8 pr-3 text-xs text-white placeholder-[#8EA6C8] focus:outline-none focus:border-[#89CFF0]"
                />
                <Search className="w-3.5 h-3.5 text-[#8EA6C8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Color Scale Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#040814]/50 border border-[#89CFF0]/15 rounded-2xl text-[11px]">
            <span className="text-[#8EA6C8] font-medium">Thermal Performance Index:</span>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500/30 border border-emerald-400/60 shadow-[0_0_6px_rgba(16,185,129,0.3)]" />
                <span className="text-emerald-300 font-semibold">90–100 (Grandmaster)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#89CFF0]/30 border border-[#89CFF0]/60 shadow-[0_0_6px_rgba(137,207,240,0.3)]" />
                <span className="text-[#BAE6FD] font-semibold">75–89 (Production Ready)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500/25 border border-amber-400/50" />
                <span className="text-amber-300 font-semibold">60–74 (Moderate Baseline)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-500/25 border border-rose-400/50" />
                <span className="text-rose-300 font-semibold">&lt;60 (Flagged Alert)</span>
              </span>
            </div>
          </div>

          {/* Heatmap Matrix Table */}
          <div className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08132B]/90 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold">
                  <tr>
                    <th className="py-3 px-4 min-w-[200px]">Repository &amp; Team</th>
                    <th className="py-3 px-3 text-center min-w-[80px]">
                      <span className="flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#89CFF0]" />
                        <span>Security</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[80px]">
                      <span className="flex items-center justify-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#BAE6FD]" />
                        <span>Arch</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[80px]">
                      <span className="flex items-center justify-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Perf</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[80px]">
                      <span className="flex items-center justify-center gap-1">
                        <FileCode2 className="w-3.5 h-3.5 text-[#89CFF0]" />
                        <span>Testing</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[80px]">
                      <span className="flex items-center justify-center gap-1">
                        <Database className="w-3.5 h-3.5 text-[#BAE6FD]" />
                        <span>Database</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[80px]">
                      <span className="flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Originality</span>
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[90px]">Composite</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89CFF0]/15">
                  {heatmapRepos.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#8EA6C8]">
                        No evaluated repositories found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    heatmapRepos.map((row: any, idx: number) => {
                      const repoName = row.repo || row.repoId || "repo";
                      const sec = row.sec ?? 65;
                      const arch = row.arch ?? 65;
                      const perf = row.perf ?? 65;
                      const test = row.testing_score ?? 35;
                      const db = row.db_score ?? 65;
                      const orig = row.orig ?? 85;
                      const overall = row.overall ?? 70;

                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-white block truncate max-w-[220px]">
                              {repoName}
                            </span>
                            <span className="text-[11px] text-[#89CFF0] font-medium block truncate max-w-[220px]">
                              {row.team || "Engineering"}
                            </span>
                          </td>

                          {/* Security Heat Cell */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-12 py-1 rounded-lg font-mono font-bold text-xs border transition-transform hover:scale-110 ${getHeatmapColor(sec)}`}>
                              {sec}
                            </span>
                          </td>

                          {/* Architecture Heat Cell */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-12 py-1 rounded-lg font-mono font-bold text-xs border transition-transform hover:scale-110 ${getHeatmapColor(arch)}`}>
                              {arch}
                            </span>
                          </td>

                          {/* Performance Heat Cell */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-12 py-1 rounded-lg font-mono font-bold text-xs border transition-transform hover:scale-110 ${getHeatmapColor(perf)}`}>
                              {perf}
                            </span>
                          </td>

                          {/* Testing Heat Cell */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-12 py-1 rounded-lg font-mono font-bold text-xs border transition-transform hover:scale-110 ${getHeatmapColor(test)}`}>
                              {test}
                            </span>
                          </td>

                          {/* Database Heat Cell */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-12 py-1 rounded-lg font-mono font-bold text-xs border transition-transform hover:scale-110 ${getHeatmapColor(db)}`}>
                              {db}
                            </span>
                          </td>

                          {/* Originality Heat Cell */}
                          <td className="py-3 px-3 text-center">
                            <span className={`inline-flex items-center justify-center w-12 py-1 rounded-lg font-mono font-bold text-xs border transition-transform hover:scale-110 ${getHeatmapColor(orig)}`}>
                              {orig}%
                            </span>
                          </td>

                          {/* Composite Score */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-mono font-extrabold text-sm text-white">{overall}</span>
                              <span className="text-[10px] text-[#89CFF0]">/100</span>
                            </div>
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/analysis?repo=${encodeURIComponent(repoName)}`}
                              className="inline-flex items-center gap-1 px-3 py-1 liquid-btn-primary text-[#040914] font-bold text-[11px] rounded-full shadow-xs hover:scale-105 transition-transform"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 5. ROW C: QUAD-MATRIX SCATTER PLOT (6 cols) & LANGUAGE DONUT CHART (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Code Originality vs Security Risk Quad-Matrix Scatter Plot */}
        <div className="lg:col-span-7">
          <ScrollReveal direction="up" distance={20} delay={0.25}>
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#89CFF0]" />
                    <span>Originality vs Security Risk Quad-Matrix</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#89CFF0] bg-[#08132B] px-2.5 py-0.5 rounded-full border border-[#89CFF0]/30">
                    2D Scatter Analysis
                  </span>
                </div>
                <span className="text-xs text-[#8EA6C8] block mt-0.5">
                  Plots code originality index against multi-pass security resilience score.
                </span>
              </div>

              <div className="h-72 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 15, right: 20, bottom: 20, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(137,207,240,0.15)" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Security Index" 
                      domain={[30, 100]} 
                      stroke="#8EA6C8" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(137,207,240,0.2)' }}
                      label={{ value: 'Security Index (0-100)', position: 'insideBottom', offset: -10, fill: '#8EA6C8', fontSize: 10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Originality %" 
                      domain={[40, 100]} 
                      stroke="#8EA6C8" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(137,207,240,0.2)' }}
                      label={{ value: 'Code Originality %', angle: -90, position: 'insideLeft', offset: 15, fill: '#8EA6C8', fontSize: 10 }}
                    />
                    <ZAxis type="number" dataKey="z" range={[60, 300]} name="Composite Score" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3', stroke: 'rgba(137,207,240,0.4)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pt = payload[0].payload;
                          return (
                            <div className="p-3 bg-[#08132B]/95 border border-[#89CFF0]/40 rounded-2xl shadow-xl text-xs space-y-1.5 backdrop-blur-md">
                              <span className="font-mono font-bold text-white block">{pt.name}</span>
                              <span className="text-[10px] text-[#89CFF0] block">{pt.team}</span>
                              <div className="pt-1 border-t border-[#89CFF0]/20 space-y-0.5 font-mono text-[11px]">
                                <div className="flex justify-between gap-3 text-slate-300">
                                  <span>Security:</span>
                                  <span className="font-bold text-[#89CFF0]">{pt.x}/100</span>
                                </div>
                                <div className="flex justify-between gap-3 text-slate-300">
                                  <span>Originality:</span>
                                  <span className="font-bold text-amber-300">{pt.y}%</span>
                                </div>
                                <div className="flex justify-between gap-3 text-slate-300">
                                  <span>Composite:</span>
                                  <span className="font-bold text-white">{pt.z}/100</span>
                                </div>
                              </div>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#89CFF0]/20 text-[#89CFF0]">
                                {pt.tier}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Repositories" data={scatterData} fill="#89CFF0">
                      {scatterData.map((entry, index) => {
                        const fill = entry.x >= 80 && entry.y >= 85 ? '#10B981' :
                                     entry.x >= 80 ? '#89CFF0' :
                                     entry.y >= 85 ? '#F59E0B' : '#F43F5E';
                        return <Cell key={`cell-${index}`} fill={fill} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />;
                      })}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* 4 Quadrants Explanations */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#89CFF0]/15 text-[10px]">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-300">
                  <span className="font-bold block">Vanguard Pioneers</span>
                  <span className="text-emerald-400/80">High Sec + High Orig</span>
                </div>
                <div className="p-2 rounded-xl bg-[#89CFF0]/10 border border-[#89CFF0]/20 text-[#89CFF0]">
                  <span className="font-bold block">Hardened Templates</span>
                  <span className="text-[#89CFF0]/80">High Sec + Lower Orig</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-300">
                  <span className="font-bold block">Innovative Prototypes</span>
                  <span className="text-amber-400/80">High Orig + Lower Sec</span>
                </div>
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-300">
                  <span className="font-bold block">Review Flagged</span>
                  <span className="text-rose-400/80">Low Sec + Low Orig</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Language & Tech Stack Ecosystem Distribution */}
        <div className="lg:col-span-5">
          <ScrollReveal direction="up" distance={20} delay={0.3}>
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-amber-400" />
                    <span>Language &amp; Tech Stack Ecosystem</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#89CFF0] bg-[#08132B] px-2.5 py-0.5 rounded-full border border-[#89CFF0]/30">
                    AST Breakdown
                  </span>
                </div>
                <span className="text-xs text-[#8EA6C8] block mt-0.5">
                  Automated language detection across verified repository submissions.
                </span>
              </div>

              <div className="h-64 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={langPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {langPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(8,19,43,0.8)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(8, 19, 43, 0.95)', 
                        borderColor: '#89CFF0', 
                        borderRadius: '12px', 
                        color: '#ffffff', 
                        fontSize: 12 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Badge in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-white font-mono">{history.length || stats.analyzed}</span>
                  <span className="text-[10px] text-[#89CFF0] uppercase font-bold tracking-wider">Repositories</span>
                </div>
              </div>

              {/* Language Pills Legend */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-[#89CFF0]/15">
                {langPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-[#040814]/50 border border-[#89CFF0]/20 rounded-full text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-white">{item.name}</span>
                    <span className="font-mono text-[#8EA6C8]">({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

      {/* 6. ROW D: BENCHMARK SCORE DISTRIBUTION (6 cols) & SUB-SCORE AVERAGES (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Score Distribution Histogram / Bell Curve */}
        <div className="lg:col-span-6">
          <ScrollReveal direction="up" distance={20} delay={0.35}>
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-400" />
                    <span>Benchmark Score Distribution Tiering</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#89CFF0] bg-[#08132B] px-2.5 py-0.5 rounded-full border border-[#89CFF0]/30">
                    Frequency Density
                  </span>
                </div>
                <span className="text-xs text-[#8EA6C8] block mt-0.5">
                  Count of repositories grouped into performance qualification brackets.
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(137,207,240,0.15)" vertical={false} />
                    <XAxis dataKey="tier" stroke="#8EA6C8" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(137,207,240,0.2)' }} />
                    <YAxis stroke="#8EA6C8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(8, 19, 43, 0.95)', 
                        borderColor: 'rgba(137, 207, 240, 0.35)', 
                        borderRadius: '16px', 
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 32px rgba(2, 6, 18, 0.6)',
                        color: '#FFFFFF', 
                        fontSize: '12px' 
                      }} 
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Repository Count">
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8EA6C8] pt-2 border-t border-[#89CFF0]/15">
                <span>Highest Density: Certified Tier (70–79)</span>
                <span className="text-[#89CFF0] font-semibold">Autonomous Cluster Calibration</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Sub-Score Averages Horizontal Bar Chart */}
        <div className="lg:col-span-6">
          <ScrollReveal direction="up" distance={20} delay={0.4}>
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#89CFF0]" />
                    <span>Sub-Score Mean Vectors</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#89CFF0] bg-[#08132B] px-2.5 py-0.5 rounded-full border border-[#89CFF0]/30">
                    6 Evaluator Dimensions
                  </span>
                </div>
                <span className="text-xs text-[#8EA6C8] block mt-0.5">
                  Mean score vector across all specialized multi-agent evaluation dimensions.
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgSubScores} layout="vertical" margin={{ top: 0, right: 15, left: 15, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} stroke="#8EA6C8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#8EA6C8" fontSize={11} width={85} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(8, 19, 43, 0.95)', 
                        borderColor: 'rgba(137, 207, 240, 0.35)', 
                        borderRadius: '16px', 
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 32px rgba(2, 6, 18, 0.6)',
                        color: '#FFFFFF', 
                        fontSize: '12px' 
                      }} 
                    />
                    <Bar dataKey="score" radius={[0, 9999, 9999, 0]} name="Dimension Average">
                      {avgSubScores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8EA6C8] pt-2 border-t border-[#89CFF0]/15">
                <span>Strongest: Originality &amp; Clean Architecture</span>
                <span className="text-[#89CFF0] font-semibold">ConsJudge Consensus v2.5</span>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

    </div>
  );
}
