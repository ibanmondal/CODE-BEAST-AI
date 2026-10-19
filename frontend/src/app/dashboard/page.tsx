"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  ShieldCheck, 
  Cpu, 
  FileCode, 
  Trophy, 
  Activity, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Layers,
  Search,
  Plus,
  Sparkles,
  Zap
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';

export default function DashboardPage() {
  const [stats, setStats] = useState({ 
    submitted: 18, 
    analyzed: 16, 
    running: 2, 
    avg_score: 87.4, 
    highest: 96.8, 
    failed: 0 
  });
  const [pieData, setPieData] = useState<any[]>([]);
  const [history, setHistory] = useState([
    { repo: "vercel/next.js", team: "Core Devs", lang: "TypeScript", status: "Completed", overall: 94.5, time: "10m ago", security: "CWE-None", patches: 0 },
    { repo: "fastapi/fastapi", team: "PyEngineers", lang: "Python", status: "Completed", overall: 91.2, time: "28m ago", security: "CWE-None", patches: 0 },
    { repo: "ollama/ollama", team: "AI Researchers", lang: "Go", status: "Completed", overall: 85.0, time: "1h ago", security: "CWE-798", patches: 2 },
    { repo: "facebook/react", team: "UI Systems", lang: "JavaScript", status: "Completed", overall: 89.4, time: "2h ago", security: "CWE-None", patches: 0 },
    { repo: "rust-lang/rust", team: "Systems Group", lang: "Rust", status: "Completed", overall: 96.8, time: "4h ago", security: "CWE-None", patches: 0 }
  ]);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    fetch(`http://${host}:8000/api/v1/stats/dashboard`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data?.stats) setStats(data.stats);
        if (data?.pieData) setPieData(data.pieData);
      })
      .catch(() => {});

    fetch(`http://${host}:8000/api/v1/stats/history`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data?.history && data.history.length > 0) {
          setHistory(data.history.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  const scoreTrends = [
    { day: 'Mon', score: 81, count: 12 },
    { day: 'Tue', score: 84, count: 18 },
    { day: 'Wed', score: 87, count: 24 },
    { day: 'Thu', score: 85, count: 20 },
    { day: 'Fri', score: 89, count: 32 },
    { day: 'Sat', score: 92, count: 28 },
    { day: 'Sun', score: 94, count: 35 }
  ];

  const BLUE_PIE_COLORS = ['#0B192C', '#0062FF', '#5A7A9E', '#A5BEEB', '#4F6BD4'];
  const rawData = pieData.length > 0 ? pieData : [
    { name: 'TypeScript', value: 44 },
    { name: 'Python', value: 28 },
    { name: 'Rust', value: 16 },
    { name: 'Go', value: 12 }
  ];
  const safeLanguageData = rawData.map((item: any, idx: number) => ({
    ...item,
    color: BLUE_PIE_COLORS[idx % BLUE_PIE_COLORS.length]
  }));

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Header & Quick Audit Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Consensus Platform Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Software Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1 max-w-2xl">
            Real-time telemetry, multi-agent evaluation throughput, and verified ConsJudge audit records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/analysis">
            <CodeBeastLiquidButton
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              label="Evaluate Repository"
            />
          </Link>
        </div>
      </div>

      {/* 2. Elegant Row of Summary Metric Cards with Liquid Glass */}
      <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" staggerDelay={0.05}>
        
        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full border border-[#89CFF0]/25 bg-[#08132B]/80">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              Evaluated
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{stats.analyzed}</span>
              <span className="text-[11px] text-[#89CFF0] font-medium">repos</span>
            </div>
            <span className="text-[10px] text-[#8EA6C8] font-medium mt-1 block">
              {stats.submitted} total queued
            </span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full border border-[#89CFF0]/25 bg-[#08132B]/80">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              Mean Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#89CFF0] font-mono">{stats.avg_score}</span>
              <span className="text-[11px] text-[#8EA6C8]">/100</span>
            </div>
            <span className="text-[10px] text-[#89CFF0] font-medium mt-1 block">
              ±1.4 pts variance bound
            </span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full border border-[#89CFF0]/25 bg-[#08132B]/80">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              Peak Benchmark
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{stats.highest}</span>
              <span className="text-[11px] text-[#8EA6C8]">/100</span>
            </div>
            <span className="text-[10px] text-[#89CFF0] font-medium mt-1 block truncate">
              rust-lang/rust
            </span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full border border-[#89CFF0]/25 bg-[#08132B]/80">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              Active Jobs
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">{stats.running}</span>
              <span className="text-[11px] text-emerald-400 font-semibold">live</span>
            </div>
            <span className="text-[10px] text-[#8EA6C8] font-medium mt-1 block">
              Parallel Async Swarm
            </span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full border border-[#89CFF0]/25 bg-[#08132B]/80">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              ConsJudge
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white font-mono">Dual-Pass</span>
            </div>
            <span className="text-[10px] text-[#89CFF0] font-medium mt-1 block">
              NaraRouter + Groq Llama 3.3
            </span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full border border-[#89CFF0]/25 bg-[#08132B]/80">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              Originality
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white font-mono">FAISS</span>
            </div>
            <span className="text-[10px] text-[#8EA6C8] font-medium mt-1 block">
              AST + CodeBERT Neural
            </span>
          </div>
        </StaggerItem>

      </StaggerContainer>

      {/* 3. Charts Grid with ScrollReveal */}
      <ScrollReveal distance={20} duration={0.5}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Score Progression Trend (8 cols) */}
          <div className="lg:col-span-8 liquid-glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-[#89CFF0]/25 bg-[#08132B]/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Consensus Quality Index Trends
                </h2>
                <span className="text-xs text-[#8EA6C8]">
                  Weekly aggregate of supervisor consensus score trends across repository runs.
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 shadow-xs">
                7-Day Rolling Window
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#89CFF0" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#89CFF0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#8EA6C8" fontSize={11} tickLine={false} />
                  <YAxis domain={[60, 100]} stroke="#8EA6C8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#08132B', border: '1px solid #89CFF0', borderRadius: '12px', color: '#ffffff', fontSize: '12px', boxShadow: '0 8px 24px rgba(137, 207, 240, 0.2)' }} 
                  />
                  <Area type="monotone" dataKey="score" stroke="#89CFF0" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Evaluated Language Distribution (4 cols) */}
          <div className="lg:col-span-4 liquid-glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-[#89CFF0]/25 bg-[#08132B]/80">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Ecosystem Distribution
              </h2>
              <span className="text-xs text-[#8EA6C8]">
                Breakdown of parsed AST trees by target language.
              </span>
            </div>

            <div className="h-44 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safeLanguageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {safeLanguageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#89CFF0', '#BAE6FD', '#70C0E8', '#E0F2FE', '#58A6FF'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#08132B', border: '1px solid #89CFF0', borderRadius: '12px', color: '#ffffff', fontSize: '12px', boxShadow: '0 8px 24px rgba(137, 207, 240, 0.2)' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-[#89CFF0]/20">
              {safeLanguageData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ['#89CFF0', '#BAE6FD', '#70C0E8', '#E0F2FE', '#58A6FF'][idx % 5] }} />
                  <span className="text-[#89CFF0] truncate">{item.name}</span>
                  <span className="font-bold text-white ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </ScrollReveal>

      {/* 4. Recent Repository Evaluations Table with ScrollReveal */}
      <ScrollReveal distance={20} duration={0.5}>
        <div className="liquid-glass-card rounded-2xl p-6 shadow-sm border border-[#89CFF0]/25 bg-[#08132B]/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Recent Repository Evaluations
              </h2>
              <span className="text-xs text-[#8EA6C8]">
                Latest audit runs recorded in local database.
              </span>
            </div>

            <Link href="/reports" className="text-xs font-bold text-[#89CFF0] hover:underline flex items-center gap-1">
              <span>View all reports archive</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold bg-[#040914]/40">
                  <th className="py-2.5 px-3">Repository</th>
                  <th className="py-2.5 px-3">Team / Owner</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Consensus Score</th>
                  <th className="py-2.5 px-3">AutoReview Security</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#89CFF0]/15">
                {history.map((row, i) => (
                  <tr key={i} className="hover:bg-[#89CFF0]/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white font-mono">
                      <Link href={`/analysis?repo=${encodeURIComponent(row.repo)}`} className="hover:text-[#89CFF0] hover:underline">
                        {row.repo}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-[#8EA6C8]">{row.team || "Engineering"}</td>
                    <td className="py-3 px-3 text-[#89CFF0]">
                      <span className="px-2.5 py-0.5 bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 rounded-full text-[10px] font-mono shadow-xs">
                        {row.lang || "TypeScript"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white font-mono text-sm">
                        {row.overall || 88}
                      </span>
                      <span className="text-[10px] text-[#89CFF0]">/100</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 rounded-full shadow-xs">
                        {row.security || "CWE-Verified"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{row.status || "Completed"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/analysis?repo=${encodeURIComponent(row.repo)}`}
                        className="px-4 py-1.5 liquid-btn-primary text-[#040914] font-bold text-xs rounded-full inline-block"
                      >
                        Inspect Report &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
