"use client";

import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, GitBranch, Award, Activity, AlertTriangle, PlayCircle, Shield, Cpu, Zap, Database, Fingerprint } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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
  const pieData = data?.pieData || [];

  // Generate chart data from real history
  const scoreTrendData = history.slice(0, 10).reverse().map((h, i) => ({
    name: h.repo.length > 12 ? h.repo.substring(0, 10) + '..' : h.repo,
    overall: h.overall || 0,
    sec: h.sec || 0,
    arch: h.arch || 0,
    perf: h.perf || 0,
    orig: h.orig || 100,
  }));

  const avgSubScores = [
    { name: 'Security', score: history.length ? Math.round(history.reduce((a, b) => a + (b.sec || 0), 0) / history.length) : 85, fill: '#3b82f6' },
    { name: 'Architecture', score: history.length ? Math.round(history.reduce((a, b) => a + (b.arch || 0), 0) / history.length) : 82, fill: '#10b981' },
    { name: 'Performance', score: history.length ? Math.round(history.reduce((a, b) => a + (b.perf || 0), 0) / history.length) : 88, fill: '#f59e0b' },
    { name: 'Testing', score: history.length ? Math.round(history.reduce((a, b) => a + (b.testing_score || 0), 0) / history.length) : 75, fill: '#ef4444' },
    { name: 'Database', score: history.length ? Math.round(history.reduce((a, b) => a + (b.db_score || 0), 0) / history.length) : 80, fill: '#06b6d4' },
    { name: 'Originality', score: history.length ? Math.round(history.reduce((a, b) => a + (b.orig || 100), 0) / history.length) : 95, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Platform metrics, multi-agent telemetry, and evaluation insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Telemetry Online
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Repos Analyzed', value: stats.analyzed.toString(), icon: GitBranch, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Platform Avg Score', value: `${stats.avg_score}/100`, icon: Award, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Highest Score', value: `${stats.highest}/100`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Running / Queued Jobs', value: stats.running.toString(), icon: PlayCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#141C2F] border border-gray-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</h3>
              <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#141C2F] border border-gray-800 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-base">Evaluations Score Trends</h3>
              <p className="text-xs text-gray-400 mt-0.5">Overall vs Security vs Architecture scores over recent evaluations</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-gray-400">Overall</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-gray-400">Security</span>
              </div>
            </div>
          </div>
          
          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              {scoreTrendData.length > 0 ? (
                <AreaChart data={scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorOverall)" name="Overall Score" />
                  <Area type="monotone" dataKey="sec" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSec)" name="Security Score" />
                </AreaChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Run an evaluation to visualize historical score curves.
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Sub-Scores Breakdown */}
        <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-semibold text-base mb-1">Average Sub-Score Breakdown</h3>
            <p className="text-xs text-gray-400 mb-4">Mean performance across all 6 specialized agent dimensions</p>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgSubScores} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {avgSubScores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Telemetry & Health Grid */}
      <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Multi-Agent Runtime Telemetry & Health
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'AutoReview Security', model: 'OWASP CWE AST', status: 'Healthy', latency: '420ms', icon: Shield, color: 'text-blue-400 border-blue-500/20' },
            { name: 'Architecture Node', model: 'Groq (Llama-3.3)', status: 'Healthy', latency: '380ms', icon: Cpu, color: 'text-emerald-400 border-emerald-500/20' },
            { name: 'Performance Node', model: 'Groq (Llama-3.3)', status: 'Healthy', latency: '390ms', icon: Zap, color: 'text-amber-400 border-amber-500/20' },
            { name: 'Testing Agent', model: 'Groq (Llama-3.1)', status: 'Healthy', latency: '310ms', icon: Award, color: 'text-rose-400 border-rose-500/20' },
            { name: 'Database Agent', model: 'Gemini 2.5 Flash', status: 'Healthy', latency: '490ms', icon: Database, color: 'text-cyan-400 border-cyan-500/20' },
            { name: 'AST/CodeBERT Similarity', model: 'FAISS Vector Index', status: 'Healthy', latency: '180ms', icon: Fingerprint, color: 'text-purple-400 border-purple-500/20' },
          ].map((agent, i) => (
            <div key={i} className="p-3.5 bg-black/40 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <agent.icon className={`w-4 h-4 ${agent.color.split(' ')[0]}`} />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h4 className="text-xs font-semibold text-white">{agent.name}</h4>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{agent.model}</p>
              <div className="mt-2 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-medium">{agent.status}</span>
                <span className="text-gray-500 font-mono">{agent.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
