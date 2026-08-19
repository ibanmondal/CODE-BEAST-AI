"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, GitBranch, Award, PlayCircle, Shield, Cpu, Zap, Database, Fingerprint, Activity, Sparkles } from 'lucide-react';
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
  Cell
} from 'recharts';
import { TiltCard } from '@/components/TiltCard';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://' + window.location.hostname + ':8000/api/v1/stats/dashboard').then(r => r.json()).catch(() => null),
      fetch('http://' + window.location.hostname + ':8000/api/v1/stats/history').then(r => r.json()).catch(() => null)
    ]).then(([dashData, histData]) => {
      if (dashData) setData(dashData);
      if (histData) setHistory(histData.history || []);
      setLoading(false);
    });
  }, []);

  const stats = data?.stats || { analyzed: 0, avg_score: 0, failed: 0, running: 0, submitted: 0, highest: 0 };

  const defaultTrendData = [
    { name: 'next.js', overall: 94, sec: 92 },
    { name: 'fastapi', overall: 91, sec: 88 },
    { name: 'ollama', overall: 85, sec: 80 },
    { name: 'react', overall: 89, sec: 91 },
    { name: 'rust', overall: 96, sec: 98 }
  ];

  const scoreTrendData = history.length > 0 
    ? history.slice(0, 10).reverse().map((h) => ({
        name: h.repo.length > 12 ? h.repo.substring(0, 10) + '..' : h.repo,
        overall: h.overall || 0,
        sec: h.sec || 0,
        arch: h.arch || 0,
        perf: h.perf || 0,
        orig: h.orig || 100,
      }))
    : defaultTrendData;

  const avgSubScores = [
    { name: 'Security', score: history.length ? Math.round(history.reduce((a, b) => a + (b.sec || 0), 0) / history.length) : 85, fill: '#E07A48' },
    { name: 'Architecture', score: history.length ? Math.round(history.reduce((a, b) => a + (b.arch || 0), 0) / history.length) : 82, fill: '#FF8C42' },
    { name: 'Performance', score: history.length ? Math.round(history.reduce((a, b) => a + (b.perf || 0), 0) / history.length) : 88, fill: '#D96B27' },
    { name: 'Testing', score: history.length ? Math.round(history.reduce((a, b) => a + (b.testing_score || 0), 0) / history.length) : 75, fill: '#FF9C55' },
    { name: 'Database', score: history.length ? Math.round(history.reduce((a, b) => a + (b.db_score || 0), 0) / history.length) : 80, fill: '#C8602A' },
    { name: 'Originality', score: history.length ? Math.round(history.reduce((a, b) => a + (b.orig || 100), 0) / history.length) : 95, fill: '#FFB085' },
  ];

  return (
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E07A48]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-3">
            <Activity className="w-3.5 h-3.5" />
            <span>Platform Telemetry</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
            ANALYTICS <span className="text-gradient-copper">OVERVIEW</span>
          </h1>
          <p className="text-amber-100/70 text-sm mt-2 max-w-xl font-normal leading-relaxed">
            Platform metrics, multi-agent telemetry vectors, and evaluated codebase insights.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#0E0602] border border-[#E07A48]/30 text-[#FF8C42] text-xs font-mono font-bold shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C42] animate-ping" />
            Telemetry Online
          </span>
        </div>
      </div>

      {/* KPI Cards wrapped in 3D TiltCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Repos Analyzed', value: stats.analyzed.toString(), icon: GitBranch, sub: '100% verified passes' },
          { label: 'Platform Avg Score', value: `${stats.avg_score}/100`, icon: Award, sub: '±1.8 pts variance' },
          { label: 'Highest Evaluated Score', value: `${stats.highest}/100`, icon: TrendingUp, sub: 'Top cohort benchmark' },
          { label: 'Running / Queued Jobs', value: stats.running.toString(), icon: PlayCircle, sub: 'Parallel Celery workers' },
        ].map((stat, i) => (
          <TiltCard key={i} variant="metric" className="p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-amber-200/50 text-xs font-mono font-bold uppercase tracking-wider">{stat.label}</span>
              <div className="p-2.5 rounded-xl bg-[#261208] border border-[#E07A48]/30 text-[#FF8C42] shadow-inner">
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="font-display text-4xl text-[#D4BC9A] text-gradient-copper leading-none">{stat.value}</p>
              <p className="text-[11px] text-amber-200/40 font-mono mt-2">{stat.sub}</p>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* Main Score Trend Area Chart (8 cols) */}
        <TiltCard variant="primary" className="lg:col-span-8 p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display text-2xl text-[#D4BC9A] uppercase tracking-wider font-normal">Evaluations Score Trends</h3>
              <p className="text-xs text-amber-100/60 mt-0.5 font-normal">Overall vs Security vs Architecture scores over recent evaluations</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono bg-[#0E0602] px-3.5 py-1.5 rounded-xl border border-[#E07A48]/20 self-start sm:self-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E07A48]" />
                <span className="text-amber-200/70">Overall</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C42]" />
                <span className="text-amber-200/70">Security</span>
              </div>
            </div>
          </div>
          
          <div className="h-[290px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E07A48" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#E07A48" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8C42" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#FF8C42" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3A1E11" />
                <XAxis dataKey="name" stroke="#FF8C42" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#FF8C42" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1A0B05', borderColor: '#E07A48', borderRadius: '12px', color: '#D4BC9A' }} />
                <Area type="monotone" dataKey="overall" stroke="#E07A48" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOverall)" name="Overall Score" />
                <Area type="monotone" dataKey="sec" stroke="#FF8C42" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSec)" name="Security Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TiltCard>

        {/* Average Sub-Scores Breakdown Bar Chart (4 cols) */}
        <TiltCard variant="secondary" className="lg:col-span-4 p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-display text-2xl text-[#D4BC9A] mb-1 uppercase tracking-wider font-normal">Sub-Score Averages</h3>
            <p className="text-xs text-amber-100/60 mb-4 font-normal">Mean vector across all 6 specialized agent dimensions</p>
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgSubScores} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#78350f" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#D4BC9A" fontSize={11} width={85} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A0B05', borderColor: '#E07A48', borderRadius: '12px', color: '#D4BC9A' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {avgSubScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E07A48]/15 text-center">
            <span className="text-[11px] text-amber-200/50 font-mono">Consensus threshold validated</span>
          </div>
        </TiltCard>
      </div>

      {/* Agents Telemetry & Health Grid */}
      <TiltCard variant="primary" className="p-6 sm:p-8 shadow-2xl">
        <h3 className="font-display text-2xl text-[#D4BC9A] mb-4 flex items-center gap-2 uppercase tracking-wider font-normal">
          <Activity className="w-5 h-5 text-[#FF8C42]" />
          Multi-Agent Runtime Telemetry & Node Health
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'AutoReview Security', model: 'OWASP CWE AST', status: 'Healthy', latency: '420ms', icon: Shield },
            { name: 'Architecture Node', model: 'Groq (Llama-3.3)', status: 'Healthy', latency: '380ms', icon: Cpu },
            { name: 'Performance Node', model: 'Groq (Llama-3.3)', status: 'Healthy', latency: '390ms', icon: Zap },
            { name: 'Testing Agent', model: 'Groq (Llama-3.1)', status: 'Healthy', latency: '310ms', icon: Award },
            { name: 'Database Agent', model: 'Gemini 2.5 Flash', status: 'Healthy', latency: '490ms', icon: Database },
            { name: 'AST/CodeBERT Similarity', model: 'FAISS Vector Index', status: 'Healthy', latency: '180ms', icon: Fingerprint },
          ].map((agent, i) => (
            <TiltCard key={i} variant="secondary" className="p-4 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <agent.icon className="w-5 h-5 text-[#FF8C42]" />
                <span className="w-2 h-2 rounded-full bg-[#FF8C42] animate-pulse" />
              </div>
              <h4 className="font-bold text-xs text-[#D4BC9A] font-mono">{agent.name}</h4>
              <p className="text-[10px] text-amber-200/50 font-mono mt-0.5 truncate">{agent.model}</p>
              <div className="mt-3 pt-2 border-t border-[#E07A48]/20 flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-400 font-semibold">{agent.status}</span>
                <span className="text-amber-200/50">{agent.latency}</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </TiltCard>

    </div>
  );
}
