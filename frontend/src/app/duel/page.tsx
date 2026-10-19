"use client";

import React, { useState, useEffect } from "react";
import { 
  Swords, 
  Trophy, 
  ShieldCheck, 
  Zap, 
  TestTube, 
  Database, 
  Fingerprint, 
  AlertTriangle, 
  CheckCircle2, 
  Crown, 
  Scale, 
  Printer, 
  Layers, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion-primitives";

interface MetricDelta {
  category: string;
  score_a: number;
  score_b: number;
  delta: number;
  winner: "repo_a" | "repo_b" | "tie";
  analysis: string;
}

interface CrossSimilarity {
  overlap_score: number;
  is_suspicious_clone: boolean;
  shared_structure_notes: string;
}

interface JuryVerdict {
  winner: "repo_a" | "repo_b" | "tie";
  winner_name: string;
  win_margin: string;
  confidence: number;
  summary: string;
  decisive_factors: string[];
  strengths_a: string[];
  strengths_b: string[];
  tradeoffs: string;
  jury_recommendation: string;
}

interface TeamData {
  repo: string;
  repoId: string;
  team: string;
  lang: string;
  overall: number;
  sec: number;
  arch: number;
  perf: number;
  testing_score: number;
  db_score: number;
  orig: number;
  vulnerabilities?: number;
}

interface DuelResult {
  team_a: TeamData;
  team_b: TeamData;
  metrics: MetricDelta[];
  cross_similarity: CrossSimilarity;
  verdict: JuryVerdict;
  radar_data: any[];
}

export default function RepoDuelPage() {
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [repoA, setRepoA] = useState<string>("");
  const [repoB, setRepoB] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [duelResult, setDuelResult] = useState<DuelResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    fetch(`http://${host}:8000/api/v1/stats/history`)
      .then(res => res.json())
      .then(data => {
        if (data.history && data.history.length > 0) {
          setHistoryList(data.history);
          if (data.history.length >= 2) {
            setRepoA(data.history[0].repoId || data.history[0].repo);
            setRepoB(data.history[1].repoId || data.history[1].repo);
          } else if (data.history.length === 1) {
            setRepoA(data.history[0].repoId || data.history[0].repo);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleStartDuel = async () => {
    if (!repoA.trim() || !repoB.trim()) {
      setError("Please select or enter two repositories to duel.");
      return;
    }
    if (repoA.trim() === repoB.trim()) {
      setError("Please choose two different repositories for head-to-head comparison.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const res = await fetch(`http://${host}:8000/api/v1/duel/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_a: repoA.trim(),
          repo_b: repoB.trim(),
          custom_judge_prompt: customPrompt.trim() || null
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || "Duel simulation failed. Please ensure both repositories are evaluated.");
      }

      const data = await res.json();
      setDuelResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to execute head-to-head duel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
            <Swords className="w-3.5 h-3.5" />
            Competitive Evaluation Arena
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Repository Duel Arena (A/B Benchmark)
          </h1>
          <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
            Head-to-head multi-agent evaluation comparing code quality, architectural modularity, and clone overlap.
          </p>
        </div>

        {duelResult && (
          <CodeBeastLiquidButton
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            label="Print / Export Report"
            icon={<Printer className="w-4 h-4 text-[#89CFF0]" />}
          />
        )}
      </div>

      {/* 2. Matchmaker Selection Card with Liquid Glass */}
      <ScrollReveal distance={16} duration={0.45}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(137,207,240,0.1)] relative border border-[#89CFF0]/25">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
            
            {/* Contender Alpha */}
            <div className="lg:col-span-5 p-5 bg-[#08132B]/80 backdrop-blur-md border border-[#89CFF0]/25 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#89CFF0] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#89CFF0]" /> Contender Alpha
                </span>
                <span className="text-[11px] text-[#8EA6C8]">Primary Repository</span>
              </div>

              {historyList.length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-white block mb-1">Select from analyzed repositories:</label>
                  <select 
                    className="w-full bg-[#040914] border border-[#89CFF0]/25 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#89CFF0] shadow-inner"
                    value={repoA}
                    onChange={(e) => setRepoA(e.target.value)}
                  >
                    {historyList.map((job, idx) => (
                      <option key={idx} value={job.repoId || job.repo} className="bg-[#08132B] text-white">
                        {job.repo} — Score: {job.overall || 88}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-white block mb-1">Or direct GitHub URL:</label>
                <input 
                  type="text" 
                  placeholder="https://github.com/organization/repo-a"
                  value={repoA}
                  onChange={(e) => setRepoA(e.target.value)}
                  className="w-full bg-[#040914] border border-[#89CFF0]/25 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#8EA6C8] focus:outline-none focus:border-[#89CFF0] font-mono shadow-inner"
                />
              </div>
            </div>

            {/* VS Divider */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] text-[#040914] flex items-center justify-center font-bold text-sm shadow-[0_8px_20px_rgba(137,207,240,0.35)]">
                VS
              </div>
            </div>

            {/* Contender Beta */}
            <div className="lg:col-span-5 p-5 bg-[#08132B]/80 backdrop-blur-md border border-[#89CFF0]/25 rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#BAE6FD] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BAE6FD]" /> Contender Beta
                </span>
                <span className="text-[11px] text-[#8EA6C8]">Challenger Repository</span>
              </div>

              {historyList.length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-white block mb-1">Select from analyzed repositories:</label>
                  <select 
                    className="w-full bg-[#040914] border border-[#89CFF0]/25 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#89CFF0] shadow-inner"
                    value={repoB}
                    onChange={(e) => setRepoB(e.target.value)}
                  >
                    {historyList.map((job, idx) => (
                      <option key={idx} value={job.repoId || job.repo} className="bg-[#08132B] text-white">
                        {job.repo} — Score: {job.overall || 88}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-white block mb-1">Or direct GitHub URL:</label>
                <input 
                  type="text" 
                  placeholder="https://github.com/organization/repo-b"
                  value={repoB}
                  onChange={(e) => setRepoB(e.target.value)}
                  className="w-full bg-[#040914] border border-[#89CFF0]/25 rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#8EA6C8] focus:outline-none focus:border-[#89CFF0] font-mono shadow-inner"
                />
              </div>
            </div>

          </div>

          {/* Custom Focus Prompt & Submit Button */}
          <div className="mt-6 pt-5 border-t border-[#89CFF0]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <input 
              type="text" 
              placeholder="Optional custom evaluation priority (e.g. 'Prioritize API security and test coverage')"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full sm:flex-1 bg-[#040914] border border-[#89CFF0]/25 rounded-full px-4 py-2.5 text-xs text-white placeholder-[#8EA6C8] focus:outline-none focus:border-[#89CFF0] shadow-inner"
            />

            <CodeBeastLiquidButton
              onClick={handleStartDuel}
              disabled={loading}
              isLoading={loading}
              variant="primary"
              size="md"
              label="Initiate Head-to-Head Duel"
              hasArrow={true}
              icon={<Swords className="w-4 h-4" />}
            />
          </div>

          {error && (
            <div className="mt-4 p-3.5 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* 3. Duel Results Section */}
      {duelResult && (
        <ScrollReveal distance={20} duration={0.5}>
          <div className="space-y-6">
          
          {/* Executive Verdict Banner */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(137,207,240,0.1)] relative border border-[#89CFF0]/25">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#89CFF0]/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#08132B] border border-[#89CFF0]/30 shadow-xs text-[#89CFF0] flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-[#89CFF0]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#89CFF0] uppercase tracking-wider">
                      Executive Verdict
                    </span>
                    <span className="text-xs px-3 py-0.5 rounded-full bg-[#08132B] text-white border border-[#89CFF0]/30 font-semibold shadow-xs">
                      {Math.round(duelResult.verdict.confidence * 100)}% Decision Confidence
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                    Winner: <span className="text-[#89CFF0]">{duelResult.verdict.winner_name}</span>
                  </h2>
                  <span className="text-xs text-[#8EA6C8] block mt-0.5">{duelResult.verdict.win_margin}</span>
                </div>
              </div>

              {/* Overall Side-by-Side Scores */}
              <div className="flex items-center gap-4 bg-[#08132B]/90 border border-[#89CFF0]/25 rounded-2xl p-4 self-stretch sm:self-auto justify-around shadow-xs">
                <div className="text-center px-4">
                  <span className="text-xs text-[#89CFF0] font-bold block">{duelResult.team_a.team}</span>
                  <span className="text-3xl font-bold text-[#89CFF0] font-mono">{duelResult.team_a.overall}</span>
                  <span className="text-[10px] text-[#8EA6C8] block">{duelResult.team_a.lang}</span>
                </div>
                <span className="text-xs font-bold text-[#8EA6C8]">vs</span>
                <div className="text-center px-4">
                  <span className="text-xs text-white font-bold block">{duelResult.team_b.team}</span>
                  <span className="text-3xl font-bold text-white font-mono">{duelResult.team_b.overall}</span>
                  <span className="text-[10px] text-[#8EA6C8] block">{duelResult.team_b.lang}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-white leading-relaxed pt-4">
              {duelResult.verdict.summary}
            </p>
          </div>

          {/* Telemetry Radar + Code Overlap Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Dual Radar Chart (7 cols) */}
            <div className="lg:col-span-7 liquid-glass-card rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-[#89CFF0]/25">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#89CFF0]" />
                  Multi-Axis Comparative Telemetry
                </h3>
                <span className="text-xs text-[#8EA6C8]">Overlaying metrics across 6 specialized evaluation axes.</span>
              </div>

              <div className="h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={duelResult.radar_data}>
                    <PolarGrid stroke="rgba(137, 207, 240, 0.2)" />
                    <PolarAngleAxis dataKey="subject" stroke="#89CFF0" tick={{ fill: '#BAE6FD', fontSize: 11, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(137, 207, 240, 0.2)" />
                    <Radar 
                      name={duelResult.team_a.team} 
                      dataKey="teamA" 
                      stroke="#89CFF0" 
                      fill="#89CFF0" 
                      fillOpacity={0.25} 
                      strokeWidth={2}
                    />
                    <Radar 
                      name={duelResult.team_b.team} 
                      dataKey="teamB" 
                      stroke="#BAE6FD" 
                      fill="#BAE6FD" 
                      fillOpacity={0.25} 
                      strokeWidth={2}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 10, fontSize: 12 }} 
                      formatter={(val) => <span className="text-white font-semibold">{val}</span>} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#08132B', borderColor: '#89CFF0', borderRadius: '12px', color: '#ffffff', fontSize: 12, boxShadow: '0 8px 24px rgba(137, 207, 240, 0.2)' }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overlap & Decisive Factors (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Overlap Card */}
              <div className="liquid-glass-card rounded-2xl p-6 shadow-sm border border-[#89CFF0]/25">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-[#89CFF0]" />
                    AST Codebase Overlap
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 shadow-xs">
                    {duelResult.cross_similarity.overlap_score}% Shared Structure
                  </span>
                </div>
                <p className="text-xs text-[#8EA6C8] leading-relaxed mb-3">
                  {duelResult.cross_similarity.shared_structure_notes}
                </p>
                <div className="w-full bg-[#040914] h-2.5 overflow-hidden rounded-full border border-[#89CFF0]/25">
                  <div 
                    className="h-full bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] rounded-full transition-all duration-700"
                    style={{ width: `${duelResult.cross_similarity.overlap_score}%` }}
                  />
                </div>
              </div>

              {/* Decisive Edge List */}
              <div className="liquid-glass-card rounded-2xl p-6 shadow-sm border border-[#89CFF0]/25">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#89CFF0]" />
                  Key Decisive Factors
                </h3>
                <ul className="space-y-2.5">
                  {duelResult.verdict.decisive_factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#BAE6FD] leading-relaxed">
                      <ChevronRight className="w-3.5 h-3.5 text-[#89CFF0] shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

          </div>
        </ScrollReveal>
      )}

    </div>
  );
}
