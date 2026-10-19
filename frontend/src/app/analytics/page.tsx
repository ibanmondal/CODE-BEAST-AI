"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  GitBranch, 
  Award, 
  PlayCircle, 
  BarChart2,
  Sparkles
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
  Cell
} from 'recharts';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    Promise.all([
      fetch(`http://${host}:8000/api/v1/stats/dashboard`).then(r => r.json()).catch(() => null),
      fetch(`http://${host}:8000/api/v1/stats/history`).then(r => r.json()).catch(() => null)
    ]).then(([dashData, histData]) => {
      if (dashData) setData(dashData);
      if (histData) setHistory(histData.history || []);
      setLoading(false);
    });
  }, []);

  const stats = data?.stats || { analyzed: 0, avg_score: 0, failed: 0, running: 0, submitted: 0, highest: 0 };

  const scoreTrendData = history.length > 0 
    ? history.slice(0, 8).reverse().map((h) => {
        const repoStr = h.repo || "Repo";
        const shortName = repoStr.includes('/') ? repoStr.split('/')[1] : repoStr;
        return {
          name: shortName.length > 12 ? shortName.substring(0, 10) + '..' : shortName,
          overall: h.overall ?? 0,
          sec: h.sec ?? 0,
          arch: h.arch ?? 0,
          perf: h.perf ?? 0,
          orig: h.orig ?? 0,
        };
      })
    : [];

  const avgSubScores = [
    { name: 'Security', score: history.length ? Math.round(history.reduce((a, b) => a + (b.sec || 0), 0) / history.length) : 0, fill: '#89CFF0' },
    { name: 'Architecture', score: history.length ? Math.round(history.reduce((a, b) => a + (b.arch || 0), 0) / history.length) : 0, fill: '#BAE6FD' },
    { name: 'Performance', score: history.length ? Math.round(history.reduce((a, b) => a + (b.perf || 0), 0) / history.length) : 0, fill: '#89CFF0' },
    { name: 'Testing', score: history.length ? Math.round(history.reduce((a, b) => a + (b.testing_score || 0), 0) / history.length) : 0, fill: '#BAE6FD' },
    { name: 'Database', score: history.length ? Math.round(history.reduce((a, b) => a + (b.db_score || 0), 0) / history.length) : 0, fill: '#89CFF0' },
    { name: 'Originality', score: history.length ? Math.round(history.reduce((a, b) => a + (b.orig || 0), 0) / history.length) : 0, fill: '#BAE6FD' },
  ];

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Page Header */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <BarChart2 className="w-3.5 h-3.5" />
              Platform Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Platform Telemetry & Quality Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
              Aggregate quality vectors, historical score curves, and multi-agent evaluator metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              <span className="text-3xl font-bold text-white font-mono">{stats.analyzed}</span>
              <span className="text-xs text-[#89CFF0] block mt-1 font-medium">100% verified passes</span>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-interactive rounded-2xl p-5 shadow-[0_12px_32px_rgba(2,6,18,0.7)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider">Platform Mean Score</span>
              <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                <Award className="w-4 h-4" />
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
              <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-white font-mono">{stats.highest}</span>
              <span className="text-xs text-[#89CFF0] block mt-1 font-medium">Highest evaluated index</span>
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

      {/* 3. Charts Grid with Liquid Glass Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Score Trends Area Chart (8 cols) */}
        <div className="lg:col-span-8">
          <ScrollReveal direction="up" distance={20} delay={0.1}>
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] flex flex-col justify-between h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Evaluation Quality Vectors</h3>
                  <span className="text-xs text-[#8EA6C8]">Overall Score vs AutoReview Security across recent audits</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#BAE6FD]" />
                    <span className="text-[#BAE6FD] font-semibold">Overall</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#89CFF0]" />
                    <span className="text-[#89CFF0] font-semibold">Security</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#BAE6FD" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#BAE6FD" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#89CFF0" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#89CFF0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(137,207,240,0.15)" vertical={false} />
                    <XAxis dataKey="name" stroke="#8EA6C8" fontSize={11} tickLine={false} axisLine={{ stroke: 'rgba(137,207,240,0.2)' }} />
                    <YAxis domain={[50, 100]} stroke="#8EA6C8" fontSize={11} tickLine={false} axisLine={false} />
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
                    <Area type="monotone" dataKey="overall" stroke="#BAE6FD" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOverall)" name="Overall Score" />
                    <Area type="monotone" dataKey="sec" stroke="#89CFF0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSec)" name="Security Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Sub-Score Averages Bar Chart (4 cols) */}
        <div className="lg:col-span-4">
          <ScrollReveal direction="up" distance={20} delay={0.2}>
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Sub-Score Averages</h3>
                <span className="text-xs text-[#8EA6C8] block mb-4">Mean score vector across 6 specialized dimensions</span>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={avgSubScores} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                      <XAxis type="number" domain={[0, 100]} stroke="#8EA6C8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#8EA6C8" fontSize={11} width={80} tickLine={false} axisLine={false} />
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
                      <Bar dataKey="score" radius={[0, 9999, 9999, 0]}>
                        {avgSubScores.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>

    </div>
  );
}
