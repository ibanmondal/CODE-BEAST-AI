"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  SlidersHorizontal, 
  Scale, 
  Sparkles, 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Download, 
  Save, 
  RefreshCw, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  FileSpreadsheet,
  Check,
  Cpu,
  User,
  HelpCircle,
  Layers,
  History,
  Filter,
  Clock
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';
import { apiUrl } from '@/lib/api';

interface CohortItem {
  cohort_id: string;
  name: string;
  type: 'batch' | 'session';
  batch_id?: string | null;
  repo_count: number;
  is_recent: boolean;
  created_at?: string;
  sample_repos?: string[];
}

interface RepoEvaluationItem {
  id: string;
  repo: string;
  repoUrl: string;
  team: string;
  aiScore: number;
  aiSubscores?: {
    security?: number;
    arch?: number;
    perf?: number;
    testing?: number;
    originality?: number;
  };
  humanScore: number;
  vivaScore: number;
  innovationScore: number;
  evaluatorNotes: string;
  evaluatorName: string;
}

const DEFAULT_SAMPLE_REPOS: RepoEvaluationItem[] = [
  {
    id: "repo-1",
    repo: "distributed-auth-vault",
    repoUrl: "https://github.com/cybercore/distributed-auth-vault",
    team: "Nexus Security",
    aiScore: 92,
    aiSubscores: { security: 95, arch: 90, perf: 88, testing: 94, originality: 96 },
    humanScore: 88,
    vivaScore: 90,
    innovationScore: 86,
    evaluatorNotes: "Excellent architecture defense; clear grasp of JWT rotation & rate limiting.",
    evaluatorName: "Dr. Priya Sharma"
  },
  {
    id: "repo-2",
    repo: "micro-cache-orchestrator",
    repoUrl: "https://github.com/infra-ops/micro-cache-orchestrator",
    team: "Cloud Warriors",
    aiScore: 78,
    aiSubscores: { security: 74, arch: 80, perf: 84, testing: 72, originality: 82 },
    humanScore: 94,
    vivaScore: 96,
    innovationScore: 92,
    evaluatorNotes: "Very impressive live demo & viva presentation. Handled edge-case chaos questions with ease.",
    evaluatorName: "Prof. Arvind Subramanian"
  },
  {
    id: "repo-3",
    repo: "quantum-ml-flow",
    repoUrl: "https://github.com/quant-team/quantum-ml-flow",
    team: "AI Synthetics",
    aiScore: 89,
    aiSubscores: { security: 86, arch: 88, perf: 92, testing: 84, originality: 94 },
    humanScore: 82,
    vivaScore: 80,
    innovationScore: 84,
    evaluatorNotes: "High AI score, but struggled slightly to explain custom gradient descent implementation in viva.",
    evaluatorName: "David Chen"
  },
  {
    id: "repo-4",
    repo: "event-stream-ledger",
    repoUrl: "https://github.com/fintech-hub/event-stream-ledger",
    team: "FinTech Ledger",
    aiScore: 84,
    aiSubscores: { security: 82, arch: 86, perf: 88, testing: 78, originality: 85 },
    humanScore: 85,
    vivaScore: 86,
    innovationScore: 84,
    evaluatorNotes: "Solid distributed transactions defense. Clean database isolation patterns.",
    evaluatorName: "Dr. Priya Sharma"
  },
  {
    id: "repo-5",
    repo: "edge-vision-pipeline",
    repoUrl: "https://github.com/vision-labs/edge-vision-pipeline",
    team: "Spectra AI",
    aiScore: 72,
    aiSubscores: { security: 68, arch: 74, perf: 76, testing: 65, originality: 79 },
    humanScore: 90,
    vivaScore: 92,
    innovationScore: 88,
    evaluatorNotes: "AI penalized low test assertion density, but hardware prototype demonstrated live was extraordinary.",
    evaluatorName: "Marcus Johnson"
  },
  {
    id: "repo-6",
    repo: "semantic-search-graph",
    repoUrl: "https://github.com/nlp-core/semantic-search-graph",
    team: "Graph Minds",
    aiScore: 81,
    aiSubscores: { security: 79, arch: 82, perf: 80, testing: 82, originality: 83 },
    humanScore: 78,
    vivaScore: 76,
    innovationScore: 80,
    evaluatorNotes: "Good baseline, but incomplete implementation of multi-tenancy access controls.",
    evaluatorName: "Prof. Arvind Subramanian"
  }
];

export default function HumanAiEvaluationPage() {
  // Split weight: AI percentage (0 to 100). Human percentage is always (100 - aiWeight)
  const [aiWeight, setAiWeight] = useState<number>(60);
  const [repos, setRepos] = useState<RepoEvaluationItem[]>(DEFAULT_SAMPLE_REPOS);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [editingRepoId, setEditingRepoId] = useState<string | null>(null);

  // Cohort & Recency Filtering State
  const [cohortScope, setCohortScope] = useState<'recent' | 'all' | string>('recent');
  const [availableCohorts, setAvailableCohorts] = useState<CohortItem[]>([]);
  const [activeCohortName, setActiveCohortName] = useState<string>('Recent Evaluation Session');
  const [totalHiddenOlder, setTotalHiddenOlder] = useState<number>(0);

  // Derived human weight
  const humanWeight = 100 - aiWeight;

  // 1. Fetch Cohort Data from Backend (scoped to recent evaluation by default)
  const fetchCohortData = async (scope: string = 'recent', forceFresh: boolean = false) => {
    setLoading(true);
    try {
      // 1. Fetch available cohorts list
      let cohortsList: CohortItem[] = [];
      try {
        const cRes = await fetch(apiUrl('/api/v1/stats/cohorts'));
        if (cRes.ok) {
          const cData = await cRes.json();
          cohortsList = cData.cohorts || [];
          setAvailableCohorts(cohortsList);
        }
      } catch (e) {}

      // 2. Load saved human scores map (keyed by repo URL / ID)
      let savedGradesMap: Record<string, any> = {};
      try {
        const savedMap = localStorage.getItem('codebeast_human_grades_map');
        if (savedMap && !forceFresh) {
          savedGradesMap = JSON.parse(savedMap);
        } else if (forceFresh) {
          // If explicitly syncing or refreshing fresh, purge older state
          localStorage.removeItem('codebeast_human_ai_state');
          localStorage.removeItem('codebeast_human_grades_map');
        }
      } catch (e) {}

      // 3. Build target endpoint URL
      let url = '/api/v1/stats/history';
      if (scope === 'recent') {
        url = '/api/v1/stats/history?recent_only=true';
      } else if (scope !== 'all') {
        url = `/api/v1/stats/history?cohort_id=${encodeURIComponent(scope)}`;
      }

      const res = await fetch(apiUrl(url));
      if (res.ok) {
        const data = await res.json();
        const historyList: any[] = data.history || [];
        const completed = historyList.filter(h => h.status === 'Completed' || h.overall);

        if (data.active_cohort_name) {
          setActiveCohortName(data.active_cohort_name);
        }

        // Calculate count of older audits hidden when in recent mode
        if (scope === 'recent' && cohortsList.length > 1) {
          const totalAll = cohortsList.reduce((acc, c) => acc + (c.repo_count || 0), 0);
          setTotalHiddenOlder(Math.max(0, totalAll - completed.length));
        } else {
          setTotalHiddenOlder(0);
        }

        if (completed.length > 0) {
          const mapped = completed.map((job, idx) => {
            const cleanRepo = job.repo || `Repository-${idx + 1}`;
            const key = job.id || job.repoId || cleanRepo;
            const existing = savedGradesMap[key] || savedGradesMap[cleanRepo];

            const overallScore = job.overall || job.final_report?.overall_score || 75;
            const subscores = job.final_report || {};

            return {
              id: job.id || job.repoId || `job-${idx}`,
              repo: cleanRepo,
              repoUrl: job.repoId?.startsWith('http') ? job.repoId : `https://github.com/${job.team || 'developer'}/${cleanRepo}`,
              team: job.team || job.final_report?.team_name || `${cleanRepo.split('/')[0] || 'Team'} Engineering`,
              aiScore: overallScore,
              aiSubscores: {
                security: job.sec || subscores.security_score || 75,
                arch: job.arch || subscores.arch_score || 75,
                perf: job.perf || subscores.perf_score || 75,
                testing: job.testing_score || subscores.testing_score || 70,
                originality: job.orig || subscores.originality_score || 85
              },
              humanScore: existing ? existing.humanScore : Math.min(100, Math.max(50, overallScore + (idx % 2 === 0 ? 3 : -2))),
              vivaScore: existing ? existing.vivaScore : Math.min(100, Math.max(50, overallScore)),
              innovationScore: existing ? existing.innovationScore : Math.min(100, Math.max(50, overallScore)),
              evaluatorNotes: existing ? existing.evaluatorNotes : "Live committee viva presentation evaluated.",
              evaluatorName: existing ? existing.evaluatorName : "Faculty Panel Evaluator"
            };
          });

          setRepos(mapped);
          setLoading(false);
          return;
        }
      }

      setRepos(DEFAULT_SAMPLE_REPOS);
    } catch (e) {
      setRepos(DEFAULT_SAMPLE_REPOS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if saved state has custom weight
    const savedState = localStorage.getItem('codebeast_human_ai_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (typeof parsed.aiWeight === 'number') setAiWeight(parsed.aiWeight);
        if (parsed.cohortScope) setCohortScope(parsed.cohortScope);
      } catch (e) {}
    }

    fetchCohortData('recent');
  }, []);

  const handleScopeChange = (newScope: string) => {
    setCohortScope(newScope);
    fetchCohortData(newScope);
  };

  const handleSyncRecent = async () => {
    setSyncToast(true);
    setCohortScope('recent');
    localStorage.removeItem('codebeast_human_ai_state');
    await fetchCohortData('recent', true);
    setTimeout(() => setSyncToast(false), 2400);
  };

  // 2. Compute Hybrid Scores and Sort Leaderboard dynamically
  const leaderboard = useMemo(() => {
    // Pure AI Rank map for calculating Rank Shifts
    const aiRankMap = new Map<string, number>();
    [...repos]
      .sort((a, b) => b.aiScore - a.aiScore)
      .forEach((item, index) => {
        aiRankMap.set(item.id, index + 1);
      });

    // Compute Hybrid Final Score for each team
    const calculated = repos.map((item) => {
      const weightedAi = (item.aiScore * aiWeight) / 100;
      const weightedHuman = (item.humanScore * humanWeight) / 100;
      const hybridFinal = Math.round((weightedAi + weightedHuman) * 10) / 10;

      // Letter grade calculation
      let grade = 'A+';
      if (hybridFinal < 60) grade = 'F';
      else if (hybridFinal < 70) grade = 'C';
      else if (hybridFinal < 80) grade = 'B';
      else if (hybridFinal < 90) grade = 'A';
      else grade = 'A+';

      return {
        ...item,
        weightedAi,
        weightedHuman,
        hybridFinal,
        grade
      };
    });

    // Sort by final Hybrid score descending
    calculated.sort((a, b) => b.hybridFinal - a.hybridFinal);

    // Compute rank delta (relative to pure AI rank)
    return calculated.map((item, hybridIndex) => {
      const hybridRank = hybridIndex + 1;
      const originalAiRank = aiRankMap.get(item.id) || hybridRank;
      const rankDelta = originalAiRank - hybridRank; // Positive means moved up, negative means moved down

      return {
        ...item,
        hybridRank,
        originalAiRank,
        rankDelta
      };
    });
  }, [repos, aiWeight, humanWeight]);

  // Handlers
  const handleScoreChange = (id: string, newScore: number) => {
    const validScore = Math.min(100, Math.max(0, isNaN(newScore) ? 0 : newScore));
    setRepos(prev => prev.map(r => r.id === id ? { ...r, humanScore: validScore } : r));
  };

  const handleNotesChange = (id: string, notes: string) => {
    setRepos(prev => prev.map(r => r.id === id ? { ...r, evaluatorNotes: notes } : r));
  };

  const handleSaveState = () => {
    try {
      localStorage.setItem('codebeast_human_ai_state', JSON.stringify({
        aiWeight,
        cohortScope,
        repos
      }));

      // Also persist human marks map keyed by repository
      const gradesMap: Record<string, any> = {};
      repos.forEach(r => {
        gradesMap[r.id] = {
          humanScore: r.humanScore,
          vivaScore: r.vivaScore,
          innovationScore: r.innovationScore,
          evaluatorNotes: r.evaluatorNotes,
          evaluatorName: r.evaluatorName
        };
        gradesMap[r.repo] = gradesMap[r.id];
      });
      localStorage.setItem('codebeast_human_grades_map', JSON.stringify(gradesMap));

      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2400);
    } catch (e) {}
  };

  const handleExportCSV = () => {
    const headers = [
      "Hybrid_Rank",
      "Team_Name",
      "Repository",
      "AI_Score",
      "Human_Score",
      "AI_Weight_Pct",
      "Human_Weight_Pct",
      "Final_Hybrid_Score",
      "Grade",
      "Rank_Delta",
      "Evaluator_Notes"
    ];

    const rows = leaderboard.map(item => [
      item.hybridRank,
      `"${item.team.replace(/"/g, '""')}"`,
      `"${item.repo.replace(/"/g, '""')}"`,
      item.aiScore,
      item.humanScore,
      `${aiWeight}%`,
      `${humanWeight}%`,
      item.hybridFinal,
      item.grade,
      item.rankDelta > 0 ? `+${item.rankDelta}` : item.rankDelta,
      `"${item.evaluatorNotes.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `codebeast_hybrid_leaderboard_${aiWeight}AI_${humanWeight}Human.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="space-y-8 pb-16 text-white max-w-7xl mx-auto">
      
      {/* 1. Header */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2.5">
              <Scale className="w-3.5 h-3.5 text-[#89CFF0]" />
              Human-in-the-Loop Consensus Grading
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Human + AI Hybrid Evaluation & Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1 max-w-3xl leading-relaxed">
              Synthesize autonomous multi-agent code audits with live faculty viva/presentation scores using an adjustable weighting slider.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/10 text-[#89CFF0] border border-[#89CFF0]/30 rounded-xl transition-all flex items-center gap-2 shadow-xs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showExplanation ? "Hide Formula" : "How is it calculated?"}</span>
            </button>

            <button
              onClick={handleSaveState}
              className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/10 text-[#89CFF0] border border-[#89CFF0]/30 rounded-xl transition-all flex items-center gap-2 shadow-xs"
            >
              {savedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedToast ? "Saved!" : "Save Standings"}</span>
            </button>

            <CodeBeastLiquidButton 
              onClick={handleExportCSV}
              variant="primary"
              size="sm"
              label="Export Grade Sheet"
              icon={<Download className="w-4 h-4" />}
            />
          </div>
        </div>
      </ScrollReveal>

      {/* 2. Formula & Academic Rationale Card */}
      {showExplanation && (
        <ScrollReveal direction="up" distance={15}>
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-7 border border-[#89CFF0]/30 bg-gradient-to-br from-[#08132B]/90 via-[#0A1B3B]/80 to-[#030816]/95 shadow-[0_12px_40px_rgba(2,6,18,0.7)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#89CFF0]/20">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#89CFF0]" />
                <span>The Hybrid Evaluation Formula</span>
              </div>
              <span className="text-[11px] text-[#89CFF0] bg-[#08132B] px-3 py-1 rounded-full border border-[#89CFF0]/30 font-mono">
                Final = (AI × {aiWeight}%) + (Human × {humanWeight}%)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[#8EA6C8]">
              <div className="bg-[#040914]/60 p-4 rounded-2xl border border-[#89CFF0]/15 space-y-2">
                <div className="flex items-center gap-2 text-[#89CFF0] font-semibold">
                  <Cpu className="w-4 h-4" />
                  <span>AI Component ({aiWeight}%)</span>
                </div>
                <p className="leading-relaxed">
                  Evaluated statically by CodeBeast's 8 autonomous agents: AST parsing, CWE vulnerability coordinate slicing, SOLID modularity, and CodeBERT clone detection.
                </p>
              </div>

              <div className="bg-[#040914]/60 p-4 rounded-2xl border border-[#89CFF0]/15 space-y-2">
                <div className="flex items-center gap-2 text-violet-400 font-semibold">
                  <User className="w-4 h-4" />
                  <span>Human Evaluator Component ({humanWeight}%)</span>
                </div>
                <p className="leading-relaxed">
                  Scored live by faculty, mentors, or panel judges based on viva defense, practical demo implementation, oral questioning, and business innovation.
                </p>
              </div>

              <div className="bg-[#040914]/60 p-4 rounded-2xl border border-[#89CFF0]/15 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Trophy className="w-4 h-4" />
                  <span>Dynamic Real-Time Re-ranking</span>
                </div>
                <p className="leading-relaxed">
                  As you swipe the interactive weight slider below, all student projects dynamically re-rank in real time, revealing how human presentation marks impact technical rankings.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* 3. Interactive Weight Ratio Slider Bar */}
      <ScrollReveal direction="up" distance={20} delay={0.1}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] border border-[#89CFF0]/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#89CFF0] uppercase tracking-wider mb-1 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#89CFF0]" />
                <span>Consensus Weight Allocation Bar</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Drag Slider to Balance AI vs. Human Weight
              </h2>
            </div>

            {/* Quick-Preset Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "80 / 20", ai: 80, desc: "AI Heavy" },
                { label: "70 / 30", ai: 70, desc: "College Standard" },
                { label: "60 / 40", ai: 60, desc: "Balanced Tech" },
                { label: "50 / 50", ai: 50, desc: "Equal Split" },
                { label: "30 / 70", ai: 30, desc: "Viva Heavy" }
              ].map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setAiWeight(preset.ai)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    aiWeight === preset.ai
                      ? 'liquid-btn-primary text-[#040914] shadow-md border-transparent'
                      : 'bg-[#08132B] text-[#89CFF0] border-[#89CFF0]/30 hover:bg-[#89CFF0]/10'
                  }`}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Dual Indicator Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-[#89CFF0]">
                <Cpu className="w-4 h-4" />
                <span>AI Automated Score Weight: {aiWeight}%</span>
              </div>
              <div className="flex items-center gap-2 text-violet-400">
                <User className="w-4 h-4" />
                <span>Human Evaluator Viva Weight: {humanWeight}%</span>
              </div>
            </div>

            {/* The Slidable Range Input */}
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={aiWeight}
                onChange={(e) => setAiWeight(Number(e.target.value))}
                className="w-full h-3 bg-[#08132B] rounded-lg appearance-none cursor-pointer accent-[#89CFF0] focus:outline-none"
              />
              <div 
                className="h-2 rounded-full mt-2 flex overflow-hidden shadow-inner border border-[#89CFF0]/20"
              >
                <div 
                  className="bg-gradient-to-r from-[#50B2EC] to-[#89CFF0] transition-all duration-150"
                  style={{ width: `${aiWeight}%` }}
                />
                <div 
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-150"
                  style={{ width: `${humanWeight}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8EA6C8]">
              <span>0% (100% Human Viva Only)</span>
              <span className="font-semibold text-white">Current Ratio: {aiWeight} AI : {humanWeight} Human</span>
              <span>100% (100% Autonomous AI Only)</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 4. Top 3 Hybrid Podium Cards */}
      <ScrollReveal direction="up" distance={20} delay={0.15}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Current Hybrid Cohort Podium ({aiWeight}% AI / {humanWeight}% Human)</span>
            </h3>
            <span className="text-xs text-[#8EA6C8]">
              Updated in real time based on active weight split
            </span>
          </div>

          <div className={`grid ${
            top3.length === 1 
              ? 'grid-cols-1 max-w-md mx-auto' 
              : top3.length === 2 
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' 
              : 'grid-cols-1 md:grid-cols-3'
          } gap-6`}>
            {/* 1st Place - Gold (Grand Champion) */}
            {top3[0] && (
              <div className={`podium-card-gold rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 ${
                top3.length === 3 ? 'md:order-2 md:-translate-y-2' : 'md:order-1'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="podium-badge-gold">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>1ST PLACE CHAMPION</span>
                    </span>
                    <span className="text-xs text-amber-400/80 font-mono font-bold">Rank #1</span>
                  </div>
                  <h4 className="text-xl font-extrabold text-white mt-3 truncate">{top3[0].repo}</h4>
                  <p className="text-xs text-amber-200/80 font-medium">{top3[0].team}</p>
                </div>

                <div className="bg-[#040914]/80 rounded-2xl p-5 border border-amber-400/30 space-y-2 shadow-lg">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-amber-200">Hybrid Final Score:</span>
                    <span className="text-3xl font-black text-amber-300">{top3[0].hybridFinal}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-amber-400/20 font-medium">
                    <div className="text-[#89CFF0]">AI Code: <span className="font-bold">{top3[0].aiScore}</span></div>
                    <div className="text-violet-300">Human Viva: <span className="font-bold">{top3[0].humanScore}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* 2nd Place - Silver */}
            {top3[1] && (
              <div className={`podium-card-silver rounded-3xl p-6 flex flex-col justify-between space-y-4 ${
                top3.length === 3 ? 'md:order-1' : 'md:order-2'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="podium-badge-silver">
                      <Medal className="w-3.5 h-3.5 text-slate-300" />
                      <span>2ND PLACE</span>
                    </span>
                    <span className="text-xs text-[#8EA6C8] font-mono">Rank #2</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-3 truncate">{top3[1].repo}</h4>
                  <p className="text-xs text-[#8EA6C8]">{top3[1].team}</p>
                </div>

                <div className="bg-[#040914]/70 rounded-2xl p-4 border border-slate-400/20 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#8EA6C8]">Hybrid Final:</span>
                    <span className="text-2xl font-black text-slate-200">{top3[1].hybridFinal}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-400/20">
                    <div>AI: <span className="text-white font-bold">{top3[1].aiScore}</span></div>
                    <div>Human: <span className="text-white font-bold">{top3[1].humanScore}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place - Bronze */}
            {top3[2] && (
              <div className="podium-card-bronze rounded-3xl p-6 flex flex-col justify-between space-y-4 md:order-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="podium-badge-bronze">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>3RD PLACE</span>
                    </span>
                    <span className="text-xs text-[#8EA6C8] font-mono">Rank #3</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mt-3 truncate">{top3[2].repo}</h4>
                  <p className="text-xs text-[#8EA6C8]">{top3[2].team}</p>
                </div>

                <div className="bg-[#040914]/70 rounded-2xl p-4 border border-amber-600/20 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#8EA6C8]">Hybrid Final:</span>
                    <span className="text-2xl font-black text-amber-400">{top3[2].hybridFinal}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-amber-600/20">
                    <div>AI: <span className="text-white font-bold">{top3[2].aiScore}</span></div>
                    <div>Human: <span className="text-white font-bold">{top3[2].humanScore}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* 5. Complete Interactive Hybrid Leaderboard Table */}
      <ScrollReveal direction="up" distance={20} delay={0.2}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] border border-[#89CFF0]/25 space-y-6">
          
          {/* Cohort & Recency Filtering Control Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#08132B]/90 border border-[#89CFF0]/25 shadow-inner">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#8EA6C8] uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Layers className="w-3.5 h-3.5 text-[#89CFF0]" />
                Cohort Scope:
              </span>

              {/* Button: Recent Evaluation Only (Default) */}
              <button
                onClick={() => handleScopeChange('recent')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  cohortScope === 'recent'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-[#040914] shadow-md font-bold'
                    : 'bg-[#040914] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/25'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recent Leaderboard Only (Default)</span>
                <span className={`w-2 h-2 rounded-full ${cohortScope === 'recent' ? 'bg-[#040914] animate-pulse' : 'bg-emerald-400'}`} />
              </button>

              {/* Cohort Selector Dropdown */}
              {availableCohorts.length > 1 && (
                <div className="relative">
                  <select
                    value={cohortScope}
                    onChange={(e) => handleScopeChange(e.target.value)}
                    className="px-3 py-1.5 bg-[#040914] border border-[#89CFF0]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#89CFF0] cursor-pointer"
                  >
                    <option value="recent">⚡ Most Recent Cohort ({availableCohorts[0]?.repo_count || repos.length} repos)</option>
                    {availableCohorts.map((c) => (
                      <option key={c.cohort_id} value={c.cohort_id}>
                        {c.is_recent ? `⚡ Recent: ${c.name}` : `📁 ${c.name}`}
                      </option>
                    ))}
                    <option value="all">🌐 All Historical Audits ({availableCohorts.reduce((a, c) => a + c.repo_count, 0)} total)</option>
                  </select>
                </div>
              )}

              {/* Button: All Audits */}
              <button
                onClick={() => handleScopeChange('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  cohortScope === 'all'
                    ? 'bg-gradient-to-r from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] shadow-md font-bold'
                    : 'bg-[#040914] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/25'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>All History</span>
              </button>
            </div>

            {/* Right Side: Active Cohort Status & Sync Button */}
            <div className="flex items-center gap-3">
              {cohortScope === 'recent' && totalHiddenOlder > 0 && (
                <span className="text-[11px] text-amber-300/90 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/25 hidden sm:inline-flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-amber-300" />
                  <span>{totalHiddenOlder} older audits excluded</span>
                </span>
              )}

              <button
                onClick={handleSyncRecent}
                className="px-3 py-1.5 text-xs font-semibold bg-[#040914] hover:bg-[#89CFF0]/15 text-[#89CFF0] border border-[#89CFF0]/30 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Purge stale local cache and sync to the most recent evaluation cohort only"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncToast ? 'animate-spin text-emerald-400' : ''}`} />
                <span>{syncToast ? "Synced!" : "Sync Recent Only"}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#89CFF0]/20">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#89CFF0]" />
                <span>Full Hybrid Cohort Grade Sheet & Live Evaluation Table</span>
              </h3>
              <p className="text-xs text-[#8EA6C8] mt-0.5">
                {cohortScope === 'recent' 
                  ? `Active Cohort: ${activeCohortName} (${repos.length} recent repositories). Older historical audits are excluded.`
                  : `Active Cohort: ${activeCohortName} (${repos.length} repositories).`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8EA6C8]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Recalculation Active</span>
            </div>
          </div>

          <div className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden shadow-xs bg-[#040914]/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08132B]/90 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Hybrid Rank</th>
                    <th className="py-3.5 px-4">Project & Team</th>
                    <th className="py-3.5 px-4 text-center">AI Score ({aiWeight}%)</th>
                    <th className="py-3.5 px-4 text-center">Human Viva ({humanWeight}%)</th>
                    <th className="py-3.5 px-4 text-center">Final Hybrid Score</th>
                    <th className="py-3.5 px-4 text-center">Grade</th>
                    <th className="py-3.5 px-4 text-center">Rank Shift</th>
                    <th className="py-3.5 px-4">Faculty Notes & Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89CFF0]/15">
                  {leaderboard.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      
                      {/* Rank Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center border shadow-xs ${
                            item.hybridRank === 1 ? 'podium-rank-gold' :
                            item.hybridRank === 2 ? 'podium-rank-silver' :
                            item.hybridRank === 3 ? 'podium-rank-bronze' :
                            'bg-[#08132B] text-[#89CFF0] border-[#89CFF0]/30'
                          }`}>
                            #{item.hybridRank}
                          </span>
                        </div>
                      </td>

                      {/* Project & Team */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <a 
                            href={item.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-white hover:text-[#89CFF0] transition-colors flex items-center gap-1.5 text-sm"
                          >
                            <span>{item.repo}</span>
                            <ExternalLink className="w-3 h-3 text-[#8EA6C8] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <div className="text-[11px] text-[#8EA6C8]">
                            Team: <span className="text-[#BAE6FD] font-medium">{item.team}</span>
                          </div>
                        </div>
                      </td>

                      {/* AI Score */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-extrabold text-[#89CFF0] text-sm">
                            {item.aiScore}
                          </span>
                          <span className="text-[10px] text-[#8EA6C8]">
                            {(item.weightedAi).toFixed(1)} pts
                          </span>
                        </div>
                      </td>

                      {/* Human Score (Editable Input) */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.humanScore}
                            onChange={(e) => handleScoreChange(item.id, Number(e.target.value))}
                            className="w-16 text-center font-extrabold text-sm text-violet-300 bg-[#08132B] border border-violet-400/40 rounded-lg py-1 px-1 focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-inner"
                            title="Edit faculty viva score (0-100)"
                          />
                          <span className="text-[10px] text-[#8EA6C8]">
                            {(item.weightedHuman).toFixed(1)} pts
                          </span>
                        </div>
                      </td>

                      {/* Final Hybrid Score */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className={`text-base font-black px-3 py-1 rounded-xl border shadow-xs inline-block ${
                          item.hybridRank === 1 ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' :
                          item.hybridRank === 2 ? 'bg-slate-400/20 text-slate-200 border-slate-400/40' :
                          item.hybridRank === 3 ? 'bg-amber-600/20 text-amber-400 border-amber-600/40' :
                          'bg-[#08132B] text-white border-[#89CFF0]/25'
                        }`}>
                          {item.hybridFinal}
                        </span>
                      </td>

                      {/* Letter Grade */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                          item.grade === 'A+' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                          item.grade === 'A' ? 'bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/30' :
                          item.grade === 'B' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                        }`}>
                          {item.grade}
                        </span>
                      </td>

                      {/* Rank Shift Indicator */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {item.rankDelta > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
                            <TrendingUp className="w-3 h-3" />
                            <span>+{item.rankDelta}</span>
                          </span>
                        ) : item.rankDelta < 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-400/30">
                            <TrendingDown className="w-3 h-3" />
                            <span>{item.rankDelta}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#8EA6C8] font-mono">
                            —
                          </span>
                        )}
                      </td>

                      {/* Faculty Notes */}
                      <td className="py-4 px-4 max-w-xs">
                        <input
                          type="text"
                          value={item.evaluatorNotes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          placeholder="Add faculty feedback / viva remark..."
                          className="w-full bg-[#08132B]/80 border border-[#89CFF0]/20 rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#8EA6C8]/60 focus:outline-none focus:border-[#89CFF0] focus:ring-1 focus:ring-[#89CFF0]"
                        />
                        <span className="text-[10px] text-[#8EA6C8]/70 block mt-0.5 truncate">
                          Signed by: {item.evaluatorName}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
