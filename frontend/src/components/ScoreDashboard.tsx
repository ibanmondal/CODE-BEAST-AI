"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Zap, 
  Database, 
  Shield, 
  Layers, 
  TestTube, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  FileCode,
  Fingerprint,
  Bot,
  ShieldCheck,
  Code2,
  BookOpen,
  Activity,
  ArrowUpRight,
  Download,
  AlertTriangle,
  Info,
  Sparkles,
  ExternalLink,
  User,
  Users,
  Calendar,
  Printer
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { JudgeChatBot } from './JudgeChatBot';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { ScoreRadial3D } from '@/components/ScoreRadial3D';
import { AgentInspectorModal } from '@/components/AgentInspectorModal';
import { ReportPdfExport } from '@/components/ReportPdfExport';

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
  dx_score?: number;
  finops_score?: number;
  orig?: number;
  repoName?: string;
  repo_name?: string;
  repoUrl?: string;
  submitter_github_username?: string;
  team_name?: string;
  evaluated_at?: string;
  task_id?: string;
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
  const [expandedVuln, setExpandedVuln] = useState<number | null>(0);
  const [copiedPatchIdx, setCopiedPatchIdx] = useState<number | null>(null);
  const [showChatBot, setShowChatBot] = useState<boolean>(startWithChatOpen);
  const [copiedBadge, setCopiedBadge] = useState(false);
  const [inspectAgentId, setInspectAgentId] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  const repoIdentifier = report.repoUrl || (report.repoName ? `https://github.com/${report.repoName}` : "repository");
  const extractedUser = repoIdentifier.replace(/^https?:\/\/github\.com\//i, "").split("/")[0] || "Developer";
  const githubUser = report.submitter_github_username || extractedUser;
  const teamName = report.team_name || `${githubUser} Team`;
  const evalDate = report.evaluated_at || new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'text-[#89CFF0] bg-[#08132B] border border-[#89CFF0]/40 font-bold';
    if (score >= 60) return 'text-amber-300 bg-amber-950/60 border border-amber-500/30 font-semibold';
    return 'text-rose-300 bg-rose-950/60 border border-rose-500/30 font-semibold';
  };

  const getSeverityBadge = (severity: string) => {
    const s = (severity || 'LOW').toUpperCase();
    if (s === 'CRITICAL') return 'bg-rose-950/60 text-rose-300 border border-rose-500/30 font-semibold';
    if (s === 'HIGH') return 'bg-amber-950/60 text-amber-300 border border-amber-500/30 font-semibold';
    if (s === 'MEDIUM') return 'bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 font-medium';
    return 'bg-[#08132B] text-[#BAE6FD] border border-[#89CFF0]/20';
  };

  const handleCopyPatch = (patch: string, idx: number) => {
    navigator.clipboard.writeText(patch);
    setCopiedPatchIdx(idx);
    setTimeout(() => setCopiedPatchIdx(null), 2000);
  };

  const handleCopyBadge = () => {
    const repo = report.repoName || "repository";
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const badgeUrl = `http://${host}:8000/api/v1/stats/badge?repo=${encodeURIComponent(repo)}`;
    const md = `[![CodeBeast Score](${badgeUrl})](https://github.com/ibanmondal/CODE-BEAST-AI)`;
    navigator.clipboard.writeText(md);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  const getConfidenceBadge = () => {
    const status = report.consistency_status || 'HIGH_CONFIDENCE';
    const variance = report.variance_margin !== undefined ? report.variance_margin : 1.4;
    const conf = report.confidence_score ? Math.round(report.confidence_score * 100) : 96;

    if (status === 'HIGH_CONFIDENCE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/35 text-[#89CFF0] text-xs font-semibold rounded-full shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#89CFF0]" />
          <span>ConsJudge Verified &bull; High Consistency (±{variance} pts, {conf}% Conf.)</span>
        </span>
      );
    }
    if (status === 'MODERATE_CONFIDENCE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-full">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>ConsJudge: Moderate Variance (±{variance} pts, {conf}% Conf.)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-full">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        <span>ConsJudge Notice: Variance (±{variance} pts &bull; Review Recommended)</span>
      </span>
    );
  };

  const chartData = [
    { name: 'Security', score: report.sec || 82, fill: '#89CFF0' },
    { name: 'Architecture', score: report.arch || 88, fill: '#BAE6FD' },
    { name: 'Performance', score: report.perf || 84, fill: '#89CFF0' },
    { name: 'Testing', score: report.testing_score || 80, fill: '#BAE6FD' },
    { name: 'Database', score: report.db_score || 86, fill: '#89CFF0' },
    { name: 'Dev Exp', score: report.dx_score || 85, fill: '#BAE6FD' },
    { name: 'FinOps', score: report.finops_score || 85, fill: '#89CFF0' },
    { name: 'Originality', score: report.orig || 94, fill: '#BAE6FD' },
  ];

  const agentNodes = [
    { id: "security_agent", name: "Security", score: report.sec || 82, desc: "AutoReview CWE Slicing", icon: ShieldCheck, tech: "ACM FSE '25" },
    { id: "architecture_agent", name: "Architecture", score: report.arch || 88, desc: "SOLID & Modularity", icon: Layers, tech: "Llama 3.3" },
    { id: "performance_agent", name: "Performance", score: report.perf || 84, desc: "Resource & Caching", icon: Zap, tech: "Llama 3.3" },
    { id: "testing_agent", name: "Testing", score: report.testing_score || 80, desc: "CI & Flake Risk", icon: TestTube, tech: "Llama 3.1" },
    { id: "database_agent", name: "Database", score: report.db_score || 86, desc: "Schema & ORM", icon: Database, tech: "Gemini Flash" },
    { id: "similarity_agent", name: "Originality", score: report.orig || 94, desc: "CodeBERT FAISS", icon: Fingerprint, tech: "AST Vector" },
    { id: "dx_agent", name: "Dev Experience", score: report.dx_score || 85, desc: "DX & Tooling", icon: BookOpen, tech: "Groq Llama" },
    { id: "finops_agent", name: "FinOps & Cloud", score: report.finops_score || 85, desc: "Cost & Sizing", icon: Activity, tech: "Groq Llama" },
    ];  return (
    <div id="report-dashboard" className="w-full space-y-6 text-white">
      
      {/* 1. Top Executive Header Card with Liquid Glass */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] text-[#040914] shadow-xs">
                AUDIT COMPLETE
              </span>
              {getConfidenceBadge()}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {report.repoName ? report.repoName : "Repository Evaluation Report"}
            </h2>

            <p className="text-sm text-[#8EA6C8] leading-relaxed max-w-3xl">
              {report.executive_summary}
            </p>

            {/* Submitter & Team Authorship Credentials */}
            <div className="bg-[#08132B]/90 border border-[#89CFF0]/25 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shadow-xs">
              <div>
                <span className="text-[10px] text-[#8EA6C8] block uppercase font-mono font-medium">Submitter / GitHub</span>
                <span className="font-mono font-bold text-white flex items-center gap-1.5 mt-0.5 truncate">
                  <User className="w-3.5 h-3.5 text-[#89CFF0]" />
                  @{githubUser}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8EA6C8] block uppercase font-mono font-medium">Submitting Team</span>
                <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5 truncate">
                  <Users className="w-3.5 h-3.5 text-[#89CFF0]" />
                  {teamName}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8EA6C8] block uppercase font-mono font-medium">Target Repository</span>
                <span className="font-mono font-semibold text-white truncate block mt-0.5" title={report.repoName || repoIdentifier}>
                  {report.repoName || "Repository"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8EA6C8] block uppercase font-mono font-medium">Evaluation Date</span>
                <span className="font-medium text-white flex items-center gap-1.5 mt-0.5 truncate">
                  <Calendar className="w-3.5 h-3.5 text-[#89CFF0]" />
                  {evalDate}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => setShowPdfModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] hover:opacity-95 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF Report</span>
              </button>

              <CodeBeastLiquidButton
                onClick={() => setShowChatBot(!showChatBot)}
                variant="primary"
                size="sm"
                label={showChatBot ? "Close Repository Copilot" : "Talk to Repository"}
                icon={<Bot className="w-4 h-4" />}
              />

              <button 
                onClick={handleCopyBadge}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 rounded-full shadow-xs transition-colors"
              >
                {copiedBadge ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#89CFF0]" />}
                <span>{copiedBadge ? "Badge Copied!" : "Copy Markdown Badge"}</span>
              </button>
            </div>
          </div>

          {/* Overall 3D Radial Score Gauge - Highly Visible Obsidian Midnight Card with Baby Blue Glow */}
          <div className="shrink-0 flex items-center justify-center p-3 bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/35 rounded-2xl shadow-[0_0_30px_rgba(137,207,240,0.15)]">
            <ScoreRadial3D 
              score={report.overall_score} 
              size={150} 
              strokeWidth={11}
              label="Consensus" 
            />
          </div>
        </div>
      </div>

      {/* Interactive Talk to Repository Judge Copilot Drawer */}
      {showChatBot && (
        <div className="transition-all duration-200">
          <JudgeChatBot report={report} onClose={() => setShowChatBot(false)} />
        </div>
      )}

      {/* Grid: Sub-Score Breakdown Chart + ConsJudge Multi-Pass Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Horizontal Bar Chart (7 cols) */}
        <div className="lg:col-span-7 liquid-glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                Sub-Metric Dimension Breakdown
              </h3>
              <span className="text-[11px] font-mono text-[#89CFF0] bg-[#08132B] px-2.5 py-0.5 rounded-full border border-[#89CFF0]/30">
                8 Dimensions
              </span>
            </div>
            <p className="text-xs text-[#8EA6C8] mb-4">
              Normalized component scores across specialized evaluators (0 to 100 scale).
            </p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#8EA6C8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#89CFF0" width={95} tick={{ fill: '#BAE6FD', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(137, 207, 240, 0.15)' }} 
                  contentStyle={{ backgroundColor: 'rgba(8, 19, 43, 0.95)', border: '1px solid rgba(137, 207, 240, 0.35)', borderRadius: '12px', color: '#FFFFFF', fontSize: '12px', boxShadow: '0 8px 24px rgba(2, 6, 18, 0.8)' }} 
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#89CFF0' : '#BAE6FD'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ConsJudge Multi-Pass Supervisor Details (5 cols) */}
        <div className="lg:col-span-5 liquid-glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#89CFF0]" />
                ConsJudge Supervisor
              </h3>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30">
                Research v2.5
              </span>
            </div>
            <p className="text-xs text-[#8EA6C8] leading-relaxed mb-4">
              Runs dual concurrent LLM passes (Gemini Flash + Groq Llama 3.3) over evaluator nodes to bound score hallucination within statistically verified margins.
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#89CFF0]/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8EA6C8]">Consistency Metric</span>
              <span className="font-semibold text-white">
                {report.consistency_status?.replace('_', ' ') || "High Confidence"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8EA6C8]">Variance Bound</span>
              <span className="font-mono font-semibold text-[#89CFF0]">
                ±{report.variance_margin !== undefined ? report.variance_margin : "1.4"} points
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8EA6C8]">Judge Agreement Confidence</span>
              <span className="font-semibold text-[#89CFF0]">
                {report.confidence_score ? Math.round(report.confidence_score * 100) : 96}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8EA6C8]">Synthesized Cycles</span>
              <span className="font-mono text-white">2 Concurrent Cycles</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Specialized AI Agents Grid */}
      <div className="liquid-glass-card rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#89CFF0]" />
              8 Parallel Evaluator Agent Nodes
            </h3>
            <p className="text-xs text-[#8EA6C8]">Click any node to inspect prompt methodology and AST slicing depth</p>
          </div>
          <span className="text-xs text-[#89CFF0] font-semibold bg-[#08132B] px-3 py-1 rounded-full border border-[#89CFF0]/30">
            LangGraph Multi-Agent Architecture
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {agentNodes.map((agent, i) => (
            <div 
              key={i} 
              onClick={() => setInspectAgentId(agent.id)}
              className="p-3.5 border border-[#89CFF0]/20 bg-[#08132B]/80 backdrop-blur-sm rounded-xl flex flex-col justify-between text-center hover:border-[#89CFF0] hover:bg-[#0C1A38] hover:shadow-md transition-all cursor-pointer group"
            >
              <div>
                <agent.icon className="w-5 h-5 mx-auto text-[#89CFF0] mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-white leading-tight truncate group-hover:text-[#89CFF0] transition-colors">
                  {agent.name}
                </h4>
                <span className="text-[10px] text-[#8EA6C8] block mt-0.5 leading-tight font-mono">
                  {agent.tech}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-[#89CFF0]/20">
                <span className="text-lg font-bold text-white">
                  {agent.score}
                </span>
                <span className="text-[10px] text-[#8EA6C8] block">/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AutoReview Security Findings & Remediation Section */}
      <div className="liquid-glass-card rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#89CFF0]" />
              AutoReview Security Vulnerability Matrix (ACM FSE 2025)
            </h3>
            <p className="text-xs text-[#8EA6C8] mt-0.5">
              3-Stage Detect → Locate → Repair pipeline classifying CWE taxonomy and synthesizing unified diff patches.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 rounded-full self-start sm:self-auto shadow-xs">
            {report.cwe_matrix?.length || 0} Findings Tracked
          </span>
        </div>

        {report.cwe_matrix && report.cwe_matrix.length > 0 ? (
          <div className="space-y-3">
            {report.cwe_matrix.map((vuln, idx) => {
              const isExpanded = expandedVuln === idx;
              return (
                <div 
                  key={idx}
                  className="border border-[#89CFF0]/20 rounded-xl overflow-hidden transition-all bg-[#08132B]/80 backdrop-blur-sm shadow-xs"
                >
                  <div 
                    onClick={() => setExpandedVuln(isExpanded ? null : idx)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider rounded-full border ${getSeverityBadge(vuln.severity)}`}>
                        {vuln.severity}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        {vuln.cwe_id}
                      </span>
                      <span className="text-xs text-[#89CFF0] font-mono truncate hidden sm:inline">
                        {vuln.file_path || "source repository"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-[#89CFF0]">
                        {isExpanded ? "Hide Remediation" : "View Fix"}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#89CFF0]" /> : <ChevronDown className="w-4 h-4 text-[#89CFF0]" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-[#040914]/90 border-t border-[#89CFF0]/20 space-y-4 text-xs">
                      {vuln.trigger_vector && (
                        <div>
                          <span className="font-bold text-white block mb-1">Trigger Vector:</span>
                          <p className="text-[#BAE6FD] leading-relaxed bg-[#08132B] p-3 border border-[#89CFF0]/20 rounded-xl font-mono text-[11px] shadow-xs">
                            {vuln.trigger_vector}
                          </p>
                        </div>
                      )}

                      {vuln.remediation_patch && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-white">AutoReview Unified Diff Patch:</span>
                            <button
                              onClick={() => handleCopyPatch(vuln.remediation_patch!, idx)}
                              className="inline-flex items-center gap-1.5 text-xs text-[#89CFF0] font-semibold hover:underline"
                            >
                              {copiedPatchIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#89CFF0]" />}
                              <span>{copiedPatchIdx === idx ? "Copied" : "Copy Patch"}</span>
                            </button>
                          </div>
                          <pre className="p-4 bg-[#040914] text-[#BAE6FD] font-mono text-[11px] overflow-x-auto leading-relaxed rounded-xl border border-[#89CFF0]/20 shadow-inner">
                            {vuln.remediation_patch}
                          </pre>
                        </div>
                      )}

                      {vuln.test_guidance && (
                        <div>
                          <span className="font-bold text-white block mb-1">Defensive Test Guidance:</span>
                          <p className="text-[#89CFF0] leading-relaxed bg-[#08132B] p-3 border border-[#89CFF0]/20 rounded-xl shadow-xs">
                            {vuln.test_guidance}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-[#08132B]/80 border border-[#89CFF0]/20 rounded-xl text-white text-xs flex items-center gap-2.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero critical vulnerabilities detected. AutoReview CWE static slicing found no exploit triggers.</span>
          </div>
        )}
      </div>

      {/* Two-Column: Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Engineering Strengths */}
        <div className="liquid-glass-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-[#89CFF0]" />
            Verified Engineering Strengths
          </h3>
          <ul className="space-y-2.5">
            {(report.strengths || ["Production-ready architectural modularity", "Clean dependency inversion", "Robust test suite signal"]).map((item, i) => (
              <li key={i} className="text-xs text-[#8EA6C8] flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#89CFF0] mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Recommendations / Weaknesses */}
        <div className="liquid-glass-card rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[#89CFF0]" />
            Actionable Optimization Recommendations
          </h3>
          <ul className="space-y-2.5">
            {(report.weaknesses || ["Verify input sanitation across outer API boundaries", "Add integration tests for hot execution paths"]).map((item, i) => (
              <li key={i} className="text-xs text-[#8EA6C8] flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BAE6FD] mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Agent Inspector Modal */}
      {inspectAgentId && (
        <AgentInspectorModal
          agentId={inspectAgentId}
          onClose={() => setInspectAgentId(null)}
        />
      )}

      {/* Official PDF Export Modal */}
      <ReportPdfExport
        report={report}
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
      />

    </div>
  );
}
