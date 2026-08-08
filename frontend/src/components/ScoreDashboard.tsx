import React from 'react';
import { CheckCircle2, XCircle, Cpu, Zap, Database, Shield, Layout, Beaker } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface FinalReport {
  executive_summary: string;
  strengths: string[];
  weaknesses: string[];
  overall_score: number;
  sec?: number;
  arch?: number;
  perf?: number;
  testing_score?: number;
  db_score?: number;
  orig?: number;
  repoName?: string;
  confidence_score?: number;
  variance_margin?: number;
  consistency_status?: string;
  judge_passes?: number;
}

interface ScoreDashboardProps {
  report: FinalReport;
}

export function ScoreDashboard({ report }: ScoreDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceBadge = () => {
    const status = report.consistency_status || 'HIGH_CONFIDENCE';
    const variance = report.variance_margin !== undefined ? report.variance_margin : 0.0;
    const passes = report.judge_passes || 2;
    const conf = report.confidence_score ? Math.round(report.confidence_score * 100) : 95;

    if (status === 'HIGH_CONFIDENCE') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>ConsJudge Verified • High Consistency (±{variance} pts, {conf}% Conf.)</span>
        </div>
      );
    }
    if (status === 'MODERATE_CONFIDENCE') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>ConsJudge: Moderate Variance (±{variance} pts, {conf}% Conf.)</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
        <Shield className="w-3.5 h-3.5 text-rose-400" />
        <span>ConsJudge Alert: Low Consistency (±{variance} pts • Review Recommended)</span>
      </div>
    );
  };

  const chartData = [
    { name: 'Security', score: report.sec || 0, fill: '#3b82f6' },
    { name: 'Architecture', score: report.arch || 0, fill: '#10b981' },
    { name: 'Performance', score: report.perf || 0, fill: '#f59e0b' },
    { name: 'Testing', score: report.testing_score || 0, fill: '#ef4444' },
    { name: 'Database', score: report.db_score || 0, fill: '#06b6d4' },
    { name: 'Originality', score: report.orig || 0, fill: '#8b5cf6' },
  ];

  return (
    <div id="report-dashboard" className="w-full mx-auto space-y-4 animate-in fade-in zoom-in duration-500 bg-[#0A0E17] p-5 rounded-3xl">
      {/* Header / Score Section */}
      <div className="flex flex-col md:flex-row items-center justify-between p-5 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl gap-4">
        <div className="flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">AI Evaluation Complete</h2>
            {getConfidenceBadge()}
          </div>
          <p className="text-zinc-400 leading-relaxed text-sm max-w-2xl">
            {report.executive_summary}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-black rounded-3xl border border-zinc-800 shadow-inner min-w-[130px] min-h-[120px]">
          <div className="flex items-baseline gap-1">
            <span className={`text-5xl font-black ${getScoreColor(report.overall_score)} drop-shadow-lg`}>
              {report.overall_score}
            </span>
            {report.variance_margin !== undefined && (
              <span className="text-xs text-zinc-500 font-mono">±{report.variance_margin}</span>
            )}
          </div>
          <span className="text-zinc-500 text-[10px] font-medium mt-1 tracking-widest uppercase">Overall Score</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
        <h3 className="text-lg font-semibold text-white mb-3">Sub-Score Breakdown</h3>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#52525b" />
              <YAxis dataKey="name" type="category" stroke="#a1a1aa" width={100} />
              <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Agents Architecture */}
      <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          AI Agents Architecture
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <div className="flex flex-col p-2 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-zinc-200 text-sm font-medium">Security</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded inline-block w-fit border border-orange-500/20 text-orange-400/80">Groq (llama-3.3)</span>
          </div>
          <div className="flex flex-col p-2 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Layout className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-zinc-200 text-sm font-medium">Architecture</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded inline-block w-fit border border-orange-500/20 text-orange-400/80">Groq (llama-3.3)</span>
          </div>
          <div className="flex flex-col p-2 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-zinc-200 text-sm font-medium">Performance</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded inline-block w-fit border border-orange-500/20 text-orange-400/80">Groq (llama-3.3)</span>
          </div>
          <div className="flex flex-col p-2 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Beaker className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-zinc-200 text-sm font-medium">Testing</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded inline-block w-fit border border-orange-500/20 text-orange-400/80">Groq (llama-3.1)</span>
          </div>
          <div className="flex flex-col p-2 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-zinc-200 text-sm font-medium">Database</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded inline-block w-fit border border-blue-500/20 text-blue-400/80">Gemini (flash)</span>
          </div>
          <div className="flex flex-col p-2 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-zinc-200 text-sm font-medium">Supervisor</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded inline-block w-fit border border-emerald-500/20 text-emerald-400/80">ConsJudge Multi-Pass</span>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Key Strengths
          </h3>
          <ul className="space-y-2">
            {report.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <div className="mt-1.5 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                <span className="leading-snug">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {report.weaknesses.map((weakness, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <div className="mt-1.5 w-1 h-1 rounded-full bg-red-500 shrink-0" />
                <span className="leading-snug">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
