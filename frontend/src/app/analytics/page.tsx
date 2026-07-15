"use client";

import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Users, GitBranch, Award, Activity, AlertTriangle, PlayCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://' + window.location.hostname + ':8000/api/v1/stats/dashboard')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, []);

  const stats = data?.stats || { analyzed: 0, avg_score: 0, failed: 0, running: 0 };
  const pieData = data?.pieData || [];
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Analytics Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Platform metrics and hackathon evaluation insights.</p>
        </div>
        <select className="bg-[#141C2F] border border-gray-800 text-white text-sm rounded-lg px-4 py-2 outline-none focus:border-blue-500">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>All Time</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Repos Analyzed', value: stats.analyzed.toString(), change: '', icon: GitBranch, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Average Score', value: `${stats.avg_score}/100`, change: '', icon: Award, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Failed Jobs', value: stats.failed.toString(), change: '', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'Running Jobs', value: stats.running.toString(), change: '', icon: PlayCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#141C2F] border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Mock */}
        <div className="lg:col-span-2 bg-[#141C2F] border border-gray-800 rounded-xl p-6 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-medium">Evaluation Volume vs Avg Score</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-xs text-gray-400">Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                <span className="text-xs text-gray-400">Score</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 border-b border-l border-gray-800 pb-2 pl-2">
            {/* CSS-based mock chart */}
            {[40, 60, 30, 80, 50, 90, 70, 40, 60, 100, 80, 50].map((h, i) => (
              <div key={i} className="w-full flex justify-center items-end gap-1 h-full">
                <div className="w-1/2 bg-blue-500/80 hover:bg-blue-400 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
                <div className="w-1/2 bg-purple-500/80 hover:bg-purple-400 rounded-t-sm transition-all" style={{ height: `${(h + 20) % 100 || 20}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 px-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Top Languages */}
          <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-6">Language Distribution</h3>
            <div className="space-y-4">
              {pieData.length > 0 ? pieData.map((item: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-300 font-medium">{item.name}</span>
                    <span className="text-gray-400">{item.value} repos</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${Math.min(100, item.value * 10)}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
              )) : (
                <div className="text-gray-500 text-sm py-4">No data available yet.</div>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              Agent System Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-800/30">
                <span className="text-sm text-gray-400">Security Agent</span>
                <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded">99.8% Uptime</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-800/30">
                <span className="text-sm text-gray-400">Architecture Agent</span>
                <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded">99.5% Uptime</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-gray-800/30">
                <span className="text-sm text-gray-400">Similarity Engine</span>
                <span className="text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">High Load</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
