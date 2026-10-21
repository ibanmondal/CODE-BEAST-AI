"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Trophy, 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Filter, 
  ExternalLink, 
  Printer, 
  Layers, 
  Star, 
  Zap, 
  Check, 
  Clock, 
  Cpu, 
  BarChart3, 
  TrendingUp, 
  Scale, 
  FileSpreadsheet,
  Users,
  Code2,
  Terminal,
  Activity,
  ThumbsUp,
  Download
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/motion-primitives';
import { apiUrl } from '@/lib/api';

export interface HackathonProject {
  id: string;
  boothNumber: string;
  repo: string;
  repoUrl: string;
  team: string;
  track: 'AI & Multi-Agent' | 'Web3 & FinTech' | 'Cybersecurity & Infra' | 'HealthTech' | 'Open Innovation';
  tagline: string;
  techStack: string[];
  // Hackathon Authenticity & Forensics
  authenticityScore: number;     // e.g. 95% built during hackathon
  prebuiltCodeRisk: 'Low' | 'Medium' | 'High';
  commitCount: number;
  firstCommitHoursAgo: number;
  mockVsRealStatus: {
    realApis: number;
    hasDatabase: boolean;
    hasAuth: boolean;
    isFullyLive: boolean;
  };
  // 4 Hackathon Judging Rubrics (Total 100)
  rubricInnovation: number;      // Max 30 pts
  rubricComplexity: number;      // Max 30 pts
  rubricDesign: number;          // Max 20 pts
  rubricDemo: number;            // Max 20 pts
  totalMarks: number;
  // Category Nominations & Shortlist
  isShortlisted: boolean;
  categoryNominations: string[];
  judgeNotes: string;
  evaluatorName: string;
  isGraded: boolean;
}

const HACKATHON_PROJECTS: HackathonProject[] = [
  {
    id: "hack-01",
    boothNumber: "01",
    repo: "multi-agent-evaluator",
    repoUrl: "https://github.com/codebeast/multi-agent-evaluator",
    team: "Nexus AI (Booth 01)",
    track: "AI & Multi-Agent",
    tagline: "Parallel LangGraph multi-agent orchestration for autonomous software repository auditing.",
    techStack: ["Next.js", "FastAPI", "LangGraph", "Groq LLaMA-3.3", "PyTorch"],
    authenticityScore: 96,
    prebuiltCodeRisk: "Low",
    commitCount: 48,
    firstCommitHoursAgo: 32,
    mockVsRealStatus: {
      realApis: 14,
      hasDatabase: true,
      hasAuth: true,
      isFullyLive: true
    },
    rubricInnovation: 29,
    rubricComplexity: 29,
    rubricDesign: 19,
    rubricDemo: 19,
    totalMarks: 96,
    isShortlisted: true,
    categoryNominations: ["Grand Prize Winner", "Best AI / ML Implementation", "Most Technically Audacious"],
    judgeNotes: "Outstanding multi-agent execution. Real inference fallbacks across Groq and local Ollama working seamlessly.",
    evaluatorName: "Dr. Tabassum Ara",
    isGraded: true
  },
  {
    id: "hack-02",
    boothNumber: "02",
    repo: "zero-trust-vault",
    repoUrl: "https://github.com/cyber-ops/zero-trust-vault",
    team: "Cipher Guard (Booth 02)",
    track: "Cybersecurity & Infra",
    tagline: "Dynamic secret rotation and micro-segmentation proxy with real-time CWE vulnerability blocking.",
    techStack: ["Rust", "eBPF", "Docker", "gRPC", "Redis"],
    authenticityScore: 91,
    prebuiltCodeRisk: "Low",
    commitCount: 36,
    firstCommitHoursAgo: 28,
    mockVsRealStatus: {
      realApis: 8,
      hasDatabase: true,
      hasAuth: true,
      isFullyLive: true
    },
    rubricInnovation: 27,
    rubricComplexity: 28,
    rubricDesign: 17,
    rubricDemo: 18,
    totalMarks: 90,
    isShortlisted: true,
    categoryNominations: ["Best Security & Privacy", "Most Technically Audacious"],
    judgeNotes: "High-performance Rust implementation. Live packet interception and dynamic ACL demo was rock solid.",
    evaluatorName: "David Chen",
    isGraded: true
  },
  {
    id: "hack-03",
    boothNumber: "03",
    repo: "hyper-cache-kv",
    repoUrl: "https://github.com/perf-labs/hyper-cache-kv",
    team: "Latency Killers (Booth 03)",
    track: "Cybersecurity & Infra",
    tagline: "Sub-millisecond distributed in-memory cache with Raft consensus and automated partition healing.",
    techStack: ["Go", "Raft", "WebSockets", "Prometheus"],
    authenticityScore: 84,
    prebuiltCodeRisk: "Low",
    commitCount: 29,
    firstCommitHoursAgo: 24,
    mockVsRealStatus: {
      realApis: 6,
      hasDatabase: false,
      hasAuth: false,
      isFullyLive: true
    },
    rubricInnovation: 25,
    rubricComplexity: 26,
    rubricDesign: 16,
    rubricDemo: 17,
    totalMarks: 84,
    isShortlisted: false,
    categoryNominations: ["Most Technically Audacious"],
    judgeNotes: "Strong Go concurrency patterns. Handled split-brain network partition simulations during booth testing.",
    evaluatorName: "Dr. Tabassum Ara",
    isGraded: true
  },
  {
    id: "hack-04",
    boothNumber: "04",
    repo: "solana-pay-stream",
    repoUrl: "https://github.com/defi-core/solana-pay-stream",
    team: "Solana Streams (Booth 04)",
    track: "Web3 & FinTech",
    tagline: "Per-second streaming micropayments for API calls and computational resource leasing.",
    techStack: ["Solana Anchor", "Rust", "Next.js", "Tailwind CSS"],
    authenticityScore: 88,
    prebuiltCodeRisk: "Low",
    commitCount: 31,
    firstCommitHoursAgo: 30,
    mockVsRealStatus: {
      realApis: 9,
      hasDatabase: true,
      hasAuth: true,
      isFullyLive: true
    },
    rubricInnovation: 26,
    rubricComplexity: 25,
    rubricDesign: 19,
    rubricDemo: 18,
    totalMarks: 88,
    isShortlisted: true,
    categoryNominations: ["Best UI/UX & Design Polish"],
    judgeNotes: "Polished Solana devnet transactions. Real-time balance streaming counter looked and worked great.",
    evaluatorName: "Sarah Jenkins",
    isGraded: true
  },
  {
    id: "hack-05",
    boothNumber: "05",
    repo: "health-vision-edge",
    repoUrl: "https://github.com/med-tech/health-vision-edge",
    team: "MedVision (Booth 05)",
    track: "HealthTech",
    tagline: "On-device retinal scan analysis with quantized ONNX models and offline diagnostic report generation.",
    techStack: ["Python", "OpenCV", "ONNX Runtime", "Flutter"],
    authenticityScore: 78,
    prebuiltCodeRisk: "Medium",
    commitCount: 22,
    firstCommitHoursAgo: 20,
    mockVsRealStatus: {
      realApis: 4,
      hasDatabase: true,
      hasAuth: false,
      isFullyLive: false
    },
    rubricInnovation: 24,
    rubricComplexity: 22,
    rubricDesign: 16,
    rubricDemo: 15,
    totalMarks: 77,
    isShortlisted: false,
    categoryNominations: [],
    judgeNotes: "Promising idea, but model inference relies partly on cached image fixtures rather than live camera stream.",
    evaluatorName: "Dr. Priya Sharma",
    isGraded: false
  },
  {
    id: "hack-06",
    boothNumber: "06",
    repo: "eco-route-optimizer",
    repoUrl: "https://github.com/green-logistics/eco-route-optimizer",
    team: "CarbonZero (Booth 06)",
    track: "Open Innovation",
    tagline: "Graph-theoretic carbon emission minimization for urban delivery fleets using Dijkstra-variant algorithms.",
    techStack: ["TypeScript", "Node.js", "Mapbox GL", "Neo4j"],
    authenticityScore: 82,
    prebuiltCodeRisk: "Low",
    commitCount: 26,
    firstCommitHoursAgo: 26,
    mockVsRealStatus: {
      realApis: 7,
      hasDatabase: true,
      hasAuth: false,
      isFullyLive: true
    },
    rubricInnovation: 23,
    rubricComplexity: 24,
    rubricDesign: 18,
    rubricDemo: 16,
    totalMarks: 81,
    isShortlisted: false,
    categoryNominations: [],
    judgeNotes: "Clean map integration and real-time route carbon comparison.",
    evaluatorName: "David Chen",
    isGraded: false
  }
];

const AVAILABLE_AWARDS = [
  "Grand Prize Winner",
  "Best AI / ML Implementation",
  "Best UI/UX & Design Polish",
  "Most Technically Audacious",
  "Best Security & Privacy",
  "Underdog / Rising Star Team"
];

export default function HackathonArenaPage() {
  const [projects, setProjects] = useState<HackathonProject[]>(HACKATHON_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("hack-01");
  const [activeTrack, setActiveTrack] = useState<string>("All Tracks");
  const [activeTab, setActiveTab] = useState<'console' | 'finalists' | 'jury'>('console');
  
  // Active Judge Selection
  const [presidingJudge, setPresidingJudge] = useState<string>("Dr. Tabassum Ara");

  // 3-Minute Live Demo Pitch Clock
  const [pitchSeconds, setPitchSeconds] = useState<number>(180); // 3 minutes = 180s
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Scoring Desk Form State for selected project
  const [rubricInnovation, setRubricInnovation] = useState<number>(29);
  const [rubricComplexity, setRubricComplexity] = useState<number>(29);
  const [rubricDesign, setRubricDesign] = useState<number>(19);
  const [rubricDemo, setRubricDemo] = useState<number>(19);
  const [isShortlisted, setIsShortlisted] = useState<boolean>(true);
  const [selectedAwards, setSelectedAwards] = useState<string[]>(["Grand Prize Winner", "Best AI / ML Implementation"]);
  const [judgeNotes, setJudgeNotes] = useState<string>("");
  const [saveToast, setSaveToast] = useState<boolean>(false);
  const [isJuryReportModalOpen, setIsJuryReportModalOpen] = useState<boolean>(false);

  // Load projects from localStorage if customized
  useEffect(() => {
    try {
      const saved = localStorage.getItem('codebeast_hackathon_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
          setSelectedProjectId(parsed[0].id);
          loadProjectToDesk(parsed[0]);
          return;
        }
      }
    } catch (e) {}
    loadProjectToDesk(HACKATHON_PROJECTS[0]);
  }, []);

  // Timer Tick Hook
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && pitchSeconds > 0) {
      interval = setInterval(() => {
        setPitchSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pitchSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pitchSeconds]);

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0] || HACKATHON_PROJECTS[0];
  }, [projects, selectedProjectId]);

  const loadProjectToDesk = (proj: HackathonProject) => {
    setSelectedProjectId(proj.id);
    setRubricInnovation(proj.rubricInnovation);
    setRubricComplexity(proj.rubricComplexity);
    setRubricDesign(proj.rubricDesign);
    setRubricDemo(proj.rubricDemo);
    setIsShortlisted(proj.isShortlisted);
    setSelectedAwards(proj.categoryNominations || []);
    setJudgeNotes(proj.judgeNotes || "");
    if (proj.evaluatorName) setPresidingJudge(proj.evaluatorName);
    // Reset timer to 3 mins for new booth evaluation
    setPitchSeconds(180);
    setIsTimerRunning(false);
  };

  const handleNextProject = () => {
    const currentIndex = projects.findIndex(p => p.id === currentProject.id);
    const nextIndex = (currentIndex + 1) % projects.length;
    loadProjectToDesk(projects[nextIndex]);
  };

  const handlePrevProject = () => {
    const currentIndex = projects.findIndex(p => p.id === currentProject.id);
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    loadProjectToDesk(projects[prevIndex]);
  };

  const totalCalculatedMarks = rubricInnovation + rubricComplexity + rubricDesign + rubricDemo;

  const handleToggleAward = (award: string) => {
    setSelectedAwards(prev => 
      prev.includes(award) ? prev.filter(a => a !== award) : [...prev, award]
    );
  };

  // Quick Preset Scoring
  const applyPreset = (innov: number, comp: number, des: number, demo: number) => {
    setRubricInnovation(innov);
    setRubricComplexity(comp);
    setRubricDesign(des);
    setRubricDemo(demo);
  };

  // Save Hackathon Evaluation
  const handleSaveEvaluation = () => {
    if (!currentProject) return;

    const updated = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          rubricInnovation,
          rubricComplexity,
          rubricDesign,
          rubricDemo,
          totalMarks: totalCalculatedMarks,
          isShortlisted,
          categoryNominations: selectedAwards,
          judgeNotes,
          evaluatorName: presidingJudge,
          isGraded: true
        };
      }
      return p;
    });

    setProjects(updated);
    try {
      localStorage.setItem('codebeast_hackathon_projects', JSON.stringify(updated));
    } catch (e) {}

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Filtered by Track
  const filteredProjects = useMemo(() => {
    if (activeTrack === 'All Tracks') return projects;
    return projects.filter(p => p.track === activeTrack);
  }, [projects, activeTrack]);

  // Ranked Projects for Finalists Podium
  const rankedProjects = useMemo(() => {
    return [...projects].sort((a, b) => b.totalMarks - a.totalMarks);
  }, [projects]);

  const shortlistedCount = projects.filter(p => p.isShortlisted).length;
  const gradedCount = projects.filter(p => p.isGraded).length;

  // Format Timer mm:ss
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-16 text-white max-w-7xl mx-auto">
      
      {/* 1. Header Banner with Live Hackathon Status */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/40 text-[#89CFF0] text-[11px] font-bold tracking-wider uppercase rounded-none shadow-xs mb-2">
              <Flame className="w-3.5 h-3.5 text-[#89CFF0] animate-pulse" />
              Live Hackathon Rapid Evaluation Arena
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Hackathon Judging Arena</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-red-950/80 text-red-400 border border-red-500/40 uppercase">
                Demo Round Live
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1 max-w-3xl leading-relaxed">
              Automated pre-built code forensics, real prototype verification, 3-minute live pitch timers, rapid 4-pillar rubrics, and award nominations for hackathon evaluators.
            </p>
          </div>

          {/* Header Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsJuryReportModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-[#89CFF0] text-[#08132B] hover:bg-[#BAE6FD] transition-colors rounded-none flex items-center gap-2 shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Jury Awards & Podium</span>
            </button>

            <Link
              href="/human-ai"
              className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/10 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none transition-all flex items-center gap-2 shadow-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Hybrid Leaderboard</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. Global Hackathon Stats & Live 3-Minute Pitch Clock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Pitch Timer Console (4 Cols) */}
        <div className="lg:col-span-5 liquid-glass-card rounded-none p-4 sm:p-5 border-2 border-[#89CFF0]/40 bg-gradient-to-br from-[#08132B] via-[#0D1E45] to-[#08132B] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#89CFF0]/20">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#89CFF0]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Booth Live Demo Clock (3:00)
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 border ${
              pitchSeconds < 30 ? 'bg-red-950 text-red-300 border-red-500 animate-pulse' : 'bg-[#08132B] text-[#89CFF0] border-[#89CFF0]/30'
            }`}>
              {pitchSeconds < 30 ? 'WRAPPING UP' : isTimerRunning ? 'PITCH RUNNING' : 'PAUSED'}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <div>
              <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                pitchSeconds < 30 ? 'text-red-400' : 'text-white'
              }`}>
                {formatTimer(pitchSeconds)}
              </span>
              <span className="text-[11px] text-[#8EA6C8] block mt-0.5 font-mono">
                {pitchSeconds > 60 ? "2 Min Demo Walkthrough" : "1 Min Judge Q&A Defense"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-3 font-bold rounded-none border transition-colors flex items-center justify-center ${
                  isTimerRunning 
                    ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 hover:bg-amber-900' 
                    : 'bg-[#89CFF0] text-[#08132B] border-[#89CFF0] hover:bg-[#BAE6FD]'
                }`}
                title={isTimerRunning ? "Pause Demo Timer" : "Start 3-Minute Demo Timer"}
              >
                {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setPitchSeconds(180);
                }}
                className="p-3 bg-[#08132B] hover:bg-[#0E2248] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/30 rounded-none transition-colors"
                title="Reset to 3:00"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#89CFF0]/15 flex items-center justify-between text-[11px] text-[#8EA6C8]">
            <span>Now Pitching: <strong className="text-white">{currentProject.team}</strong></span>
            <span className="text-[#89CFF0] font-mono">Booth #{currentProject.boothNumber}</span>
          </div>
        </div>

        {/* Hackathon Overview Metric Cards (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/20 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Presiding Judge</span>
            <select
              value={presidingJudge}
              onChange={(e) => setPresidingJudge(e.target.value)}
              className="mt-1 bg-[#08132B] text-white border border-[#89CFF0]/30 text-xs py-1 px-1.5 w-full rounded-none font-bold focus:outline-none"
            >
              <option value="Dr. Tabassum Ara">Dr. Tabassum Ara (Head of Dept.)</option>
              <option value="David Chen">David Chen (Technical Judge)</option>
              <option value="Dr. Priya Sharma">Dr. Priya Sharma (Head Judge)</option>
              <option value="Sarah Jenkins">Sarah Jenkins (Industry Observer)</option>
            </select>
            <span className="text-[10px] text-[#89CFF0] mt-1 block">Booth Reviewer</span>
          </div>

          <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/20 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Evaluated Teams</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">{gradedCount}</span>
              <span className="text-xs text-[#8EA6C8] font-mono">/ {projects.length} Total</span>
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block font-mono">
              {Math.round((gradedCount / projects.length) * 100)}% Completed
            </span>
          </div>

          <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/20 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Finalists Shortlisted</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-300 font-mono">{shortlistedCount}</span>
              <span className="text-xs text-[#8EA6C8] font-mono">Teams</span>
            </div>
            <span className="text-[10px] text-amber-400 mt-1 block">Top Stage Contenders</span>
          </div>

          <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/20 shadow-xs">
            <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Current Score Leader</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#89CFF0] font-mono">96</span>
              <span className="text-xs text-[#8EA6C8] font-mono">pts</span>
            </div>
            <span className="text-[10px] text-[#8EA6C8] mt-1 block truncate">multi-agent-evaluator</span>
          </div>
        </div>

      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#89CFF0]/20 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-none transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'console'
                ? 'border-[#89CFF0] text-[#89CFF0] bg-[#08132B]'
                : 'border-transparent text-[#8EA6C8] hover:text-white hover:bg-[#08132B]/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Booth Scoring & Forensics Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('finalists')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-none transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'finalists'
                ? 'border-[#89CFF0] text-[#89CFF0] bg-[#08132B]'
                : 'border-transparent text-[#8EA6C8] hover:text-white hover:bg-[#08132B]/50'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Finalists Podium & Award Matrix</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30">
              {shortlistedCount} Finalists
            </span>
          </button>
        </div>

        {/* Booth Prev / Next Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevProject}
            className="px-2.5 py-1 text-xs font-semibold bg-[#08132B] hover:bg-[#0E2248] text-white border border-[#89CFF0]/30 rounded-none flex items-center gap-1"
            title="Previous Booth"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev Booth</span>
          </button>

          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#0E2248] text-[#89CFF0] border border-[#89CFF0]/40">
            Booth #{currentProject.boothNumber}
          </span>

          <button
            onClick={handleNextProject}
            className="px-2.5 py-1 text-xs font-semibold bg-[#08132B] hover:bg-[#0E2248] text-white border border-[#89CFF0]/30 rounded-none flex items-center gap-1"
            title="Next Booth"
          >
            <span className="hidden sm:inline">Next Booth</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BOOTH SCORING & FORENSICS DESK */}
      {/* ========================================================================= */}
      {activeTab === 'console' && (
        <div className="space-y-6">
          
          {/* Booth Selector Ribbon */}
          <div className="liquid-glass-card rounded-none p-3.5 border border-[#89CFF0]/25 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-[#89CFF0]" />
                <span className="font-bold text-white uppercase font-mono">Filter by Track:</span>
                <div className="flex flex-wrap gap-1">
                  {['All Tracks', 'AI & Multi-Agent', 'Cybersecurity & Infra', 'Web3 & FinTech', 'HealthTech', 'Open Innovation'].map((trk) => (
                    <button
                      key={trk}
                      onClick={() => setActiveTrack(trk)}
                      className={`px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                        activeTrack === trk
                          ? 'bg-[#89CFF0]/20 text-[#89CFF0] border-[#89CFF0]'
                          : 'bg-[#08132B] text-[#8EA6C8] border-[#89CFF0]/20 hover:text-white'
                      }`}
                    >
                      {trk}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              {filteredProjects.map((proj) => {
                const isSelected = proj.id === currentProject.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => loadProjectToDesk(proj)}
                    className={`p-2.5 text-left border rounded-none transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0E2248] border-[#89CFF0] shadow-[0_0_15px_rgba(137,207,240,0.25)]'
                        : 'bg-[#08132B]/80 border-[#89CFF0]/20 hover:border-[#89CFF0]/50 hover:bg-[#08132B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold text-[#89CFF0]">Booth #{proj.boothNumber}</span>
                        {proj.isShortlisted && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-white block truncate">{proj.repo}</span>
                      <span className="text-[10px] text-[#8EA6C8] block truncate">{proj.team}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#89CFF0]/10 text-[10px] font-mono">
                      <span className="text-[#8EA6C8]">{proj.track.split(' ')[0]}</span>
                      <span className="font-bold text-white">{proj.totalMarks} pts</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DUAL PANE: FORENSICS TELEMETRY VS RAPID SCORING DESK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT PANE: HACKATHON FORENSICS & PROTOTYPE VERIFICATION (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="liquid-glass-card rounded-none p-5 sm:p-6 border-2 border-[#89CFF0]/30 shadow-md space-y-5">
                
                {/* Project Header */}
                <div className="pb-3 border-b border-[#89CFF0]/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase tracking-wider">
                      BOOTH #{currentProject.boothNumber} · {currentProject.track}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#08132B] text-emerald-400 border border-emerald-500/30">
                      {currentProject.authenticityScore}% Built in Event
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {currentProject.repo}
                  </h3>
                  <p className="text-xs text-[#BAE6FD] leading-relaxed">
                    {currentProject.tagline}
                  </p>
                </div>

                {/* 1. Hackathon Authenticity & Pre-Built Code Detector */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#89CFF0]" />
                      Authenticity & Pre-Built Code Forensics:
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                      currentProject.prebuiltCodeRisk === 'Low'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    }`}>
                      {currentProject.prebuiltCodeRisk === 'Low' ? 'Verified Fresh Build' : 'Pre-Built Code Warning'}
                    </span>
                  </div>

                  <div className="p-3 bg-[#08132B] border border-[#89CFF0]/20 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#8EA6C8]">Commit Velocity (Hackathon Window):</span>
                      <strong className="text-white font-mono">{currentProject.commitCount} Commits across 48h</strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#8EA6C8]">First Repository Commit:</span>
                      <strong className="text-white font-mono">{currentProject.firstCommitHoursAgo}h ago (Post-Kickoff)</strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#8EA6C8]">Boilerplate vs Original Logic:</span>
                      <strong className="text-emerald-400 font-mono">88% Original Implementation</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Prototype Reality Check (Real vs Mocked Backend) */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#89CFF0]" />
                    Prototype Execution & Backend Reality:
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-[#08132B] border border-[#89CFF0]/20 flex items-center justify-between">
                      <span className="text-[#8EA6C8]">Real APIs:</span>
                      <span className="font-mono font-bold text-emerald-400">{currentProject.mockVsRealStatus.realApis} Live Endpoints</span>
                    </div>

                    <div className="p-2.5 bg-[#08132B] border border-[#89CFF0]/20 flex items-center justify-between">
                      <span className="text-[#8EA6C8]">Database:</span>
                      <span className={`font-mono font-bold ${currentProject.mockVsRealStatus.hasDatabase ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {currentProject.mockVsRealStatus.hasDatabase ? 'Active Storage' : 'In-Memory / None'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#08132B] border border-[#89CFF0]/20 flex items-center justify-between">
                      <span className="text-[#8EA6C8]">Session Auth:</span>
                      <span className={`font-mono font-bold ${currentProject.mockVsRealStatus.hasAuth ? 'text-emerald-400' : 'text-[#8EA6C8]'}`}>
                        {currentProject.mockVsRealStatus.hasAuth ? 'Real JWT/OAuth' : 'Mocked Login'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#08132B] border border-[#89CFF0]/20 flex items-center justify-between">
                      <span className="text-[#8EA6C8]">Prototype State:</span>
                      <span className={`font-mono font-bold ${currentProject.mockVsRealStatus.isFullyLive ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {currentProject.mockVsRealStatus.isFullyLive ? 'Full Working Demo' : 'Partial UI Mock'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Tech Stack Tags */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">
                    Detected Stack Components:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentProject.techStack.map((tech, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30 text-[10px] font-mono text-[#BAE6FD]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Judge Cross-Examination Prompts */}
                <div className="p-3 bg-[#08132B]/90 border-l-2 border-l-[#89CFF0] text-xs space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase block">
                    3-Minute Booth Probing Checklist:
                  </span>
                  <ul className="space-y-1 text-[#8EA6C8] text-[11px]">
                    <li>&bull; &ldquo;Ask them to trigger an edge-case failure in their live demo.&rdquo;</li>
                    <li>&bull; &ldquo;Verify which libraries were written this weekend vs. imported.&rdquo;</li>
                    <li>&bull; &ldquo;Have them explain their database schema & state transitions.&rdquo;</li>
                  </ul>
                </div>

              </div>
            </div>

            {/* RIGHT PANE: RAPID 4-PILLAR SCORING & NOMINATIONS (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="liquid-glass-card rounded-none p-5 sm:p-7 border-2 border-[#89CFF0]/40 shadow-lg space-y-6">
                
                {/* Scoring Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#89CFF0]/20">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase tracking-wider block">
                      OFFICIAL HACKATHON EVALUATION DESK
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      Booth #{currentProject.boothNumber}: {currentProject.team}
                    </h3>
                    <span className="text-xs text-[#8EA6C8]">
                      Evaluating Judge: <strong className="text-white">{presidingJudge}</strong>
                    </span>
                  </div>

                  {/* Calculated Marks Meter */}
                  <div className="px-4 py-2 bg-[#08132B] border-2 border-[#89CFF0]/40 text-right">
                    <span className="text-[10px] font-mono text-[#8EA6C8] uppercase block">Total Awarded Marks</span>
                    <div className="flex items-baseline justify-end gap-1.5">
                      <span className="text-3xl font-black text-white font-mono">{totalCalculatedMarks}</span>
                      <span className="text-xs text-[#8EA6C8] font-mono">/100</span>
                      <span className={`text-xs font-mono font-bold ml-1.5 ${
                        totalCalculatedMarks >= 90 ? 'text-purple-400' : totalCalculatedMarks >= 80 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {totalCalculatedMarks >= 90 ? '[Podium Tier]' : totalCalculatedMarks >= 80 ? '[Finalist Tier]' : '[Standard Tier]'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rapid Score Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">
                    Fast Score Presets (1-Click Fill):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
                    <button
                      onClick={() => applyPreset(29, 29, 19, 19)}
                      className="p-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/30 text-center"
                    >
                      ★ Grand Prize (96)
                    </button>
                    <button
                      onClick={() => applyPreset(26, 26, 17, 17)}
                      className="p-1.5 bg-[#08132B] hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-center"
                    >
                      Top Finalist (86)
                    </button>
                    <button
                      onClick={() => applyPreset(23, 23, 15, 15)}
                      className="p-1.5 bg-[#08132B] hover:bg-amber-950/60 text-amber-300 border border-amber-500/30 text-center"
                    >
                      Solid Build (76)
                    </button>
                    <button
                      onClick={() => applyPreset(16, 16, 10, 10)}
                      className="p-1.5 bg-[#08132B] hover:bg-red-950/60 text-red-300 border border-red-500/30 text-center"
                    >
                      Incomplete (52)
                    </button>
                  </div>
                </div>

                {/* 4 Hackathon Rubric Sliders */}
                <div className="space-y-4 pt-1">
                  
                  {/* Rubric 1: Innovation (30 pts) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">1. Innovation, Novelty & Disruption</span>
                        <span className="text-[11px] text-[#8EA6C8]">Novel solution, unique concept vs generic clone</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-[#89CFF0] px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30">
                        {rubricInnovation} / 30
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={rubricInnovation}
                      onChange={(e) => setRubricInnovation(Number(e.target.value))}
                      className="w-full accent-[#89CFF0] bg-[#08132B] h-2 rounded-none cursor-pointer"
                    />
                  </div>

                  {/* Rubric 2: Technical Execution (30 pts) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">2. Technical Execution & Architectural Complexity</span>
                        <span className="text-[11px] text-[#8EA6C8]">Multi-agent AI, database, distributed services, difficulty</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-[#89CFF0] px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30">
                        {rubricComplexity} / 30
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={rubricComplexity}
                      onChange={(e) => setRubricComplexity(Number(e.target.value))}
                      className="w-full accent-[#89CFF0] bg-[#08132B] h-2 rounded-none cursor-pointer"
                    />
                  </div>

                  {/* Rubric 3: Design & Polish (20 pts) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">3. Design, UI Polish & User Experience</span>
                        <span className="text-[11px] text-[#8EA6C8]">Aesthetic liquid-glass design, smooth interactions, responsive</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-[#89CFF0] px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30">
                        {rubricDesign} / 20
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={rubricDesign}
                      onChange={(e) => setRubricDesign(Number(e.target.value))}
                      className="w-full accent-[#89CFF0] bg-[#08132B] h-2 rounded-none cursor-pointer"
                    />
                  </div>

                  {/* Rubric 4: Demo & Viability (20 pts) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">4. Live Demonstration & Pitch Delivery</span>
                        <span className="text-[11px] text-[#8EA6C8]">Working prototype, zero live crashes, clear Q&A defense</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-[#89CFF0] px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30">
                        {rubricDemo} / 20
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={rubricDemo}
                      onChange={(e) => setRubricDemo(Number(e.target.value))}
                      className="w-full accent-[#89CFF0] bg-[#08132B] h-2 rounded-none cursor-pointer"
                    />
                  </div>

                </div>

                {/* Finalist Shortlist & Category Nominations */}
                <div className="space-y-3 pt-3 border-t border-[#89CFF0]/15">
                  
                  {/* Shortlist Checkbox */}
                  <div className="flex items-center justify-between p-3 bg-[#08132B] border border-[#89CFF0]/30">
                    <div className="flex items-center gap-2.5">
                      <Star className={`w-4 h-4 ${isShortlisted ? 'text-amber-400 fill-amber-400' : 'text-[#8EA6C8]'}`} />
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Shortlist for Main Stage Top 5 Pitches
                        </span>
                        <span className="text-[11px] text-[#8EA6C8]">
                          Advances this booth to the final podium presentation round
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isShortlisted}
                      onChange={(e) => setIsShortlisted(e.target.checked)}
                      className="w-4 h-4 accent-[#89CFF0] cursor-pointer"
                    />
                  </div>

                  {/* Award Category Badges (Click to toggle) */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-white uppercase font-mono block">
                      Nominate for Track Category Awards:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_AWARDS.map((award) => {
                        const isNominated = selectedAwards.includes(award);
                        return (
                          <button
                            key={award}
                            type="button"
                            onClick={() => handleToggleAward(award)}
                            className={`px-2.5 py-1 text-[11px] font-mono border transition-colors flex items-center gap-1.5 ${
                              isNominated
                                ? 'bg-purple-950/80 text-purple-200 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                                : 'bg-[#08132B] text-[#8EA6C8] border-[#89CFF0]/20 hover:text-white'
                            }`}
                          >
                            <Award className="w-3 h-3 text-[#89CFF0]" />
                            <span>{award}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Judge Remarks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase font-mono block">
                    Judge Booth Notes & Technical Observations:
                  </label>
                  <textarea
                    rows={2}
                    value={judgeNotes}
                    onChange={(e) => setJudgeNotes(e.target.value)}
                    placeholder="Enter notes on demo stability, questions answered, technical strengths, or flaws..."
                    className="w-full bg-[#08132B] text-white border border-[#89CFF0]/30 p-2.5 text-xs rounded-none focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                {/* Save Evaluation Button & Toast */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#89CFF0]/20">
                  <div className="flex items-center gap-2">
                    <CodeBeastLiquidButton
                      onClick={handleSaveEvaluation}
                      variant="primary"
                      size="sm"
                      label="Submit Hackathon Score"
                      icon={<Check className="w-4 h-4" />}
                    />

                    <button
                      onClick={handleNextProject}
                      className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none flex items-center gap-1.5"
                    >
                      <span>Next Booth</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[11px] text-[#8EA6C8] font-mono">
                    Marks auto-sync to Hackathon Leaderboard
                  </span>
                </div>

                {saveToast && (
                  <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Booth #{currentProject.boothNumber} evaluation submitted! Score ({totalCalculatedMarks} pts) recorded in Hackathon Jury Ledger.
                    </span>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FINALISTS PODIUM & AWARD MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'finalists' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#89CFF0]/20">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#89CFF0]" />
                <span>Hackathon Finalists Podium & Category Nominations</span>
              </h2>
              <p className="text-xs text-[#8EA6C8] mt-0.5">
                Top teams ranked by consolidated hackathon jury scores across all tracks.
              </p>
            </div>

            <button
              onClick={() => setIsJuryReportModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold bg-[#89CFF0] text-[#08132B] hover:bg-[#BAE6FD] transition-colors rounded-none flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Jury Report</span>
            </button>
          </div>

          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Rank 2 (Silver) */}
            {rankedProjects[1] && (
              <div className="liquid-glass-card rounded-none p-5 border-2 border-slate-400/50 bg-[#08132B]/90 space-y-3 relative overflow-hidden order-2 md:order-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">🥈 1st Runner Up</span>
                  <span className="text-2xl font-black font-mono text-white">{rankedProjects[1].totalMarks} pts</span>
                </div>
                <h3 className="text-lg font-bold text-white">{rankedProjects[1].repo}</h3>
                <p className="text-xs text-[#8EA6C8]">{rankedProjects[1].team} · {rankedProjects[1].track}</p>
                <div className="flex flex-wrap gap-1 pt-2 border-t border-[#89CFF0]/15">
                  {rankedProjects[1].categoryNominations.map((nom, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-[#0C1E45] text-[10px] font-mono text-[#BAE6FD] border border-[#89CFF0]/30">
                      {nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rank 1 (Gold / Grand Prize) */}
            {rankedProjects[0] && (
              <div className="liquid-glass-card rounded-none p-6 border-2 border-amber-400/70 bg-gradient-to-b from-[#122A5E] to-[#08132B] space-y-4 relative overflow-hidden order-1 md:order-2 shadow-[0_0_30px_rgba(251,191,36,0.15)] -translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    🥇 Grand Prize Champion
                  </span>
                  <span className="text-3xl font-black font-mono text-amber-300">{rankedProjects[0].totalMarks} pts</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">{rankedProjects[0].repo}</h3>
                  <p className="text-xs text-[#BAE6FD] mt-0.5">{rankedProjects[0].team} · {rankedProjects[0].track}</p>
                </div>
                <div className="flex flex-wrap gap-1 pt-2 border-t border-[#89CFF0]/25">
                  {rankedProjects[0].categoryNominations.map((nom, idx) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-amber-950/60 text-[10px] font-mono text-amber-200 border border-amber-500/40">
                      🏆 {nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {rankedProjects[2] && (
              <div className="liquid-glass-card rounded-none p-5 border-2 border-amber-700/50 bg-[#08132B]/90 space-y-3 relative overflow-hidden order-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-600 uppercase">🥉 2nd Runner Up</span>
                  <span className="text-2xl font-black font-mono text-white">{rankedProjects[2].totalMarks} pts</span>
                </div>
                <h3 className="text-lg font-bold text-white">{rankedProjects[2].repo}</h3>
                <p className="text-xs text-[#8EA6C8]">{rankedProjects[2].team} · {rankedProjects[2].track}</p>
                <div className="flex flex-wrap gap-1 pt-2 border-t border-[#89CFF0]/15">
                  {rankedProjects[2].categoryNominations.map((nom, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-[#0C1E45] text-[10px] font-mono text-[#BAE6FD] border border-[#89CFF0]/30">
                      {nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Full Finalists Ledger */}
          <div className="liquid-glass-card rounded-none border border-[#89CFF0]/25 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#08132B] text-[#89CFF0] uppercase font-mono text-[10px] tracking-wider border-b border-[#89CFF0]/20">
                <tr>
                  <th className="p-3.5">Rank & Booth</th>
                  <th className="p-3.5">Repository & Team</th>
                  <th className="p-3.5">Track</th>
                  <th className="p-3.5 text-center">Authenticity</th>
                  <th className="p-3.5 text-center">Score</th>
                  <th className="p-3.5">Stage Shortlist</th>
                  <th className="p-3.5">Award Nominations</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#89CFF0]/10 text-[#DCE4FE]">
                {rankedProjects.map((proj, idx) => (
                  <tr key={proj.id} className="hover:bg-[#08132B]/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white">
                      #{idx + 1} <span className="text-[11px] text-[#8EA6C8] font-normal">(Booth {proj.boothNumber})</span>
                    </td>
                    <td className="p-3.5 font-medium">
                      <span className="font-bold text-white block">{proj.repo}</span>
                      <span className="text-[11px] text-[#8EA6C8]">{proj.team}</span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-[#BAE6FD]">
                      {proj.track}
                    </td>
                    <td className="p-3.5 text-center font-mono text-xs">
                      <span className="px-1.5 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                        {proj.authenticityScore}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-extrabold text-[#89CFF0] text-sm">
                      {proj.totalMarks} / 100
                    </td>
                    <td className="p-3.5">
                      {proj.isShortlisted ? (
                        <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-500/30 font-mono text-[10px] flex items-center gap-1 max-w-fit">
                          <Star className="w-3 h-3 fill-amber-300" />
                          <span>Shortlisted</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8EA6C8] font-mono">Standard</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {proj.categoryNominations.map((nom, nIdx) => (
                          <span key={nIdx} className="px-1.5 py-0.5 bg-[#08132B] border border-[#89CFF0]/20 text-[9px] font-mono text-[#BAE6FD]">
                            {nom}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          loadProjectToDesk(proj);
                          setActiveTab('console');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none transition-colors"
                      >
                        Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OFFICIAL JURY AWARDS & PODIUM REPORT MODAL (PRINT READY) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isJuryReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#08132B] border-2 border-[#89CFF0]/50 text-white p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl rounded-none"
            >
              
              {/* Header */}
              <div className="text-center pb-4 border-b-2 border-white/20 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#89CFF0] block">
                  CODE BEAST AI — HACKATHON JURY ARENA
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  OFFICIAL HACKATHON WINNERS & JURY AWARDS
                </h2>
                <p className="text-xs text-[#BAE6FD]">
                  Presided by Department of AI & ML · HKBK College of Engineering
                </p>
              </div>

              {/* Award List Table */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-white uppercase font-mono block">
                  Category Prize Winners & Standings:
                </span>
                
                <div className="border border-[#89CFF0]/30 divide-y divide-[#89CFF0]/20 text-xs">
                  {rankedProjects.slice(0, 5).map((p, idx) => (
                    <div key={p.id} className="p-3 bg-[#08132B] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#89CFF0]">Rank #{idx + 1}:</span>
                          <strong className="text-white text-sm">{p.repo}</strong>
                          <span className="text-[11px] text-[#8EA6C8]">({p.team})</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.categoryNominations.map((a, aIdx) => (
                            <span key={aIdx} className="px-1.5 py-0.5 bg-amber-950/60 text-amber-200 border border-amber-500/40 text-[9px] font-mono">
                              🏆 {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-lg font-black text-white">{p.totalMarks}</span>
                        <span className="text-xs text-[#8EA6C8]"> / 100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/20 text-xs">
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-[#8EA6C8]/60" />
                  <strong className="block text-white">Dr. Tabassum Ara</strong>
                  <span className="text-[11px] text-[#8EA6C8] block">Professor & Head of Department, AI & ML</span>
                  <span className="text-[10px] text-[#89CFF0] block">Hackathon Chief Jury & Faculty Mentor</span>
                </div>

                <div className="space-y-1 text-right">
                  <div className="h-10 border-b border-dashed border-[#8EA6C8]/60" />
                  <strong className="block text-white">{presidingJudge}</strong>
                  <span className="text-[11px] text-[#8EA6C8] block">Technical Evaluator / Jury Committee</span>
                  <span className="text-[10px] text-[#89CFF0] block">Official Ratification Signature</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#89CFF0]/20">
                <button
                  onClick={() => setIsJuryReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20 rounded-none"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold bg-[#89CFF0] text-[#08132B] hover:bg-[#BAE6FD] transition-colors rounded-none flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Jury Certificate & Report</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
