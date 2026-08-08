import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Zap, 
  Database, 
  Shield, 
  Layout, 
  Beaker, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  AlertTriangle, 
  FileCode,
  Fingerprint,
  Bot,
  MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { JudgeChatBot } from './JudgeChatBot';

export interface SecurityVulnerability {
  cwe_id: string;
  severity: string;
  file_path?: string;
  line_range?: string;
  trigger_vector?: string;
  remediation_patch?: string;
  test_guidance?: string;
}

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
  cwe_matrix?: SecurityVulnerability[];
  detected_clones?: string[];
  structural_evidence?: string[];
  clone_risk_level?: string;
}

interface ScoreDashboardProps {
  report: FinalReport;
  startWithChatOpen?: boolean;
}

export function ScoreDashboard({ report, startWithChatOpen = false }: ScoreDashboardProps) {
  const [expandedVuln, setExpandedVuln] = useState<number | null>(null);
  const [copiedPatchIdx, setCopiedPatchIdx] = useState<number | null>(null);
  const [showChatBot, setShowChatBot] = useState<boolean>(startWithChatOpen);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityBadge = (severity: string) => {
    const s = severity.toUpperCase();
    if (s === 'CRITICAL') return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (s === 'HIGH') return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    if (s === 'MEDIUM') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
  };

  const handleCopyPatch = (patch: string, idx: number) => {
    navigator.clipboard.writeText(patch);
    setCopiedPatchIdx(idx);
    setTimeout(() => setCopiedPatchIdx(null), 2000);
  };

  const getConfidenceBadge = () => {
    const status = report.consistency_status || 'HIGH_CONFIDENCE';
    const variance = report.variance_margin !== undefined ? report.variance_margin : 0.0;
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
            
            {/* Talk to Repository Trigger Button */}
            <button
              onClick={() => setShowChatBot(!showChatBot)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{showChatBot ? "Close Judge Copilot" : "💬 Talk to Repository"}</span>
            </button>
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

      {/* Interactive Talk to Repository Judge Copilot Drawer */}
      {showChatBot && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <JudgeChatBot report={report} onClose={() => setShowChatBot(false)} />
        </div>
      )}

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
          AI Agents Architecture (6 Parallel Nodes + ConsJudge Supervisor)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
          <div className="flex flex-col p-2 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-zinc-200 text-sm font-medium">Security</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded inline-block w-fit border border-blue-500/20 text-blue-400/80">AutoReview (FSE '25)</span>
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
              <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-zinc-200 text-sm font-medium">Similarity</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded inline-block w-fit border border-purple-500/20 text-purple-400/80">AST + CodeBERT</span>
          </div>
          <div className="flex flex-col p-2 bg-black/40 rounded-xl border border-zinc-800/50 hover:border-zinc-700 transition-colors justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-zinc-200 text-sm font-medium">Supervisor</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded inline-block w-fit border border-emerald-500/20 text-emerald-400/80">ConsJudge Multi-Pass</span>
          </div>
        </div>
      </div>

      {/* Originality & Clone Detection Card */}
      <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-purple-400" />
            AST & CodeBERT Originality Verification
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${report.clone_risk_level === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-purple-500/10 text-purple-300 border-purple-500/30'}`}>
              Risk Level: {report.clone_risk_level || 'LOW'}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
              Originality Score: {report.orig || 100}/100
            </span>
          </div>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed mb-3">
          Evaluated against known canonical templates and semantic clone clusters using normalized Tree-Sitter AST hash trees and CodeBERT neural embeddings.
        </p>

        {report.structural_evidence && report.structural_evidence.length > 0 && (
          <div className="mt-2 space-y-1.5 bg-black/40 p-3 rounded-xl border border-zinc-800/60">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Structural Evidence</span>
            {report.structural_evidence.map((ev, i) => (
              <div key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>{ev}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3-Stage Security AutoReview Pipeline Card with Interactive Diffs */}
      <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-400" />
            AutoReview: 3-Stage Security Pipeline (ACM FSE 2025)
          </h3>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300">
            Detect → Locate → Repair Active
          </span>
        </div>

        {/* 3 Steps Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 mb-4">
          <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/60">
            <span className="text-xs font-bold text-rose-400 block mb-1">1. DETECT (CWE Engine)</span>
            <p className="text-[11px] text-zinc-400">Classifies vulnerability taxonomy (CWE-89, CWE-798, CWE-78) using AST & semantic pattern matching.</p>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/60">
            <span className="text-xs font-bold text-amber-400 block mb-1">2. LOCATE (Pinpoint Vector)</span>
            <p className="text-[11px] text-zinc-400">Isolates exact file coordinates, vulnerable code lines, and attack vector exploit paths.</p>
          </div>
          <div className="p-3 bg-black/40 rounded-xl border border-zinc-800/60">
            <span className="text-xs font-bold text-emerald-400 block mb-1">3. REPAIR (Unified Patch)</span>
            <p className="text-[11px] text-zinc-400">Generates ready-to-merge unified git diffs and defensive regression unit tests.</p>
          </div>
        </div>

        {/* Interactive CWE Matrix and Remediation Diffs */}
        {report.cwe_matrix && report.cwe_matrix.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              Verified Security Findings & Remediation Patches ({report.cwe_matrix.length})
            </h4>

            {report.cwe_matrix.map((item, idx) => {
              const isExpanded = expandedVuln === idx;
              return (
                <div key={idx} className="bg-black/60 rounded-xl border border-zinc-800 overflow-hidden">
                  <div 
                    onClick={() => setExpandedVuln(isExpanded ? null : idx)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                      <span className="text-sm font-medium text-white">{item.cwe_id}</span>
                      <span className="text-xs text-zinc-500 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {item.file_path} ({item.line_range})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-xs">{isExpanded ? 'Hide Details' : 'View Fix'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-zinc-800/80 space-y-3 bg-zinc-950/60">
                      <div>
                        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block mb-1">Exploit / Trigger Vector</span>
                        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/50">
                          {item.trigger_vector}
                        </p>
                      </div>

                      {item.remediation_patch && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Unified Remediation Patch (Git Diff)</span>
                            <button 
                              onClick={() => handleCopyPatch(item.remediation_patch || '', idx)}
                              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 px-2 py-1 rounded transition-colors"
                            >
                              {copiedPatchIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedPatchIdx === idx ? 'Copied!' : 'Copy Patch'}</span>
                            </button>
                          </div>
                          <pre className="text-xs font-mono p-3 bg-black rounded-lg border border-zinc-800 overflow-x-auto text-emerald-300">
                            {item.remediation_patch}
                          </pre>
                        </div>
                      )}

                      {item.test_guidance && (
                        <div>
                          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">Defensive Test & Verification Guidance</span>
                          <p className="text-xs text-zinc-400 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/40">
                            {item.test_guidance}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
