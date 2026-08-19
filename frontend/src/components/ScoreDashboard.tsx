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
  FileCode,
  Fingerprint,
  Bot,
  Sparkles,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { JudgeChatBot } from './JudgeChatBot';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { TiltCard } from '@/components/TiltCard';

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
    if (score >= 80) return 'text-[#FF8C42]';
    if (score >= 60) return 'text-amber-300';
    return 'text-rose-400';
  };

  const getSeverityBadge = (severity: string) => {
    const s = severity.toUpperCase();
    if (s === 'CRITICAL') return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (s === 'HIGH') return 'bg-[#E07A48]/25 text-[#FF8C42] border-[#E07A48]/50';
    if (s === 'MEDIUM') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-amber-900/30 text-amber-200 border-amber-800/40';
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F0F08] border border-[#E07A48]/30 text-[#D4BC9A] text-xs font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF8C42]" />
          <span>ConsJudge Verified &bull; High Consistency (±{variance} pts, {conf}% Conf.)</span>
        </div>
      );
    }
    if (status === 'MODERATE_CONFIDENCE') {
      return (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium font-mono">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>ConsJudge: Moderate Variance (±{variance} pts, {conf}% Conf.)</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium font-mono">
        <Shield className="w-3.5 h-3.5 text-rose-400" />
        <span>ConsJudge Alert: Low Consistency (±{variance} pts &bull; Review Recommended)</span>
      </div>
    );
  };

  const chartData = [
    { name: 'Security', score: report.sec || 0, fill: '#FF8C42' },
    { name: 'Architecture', score: report.arch || 0, fill: '#E07A48' },
    { name: 'Performance', score: report.perf || 0, fill: '#FFB085' },
    { name: 'Testing', score: report.testing_score || 0, fill: '#D96B27' },
    { name: 'Database', score: report.db_score || 0, fill: '#FF9E64' },
    { name: 'Originality', score: report.orig || 0, fill: '#C85A17' },
  ];

  return (
    <div id="report-dashboard" className="w-full mx-auto space-y-6 text-[#D4BC9A]">
      
      {/* Header / Score Section */}
      <TiltCard variant="hero" className="p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] tracking-wider uppercase font-normal">AI EVALUATION COMPLETE</h2>
              {getConfidenceBadge()}
              
              {/* Talk to Repository Trigger Button */}
              <CodeBeastLiquidButton
                onClick={() => setShowChatBot(!showChatBot)}
                variant="primary"
                size="sm"
                label={showChatBot ? "CLOSE COPILOT" : "TALK TO REPOSITORY"}
                hasArrow={!showChatBot}
                icon={<Bot className="w-4 h-4 text-[#FF8C42]" />}
              />
            </div>
            <p className="text-amber-100/70 leading-relaxed text-sm max-w-2xl font-normal">
              {report.executive_summary}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center p-5 sm:p-6 bg-[#070402] rounded-2xl border border-[#E07A48]/30 shadow-inner min-w-[140px] min-h-[120px] shrink-0">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl sm:text-6xl text-gradient-copper">
                {report.overall_score}
              </span>
              {report.variance_margin !== undefined && (
                <span className="text-xs text-amber-200/50 font-mono">±{report.variance_margin}</span>
              )}
            </div>
            <span className="text-amber-200/50 text-[10px] font-bold mt-1 tracking-widest uppercase font-mono">Overall Score</span>
          </div>
        </div>
      </TiltCard>

      {/* Interactive Talk to Repository Judge Copilot Drawer */}
      {showChatBot && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <JudgeChatBot report={report} onClose={() => setShowChatBot(false)} />
        </div>
      )}

      {/* Charts Section */}
      <TiltCard variant="primary" className="p-6 sm:p-7 shadow-xl">
        <h3 className="font-display text-xl sm:text-2xl text-[#D4BC9A] tracking-wider uppercase mb-3 font-normal">Sub-Score Breakdown</h3>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#78350f" />
              <YAxis dataKey="name" type="category" stroke="#D4BC9A" width={100} tick={{ fill: '#D4BC9A', fontSize: 11 }} />
              <Tooltip cursor={{ fill: '#261208' }} contentStyle={{ backgroundColor: '#1A0B05', border: '1px solid #E07A48', color: '#D4BC9A' }} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TiltCard>

      {/* AI Agents Architecture */}
      <TiltCard variant="secondary" className="p-6 sm:p-7 shadow-xl">
        <h3 className="text-base sm:text-lg font-display text-[#D4BC9A] mb-4 flex items-center gap-2 uppercase tracking-wider font-normal">
          <Cpu className="w-5 h-5 text-[#FF8C42]" />
          6 Parallel LangGraph AI Nodes + ConsJudge Supervisor
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5">
          <div className="flex flex-col p-3 bg-[#070402] rounded-xl border border-[#E07A48]/20 justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-[#FF8C42]" />
              <span className="text-[#D4BC9A] text-xs font-semibold">Security</span>
            </div>
            <span className="text-[9px] font-mono text-amber-200/60 bg-[#180A04] px-1.5 py-0.5 rounded border border-[#E07A48]/20">AutoReview (FSE &apos;25)</span>
          </div>

          <div className="flex flex-col p-3 bg-[#070402] rounded-xl border border-[#E07A48]/20 justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Layout className="w-3.5 h-3.5 text-[#FF8C42]" />
              <span className="text-[#D4BC9A] text-xs font-semibold">Architecture</span>
            </div>
            <span className="text-[9px] font-mono text-amber-200/60 bg-[#180A04] px-1.5 py-0.5 rounded border border-[#E07A48]/20">Groq (Llama-3.3)</span>
          </div>

          <div className="flex flex-col p-3 bg-[#070402] rounded-xl border border-[#E07A48]/20 justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-[#FF8C42]" />
              <span className="text-[#D4BC9A] text-xs font-semibold">Performance</span>
            </div>
            <span className="text-[9px] font-mono text-amber-200/60 bg-[#180A04] px-1.5 py-0.5 rounded border border-[#E07A48]/20">Groq (Llama-3.3)</span>
          </div>

          <div className="flex flex-col p-3 bg-[#070402] rounded-xl border border-[#E07A48]/20 justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Beaker className="w-3.5 h-3.5 text-[#FF8C42]" />
              <span className="text-[#D4BC9A] text-xs font-semibold">Testing</span>
            </div>
            <span className="text-[9px] font-mono text-amber-200/60 bg-[#180A04] px-1.5 py-0.5 rounded border border-[#E07A48]/20">Groq (Llama-3.1)</span>
          </div>

          <div className="flex flex-col p-3 bg-[#070402] rounded-xl border border-[#E07A48]/20 justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Database className="w-3.5 h-3.5 text-[#FF8C42]" />
              <span className="text-[#D4BC9A] text-xs font-semibold">Database</span>
            </div>
            <span className="text-[9px] font-mono text-amber-200/60 bg-[#180A04] px-1.5 py-0.5 rounded border border-[#E07A48]/20">Gemini (Flash)</span>
          </div>

          <div className="flex flex-col p-3 bg-[#070402] rounded-xl border border-[#E07A48]/20 justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Fingerprint className="w-3.5 h-3.5 text-[#FF8C42]" />
              <span className="text-[#D4BC9A] text-xs font-semibold">Similarity</span>
            </div>
            <span className="text-[9px] font-mono text-amber-200/60 bg-[#180A04] px-1.5 py-0.5 rounded border border-[#E07A48]/20">AST + CodeBERT</span>
          </div>

          <div className="flex flex-col p-3 bg-[#070402] rounded-xl border border-[#E07A48]/20 justify-center items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[#D4BC9A] text-xs font-semibold">Supervisor</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-[#180A04] px-1.5 py-0.5 rounded border border-emerald-500/20">ConsJudge Multi-Pass</span>
          </div>
        </div>
      </TiltCard>

      {/* Originality & Clone Detection Card */}
      <TiltCard variant="primary" className="p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-base sm:text-lg font-display text-[#D4BC9A] flex items-center gap-2 uppercase tracking-wider font-normal">
            <Fingerprint className="w-5 h-5 text-[#FF8C42]" />
            AST & CodeBERT Originality Verification
          </h3>
          <div className="flex items-center gap-2 font-mono">
            <span className={`text-xs px-3 py-1 rounded-full border ${report.clone_risk_level === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-[#E07A48]/20 text-[#FF8C42] border-[#E07A48]/30'}`}>
              Risk Level: {report.clone_risk_level || 'LOW'}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-[#E07A48]/20 border border-[#E07A48]/30 text-[#FF8C42] font-bold">
              Originality: {report.orig || 100}/100
            </span>
          </div>
        </div>
        <p className="text-xs text-amber-100/70 leading-relaxed mb-3 font-normal">
          Evaluated against known canonical templates and semantic clone clusters using normalized Tree-Sitter AST hash trees and CodeBERT neural embeddings.
        </p>

        {report.structural_evidence && report.structural_evidence.length > 0 && (
          <div className="mt-3 space-y-1.5 bg-[#070402] p-4 rounded-xl border border-[#E07A48]/20">
            <span className="text-[11px] font-mono font-bold text-amber-200/50 uppercase tracking-wider block">Structural Evidence</span>
            {report.structural_evidence.map((ev, i) => (
              <div key={i} className="text-xs text-amber-100/80 flex items-start gap-2">
                <span className="text-[#FF8C42] font-bold">&bull;</span>
                <span>{ev}</span>
              </div>
            ))}
          </div>
        )}
      </TiltCard>

      {/* 3-Stage Security AutoReview Pipeline Card with Interactive Diffs */}
      <TiltCard variant="hero" className="p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-display text-[#D4BC9A] flex items-center gap-2 uppercase tracking-wider font-normal">
            <Shield className="w-5 h-5 text-[#FF8C42]" />
            AutoReview: 3-Stage Security Pipeline (ACM FSE 2025)
          </h3>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#E07A48]/20 border border-[#E07A48]/30 text-[#FF8C42] font-semibold">
            Detect &rarr; Locate &rarr; Repair Active
          </span>
        </div>

        {/* 3 Steps Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="p-4 bg-[#070402] rounded-xl border border-[#E07A48]/20">
            <span className="text-xs font-mono font-bold text-[#FF8C42] block mb-1">1. DETECT (CWE Engine)</span>
            <p className="text-[11px] text-amber-100/70 font-normal">Classifies vulnerability taxonomy (CWE-89, CWE-798, CWE-78) using AST & semantic pattern matching.</p>
          </div>
          <div className="p-4 bg-[#070402] rounded-xl border border-[#E07A48]/20">
            <span className="text-xs font-mono font-bold text-amber-400 block mb-1">2. LOCATE (Pinpoint Vector)</span>
            <p className="text-[11px] text-amber-100/70 font-normal">Isolates exact file coordinates, vulnerable code lines, and attack vector exploit paths.</p>
          </div>
          <div className="p-4 bg-[#070402] rounded-xl border border-[#E07A48]/20">
            <span className="text-xs font-mono font-bold text-emerald-400 block mb-1">3. REPAIR (Unified Patch)</span>
            <p className="text-[11px] text-amber-100/70 font-normal">Generates ready-to-merge unified git diffs and defensive regression unit tests.</p>
          </div>
        </div>

        {/* Interactive CWE Matrix and Remediation Diffs */}
        {report.cwe_matrix && report.cwe_matrix.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-semibold text-[#D4BC9A] flex items-center gap-2 font-mono">
              <FileCode className="w-4 h-4 text-[#FF8C42]" />
              Verified Security Findings & Remediation Patches ({report.cwe_matrix.length})
            </h4>

            {report.cwe_matrix.map((item, idx) => {
              const isExpanded = expandedVuln === idx;
              return (
                <div key={idx} className="bg-[#070402] rounded-xl border border-[#E07A48]/25 overflow-hidden shadow-sm">
                  <div 
                    onClick={() => setExpandedVuln(isExpanded ? null : idx)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(item.severity)}`}>
                        {item.severity}
                      </span>
                      <span className="text-sm font-bold text-[#D4BC9A] font-mono">{item.cwe_id}</span>
                      <span className="text-xs text-amber-200/60 font-mono bg-[#140803] px-2.5 py-0.5 rounded border border-[#E07A48]/20">
                        {item.file_path} ({item.line_range})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-200/60 text-xs font-mono">
                      <span>{isExpanded ? 'Hide Details' : 'View Fix'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#FF8C42]" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-[#E07A48]/20 space-y-4 bg-[#0A0502]">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider block mb-1">Exploit / Trigger Vector</span>
                        <p className="text-xs text-amber-100/80 leading-relaxed bg-[#140803] p-3 rounded-xl border border-[#E07A48]/20 font-mono">
                          {item.trigger_vector}
                        </p>
                      </div>

                      {item.remediation_patch && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Unified Remediation Patch (Git Diff)</span>
                            <button 
                              onClick={() => handleCopyPatch(item.remediation_patch || '', idx)}
                              className="flex items-center gap-1.5 text-xs text-amber-200/60 hover:text-[#D4BC9A] bg-[#1C0E07] hover:bg-[#2A150A] px-3 py-1 rounded-lg border border-[#E07A48]/30 transition-colors font-mono"
                            >
                              {copiedPatchIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedPatchIdx === idx ? 'Copied!' : 'Copy Patch'}</span>
                            </button>
                          </div>
                          <pre className="text-xs font-mono p-4 bg-[#050201] rounded-xl border border-[#E07A48]/25 overflow-x-auto text-emerald-300 leading-relaxed">
                            {item.remediation_patch}
                          </pre>
                        </div>
                      )}

                      {item.test_guidance && (
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider block mb-1">Defensive Test & Verification Guidance</span>
                          <p className="text-xs text-amber-100/70 bg-[#140803] p-3 rounded-xl border border-[#E07A48]/20 font-mono">
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
      </TiltCard>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <TiltCard variant="secondary" className="p-6 shadow-xl">
          <h3 className="text-base sm:text-lg font-display text-[#D4BC9A] mb-3 flex items-center gap-2 uppercase tracking-wider font-normal">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Key Strengths
          </h3>
          <ul className="space-y-2.5">
            {report.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-amber-100/80 font-normal leading-relaxed">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </TiltCard>
        
        <TiltCard variant="secondary" className="p-6 shadow-xl">
          <h3 className="text-base sm:text-lg font-display text-[#D4BC9A] mb-3 flex items-center gap-2 uppercase tracking-wider font-normal">
            <XCircle className="w-5 h-5 text-rose-400" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2.5">
            {report.weaknesses.map((weakness, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-amber-100/80 font-normal leading-relaxed">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </TiltCard>
      </div>
    </div>
  );
}
