"use client";

import React, { useState, useEffect } from "react";
import { 
  Swords, 
  Trophy, 
  ShieldAlert, 
  Layout, 
  Zap, 
  TestTube, 
  Database, 
  Fingerprint, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Crown, 
  Scale, 
  Flame,
  Printer,
  RefreshCw,
  Layers,
  ChevronRight,
  ShieldCheck
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
import { TiltCard } from "@/components/TiltCard";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";

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
  const [repoA, setRepoA] = useState<string>("https://github.com/torvalds/linux");
  const [repoB, setRepoB] = useState<string>("https://github.com/pallets/flask");
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
      .catch(e => console.log("Failed to fetch repository history:", e));
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
        throw new Error("Duel simulation failed. Please ensure both repositories are accessible.");
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
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* SECTION 1: Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E07A48]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>Head-to-Head Evaluation Stage</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
            REPO DUEL <span className="text-gradient-copper">(A/B ARENA)</span>
          </h1>
          <p className="text-amber-100/70 text-sm mt-2 max-w-2xl font-normal leading-relaxed">
            Direct side-by-side codebase confrontation with comparative multi-agent telemetry, AST neural clone detection, and an AI Executive Jury Verdict.
          </p>
        </div>

        {duelResult && (
          <CodeBeastLiquidButton
            onClick={() => window.print()}
            variant="secondary"
            size="sm"
            label="EXPORT PDF"
            icon={<Printer className="w-4 h-4 text-[#FF8C42]" />}
            className="self-start sm:self-auto shrink-0"
          />
        )}
      </section>

      {/* SECTION 2: Matchmaker Selection Stage */}
      <section>
        <TiltCard variant="hero" className="p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E07A48]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF8C42]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
            
            {/* Contender A */}
            <TiltCard variant="secondary" className="lg:col-span-5 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF8C42] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C42] animate-ping" /> Contender A (Alpha)
                </span>
                <span className="text-[11px] text-amber-200/50 font-mono">Team Alpha</span>
              </div>

              {historyList.length > 0 && (
                <div className="mb-3">
                  <label className="text-[11px] text-amber-200/60 font-mono block mb-1">Quick Select from Analyzed Repos:</label>
                  <select 
                    className="w-full bg-[#140803] border border-[#E07A48]/25 rounded-xl px-3 py-2 text-xs text-[#D4BC9A] focus:outline-none focus:border-[#FF8C42] font-mono"
                    value={repoA}
                    onChange={(e) => setRepoA(e.target.value)}
                  >
                    {historyList.map((job, idx) => (
                      <option key={idx} value={job.repoId || job.repo}>
                        {job.team ? `${job.team} (${job.repo})` : job.repo} — Score: {job.overall}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="text-[11px] text-amber-200/60 font-mono block mb-1">Or Direct GitHub URL:</label>
              <input 
                type="text" 
                placeholder="https://github.com/org/repo-a"
                value={repoA}
                onChange={(e) => setRepoA(e.target.value)}
                className="w-full bg-[#140803] border border-[#E07A48]/25 rounded-xl px-3.5 py-2.5 text-xs text-[#D4BC9A] focus:outline-none focus:border-[#FF8C42] font-mono"
              />
            </TiltCard>

            {/* VS Center Pillar */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center my-2 lg:my-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E07A48] to-[#FF8C42] text-[#0D0805] flex items-center justify-center font-black text-sm shadow-[0_0_25px_rgba(224,122,72,0.5)] transform rotate-45 border-2 border-[#1C0E07]">
                <span className="transform -rotate-45 font-mono tracking-tighter">VS</span>
              </div>
            </div>

            {/* Contender B */}
            <TiltCard variant="secondary" className="lg:col-span-5 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E07A48] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E07A48] animate-ping" /> Contender B (Beta)
                </span>
                <span className="text-[11px] text-amber-200/50 font-mono">Team Beta</span>
              </div>

              {historyList.length > 0 && (
                <div className="mb-3">
                  <label className="text-[11px] text-amber-200/60 font-mono block mb-1">Quick Select from Analyzed Repos:</label>
                  <select 
                    className="w-full bg-[#140803] border border-[#E07A48]/25 rounded-xl px-3 py-2 text-xs text-[#D4BC9A] focus:outline-none focus:border-[#FF8C42] font-mono"
                    value={repoB}
                    onChange={(e) => setRepoB(e.target.value)}
                  >
                    {historyList.map((job, idx) => (
                      <option key={idx} value={job.repoId || job.repo}>
                        {job.team ? `${job.team} (${job.repo})` : job.repo} — Score: {job.overall}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label className="text-[11px] text-amber-200/60 font-mono block mb-1">Or Direct GitHub URL:</label>
              <input 
                type="text" 
                placeholder="https://github.com/org/repo-b"
                value={repoB}
                onChange={(e) => setRepoB(e.target.value)}
                className="w-full bg-[#140803] border border-[#E07A48]/25 rounded-xl px-3.5 py-2.5 text-xs text-[#D4BC9A] focus:outline-none focus:border-[#FF8C42] font-mono"
              />
            </TiltCard>

          </div>

          {/* Custom Arbiter Focus & Action Bar */}
          <div className="mt-6 pt-5 border-t border-[#E07A48]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:flex-1">
              <input 
                type="text" 
                placeholder="Optional Custom Judge Focus (e.g. 'Prioritize API security and database concurrency')"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-[#0E0602] border border-[#E07A48]/25 rounded-2xl px-4 py-2.5 text-xs text-[#D4BC9A] placeholder-amber-200/30 focus:outline-none focus:border-[#FF8C42] font-mono"
              />
            </div>

            <CodeBeastLiquidButton
              onClick={handleStartDuel}
              disabled={loading}
              isLoading={loading}
              variant="primary"
              size="lg"
              label="INITIATE HEAD-TO-HEAD DUEL"
              hasArrow
              icon={<Swords className="w-4 h-4" />}
              className="w-full sm:w-auto shrink-0"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </TiltCard>
      </section>

      {/* SECTION 3: Duel Results Display */}
      {duelResult && (
        <section className="space-y-8 animate-fade-in-up">
          
          {/* Winner Podium & Gold Crown Banner */}
          <TiltCard variant="hero" className="p-7 sm:p-9 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-[#FF8C42]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              
              <div className="flex items-center gap-5 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E07A48] to-[#FF8C42] text-[#0D0805] flex items-center justify-center shadow-[0_0_25px_rgba(224,122,72,0.6)] shrink-0">
                  <Crown className="w-9 h-9" />
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF8C42]">Chief Judge Executive Verdict</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E07A48]/20 text-[#FF8C42] border border-[#E07A48]/30 font-mono">
                      {Math.round(duelResult.verdict.confidence * 100)}% Decision Confidence
                    </span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl text-[#D4BC9A] mt-1">
                    Winner: <span className="text-gradient-copper">{duelResult.verdict.winner_name}</span>
                  </h2>
                  <p className="text-xs text-amber-200/60 mt-1 font-mono">{duelResult.verdict.win_margin}</p>
                </div>
              </div>

              {/* Side-by-Side Overall Badges */}
              <div className="flex items-center gap-4 bg-[#0E0602] border border-[#E07A48]/25 p-4 rounded-2xl">
                <div className="text-center px-4">
                  <p className="text-[11px] text-[#FF8C42] font-semibold font-mono">{duelResult.team_a.team}</p>
                  <p className="font-display text-4xl text-[#D4BC9A]">{duelResult.team_a.overall}</p>
                  <span className="text-[10px] text-amber-200/50 uppercase font-mono">{duelResult.team_a.lang}</span>
                </div>
                <div className="text-amber-200/40 font-bold font-mono">vs</div>
                <div className="text-center px-4">
                  <p className="text-[11px] text-[#FF8C42] font-semibold font-mono">{duelResult.team_b.team}</p>
                  <p className="font-display text-4xl text-[#D4BC9A]">{duelResult.team_b.overall}</p>
                  <span className="text-[10px] text-amber-200/50 uppercase font-mono">{duelResult.team_b.lang}</span>
                </div>
              </div>

            </div>

            {/* Verdict Summary */}
            <div className="mt-6 pt-5 border-t border-[#E07A48]/20 text-sm text-amber-100/80 leading-relaxed font-normal">
              <p>{duelResult.verdict.summary}</p>
            </div>
          </TiltCard>

          {/* Telemetry Radar & Cross Similarity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            
            {/* Dual Radar Chart (7 cols) */}
            <TiltCard variant="primary" className="lg:col-span-7 p-6 sm:p-7 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-2xl text-[#D4BC9A] flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#FF8C42]" />
                    Comparative Multi-Axis Radar Telemetry
                  </h3>
                  <p className="text-xs text-amber-100/60 mt-0.5">Overlaying Contender A vs Contender B across 6 core judging criteria.</p>
                </div>
              </div>

              <div className="h-[340px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={duelResult.radar_data}>
                    <PolarGrid stroke="#78350f" />
                    <PolarAngleAxis dataKey="subject" stroke="#FF8C42" tick={{ fill: '#FF8C42', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4A2616" />
                    <Radar 
                      name={duelResult.team_a.team} 
                      dataKey="teamA" 
                      stroke="#E07A48" 
                      fill="#E07A48" 
                      fillOpacity={0.35} 
                      strokeWidth={2}
                    />
                    <Radar 
                      name={duelResult.team_b.team} 
                      dataKey="teamB" 
                      stroke="#FF8C42" 
                      fill="#FF8C42" 
                      fillOpacity={0.35} 
                      strokeWidth={2}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 10, fontSize: 11 }} 
                      formatter={(val) => <span className="text-[#D4BC9A] font-semibold">{val}</span>} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A0B05', borderColor: '#E07A48', borderRadius: '12px', fontSize: 12 }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TiltCard>

            {/* Cross-Repo Plagiarism & AST Overlap Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Overlap Card */}
              <TiltCard variant="secondary" className="p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-[#FF8C42]" />
                    <h4 className="font-display text-xl text-[#D4BC9A]">Cross-Repo Code Overlap</h4>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold font-mono bg-[#E07A48]/20 text-[#FF8C42] border border-[#E07A48]/30">
                    {duelResult.cross_similarity.overlap_score}% Shared AST
                  </span>
                </div>

                <p className="text-xs text-amber-100/70 leading-relaxed mb-4 font-normal">
                  {duelResult.cross_similarity.shared_structure_notes}
                </p>

                <div className="w-full bg-[#26130A] h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#E07A48] to-[#FF8C42] transition-all duration-1000"
                    style={{ width: `${duelResult.cross_similarity.overlap_score}%` }}
                  />
                </div>
              </TiltCard>

              {/* Decisive Edge List */}
              <TiltCard variant="secondary" className="p-6 shadow-xl flex-1">
                <h4 className="font-display text-xl text-[#D4BC9A] mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FF8C42]" />
                  Key Decisive Factors
                </h4>
                <ul className="space-y-2.5">
                  {duelResult.verdict.decisive_factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-amber-100/80">
                      <ChevronRight className="w-3.5 h-3.5 text-[#FF8C42] shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </TiltCard>

            </div>

          </div>

        </section>
      )}

    </div>
  );
}
