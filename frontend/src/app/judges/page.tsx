"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  Building, 
  KeyRound, 
  Layers, 
  Info, 
  FileSpreadsheet, 
  SlidersHorizontal, 
  GraduationCap, 
  ExternalLink, 
  Printer, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  HelpCircle, 
  FileText,
  UserCheck,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Cpu,
  BarChart3,
  Scale
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';
import { apiUrl } from '@/lib/api';

export interface JudgeMember {
  id: number | string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  domains: string[];
  status: 'Active' | 'Invited' | 'Offline';
  avatar: string;
  assignedAuditsCount: number;
}

export interface StudentRepoAudit {
  id: string;
  repo: string;
  repoUrl: string;
  team: string;
  language?: string;
  aiScore: number;
  aiSubscores: {
    security: number;
    arch: number;
    perf: number;
    testing: number;
    database: number;
    originality: number;
  };
  cweFindings: {
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    code: string;
    title: string;
  }[];
  // Human / Judge Rubrics (each out of 25, total 100)
  rubricCode: number;        // Code Modularity & Architecture
  rubricViva: number;        // Viva Voce & Technical Defense
  rubricInnovation: number;  // Innovation & Problem Complexity
  rubricDemo: number;        // Working Prototype & Demo Quality
  totalHumanMarks: number;
  recommendation: 'Approved for Capstone Defense' | 'Distinction / Best Project Nominee' | 'Conditional Pass (Minor Revisions)' | 'Unsatisfactory (Re-defense Required)';
  evaluatorNotes: string;
  evaluatorName: string;
  gradedAt?: string;
  isGraded: boolean;
}

const INITIAL_JUDGES: JudgeMember[] = [
  { 
    id: 1, 
    name: 'Dr. Tabassum Ara', 
    email: 'hod.aiml@hkbk.edu.in', 
    role: 'Faculty Guide & HOD', 
    institution: 'HKBK College of Engineering · Dept. of AI & ML',
    domains: ['Consensus Override', 'Capstone Defense', 'Architecture Review', 'Academic Ethics'],
    status: 'Active', 
    avatar: 'TA',
    assignedAuditsCount: 18
  },
  { 
    id: 2, 
    name: 'Dr. Priya Sharma', 
    email: 'priya@codebeast.ai', 
    role: 'Head Judge', 
    institution: 'University Dept. of Computer Science',
    domains: ['Consensus Override', 'Security CWE', 'Architecture'],
    status: 'Active', 
    avatar: 'PS',
    assignedAuditsCount: 14
  },
  { 
    id: 3, 
    name: 'David Chen', 
    email: 'david@hackathon.org', 
    role: 'Technical Judge', 
    institution: 'National Hackathon Committee',
    domains: ['Performance', 'Testing QA', 'Database'],
    status: 'Active', 
    avatar: 'DC',
    assignedAuditsCount: 11
  },
  { 
    id: 4, 
    name: 'Sarah Jenkins', 
    email: 's.jenkins@university.edu', 
    role: 'Academic Observer', 
    institution: 'Capstone Evaluation Board',
    domains: ['Read-Only Audit', 'Plagiarism Verification'],
    status: 'Invited', 
    avatar: 'SJ',
    assignedAuditsCount: 6
  },
  { 
    id: 5, 
    name: 'Marcus Johnson', 
    email: 'marcus.j@techcorp.com', 
    role: 'Security Specialist', 
    institution: 'CyberDefense Labs',
    domains: ['AutoReview CWE', 'Static Injection Flaws'],
    status: 'Offline', 
    avatar: 'MJ',
    assignedAuditsCount: 8
  },
];

const INITIAL_PROJECTS: StudentRepoAudit[] = [
  {
    id: "repo-1",
    repo: "distributed-auth-vault",
    repoUrl: "https://github.com/cybercore/distributed-auth-vault",
    team: "Nexus Security (Team 01)",
    language: "Go / TypeScript",
    aiScore: 92,
    aiSubscores: { security: 95, arch: 90, perf: 88, testing: 94, database: 86, originality: 96 },
    cweFindings: [
      { severity: 'Medium', code: 'CWE-312', title: 'Cleartext Storage of Sensitive Information in Test Config' }
    ],
    rubricCode: 23,
    rubricViva: 22,
    rubricInnovation: 22,
    rubricDemo: 23,
    totalHumanMarks: 90,
    recommendation: 'Distinction / Best Project Nominee',
    evaluatorNotes: 'Exceptional architectural defense; clearly articulated JWT rotation mechanics and cryptographic key exchange under cross-examination.',
    evaluatorName: 'Dr. Tabassum Ara',
    gradedAt: '2026-10-21 18:30',
    isGraded: true
  },
  {
    id: "repo-2",
    repo: "micro-cache-orchestrator",
    repoUrl: "https://github.com/infra-ops/micro-cache-orchestrator",
    team: "Cloud Warriors (Team 04)",
    language: "Rust / Python",
    aiScore: 78,
    aiSubscores: { security: 74, arch: 80, perf: 84, testing: 72, database: 78, originality: 82 },
    cweFindings: [
      { severity: 'High', code: 'CWE-400', title: 'Uncontrolled Resource Consumption in Redis Connection Pool' },
      { severity: 'Medium', code: 'CWE-770', title: 'Allocation of Resources Without Limits' }
    ],
    rubricCode: 21,
    rubricViva: 24,
    rubricInnovation: 24,
    rubricDemo: 25,
    totalHumanMarks: 94,
    recommendation: 'Approved for Capstone Defense',
    evaluatorNotes: 'AI penalized lower test coverage, but live demo and handling of simulated cluster drop was flawless. Team demonstrated high resilience engineering.',
    evaluatorName: 'Dr. Tabassum Ara',
    gradedAt: '2026-10-21 19:15',
    isGraded: true
  },
  {
    id: "repo-3",
    repo: "quantum-ml-flow",
    repoUrl: "https://github.com/quant-team/quantum-ml-flow",
    team: "AI Synthetics (Team 07)",
    language: "Python / PyTorch",
    aiScore: 89,
    aiSubscores: { security: 86, arch: 88, perf: 92, testing: 84, database: 80, originality: 94 },
    cweFindings: [],
    rubricCode: 22,
    rubricViva: 19,
    rubricInnovation: 22,
    rubricDemo: 20,
    totalHumanMarks: 83,
    recommendation: 'Approved for Capstone Defense',
    evaluatorNotes: 'High AI score. However, students had mild hesitation explaining custom gradient tensor clipping in viva. Advised to review loss convergence proofs.',
    evaluatorName: 'David Chen',
    gradedAt: '2026-10-21 17:45',
    isGraded: true
  },
  {
    id: "repo-4",
    repo: "event-stream-ledger",
    repoUrl: "https://github.com/fintech-hub/event-stream-ledger",
    team: "FinTech Ledger (Team 09)",
    language: "Java / Kafka",
    aiScore: 84,
    aiSubscores: { security: 82, arch: 86, perf: 88, testing: 78, database: 85, originality: 85 },
    cweFindings: [
      { severity: 'Low', code: 'CWE-532', title: 'Insertion of Sensitive Information into Log File' }
    ],
    rubricCode: 21,
    rubricViva: 22,
    rubricInnovation: 21,
    rubricDemo: 22,
    totalHumanMarks: 86,
    recommendation: 'Approved for Capstone Defense',
    evaluatorNotes: 'Solid distributed state machine. Transaction rollback mechanism properly implemented.',
    evaluatorName: 'Dr. Priya Sharma',
    gradedAt: '2026-10-21 16:10',
    isGraded: true
  },
  {
    id: "repo-5",
    repo: "edge-vision-pipeline",
    repoUrl: "https://github.com/vision-labs/edge-vision-pipeline",
    team: "Spectra AI (Team 12)",
    language: "C++ / Python",
    aiScore: 72,
    aiSubscores: { security: 68, arch: 74, perf: 76, testing: 65, database: 70, originality: 79 },
    cweFindings: [
      { severity: 'High', code: 'CWE-119', title: 'Improper Restriction of Operations within Bounds of Memory Buffer' }
    ],
    rubricCode: 18,
    rubricViva: 18,
    rubricInnovation: 20,
    rubricDemo: 19,
    totalHumanMarks: 75,
    recommendation: 'Conditional Pass (Minor Revisions)',
    evaluatorNotes: 'Must address the C++ memory buffer boundary flaw identified by Security Agent before final university submission.',
    evaluatorName: 'Dr. Tabassum Ara',
    isGraded: false
  },
  {
    id: "repo-6",
    repo: "semantic-search-graph",
    repoUrl: "https://github.com/nlp-core/semantic-search-graph",
    team: "Graph Minds (Team 15)",
    language: "TypeScript / Neo4j",
    aiScore: 81,
    aiSubscores: { security: 79, arch: 82, perf: 80, testing: 82, database: 86, originality: 83 },
    cweFindings: [],
    rubricCode: 20,
    rubricViva: 20,
    rubricInnovation: 20,
    rubricDemo: 20,
    totalHumanMarks: 80,
    recommendation: 'Approved for Capstone Defense',
    evaluatorNotes: 'Pending live viva defense.',
    evaluatorName: 'Dr. Tabassum Ara',
    isGraded: false
  }
];

export default function JudgesPage() {
  const [activeTab, setActiveTab] = useState<'console' | 'ledger' | 'directory'>('console');
  const [judges, setJudges] = useState<JudgeMember[]>(INITIAL_JUDGES);
  const [projects, setProjects] = useState<StudentRepoAudit[]>(INITIAL_PROJECTS);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("repo-1");
  const [activeEvaluator, setActiveEvaluator] = useState<string>("Dr. Tabassum Ara");
  
  // Scoring Desk Form State for the currently selected project
  const [rubricCode, setRubricCode] = useState<number>(23);
  const [rubricViva, setRubricViva] = useState<number>(22);
  const [rubricInnovation, setRubricInnovation] = useState<number>(22);
  const [rubricDemo, setRubricDemo] = useState<number>(23);
  const [recommendation, setRecommendation] = useState<StudentRepoAudit['recommendation']>('Distinction / Best Project Nominee');
  const [notes, setNotes] = useState<string>('');
  
  // UI Modals & Toasts
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Invite Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Technical Judge');
  const [institution, setInstitution] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['Security CWE', 'Architecture']);

  // Directory Filters
  const [directoryFilter, setDirectoryFilter] = useState<'All' | 'Active' | 'Invited' | 'Offline'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Initial Load & Hydration
  useEffect(() => {
    // A. Load judges directory
    try {
      const savedJudges = localStorage.getItem('codebeast_judges_directory');
      if (savedJudges) {
        const parsed = JSON.parse(savedJudges);
        if (Array.isArray(parsed) && parsed.length > 0) setJudges(parsed);
      }
    } catch (e) {}

    // B. Fetch real projects from API or merge with saved grades map
    const loadProjectsData = async () => {
      try {
        let gradesMap: Record<string, any> = {};
        try {
          const rawMap = localStorage.getItem('codebeast_human_grades_map');
          if (rawMap) gradesMap = JSON.parse(rawMap);
        } catch (e) {}

        const res = await fetch(apiUrl('/api/v1/stats/history?recent_only=true'));
        if (res.ok) {
          const data = await res.json();
          const historyList: any[] = data.history || [];
          const completed = historyList.filter(h => h.status === 'Completed' || h.overall);

          if (completed.length > 0) {
            const mapped: StudentRepoAudit[] = completed.slice(0, 15).map((job, idx) => {
              const cleanRepo = job.repo || `Repository-${idx + 1}`;
              const key = job.id || job.repoId || cleanRepo;
              const saved = gradesMap[key] || gradesMap[cleanRepo];

              const aiScore = job.overall || job.final_report?.overall_score || 75;
              const subscores = job.final_report || {};

              const rCode = saved?.rubricCode ?? (saved?.humanScore ? Math.round(saved.humanScore * 0.25) : 21);
              const rViva = saved?.rubricViva ?? (saved?.vivaScore ? Math.round(saved.vivaScore * 0.25) : 22);
              const rInno = saved?.rubricInnovation ?? (saved?.innovationScore ? Math.round(saved.innovationScore * 0.25) : 21);
              const rDemo = saved?.rubricDemo ?? (saved?.humanScore ? Math.round(saved.humanScore * 0.25) : 22);
              const totalMarks = rCode + rViva + rInno + rDemo;

              return {
                id: key,
                repo: cleanRepo,
                repoUrl: job.repoId?.startsWith('http') ? job.repoId : `https://github.com/${job.team || 'developer'}/${cleanRepo}`,
                team: job.team || job.final_report?.team_name || `${cleanRepo.split('/')[0] || 'Team'} Engineering`,
                language: job.language || 'Python / TypeScript',
                aiScore: aiScore,
                aiSubscores: {
                  security: job.sec || subscores.security_score || 78,
                  arch: job.arch || subscores.arch_score || 80,
                  perf: job.perf || subscores.perf_score || 82,
                  testing: job.testing_score || subscores.testing_score || 75,
                  database: subscores.database_score || 78,
                  originality: job.orig || subscores.originality_score || 88
                },
                cweFindings: (job.cwe_matrix || []).slice(0, 3).map((c: any) => ({
                  severity: c.severity || 'Medium',
                  code: c.cwe || 'CWE-89',
                  title: c.message || 'Defect finding'
                })),
                rubricCode: rCode,
                rubricViva: rViva,
                rubricInnovation: rInno,
                rubricDemo: rDemo,
                totalHumanMarks: totalMarks,
                recommendation: saved?.recommendation || (totalMarks >= 90 ? 'Distinction / Best Project Nominee' : 'Approved for Capstone Defense'),
                evaluatorNotes: saved?.evaluatorNotes || "Project evaluated via multi-agent consensus review.",
                evaluatorName: saved?.evaluatorName || "Dr. Tabassum Ara",
                gradedAt: saved?.gradedAt || "2026-10-21 18:00",
                isGraded: !!saved
              };
            });

            setProjects(mapped);
            if (mapped.length > 0) {
              setSelectedRepoId(mapped[0].id);
              loadProjectToDesk(mapped[0]);
            }
            return;
          }
        }
      } catch (e) {}

      // Fallback: merge INITIAL_PROJECTS with any saved grades map
      try {
        const rawMap = localStorage.getItem('codebeast_human_grades_map');
        if (rawMap) {
          const gradesMap = JSON.parse(rawMap);
          setProjects(prev => prev.map(p => {
            const saved = gradesMap[p.id] || gradesMap[p.repo];
            if (saved) {
              const rC = saved.rubricCode ?? Math.round(saved.humanScore * 0.25);
              const rV = saved.rubricViva ?? Math.round(saved.vivaScore * 0.25);
              const rI = saved.rubricInnovation ?? Math.round(saved.innovationScore * 0.25);
              const rD = saved.rubricDemo ?? 22;
              return {
                ...p,
                rubricCode: rC,
                rubricViva: rV,
                rubricInnovation: rI,
                rubricDemo: rD,
                totalHumanMarks: rC + rV + rI + rD,
                recommendation: saved.recommendation || p.recommendation,
                evaluatorNotes: saved.evaluatorNotes || p.evaluatorNotes,
                evaluatorName: saved.evaluatorName || p.evaluatorName,
                isGraded: true
              };
            }
            return p;
          }));
        }
      } catch (e) {}
    };

    loadProjectsData();
  }, []);

  // Currently active selected project
  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedRepoId) || projects[0] || INITIAL_PROJECTS[0];
  }, [projects, selectedRepoId]);

  // Load a project into the interactive scoring desk form
  const loadProjectToDesk = (proj: StudentRepoAudit) => {
    setSelectedRepoId(proj.id);
    setRubricCode(proj.rubricCode);
    setRubricViva(proj.rubricViva);
    setRubricInnovation(proj.rubricInnovation);
    setRubricDemo(proj.rubricDemo);
    setRecommendation(proj.recommendation);
    setNotes(proj.evaluatorNotes);
    if (proj.evaluatorName) {
      setActiveEvaluator(proj.evaluatorName);
    }
  };

  // Live calculated total marks
  const totalCalculatedMarks = rubricCode + rubricViva + rubricInnovation + rubricDemo;
  const scoreDelta = totalCalculatedMarks - (currentProject?.aiScore || 0);

  // Save & Ratify Evaluation
  const handleSaveEvaluation = () => {
    if (!currentProject) return;

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const updatedProjects = projects.map(p => {
      if (p.id === currentProject.id) {
        return {
          ...p,
          rubricCode,
          rubricViva,
          rubricInnovation,
          rubricDemo,
          totalHumanMarks: totalCalculatedMarks,
          recommendation,
          evaluatorNotes: notes,
          evaluatorName: activeEvaluator,
          gradedAt: now,
          isGraded: true
        };
      }
      return p;
    });

    setProjects(updatedProjects);

    // Save into codebeast_human_grades_map so it instantly synchronizes with the /human-ai page!
    try {
      let gradesMap: Record<string, any> = {};
      const raw = localStorage.getItem('codebeast_human_grades_map');
      if (raw) gradesMap = JSON.parse(raw);

      const entry = {
        humanScore: totalCalculatedMarks,
        vivaScore: rubricViva * 4,
        innovationScore: rubricInnovation * 4,
        rubricCode,
        rubricViva,
        rubricInnovation,
        rubricDemo,
        recommendation,
        evaluatorNotes: notes,
        evaluatorName: activeEvaluator,
        gradedAt: now
      };

      gradesMap[currentProject.id] = entry;
      gradesMap[currentProject.repo] = entry;

      localStorage.setItem('codebeast_human_grades_map', JSON.stringify(gradesMap));
    } catch (e) {}

    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  // Add Judge
  const handleAddJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'JD';

    const newJudge: JudgeMember = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      institution: institution.trim() || 'Academic Faculty / Industry Evaluator',
      domains: selectedDomains.length > 0 ? selectedDomains : ['General Code Quality'],
      status: 'Invited',
      avatar: initials,
      assignedAuditsCount: 0
    };

    const updated = [newJudge, ...judges];
    setJudges(updated);
    try {
      localStorage.setItem('codebeast_judges_directory', JSON.stringify(updated));
    } catch (e) {}

    setName('');
    setEmail('');
    setInstitution('');
    setSelectedDomains(['Security CWE', 'Architecture']);
    setIsInviteModalOpen(false);
  };

  const handleDeleteJudge = (id: number | string) => {
    const updated = judges.filter(j => j.id !== id);
    setJudges(updated);
    try {
      localStorage.setItem('codebeast_judges_directory', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleToggleStatus = (id: number | string) => {
    const statusCycle: Record<JudgeMember['status'], JudgeMember['status']> = {
      Active: 'Offline',
      Offline: 'Invited',
      Invited: 'Active'
    };
    const updated = judges.map(j => {
      if (j.id === id) return { ...j, status: statusCycle[j.status] };
      return j;
    });
    setJudges(updated);
    try {
      localStorage.setItem('codebeast_judges_directory', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCopyInviteLink = (judge: JudgeMember) => {
    const fakeToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://codebeast.ai'}/judges/invite?token=CB-${fakeToken}&evaluator=${encodeURIComponent(judge.email)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(judge.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const filteredJudges = judges.filter(judge => {
    const matchesFilter = directoryFilter === 'All' ? true : judge.status === directoryFilter;
    const matchesSearch = 
      judge.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      judge.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judge.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (judge.institution && judge.institution.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const gradedCount = projects.filter(p => p.isGraded).length;
  const avgHumanMarks = Math.round(
    projects.filter(p => p.isGraded).reduce((acc, p) => acc + p.totalHumanMarks, 0) / (gradedCount || 1)
  );

  return (
    <div className="space-y-8 pb-16 text-white max-w-7xl mx-auto">
      
      {/* 1. Page Header with Navigation and Quick Actions */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-bold tracking-wider uppercase rounded-none shadow-xs mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-[#89CFF0]" />
              Academic Capstone & Defense Scoring Desk
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Evaluation Judges & Viva Defense Console
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1 max-w-3xl leading-relaxed">
              Interactive scoring desk for faculty guides, external examiners, and technical judges to evaluate student repositories, conduct viva defenses, grade rubrics, and ratify consensus scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/human-ai"
              className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/10 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none transition-all flex items-center gap-2 shadow-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Hybrid Leaderboard</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/10 text-white border border-[#89CFF0]/40 rounded-none transition-all flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#89CFF0]" />
              <span>Print Marksheet</span>
            </button>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-3 py-2 text-xs font-semibold bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20 rounded-none transition-all flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showGuide ? "Hide Guide" : "Viva Rubric Guide"}</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. Educational & Rubric Methodology Guide (Toggleable) */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="liquid-glass-card rounded-none p-5 sm:p-6 border border-[#89CFF0]/30 bg-gradient-to-r from-[#08132B]/95 via-[#0C1E45]/90 to-[#08132B]/95 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#89CFF0]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    University Capstone Evaluation Protocol & Rubric Matrix
                  </span>
                </div>
                <button onClick={() => setShowGuide(false)} className="text-[#8EA6C8] hover:text-white text-xs">
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-[#8EA6C8]">
                <div className="p-3 bg-[#08132B]/70 border border-[#89CFF0]/20 rounded-none">
                  <span className="font-bold text-[#89CFF0] block mb-1">1. Code Modularity (25 pts)</span>
                  Evaluates adherence to SOLID principles, modular package layout, docstrings, and static analysis safety.
                </div>
                <div className="p-3 bg-[#08132B]/70 border border-[#89CFF0]/20 rounded-none">
                  <span className="font-bold text-[#89CFF0] block mb-1">2. Viva Voce Defense (25 pts)</span>
                  Evaluates the student&apos;s ability to defend algorithmic choices, handle failure questions, and articulate data structures.
                </div>
                <div className="p-3 bg-[#08132B]/70 border border-[#89CFF0]/20 rounded-none">
                  <span className="font-bold text-[#89CFF0] block mb-1">3. Innovation & Complexity (25 pts)</span>
                  Assesses engineering difficulty, novelty, algorithmic complexity, and real-world domain significance.
                </div>
                <div className="p-3 bg-[#08132B]/70 border border-[#89CFF0]/20 rounded-none">
                  <span className="font-bold text-[#89CFF0] block mb-1">4. Live Demonstration (25 pts)</span>
                  Verifies working software execution, error recovery, responsive user interfaces, and edge-case resilience.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Session Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/20 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Presiding Evaluator</span>
          <span className="text-sm font-bold text-white mt-1 block truncate text-[#BAE6FD]">{activeEvaluator}</span>
          <span className="text-[10px] text-[#89CFF0] mt-0.5 block">Faculty Guide & HOD</span>
        </div>

        <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/20 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Graded Projects</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white font-mono">{gradedCount}</span>
            <span className="text-xs text-[#8EA6C8] font-mono">/ {projects.length} Total</span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">{Math.round((gradedCount / projects.length) * 100)}% Defense Progress</span>
        </div>

        <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/20 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Avg. Human Marks</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-[#89CFF0] font-mono">{avgHumanMarks}</span>
            <span className="text-xs text-[#8EA6C8] font-mono">/ 100 pts</span>
          </div>
          <span className="text-[10px] text-[#8EA6C8] mt-0.5 block">Across 4-Pillar Rubrics</span>
        </div>

        <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/20 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Consensus Alignment</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-emerald-400 font-mono">94.2%</span>
            <span className="text-xs text-[#8EA6C8] font-mono">Agreement</span>
          </div>
          <span className="text-[10px] text-[#8EA6C8] mt-0.5 block">Within ±8.5 pts of AI</span>
        </div>
      </div>

      {/* 4. Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[#89CFF0]/20 pb-1">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('console')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-none transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'console'
                ? 'border-[#89CFF0] text-[#89CFF0] bg-[#08132B]'
                : 'border-transparent text-[#8EA6C8] hover:text-white hover:bg-[#08132B]/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Interactive Viva Scoring Console</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-none transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'ledger'
                ? 'border-[#89CFF0] text-[#89CFF0] bg-[#08132B]'
                : 'border-transparent text-[#8EA6C8] hover:text-white hover:bg-[#08132B]/50'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Graded Projects & Marks Ledger</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-none transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'directory'
                ? 'border-[#89CFF0] text-[#89CFF0] bg-[#08132B]'
                : 'border-transparent text-[#8EA6C8] hover:text-white hover:bg-[#08132B]/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Committee Directory</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30">
              {judges.length}
            </span>
          </button>
        </div>

        {/* Quick Evaluator Switcher */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-[#8EA6C8] font-mono text-[11px]">Evaluator:</span>
          <select
            value={activeEvaluator}
            onChange={(e) => setActiveEvaluator(e.target.value)}
            className="bg-[#08132B] text-white border border-[#89CFF0]/40 text-xs px-2.5 py-1 rounded-none font-semibold focus:outline-none focus:border-[#89CFF0]"
          >
            {judges.map(j => (
              <option key={j.id} value={j.name}>{j.name} ({j.role})</option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE VIVA SCORING CONSOLE */}
      {/* ========================================================================= */}
      {activeTab === 'console' && (
        <div className="space-y-6">
          
          {/* Project Selection Carousel / Ribbon */}
          <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/25 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#89CFF0]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Select Repository to Evaluate:
                </span>
              </div>
              <span className="text-xs text-[#8EA6C8]">
                Click any repository card below to inspect AI evidence and record viva marks.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
              {projects.map(proj => {
                const isSelected = proj.id === currentProject.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => loadProjectToDesk(proj)}
                    className={`p-3 text-left border rounded-none transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-[#0E2248] border-[#89CFF0] shadow-[0_0_15px_rgba(137,207,240,0.25)]' 
                        : 'bg-[#08132B]/80 border-[#89CFF0]/20 hover:border-[#89CFF0]/50 hover:bg-[#08132B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono text-[#8EA6C8] truncate max-w-[90px]">{proj.team}</span>
                        {proj.isGraded ? (
                          <span className="text-[9px] font-mono font-bold px-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            GRADED
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1 bg-amber-950/60 text-amber-300 border border-amber-500/30">
                            PENDING
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white block truncate">{proj.repo}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#89CFF0]/10 text-[10px] font-mono">
                      <span className="text-[#8EA6C8]">AI: <strong className="text-white">{proj.aiScore}</strong></span>
                      <span className="text-[#8EA6C8]">Marks: <strong className={proj.isGraded ? "text-emerald-400" : "text-[#8EA6C8]"}>{proj.totalHumanMarks}</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DUAL-PANE EVALUATION CONSOLE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: MULTI-AGENT AI EVIDENCE (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="liquid-glass-card rounded-none p-5 sm:p-6 border-2 border-[#89CFF0]/30 shadow-md space-y-5">
                
                {/* Header of Left Pane */}
                <div className="flex items-center justify-between pb-3 border-b border-[#89CFF0]/20">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase tracking-wider block">
                      AI EVIDENCE & TELEMETRY
                    </span>
                    <h3 className="text-base font-bold text-white truncate max-w-[280px]">
                      {currentProject.repo}
                    </h3>
                    <span className="text-xs text-[#8EA6C8]">{currentProject.team} · {currentProject.language}</span>
                  </div>

                  {/* AI Score Badge */}
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#8EA6C8] uppercase block">AI Score</span>
                    <span className="text-2xl font-extrabold text-[#89CFF0] font-mono">
                      {currentProject.aiScore}
                      <span className="text-xs text-[#8EA6C8] font-normal">/100</span>
                    </span>
                  </div>
                </div>

                {/* 6 Specialized Agent Subscores */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">
                    Multi-Agent Subscore Breakdown:
                  </span>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#8EA6C8]">Security & CWE Slicing</span>
                        <span className="font-mono font-bold text-white">{currentProject.aiSubscores.security}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#08132B] border border-[#89CFF0]/20 rounded-none overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: `${currentProject.aiSubscores.security}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#8EA6C8]">Architecture & SOLID Principles</span>
                        <span className="font-mono font-bold text-white">{currentProject.aiSubscores.arch}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#08132B] border border-[#89CFF0]/20 rounded-none overflow-hidden">
                        <div className="h-full bg-blue-400" style={{ width: `${currentProject.aiSubscores.arch}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#8EA6C8]">Performance & Concurrency</span>
                        <span className="font-mono font-bold text-white">{currentProject.aiSubscores.perf}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#08132B] border border-[#89CFF0]/20 rounded-none overflow-hidden">
                        <div className="h-full bg-indigo-400" style={{ width: `${currentProject.aiSubscores.perf}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#8EA6C8]">Testing & Assertion Coverage</span>
                        <span className="font-mono font-bold text-white">{currentProject.aiSubscores.testing}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#08132B] border border-[#89CFF0]/20 rounded-none overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${currentProject.aiSubscores.testing}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#8EA6C8]">Database Integrity & FinOps</span>
                        <span className="font-mono font-bold text-white">{currentProject.aiSubscores.database}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#08132B] border border-[#89CFF0]/20 rounded-none overflow-hidden">
                        <div className="h-full bg-purple-400" style={{ width: `${currentProject.aiSubscores.database}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#8EA6C8]">Originality & Code Plagiarism</span>
                        <span className="font-mono font-bold text-white">{currentProject.aiSubscores.originality}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#08132B] border border-[#89CFF0]/20 rounded-none overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: `${currentProject.aiSubscores.originality}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detected CWE Vulnerabilities */}
                <div className="space-y-2 pt-2 border-t border-[#89CFF0]/15">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">
                    Flagged Code Vulnerabilities (CWE):
                  </span>
                  {currentProject.cweFindings.length > 0 ? (
                    <div className="space-y-1.5">
                      {currentProject.cweFindings.map((cwe, idx) => (
                        <div key={idx} className="p-2.5 bg-[#08132B] border border-[#89CFF0]/20 text-xs flex items-start gap-2">
                          <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                            cwe.severity === 'Critical' || cwe.severity === 'High' ? 'text-red-400' : 'text-amber-400'
                          }`} />
                          <div>
                            <span className="font-mono font-bold text-[#89CFF0] mr-1.5">{cwe.code} [{cwe.severity}]</span>
                            <span className="text-[#DCE4FE] text-[11px]">{cwe.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-[#08132B] border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Zero high-severity CWE vulnerabilities detected by Security Agent.</span>
                    </div>
                  )}
                </div>

                {/* Probing Viva Questions to Ask Students */}
                <div className="space-y-2 pt-2 border-t border-[#89CFF0]/15">
                  <span className="text-xs font-bold text-[#BAE6FD] uppercase tracking-wider block font-mono flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#89CFF0]" />
                    AI-Suggested Viva Probing Questions:
                  </span>
                  <div className="space-y-2 text-xs text-[#8EA6C8]">
                    <div className="p-2.5 bg-[#08132B]/80 border-l-2 border-l-[#89CFF0] pl-3 leading-relaxed">
                      &bull; &ldquo;Ask the team to trace how request parameters are sanitized before hitting the persistence layer.&rdquo;
                    </div>
                    <div className="p-2.5 bg-[#08132B]/80 border-l-2 border-l-[#89CFF0] pl-3 leading-relaxed">
                      &bull; &ldquo;Challenge the students on their test coverage ({currentProject.aiSubscores.testing}%) and why integration assertions are sparse.&rdquo;
                    </div>
                    <div className="p-2.5 bg-[#08132B]/80 border-l-2 border-l-[#89CFF0] pl-3 leading-relaxed">
                      &bull; &ldquo;Verify whether the core business logic algorithm was authored natively or adapted from external templates.&rdquo;
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE VIVA & RUBRICS SCORING DESK (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="liquid-glass-card rounded-none p-5 sm:p-7 border-2 border-[#89CFF0]/35 shadow-lg space-y-6">
                
                {/* Header & Presiding Judge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#89CFF0]/20">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase tracking-wider block">
                      FACULTY RUBRICS & VIVA SCORING DESK
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Evaluating: {currentProject.repo}
                    </h3>
                    <span className="text-xs text-[#8EA6C8]">
                      Presiding Evaluator: <strong className="text-white">{activeEvaluator}</strong>
                    </span>
                  </div>

                  {/* Calculated Marks Display */}
                  <div className="px-4 py-2 bg-[#08132B] border-2 border-[#89CFF0]/40 rounded-none text-right shadow-xs">
                    <span className="text-[10px] font-mono text-[#8EA6C8] uppercase block">Total Awarded Marks</span>
                    <div className="flex items-baseline justify-end gap-1.5">
                      <span className="text-2xl font-black text-white font-mono">{totalCalculatedMarks}</span>
                      <span className="text-xs text-[#8EA6C8] font-mono">/100</span>
                      <span className={`text-xs font-mono font-bold ml-1.5 ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        ({scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} vs AI)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Interactive Rubric Sliders (0 - 25 points each) */}
                <div className="space-y-5">
                  
                  {/* Rubric 1: Code Modularity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">1. Code Modularity & Architecture</span>
                        <span className="text-[11px] text-[#8EA6C8]">SOLID principles, package separation, typing, and cleanliness</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-[#89CFF0] px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30">
                        {rubricCode} / 25
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={rubricCode}
                      onChange={(e) => setRubricCode(Number(e.target.value))}
                      className="w-full accent-[#89CFF0] bg-[#08132B] h-2 rounded-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[#8EA6C8]">
                      <span>0 (Poor / Spagetti)</span>
                      <span>13 (Average / Basic)</span>
                      <span>20 (Solid / Clean)</span>
                      <span>25 (Enterprise Grade)</span>
                    </div>
                  </div>

                  {/* Rubric 2: Viva Voce & Technical Defense */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">2. Viva Voce & Technical Defense</span>
                        <span className="text-[11px] text-[#8EA6C8]">Student cross-examination, explaining trade-offs, and conceptual depth</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-[#89CFF0] px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30">
                        {rubricViva} / 25
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={rubricViva}
                      onChange={(e) => setRubricViva(Number(e.target.value))}
                      className="w-full accent-[#89CFF0] bg-[#08132B] h-2 rounded-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[#8EA6C8]">
                      <span>0 (Failed Defense)</span>
                      <span>13 (Hesitant / Basic)</span>
                      <span>20 (Clear Grasp)</span>
                      <span>25 (Mastery / Authoritative)</span>
                    </div>
                  </div>

                  {/* Rubric 3: Innovation & Problem Complexity */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">3. Innovation & Problem Complexity</span>
                        <span className="text-[11px] text-[#8EA6C8]">Original engineering depth, domain challenge, and novel implementation</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-[#89CFF0] px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30">
                        {rubricInnovation} / 25
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={rubricInnovation}
                      onChange={(e) => setRubricInnovation(Number(e.target.value))}
                      className="w-full accent-[#89CFF0] bg-[#08132B] h-2 rounded-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[#8EA6C8]">
                      <span>0 (Trivial CRUD)</span>
                      <span>13 (Standard Template)</span>
                      <span>20 (Significant Challenge)</span>
                      <span>25 (Novel / Research Grade)</span>
                    </div>
                  </div>

                  {/* Rubric 4: Working Prototype & Demo */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">4. Working Prototype & Demonstration</span>
                        <span className="text-[11px] text-[#8EA6C8]">Functional live execution, edge case stability, and feature completeness</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-[#89CFF0] px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30">
                        {rubricDemo} / 25
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      value={rubricDemo}
                      onChange={(e) => setRubricDemo(Number(e.target.value))}
                      className="w-full accent-[#89CFF0] bg-[#08132B] h-2 rounded-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[#8EA6C8]">
                      <span>0 (Non-functional Demo)</span>
                      <span>13 (Partial Features)</span>
                      <span>20 (Complete Working Flow)</span>
                      <span>25 (Flawless Execution)</span>
                    </div>
                  </div>

                </div>

                {/* Final Recommendation Selector */}
                <div className="space-y-1.5 pt-2 border-t border-[#89CFF0]/15">
                  <label className="text-xs font-bold text-white uppercase font-mono block">
                    Committee Final Recommendation:
                  </label>
                  <select
                    value={recommendation}
                    onChange={(e: any) => setRecommendation(e.target.value)}
                    className="w-full bg-[#08132B] text-white border border-[#89CFF0]/40 text-xs p-2.5 rounded-none font-semibold focus:outline-none focus:border-[#89CFF0]"
                  >
                    <option value="Approved for Capstone Defense">Approved for Capstone Defense (Passing Grade)</option>
                    <option value="Distinction / Best Project Nominee">Distinction / Best Project Nominee (A+ Outstanding)</option>
                    <option value="Conditional Pass (Minor Revisions)">Conditional Pass (Requires Minor Revisions)</option>
                    <option value="Unsatisfactory (Re-defense Required)">Unsatisfactory (Re-defense Required)</option>
                  </select>
                </div>

                {/* Qualitative Evaluator Feedback & Viva Remarks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white uppercase font-mono block">
                    Official Evaluator Remarks & Observations:
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter observations on student viva defense, code questions answered, live demo execution notes, or required revisions..."
                    className="w-full bg-[#08132B] text-white border border-[#89CFF0]/30 p-3 text-xs rounded-none focus:outline-none focus:border-[#89CFF0] leading-relaxed"
                  />
                </div>

                {/* Scoring Actions & Toast */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#89CFF0]/20">
                  <div className="flex items-center gap-2">
                    <CodeBeastLiquidButton
                      onClick={handleSaveEvaluation}
                      variant="primary"
                      size="sm"
                      label="Ratify & Save Marks"
                      icon={<Check className="w-4 h-4" />}
                    />

                    <button
                      onClick={() => setIsPrintModalOpen(true)}
                      className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/10 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Marksheet</span>
                    </button>
                  </div>

                  <Link
                    href="/human-ai"
                    className="text-xs text-[#8EA6C8] hover:text-[#89CFF0] flex items-center gap-1 font-mono transition-colors"
                  >
                    <span>View in Human+AI Hybrid Leaderboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Save Success Toast */}
                {saveSuccessToast && (
                  <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 rounded-none animate-fadeIn">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Evaluation successfully saved and ratified! Marks are now synchronized with the <strong>Human+AI Hybrid Leaderboard</strong>.
                    </span>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GRADED PROJECTS & MARKS LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#89CFF0]/20">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Official Capstone Evaluation Marks Ledger
              </h2>
              <p className="text-xs text-[#8EA6C8] mt-0.5">
                Audit trail of student repositories evaluated by the faculty defense committee.
              </p>
            </div>
            
            <Link
              href="/human-ai"
              className="px-3 py-1.5 bg-[#08132B] border border-[#89CFF0]/40 text-xs font-semibold text-[#89CFF0] rounded-none flex items-center gap-1.5 hover:bg-[#89CFF0]/10 transition-colors"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Open Weighted Hybrid Leaderboard</span>
            </Link>
          </div>

          <div className="liquid-glass-card rounded-none border border-[#89CFF0]/25 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#08132B] text-[#89CFF0] uppercase font-mono text-[10px] tracking-wider border-b border-[#89CFF0]/20">
                <tr>
                  <th className="p-3.5">Repository & Team</th>
                  <th className="p-3.5">Language</th>
                  <th className="p-3.5 text-center">AI Score</th>
                  <th className="p-3.5 text-center">Judge Marks</th>
                  <th className="p-3.5 text-center">Delta</th>
                  <th className="p-3.5">Presiding Evaluator</th>
                  <th className="p-3.5">Recommendation</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#89CFF0]/10 text-[#DCE4FE]">
                {projects.map((proj) => {
                  const delta = proj.totalHumanMarks - proj.aiScore;
                  return (
                    <tr key={proj.id} className="hover:bg-[#08132B]/50 transition-colors">
                      <td className="p-3.5 font-medium">
                        <span className="font-bold text-white block">{proj.repo}</span>
                        <span className="text-[11px] text-[#8EA6C8]">{proj.team}</span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[#8EA6C8]">
                        {proj.language}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-white">
                        {proj.aiScore}
                      </td>
                      <td className="p-3.5 text-center font-mono font-extrabold text-[#89CFF0]">
                        {proj.totalHumanMarks} / 100
                      </td>
                      <td className="p-3.5 text-center font-mono text-xs">
                        <span className={`px-1.5 py-0.5 rounded-none font-bold ${
                          delta >= 0 ? 'text-emerald-400 bg-emerald-950/40' : 'text-amber-400 bg-amber-950/40'
                        }`}>
                          {delta >= 0 ? `+${delta}` : delta}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-white">
                        {proj.evaluatorName}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-none block max-w-fit ${
                          proj.recommendation.includes('Distinction') 
                            ? 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                            : proj.recommendation.includes('Approved')
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        }`}>
                          {proj.recommendation}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            loadProjectToDesk(proj);
                            setActiveTab('console');
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none transition-colors"
                        >
                          Grade / Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMMITTEE & EVALUATOR REGISTRY */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          
          {/* Top Filter and Invite Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#89CFF0]/20">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Evaluation Judges & Committee Directory
              </h2>
              <p className="text-xs text-[#8EA6C8] mt-0.5">
                Faculty guides, external examiners, and technical evaluators who oversee multi-agent scoring consensus.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <CodeBeastLiquidButton
                onClick={() => setIsInviteModalOpen(true)}
                variant="primary"
                size="sm"
                label="Invite Evaluator"
                icon={<UserPlus className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8EA6C8]" />
              <input
                type="text"
                placeholder="Search judges by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#08132B] border border-[#89CFF0]/30 pl-9 pr-3 py-2 text-xs text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              {(['All', 'Active', 'Invited', 'Offline'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setDirectoryFilter(st)}
                  className={`px-3 py-1 font-mono text-xs rounded-none border transition-colors ${
                    directoryFilter === st
                      ? 'bg-[#89CFF0]/20 text-[#89CFF0] border-[#89CFF0]'
                      : 'bg-[#08132B] text-[#8EA6C8] border-[#89CFF0]/20 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Judges Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJudges.map(judge => (
              <div
                key={judge.id}
                className="liquid-glass-card rounded-none p-5 border border-[#89CFF0]/25 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#89CFF0]/60 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#08132B] to-[#0E2248] border border-[#89CFF0]/40 flex items-center justify-center font-mono font-bold text-white text-base">
                        {judge.avatar}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-snug">{judge.name}</h4>
                        <p className="text-[11px] text-[#89CFF0] font-semibold">{judge.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(judge.id)}
                      className={`text-[9px] font-mono px-2 py-0.5 border cursor-pointer ${
                        judge.status === 'Active'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : judge.status === 'Invited'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      {judge.status}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#8EA6C8] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#89CFF0] shrink-0" />
                    <span className="truncate">{judge.institution}</span>
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {judge.domains.map((dom, dIdx) => (
                      <span key={dIdx} className="px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/20 text-[9px] font-mono text-[#DCE4FE]">
                        {dom}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#89CFF0]/15 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleCopyInviteLink(judge)}
                    className="text-[#89CFF0] hover:text-white flex items-center gap-1 font-mono text-[11px]"
                  >
                    {copiedId === judge.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === judge.id ? "Link Copied" : "Copy Access Link"}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteJudge(judge.id)}
                    className="text-[#8EA6C8] hover:text-red-400 p-1 transition-colors"
                    title="Remove evaluator"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. OFFICIAL PRINTABLE VIVA MARKSHEET MODAL (PRINT READY) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#08132B] border-2 border-[#89CFF0]/50 text-white p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl rounded-none"
            >
              
              {/* College Header */}
              <div className="text-center pb-4 border-b-2 border-white/20 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#89CFF0] block">
                  DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  HKBK COLLEGE OF ENGINEERING, BENGALURU
                </h2>
                <p className="text-xs text-[#BAE6FD]">
                  Code Beast AI — Capstone Major Project Defense & Viva Marksheet
                </p>
              </div>

              {/* Project & Student Details */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#0C1E45]/60 p-4 border border-[#89CFF0]/30 font-mono">
                <div>
                  <span className="text-[#8EA6C8] block">Project / Repository:</span>
                  <strong className="text-white text-sm block mt-0.5">{currentProject.repo}</strong>
                  <span className="text-[11px] text-[#8EA6C8]">{currentProject.repoUrl}</span>
                </div>
                <div>
                  <span className="text-[#8EA6C8] block">Assigned Team:</span>
                  <strong className="text-white text-sm block mt-0.5">{currentProject.team}</strong>
                  <span className="text-[11px] text-[#89CFF0]">Primary Tech: {currentProject.language}</span>
                </div>
              </div>

              {/* AI vs Human Overview */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#08132B] border border-[#89CFF0]/25">
                  <span className="text-[10px] font-mono text-[#8EA6C8] uppercase block">AI Automated Score</span>
                  <span className="text-xl font-bold font-mono text-white mt-0.5 block">{currentProject.aiScore} / 100</span>
                </div>
                <div className="p-3 bg-[#0E2248] border-2 border-[#89CFF0]/50">
                  <span className="text-[10px] font-mono text-[#89CFF0] uppercase block">Committee Viva Marks</span>
                  <span className="text-2xl font-extrabold font-mono text-white mt-0.5 block">{totalCalculatedMarks} / 100</span>
                </div>
                <div className="p-3 bg-[#08132B] border border-[#89CFF0]/25">
                  <span className="text-[10px] font-mono text-[#8EA6C8] uppercase block">Consensus Margin</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                    {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts
                  </span>
                </div>
              </div>

              {/* Rubric Breakdown Table */}
              <div className="border border-[#89CFF0]/30 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#0C1E45] text-[#89CFF0] font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Evaluation Rubric</th>
                      <th className="p-2.5">Academic Criteria</th>
                      <th className="p-2.5 text-right">Max Pts</th>
                      <th className="p-2.5 text-right">Awarded Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#89CFF0]/15">
                    <tr>
                      <td className="p-2.5 font-bold text-white">1. Code Modularity</td>
                      <td className="p-2.5 text-[#8EA6C8]">SOLID principles, package separation, typing</td>
                      <td className="p-2.5 text-right font-mono">25</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#89CFF0]">{rubricCode}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">2. Viva Voce Defense</td>
                      <td className="p-2.5 text-[#8EA6C8]">Algorithmic defense, trade-offs, Q&A mastery</td>
                      <td className="p-2.5 text-right font-mono">25</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#89CFF0]">{rubricViva}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">3. Innovation & Complexity</td>
                      <td className="p-2.5 text-[#8EA6C8]">Engineering challenge, novelty, utility</td>
                      <td className="p-2.5 text-right font-mono">25</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#89CFF0]">{rubricInnovation}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">4. Working Prototype Demo</td>
                      <td className="p-2.5 text-[#8EA6C8]">Live functional demo, UI/UX completeness</td>
                      <td className="p-2.5 text-right font-mono">25</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#89CFF0]">{rubricDemo}</td>
                    </tr>
                    <tr className="bg-[#08132B] font-bold text-white">
                      <td colSpan={2} className="p-2.5 font-mono uppercase text-[#89CFF0]">Total Consolidated Marks:</td>
                      <td className="p-2.5 text-right font-mono">100</td>
                      <td className="p-2.5 text-right font-mono text-base text-white">{totalCalculatedMarks}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Recommendation & Remarks */}
              <div className="space-y-1.5 text-xs bg-[#08132B] p-3 border border-[#89CFF0]/20">
                <span className="font-bold text-white block uppercase font-mono">Verdict: {recommendation}</span>
                <p className="text-[#8EA6C8] italic">
                  &ldquo;{notes || "Candidate demonstrated adequate technical understanding of the system and successfully defended architectural decisions."}&rdquo;
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/20 text-xs">
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-[#8EA6C8]/60" />
                  <strong className="block text-white">Dr. Tabassum Ara</strong>
                  <span className="text-[11px] text-[#8EA6C8] block">Professor & Head of Department, AI & ML</span>
                  <span className="text-[10px] text-[#89CFF0] block">Faculty Guide & Project Mentor</span>
                </div>

                <div className="space-y-1 text-right">
                  <div className="h-10 border-b border-dashed border-[#8EA6C8]/60" />
                  <strong className="block text-white">{activeEvaluator}</strong>
                  <span className="text-[11px] text-[#8EA6C8] block">External Examiner / Technical Judge</span>
                  <span className="text-[10px] text-[#89CFF0] block">Consensus Committee Signature</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#89CFF0]/20">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20 rounded-none"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold bg-[#89CFF0] text-[#08132B] hover:bg-[#BAE6FD] transition-colors rounded-none flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Scorecard</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. INVITE EVALUATOR MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#08132B] border border-[#89CFF0]/40 text-white p-6 sm:p-7 max-w-md w-full space-y-4 shadow-xl rounded-none"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#89CFF0]/20">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-[#89CFF0]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Invite Evaluation Judge
                  </h3>
                </div>
                <button onClick={() => setIsInviteModalOpen(false)} className="text-[#8EA6C8] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddJudge} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">Full Name & Salutation:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">Institutional Email:</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh.k@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">Evaluation Role:</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  >
                    <option value="Technical Judge">Technical Judge (Full Rubric & Viva)</option>
                    <option value="Head Judge">Head Judge (Consensus Override Authority)</option>
                    <option value="External Examiner">External University Examiner</option>
                    <option value="Academic Observer">Academic Observer (Read-Only)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">University / Organization:</label>
                  <input
                    type="text"
                    placeholder="e.g. VTU / External Evaluation Panel"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#89CFF0]/20">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-3 py-1.5 bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20 rounded-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#89CFF0] text-[#08132B] font-bold hover:bg-[#BAE6FD] transition-colors rounded-none"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
