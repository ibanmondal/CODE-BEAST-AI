"use client";

import React from "react";
import { 
  Cpu, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  GitBranch,
  BookOpen,
  Award,
  UserCheck
} from "lucide-react";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion-primitives";

interface TeamMember {
  id: string;
  orderNumber: string;
  name: string;
  role: string;
  discipline: string;
  initials: string;
  badgeLabel: string;
  avatarGradient: string;
  summary: string;
  contributions: string[];
  technicalExpertise: string[];
  coreImpact: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "iban",
    orderNumber: "01",
    name: "Iban Nadir Mondal",
    role: "Lead Backend Architect & AI/ML Engineer",
    discipline: "BACKEND ARCHITECTURE & AI ORCHESTRATION",
    initials: "IM",
    badgeLabel: "Core Architecture",
    avatarGradient: "from-[#E0EEFE] via-[#CBE2FE] to-[#B3D4FE]",
    summary:
      "Architected the asynchronous FastAPI service, LangGraph multi-agent parallel execution graph, unified model routing across cloud and local inference engines, and the deterministic multi-dimensional scoring engine.",
    contributions: [
      "Engineered high-throughput asynchronous backend utilizing FastAPI with non-blocking concurrency pipelines.",
      "Designed LangGraph parallel orchestrator executing 8 specialized evaluator agent nodes concurrently.",
      "Built multi-provider LLM inference router with resilient fallbacks across Groq, NaraRouter, and local models.",
      "Developed the deterministic scoring engine with strict quality metrics, hard caps, and static heuristics."
    ],
    technicalExpertise: ["FastAPI", "LangGraph", "LangChain", "Groq / Llama", "NaraRouter", "Tree-Sitter", "FAISS Vector Store", "AsyncPG"],
    coreImpact: "Multi-Agent Graph Orchestration & Deterministic Scoring Core"
  },
  {
    id: "misbah",
    orderNumber: "02",
    name: "Umme Misbah Sikandar",
    role: "UI/UX Designer, Frontend Developer & Documentation Lead",
    discipline: "UI/UX SYSTEMS, FRONTEND ENGINEERING & DOCUMENTATION",
    initials: "US",
    badgeLabel: "Design & Frontend",
    avatarGradient: "from-[#E8F0FE] via-[#D2E3FC] to-[#BDD7FC]",
    summary:
      "Designed the signature liquid-glass visual identity and formal design system, developed core Next.js application modules, and authored comprehensive platform architecture and documentation specifications.",
    contributions: [
      "Conceptualized the complete liquid-glass design language, color tokens, and formal typographic hierarchy.",
      "Developed responsive Next.js application pages with structured layouts and component abstractions.",
      "Engineered interactive 3D Beast sphere canvas, inspector dialogs, and real-time pipeline status cards.",
      "Authored comprehensive system architecture specifications, user guides, and API documentation."
    ],
    technicalExpertise: ["Next.js 16", "React 19", "Tailwind CSS", "Framer Motion", "Three.js / WebGL", "UI/UX Systems", "Technical Writing"],
    coreImpact: "Enterprise Liquid-Glass Identity, Frontend Core & Documentation"
  },
  {
    id: "imaduddin",
    orderNumber: "03",
    name: "Syed Imaduddin",
    role: "Frontend Developer, Research Analyst & Report Analytics Lead",
    discipline: "DATA VISUALIZATION, RESEARCH BENCHMARKS & REPORT ANALYTICS",
    initials: "SI",
    badgeLabel: "Analytics & Research",
    avatarGradient: "from-[#E3EEFE] via-[#CCE0FD] to-[#B8D3FD]",
    summary:
      "Engineered analytics visualization modules, Recharts telemetry charts, academic benchmark alignment with ACM FSE 2025 AutoReview literature, and comparative repository duel interfaces.",
    contributions: [
      "Developed interactive analytics dashboards, metric projection cards, and telemetry visualization widgets.",
      "Formulated research benchmarks aligning platform heuristics with academic vulnerability taxonomy literature.",
      "Built the dual repository comparison engine (Repo Duel) and detailed consensus report inspection views.",
      "Structured vulnerability classification matrices, unified diff remediation viewers, and confidence metrics."
    ],
    technicalExpertise: ["Next.js", "React", "Recharts", "TypeScript", "Data Visualization", "AutoReview Taxonomy", "Comparative Analytics"],
    coreImpact: "Telemetry Analytics Dashboards & ACM FSE 2025 Benchmark Alignment"
  },
  {
    id: "hadi",
    orderNumber: "04",
    name: "Hadi Hameed",
    role: "Research Associate, Testing & Quality Assurance Engineer",
    discipline: "QUALITY ASSURANCE, VALIDATION SYSTEMS & TESTING RESEARCH",
    initials: "HH",
    badgeLabel: "QA & Verification",
    avatarGradient: "from-[#E6F0FE] via-[#D4E4FC] to-[#BFD9FC]",
    summary:
      "Directed end-to-end multi-agent test validation, regression verification, consensus stability audits, and research analysis on deterministic scoring calibration across varied codebases.",
    contributions: [
      "Designed and executed comprehensive multi-agent test validation suites and pipeline regression assertions.",
      "Evaluated consensus reliability and variance margins across diverse repository architectures and languages.",
      "Formulated automated testing criteria, mock isolation standards, and CI flake detection heuristics.",
      "Conducted deterministic scoring calibration audits ensuring honest, realistic evaluation outputs."
    ],
    technicalExpertise: ["PyTest", "Jest / Vitest", "Async Test Automation", "CI/CD Workflows", "Heuristic Verification", "Quality Assurance"],
    coreImpact: "Consensus Reliability Verification & Quality Assurance Auditing"
  }
];

export default function TeamPage() {
  return (
    <div className="space-y-8 pb-16 text-white">
      
      {/* 1. Page Header with Formal Badge & Typography */}
      <ScrollReveal direction="down" distance={15}>
        <div className="pb-6 border-b border-[#89CFF0]/20 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-bold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <UserCheck className="w-3.5 h-3.5 text-[#89CFF0]" />
              Core Engineering & Research Team
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Our Team
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1 max-w-2xl leading-relaxed">
              The founding engineers, designers, and researchers behind Code Beast AI — building verified multi-agent intelligence for software repositories.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-1.5 bg-[#08132B] border border-[#89CFF0]/30 rounded-xl shadow-xs text-left">
              <span className="text-[10px] font-mono text-[#8EA6C8] block uppercase font-bold">Platform Status</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#89CFF0] animate-pulse shadow-[0_0_8px_#89CFF0]" />
                4 Active Team Leads
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. Platform Engineering Disciplines Overview */}
      <ScrollReveal direction="up" distance={15} delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="liquid-glass-card rounded-2xl p-4 border border-[#89CFF0]/20 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Backend & AI Core</span>
            </div>
            <p className="text-[11px] text-[#8EA6C8] leading-relaxed">
              LangGraph multi-agent execution, LibGit2 AST parsing, and deterministic scoring.
            </p>
          </div>

          <div className="liquid-glass-card rounded-2xl p-4 border border-[#89CFF0]/20 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">UI/UX & Frontend</span>
            </div>
            <p className="text-[11px] text-[#8EA6C8] leading-relaxed">
              Liquid-glass design token architecture, Next.js interface, and 3D visualizers.
            </p>
          </div>

          <div className="liquid-glass-card rounded-2xl p-4 border border-[#89CFF0]/20 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">Analytics & Research</span>
            </div>
            <p className="text-[11px] text-[#8EA6C8] leading-relaxed">
              Telemetry analytics, ACM FSE 2025 AutoReview mapping, and repo duels.
            </p>
          </div>

          <div className="liquid-glass-card rounded-2xl p-4 border border-[#89CFF0]/20 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">QA & Testing</span>
            </div>
            <p className="text-[11px] text-[#8EA6C8] leading-relaxed">
              Consensus validation, regression testing, and score calibration auditing.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* 3. Four Core Creators — Detailed Rectangular Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Engineering Leadership & Creators
            </h2>
            <p className="text-xs text-[#8EA6C8] mt-0.5">
              Core members responsible for the architecture, implementation, and quality assurance of Code Beast AI.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-[#08132B] text-[#89CFF0] rounded-lg border border-[#89CFF0]/30 shadow-xs">
            4 Verified Roles
          </span>
        </div>

        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {TEAM_MEMBERS.map((member) => (
            <StaggerItem key={member.id}>
              <div className="liquid-glass-card rounded-2xl p-6 sm:p-7 shadow-[0_12px_36px_rgba(2,6,18,0.7)] hover:shadow-[0_20px_50px_rgba(137,207,240,0.15)] hover:-translate-y-0.5 transition-all duration-300 border border-[#89CFF0]/25 flex flex-col justify-between h-full group">
                
                <div className="space-y-4">
                  
                  {/* Top Bar: Discipline Tag & Member Sequence */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-[#89CFF0]/20">
                    <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase tracking-wider">
                      {member.discipline}
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-[#08132B] text-white rounded-md border border-[#89CFF0]/30 shadow-xs">
                      #{member.orderNumber}
                    </span>
                  </div>

                  {/* Member Profile Header with Professional Photo Placeholder */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    
                    {/* Professional Photo Placeholder (Sharp Rectangular Frame) */}
                    <div className="shrink-0">
                      <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-gradient-to-br from-[#08132B] to-[#0E2248] border-2 border-[#89CFF0]/40 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group-hover:border-[#89CFF0] transition-colors`}>
                        {/* Subtle Tech Grid Texture Lines */}
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#89CFF0_1px,transparent_1px)] [background-size:8px_8px]" />
                        
                        {/* Monogram Initials */}
                        <span className="text-xl sm:text-2xl font-bold text-white tracking-tight relative z-10 font-mono">
                          {member.initials}
                        </span>
                        
                        {/* Status Label */}
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[#89CFF0] font-bold relative z-10 mt-0.5">
                          CREATOR
                        </span>

                        {/* Corner Verification Indicator */}
                        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#89CFF0] ring-2 ring-[#08132B]" title="Verified Creator" />
                      </div>
                    </div>

                    {/* Member Name & Role Information */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-[#89CFF0] transition-colors leading-snug">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#BAE6FD] mt-0.5 leading-snug">
                        {member.role}
                      </p>
                      <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-[#08132B] border border-[#89CFF0]/30 rounded-md text-[10px] font-mono text-[#89CFF0]">
                        <Sparkles className="w-3 h-3 text-[#89CFF0]" />
                        {member.badgeLabel}
                      </div>
                    </div>
                  </div>

                  {/* Concise Contribution Summary */}
                  <div className="p-3 bg-[#08132B]/80 rounded-xl border border-[#89CFF0]/20 text-xs text-[#8EA6C8] leading-relaxed">
                    {member.summary}
                  </div>

                  {/* Detailed Direct Contributions */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                      Key Engineering Deliverables:
                    </span>
                    <ul className="space-y-1.5">
                      {member.contributions.map((item, idx) => (
                        <li key={idx} className="text-xs text-[#8EA6C8] flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Technical Stack Tags & Architectural Impact Footer */}
                <div className="pt-4 mt-4 border-t border-[#89CFF0]/15 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8EA6C8]">
                    <span className="font-bold text-white uppercase">Primary Technologies:</span>
                    <span className="text-[#89CFF0] font-bold">{member.coreImpact}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {member.technicalExpertise.map((tech, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="px-2.5 py-0.5 bg-[#08132B] border border-[#89CFF0]/30 rounded-md text-[10px] font-mono font-bold text-white shadow-2xs hover:border-[#89CFF0] transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* 4. Technical Governance & Project Transparency Statement */}
      <ScrollReveal direction="up" distance={15} delay={0.2}>
        <div className="liquid-glass-card rounded-2xl p-6 border border-[#89CFF0]/25 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#89CFF0]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Engineering Governance & Scientific Methodology
              </h4>
            </div>
            <p className="text-xs text-[#8EA6C8] max-w-3xl leading-relaxed">
              Code Beast AI was engineered collaboratively by the four core members, unifying asynchronous distributed backends, LangGraph multi-agent orchestration, ACM FSE 2025 AutoReview research, and a responsive Next.js liquid-glass interface.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-3 py-1.5 bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 rounded-xl shadow-xs">
              4 Authors · Open Science
            </span>
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
