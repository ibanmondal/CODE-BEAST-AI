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
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Crown, 
  Scale, 
  Flame,
  Printer,
  RefreshCw,
  Layers,
  ChevronRight
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
          // Set initial defaults from history if available
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
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setDuelResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to execute repository duel.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Security Posture": return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case "Architecture & SOLID": return <Layout className="w-5 h-5 text-blue-400" />;
      case "Performance & Algorithmic": return <Zap className="w-5 h-5 text-amber-400" />;
      case "Testing & Quality": return <TestTube className="w-5 h-5 text-purple-400" />;
      case "Database & Schema": return <Database className="w-5 h-5 text-cyan-400" />;
      case "Originality & AST": return <Fingerprint className="w-5 h-5 text-emerald-400" />;
      default: return <Layers className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              ⚔️ Head-to-Head Duel Comparator
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-gradient-to-r from-red-500/10 to-amber-500/10 text-amber-400 border-amber-500/30">
              <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" /> A/B Battle Arena
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Pit two finalist codebases against each other in real-time, generate comparative radar telemetry, and synthesize an AI Executive Jury Verdict.
          </p>
        </div>

        {duelResult && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl text-xs font-semibold border border-gray-700 transition-all self-start"
          >
            <Printer className="w-4 h-4" /> Export Duel PDF
          </button>
        )}
      </div>

      {/* Matchmaker Selection Bar */}
      <div className="bg-[#0D121F] border border-gray-800/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
          
          {/* Contender A */}
          <div className="lg:col-span-5 bg-[#141C2E] border border-blue-500/30 rounded-2xl p-5 relative shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" /> Contender A (Blue)
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Team Alpha</span>
            </div>

            {historyList.length > 0 && (
              <div className="mb-2">
                <label className="text-[11px] text-gray-400 block mb-1">Quick Select from Analyzed Repos:</label>
                <select 
                  className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
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

            <label className="text-[11px] text-gray-400 block mb-1">Or Direct GitHub URL / Team:</label>
            <input 
              type="text" 
              placeholder="e.g. https://github.com/organization/repo-a"
              value={repoA}
              onChange={(e) => setRepoA(e.target.value)}
              className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* VS Center Pillar */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center my-2 lg:my-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-[0_0_20px_rgba(239,68,68,0.5)] transform rotate-45 border-2 border-[#0D121F]">
              <span className="transform -rotate-45 font-mono tracking-tighter">VS</span>
            </div>
          </div>

          {/* Contender B */}
          <div className="lg:col-span-5 bg-[#171329] border border-purple-500/30 rounded-2xl p-5 relative shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" /> Contender B (Purple)
              </span>
              <span className="text-[11px] text-gray-400 font-mono">Team Beta</span>
            </div>

            {historyList.length > 0 && (
              <div className="mb-2">
                <label className="text-[11px] text-gray-400 block mb-1">Quick Select from Analyzed Repos:</label>
                <select 
                  className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
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

            <label className="text-[11px] text-gray-400 block mb-1">Or Direct GitHub URL / Team:</label>
            <input 
              type="text" 
              placeholder="e.g. https://github.com/organization/repo-b"
              value={repoB}
              onChange={(e) => setRepoB(e.target.value)}
              className="w-full bg-[#0B0F19] border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

        </div>

        {/* Custom Arbiter Focus (Optional) */}
        <div className="mt-5 pt-4 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:flex-1">
            <input 
              type="text"
              placeholder="Optional Custom Judge Criterion (e.g. 'Prioritize API security and database concurrency')"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full bg-[#080B13] border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>

          <button
            onClick={handleStartDuel}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all transform hover:scale-[1.02] disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Multi-Pass Duel...</span>
              </>
            ) : (
              <>
                <Swords className="w-4 h-4" />
                <span>Initiate Head-to-Head Duel</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Duel Results Display */}
      {duelResult && (
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Winner Podium & Gold Crown Banner */}
          <div className="relative bg-gradient-to-r from-[#121A2E] via-[#1A182E] to-[#121A2E] border-2 border-amber-500/40 rounded-3xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.15)] overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              
              <div className="flex items-center gap-5 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)] shrink-0">
                  <Crown className="w-9 h-9" />
                </div>
                <div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Chief Judge Executive Verdict</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {Math.round(duelResult.verdict.confidence * 100)}% Decision Confidence
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                    Winner: <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">{duelResult.verdict.winner_name}</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{duelResult.verdict.win_margin}</p>
                </div>
              </div>

              {/* Side-by-Side Overall Badges */}
              <div className="flex items-center gap-4 bg-[#0A0E17]/80 border border-gray-800 p-4 rounded-2xl backdrop-blur-md">
                <div className="text-center px-4">
                  <p className="text-[11px] text-blue-400 font-semibold">{duelResult.team_a.team}</p>
                  <p className="text-2xl font-black text-white">{duelResult.team_a.overall}</p>
                  <span className="text-[10px] text-gray-500 uppercase font-mono">{duelResult.team_a.lang}</span>
                </div>
                <div className="text-gray-700 font-bold">vs</div>
                <div className="text-center px-4">
                  <p className="text-[11px] text-purple-400 font-semibold">{duelResult.team_b.team}</p>
                  <p className="text-2xl font-black text-white">{duelResult.team_b.overall}</p>
                  <span className="text-[10px] text-gray-500 uppercase font-mono">{duelResult.team_b.lang}</span>
                </div>
              </div>

            </div>

            {/* Verdict Summary */}
            <div className="mt-6 pt-5 border-t border-gray-800/80 text-sm text-gray-300 leading-relaxed">
              <p className="font-medium text-gray-200">{duelResult.verdict.summary}</p>
            </div>
          </div>

          {/* Telemetry Radar & Cross Similarity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Dual Radar Chart (7 cols) */}
            <div className="lg:col-span-7 bg-[#0D121F] border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-400" />
                    Comparative Multi-Axis Radar Telemetry
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Overlaying Contender A vs Contender B across 6 core judging criteria.</p>
                </div>
              </div>

              <div className="h-[360px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={duelResult.radar_data}>
                    <PolarGrid stroke="#1F293D" />
                    <PolarAngleAxis dataKey="subject" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                    <Radar 
                      name={duelResult.team_a.team} 
                      dataKey="teamA" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.35} 
                      strokeWidth={2}
                    />
                    <Radar 
                      name={duelResult.team_b.team} 
                      dataKey="teamB" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.35} 
                      strokeWidth={2}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: 10, fontSize: 12 }} 
                      formatter={(val) => <span className="text-gray-300 font-semibold">{val}</span>} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: 8, fontSize: 12 }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cross-Repo Plagiarism & AST Overlap Card (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Overlap Card */}
              <div className={`p-6 rounded-3xl border ${
                duelResult.cross_similarity.is_suspicious_clone
                  ? 'bg-red-950/20 border-red-800/60'
                  : 'bg-[#0D121F] border-gray-800'
              } shadow-xl`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Cross-Repo Code Overlap</h4>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono ${
                    duelResult.cross_similarity.is_suspicious_clone
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {duelResult.cross_similarity.overlap_score}% Shared AST
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4">
                  {duelResult.cross_similarity.shared_structure_notes}
                </p>

                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      duelResult.cross_similarity.is_suspicious_clone ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${duelResult.cross_similarity.overlap_score}%` }}
                  />
                </div>
              </div>

              {/* Decisive Edge List */}
              <div className="bg-[#0D121F] border border-gray-800 rounded-3xl p-6 shadow-xl flex-1">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Key Decisive Factors
                </h4>
                <ul className="space-y-2.5">
                  {duelResult.verdict.decisive_factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

          {/* Head-to-Head Metric Scoreboards */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Category-by-Category Duel Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {duelResult.metrics.map((metric, idx) => {
                const winnerName = metric.winner === "repo_a" 
                  ? duelResult.team_a.team 
                  : (metric.winner === "repo_b" ? duelResult.team_b.team : "Tied");

                return (
                  <div key={idx} className="bg-[#0D121F] border border-gray-800/90 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          {getCategoryIcon(metric.category)}
                          <span className="text-xs font-bold text-white">{metric.category}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          metric.winner === "repo_a" 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                            : (metric.winner === "repo_b" ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-700 text-gray-300')
                        }`}>
                          {metric.winner === "tie" ? "TIED" : `${winnerName} Wins`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between my-3 bg-[#080B13] p-3 rounded-xl border border-gray-800/80">
                        <div className="text-left">
                          <p className="text-[10px] text-blue-400 font-semibold">{duelResult.team_a.team}</p>
                          <p className="text-lg font-black text-white">{metric.score_a}</p>
                        </div>
                        <div className="text-xs font-mono font-bold text-gray-500">
                          {metric.delta > 0 ? `+${metric.delta}` : `${metric.delta}`}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-purple-400 font-semibold">{duelResult.team_b.team}</p>
                          <p className="text-lg font-black text-white">{metric.score_b}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-2">{metric.analysis}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deep Strengths & Tradeoffs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contender A Strengths */}
            <div className="bg-[#121A2E]/60 border border-blue-500/20 rounded-3xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                {duelResult.team_a.team} Core Strengths
              </h4>
              <ul className="space-y-2">
                {duelResult.verdict.strengths_a.map((str, idx) => (
                  <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contender B Strengths */}
            <div className="bg-[#171329]/60 border border-purple-500/20 rounded-3xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                {duelResult.team_b.team} Core Strengths
              </h4>
              <ul className="space-y-2">
                {duelResult.verdict.strengths_b.map((str, idx) => (
                  <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-purple-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Official Hackathon Jury Recommendation */}
          <div className="bg-[#090D16] border border-amber-500/30 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-2 text-amber-400 font-bold text-sm">
              <Trophy className="w-4 h-4" />
              <span>Official Jury Recommendation for Committee:</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed italic">
              "{duelResult.verdict.jury_recommendation}"
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
