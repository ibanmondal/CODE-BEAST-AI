"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  BarChart3, 
  Terminal, 
  GitBranch, 
  CheckCircle2, 
  Zap, 
  Code2, 
  Eye, 
  X, 
  ArrowUpRight, 
  Network, 
  Fingerprint, 
  FileText, 
  Flame,
  Binary,
  Workflow,
  Search
} from "lucide-react";
import { TiltCard } from "@/components/TiltCard";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";

interface Creator {
  id: string;
  num: string;
  name: string;
  role: string;
  subRole: string;
  layer: string;
  summary: string;
  detailedContributions: string[];
  responsibilities: string[];
  technologies: string[];
  architecturalFocus: string;
  accentIcon: any;
  colorScheme: string;
}

const creators: Creator[] = [
  {
    id: "iban",
    num: "01",
    name: "Iban Nadir Mondal",
    role: "Lead Backend Developer, AI/ML Engineer & Data Manager",
    subRole: "Core Architecture & Multi-Agent Swarm Orchestration",
    layer: "BACKEND // AI MESH",
    summary:
      "Architected the high-throughput asynchronous backend, LangGraph multi-agent parallel evaluation graph, Gemini AI and Ollama local model integrations, Redis/Celery queueing, and deterministic scoring engine.",
    detailedContributions: [
      "Engineered the core asynchronous backend architecture utilizing FastAPI and high-performance routing protocols.",
      "Designed and deployed the LangGraph-based multi-agent parallel workflow, coordinating 5 specialized evaluator nodes into a consolidated intelligence core.",
      "Integrated multi-model LLM inference pipelines using Google Gemini AI, Groq Llama 3.3, and local Ollama endpoints.",
      "Constructed the deterministic scoring engine, computing verified multi-metric scores from Git tree AST metrics and repository metadata.",
      "Implemented Redis task queues, Celery worker orchestration, and WebSockets for real-time telemetry streaming."
    ],
    responsibilities: [
      "Backend System Architecture & API Design",
      "LangGraph Multi-Agent Workflow Engineering",
      "LLM Model Orchestration & Prompt Optimization",
      "Deterministic Scoring Engine & Similarity Calculus",
      "Redis Queueing & Celery Worker Infrastructure",
      "WebSocket Telemetry Broadcasting & DB Management"
    ],
    technologies: [
      "FastAPI",
      "LangGraph",
      "Python 3.12",
      "Gemini AI",
      "Groq Llama 3.3",
      "Ollama",
      "Redis",
      "Celery",
      "WebSockets",
      "SQLAlchemy",
      "GitPython",
      "AST Engine"
    ],
    architecturalFocus: "Distributed Evaluation Graphs & AI Model Synthesis",
    accentIcon: Cpu,
    colorScheme: "from-[#FF8C42]/20 via-[#E07A48]/10 to-transparent"
  },
  {
    id: "misbah",
    num: "02",
    name: "Umme Misbah Sikandar",
    role: "UI/UX Designer, Frontend Developer & Documentation Lead",
    subRole: "Visual Design System, Interface Engineering & Documentation",
    layer: "FRONTEND // INTERACTION UX",
    summary:
      "Crafted the entire CodeBeast design language, responsive Next.js 16 web application, repository ingestion cockpits, interactive 3D spatial cards, executive report viewers, and comprehensive technical documentation.",
    detailedContributions: [
      "Designed and implemented the complete CodeBeast visual identity—deep obsidian surfaces, glowing warm copper accents, and precision typography.",
      "Engineered the responsive Next.js 16 frontend with interactive 3D perspective tilt cards, glossy liquid buttons, and animated data visualizations.",
      "Built the Repository Analysis Dispatcher, Repo Duel arena, Executive Reports archive, and real-time Multi-Agent Telemetry views.",
      "Seamlessly integrated client-side interfaces with backend FastAPI endpoints and live WebSocket update channels.",
      "Authored comprehensive project documentation, system architecture blueprints, and visual presentation materials."
    ],
    responsibilities: [
      "Complete UI/UX Product Design & Visual Identity",
      "Next.js 16 App Router & React Architecture",
      "Interactive 3D Card Engine & Micro-Interactions",
      "Telemetry Dashboards, Radar Charts & Report Viewers",
      "Frontend-Backend API & WebSocket Integration",
      "Technical Documentation, Diagrams & CIP Presentations"
    ],
    technologies: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "Figma",
      "Framer Motion",
      "Recharts",
      "HTML5 Canvas",
      "Radix UI",
      "Lucide Icons",
      "Design Systems",
      "Technical Writing"
    ],
    architecturalFocus: "Client-Side Interaction Matrix & Visual Ergonomics",
    accentIcon: Layers,
    colorScheme: "from-[#FF7728]/20 via-[#D96B27]/10 to-transparent"
  },
  {
    id: "hadi",
    num: "03",
    name: "Hadi Hameed",
    role: "Testing Engineer, Quality Assurance & Research Associate",
    subRole: "System Reliability, Test Automation & Research Validation",
    layer: "TESTING // QA RELIABILITY",
    summary:
      "Structured and executed exhaustive test suites across functional endpoints, repository ingestion pipelines, multi-agent AI workflows, regression suites, and WebSocket stability checks.",
    detailedContributions: [
      "Developed end-to-end test protocols covering repository cloning, AST parsing, and scoring verification.",
      "Conducted extensive API endpoint validation, stress-testing request payloads and error-recovery behaviors.",
      "Verified multi-agent AI execution paths, ensuring fallback mechanisms engage smoothly under network constraints.",
      "Performed regression testing across UI components, modal flows, and real-time WebSocket state synchronizations.",
      "Contributed to technical research on automated vulnerability detection and architectural modularity metrics."
    ],
    responsibilities: [
      "End-to-End Functional & Integration Testing",
      "FastAPI REST API Verification & Payload Fuzzing",
      "Multi-Agent Evaluation Workflow Stability Checks",
      "Regression Suite Execution & Bug Verification",
      "WebSocket Connection & Broadcast Reliability",
      "Research Support on Automated Code Auditing"
    ],
    technologies: [
      "Pytest",
      "API Testing",
      "Regression Testing",
      "Workflow QA",
      "Payload Validation",
      "WebSocket QA",
      "Bug Triage",
      "Postman",
      "CI/CD Verification",
      "Research Methodology"
    ],
    architecturalFocus: "Multi-Agent System Fault Tolerance & Quality Assurance",
    accentIcon: ShieldCheck,
    colorScheme: "from-[#FFA04A]/20 via-[#E07A48]/10 to-transparent"
  },
  {
    id: "imad",
    num: "04",
    name: "Syed Imaduddin",
    role: "Research Analyst, API Integration & Report Analytics Developer",
    subRole: "AI Evaluation Research, API Connectivity & Analytics",
    layer: "RESEARCH // REPORT ANALYTICS",
    summary:
      "Led technical research on automated repository evaluation heuristics, integrated external AI APIs and authentication protocols, and developed evaluation-result analytics and reporting pipelines.",
    detailedContributions: [
      "Conducted research on automated repository grading methodologies, software modularity metrics, and vulnerability taxonomies.",
      "Researched and integrated external AI services, managing authentication tokens, request formatting, and rate-limit mitigation.",
      "Engineered validation logic for multi-agent evaluation output schemas and score distributions.",
      "Developed structured analytics transformations for executive reports, radar charts, and comparative duel breakdowns.",
      "Produced technical research documentation and cross-agent telemetry benchmarks."
    ],
    responsibilities: [
      "Automated Code Evaluation Research & Benchmarking",
      "External AI API Integration & Authentication Management",
      "Payload Validation & Response Schema Standardization",
      "Report Analytics & Metric Aggregation Pipelines",
      "Comparative Duel Analytics & Overlap Scoring",
      "Technical Documentation & Research Syntheses"
    ],
    technologies: [
      "API Integration",
      "Gemini Services",
      "Groq APIs",
      "Data Analytics",
      "Schema Validation",
      "Telemetry Metrics",
      "Research Analysis",
      "Python",
      "JSON Schema",
      "Documentation"
    ],
    architecturalFocus: "Service Interoperability & Analytics Transformation",
    accentIcon: BarChart3,
    colorScheme: "from-[#FF8C42]/20 via-[#C44C0D]/10 to-transparent"
  }
];

export default function CreatorsPage() {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  return (
    <div className="space-y-16 sm:space-y-20 max-w-[1700px] mx-auto pb-28 px-3 sm:px-6 text-[#D4BC9A] select-none">
      
      {/* =========================================================================
          SECTION 1: Cinematic Editorial Hero Section
          ========================================================================= */}
      <section className="relative pt-6 sm:pt-10 pb-4 overflow-hidden">
        
        {/* Subtle Ambient Background Particle & Glow Backdrop */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-[#E07A48]/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-1/3 left-10 w-[350px] h-[250px] bg-[#FF8C42]/08 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Subtle Technical Breadcrumb Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1F0F08] border border-[#E07A48]/35 text-[#FF8C42] text-xs font-mono font-bold tracking-wider uppercase shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF8C42]" />
            <span>01 // THE ARCHITECTS & CREATORS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </motion.div>

          {/* Large Bold Editorial Heading Matching Homepage */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight uppercase leading-[0.9] font-normal text-[#D4BC9A]"
          >
            THE MINDS BEHIND <br />
            <span className="bg-gradient-to-r from-[#E07A48] via-[#FF8C42] to-[#D96B27] bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(224,122,72,0.45)]">
              CODEBEAST AI
            </span>
          </motion.h1>

          {/* Lead Manifesto Text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-amber-100/75 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed font-normal"
          >
            Four technical disciplines. One consolidated intelligence layer. Built to autonomously ingest, parse, evaluate, and transform software repositories through multi-agent consensus.
          </motion.p>
        </div>

        {/* Technical Sub-telemetry Strip */}
        <div className="mt-10 pt-4 border-t border-[#E07A48]/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-amber-200/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#FF8C42]" />
              <span className="text-[#D4BC9A] font-bold">SYSTEM CORE:</span> 4 SPECIALIST NODES
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline">AUTONOMOUS CONSENSUS ARCHITECTURE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF8C42] animate-ping" />
            <span className="text-[#FF8C42] font-semibold uppercase tracking-wider">ALL NODES OPERATIONAL</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: The Four Creator Identity Modules (01 -> 04 In Exact Order)
          ========================================================================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] uppercase tracking-wider font-normal flex items-center gap-3">
            <span>ENGINEERING COHORT</span>
            <span className="text-xs font-mono text-[#FF8C42] px-2.5 py-1 rounded bg-[#E07A48]/15 border border-[#E07A48]/30">
              04 ARCHITECTS
            </span>
          </h2>
          <span className="text-xs font-mono text-amber-200/40 hidden sm:inline">
            Click any module for deep technical dossier
          </span>
        </div>

        {/* 2x2 Responsive Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {creators.map((creator, idx) => {
            const Icon = creator.accentIcon;
            return (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, delay: idx * 0.12 }}
                onClick={() => setSelectedCreator(creator)}
                className="cursor-pointer group h-full"
              >
                <TiltCard 
                  variant="hero" 
                  className="p-6 sm:p-8 h-full flex flex-col justify-between relative overflow-hidden transition-all duration-400 group-hover:border-[#FF8C42]/80 group-hover:shadow-[0_15px_40px_rgba(224,122,72,0.25)]"
                >
                  {/* Subtle Role Gradient Aura */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${creator.colorScheme} blur-3xl pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-100`} />

                  <div className="relative z-10 space-y-6">
                    {/* Top Identity Bar */}
                    <div className="flex items-center justify-between border-b border-[#E07A48]/20 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-3xl sm:text-4xl text-[#FF8C42] font-normal leading-none">
                          {creator.num}
                        </span>
                        <div className="h-6 w-px bg-[#E07A48]/30" />
                        <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-amber-200/70">
                          {creator.layer}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#231109] border border-[#E07A48]/35 text-[#FF8C42] group-hover:scale-110 group-hover:border-[#FF8C42] transition-all shadow-inner">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Creator Names & Roles */}
                    <div className="space-y-1.5">
                      <h3 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] uppercase tracking-wide group-hover:text-white transition-colors">
                        {creator.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-mono font-bold text-[#FF8C42] leading-snug">
                        {creator.role}
                      </p>
                      <p className="text-xs text-amber-200/50 font-mono">
                        {creator.subRole}
                      </p>
                    </div>

                    {/* Summary Excerpt */}
                    <p className="text-xs sm:text-sm text-amber-100/75 leading-relaxed font-normal">
                      {creator.summary}
                    </p>

                    {/* Technology Pills */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-200/40 block font-bold">
                        Specialist Core Technologies:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {creator.technologies.slice(0, 6).map((tech) => (
                          <span 
                            key={tech}
                            className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#180A04] border border-[#E07A48]/25 text-amber-200/70 group-hover:border-[#FF8C42]/50 group-hover:text-[#D4BC9A] transition-all"
                          >
                            {tech}
                          </span>
                        ))}
                        {creator.technologies.length > 6 && (
                          <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-[#1F0F08] border border-[#E07A48]/30 text-[#FF8C42]">
                            +{creator.technologies.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="relative z-10 pt-6 mt-6 border-t border-[#E07A48]/15 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-amber-200/40 group-hover:text-[#FF8C42] transition-colors flex items-center gap-1.5">
                      <Binary className="w-3.5 h-3.5 text-[#FF8C42]" />
                      <span>{creator.architecturalFocus}</span>
                    </span>
                    <div className="flex items-center gap-1 text-xs font-mono text-[#FF8C42] font-bold group-hover:translate-x-1 transition-transform">
                      <span>DOSSIER</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: "ONE SYSTEM. FOUR SPECIALTIES." Collaborative Architecture
          ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide">
            <Network className="w-3.5 h-3.5" />
            <span>Harmonized Multi-Layer Intelligence</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#D4BC9A] uppercase tracking-tight font-normal">
            ONE SYSTEM. <span className="text-gradient-copper">FOUR SPECIALTIES.</span>
          </h2>
          <p className="text-amber-100/70 text-xs sm:text-sm font-normal leading-relaxed">
            Just as CodeBeast evaluates repositories through parallel agents that converge into an executive verdict, its engineering architecture is powered by four synchronized domains.
          </p>
        </div>

        {/* The Central Connected System Node Canvas */}
        <TiltCard variant="hero" className="p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Background Glow in Matrix */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#FF8C42]/12 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            
            {/* Satellite Node 1: Iban */}
            <div className="p-5 rounded-2xl bg-[#0D0502]/90 border border-[#E07A48]/30 hover:border-[#FF8C42] transition-all space-y-3 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#FF8C42] mb-2">
                  <span className="font-bold">01 // LAYER</span>
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="font-display text-xl text-[#D4BC9A] uppercase">IBAN NADIR MONDAL</h4>
                <p className="text-xs text-[#FF8C42] font-mono font-semibold mt-0.5">Backend + AI Engine</p>
                <p className="text-xs text-amber-100/65 mt-2 leading-relaxed">
                  FastAPI, LangGraph workflows, Gemini/Ollama inference, and deterministic scoring heuristics.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E07A48]/15 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>INFERENCE STREAM ACTIVE</span>
              </div>
            </div>

            {/* Satellite Node 2: Misbah */}
            <div className="p-5 rounded-2xl bg-[#0D0502]/90 border border-[#E07A48]/30 hover:border-[#FF8C42] transition-all space-y-3 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#FF8C42] mb-2">
                  <span className="font-bold">02 // LAYER</span>
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="font-display text-xl text-[#D4BC9A] uppercase">UMME MISBAH SIKANDAR</h4>
                <p className="text-xs text-[#FF8C42] font-mono font-semibold mt-0.5">Frontend + UX + Docs</p>
                <p className="text-xs text-amber-100/65 mt-2 leading-relaxed">
                  Next.js 16 UI architecture, 3D interaction system, real-time ingestion views, and system documentation.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E07A48]/15 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>RENDER ENGINE ACTIVE</span>
              </div>
            </div>

            {/* Satellite Node 3: Hadi */}
            <div className="p-5 rounded-2xl bg-[#0D0502]/90 border border-[#E07A48]/30 hover:border-[#FF8C42] transition-all space-y-3 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#FF8C42] mb-2">
                  <span className="font-bold">03 // LAYER</span>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-display text-xl text-[#D4BC9A] uppercase">HADI HAMEED</h4>
                <p className="text-xs text-[#FF8C42] font-mono font-semibold mt-0.5">Testing + QA + Research</p>
                <p className="text-xs text-amber-100/65 mt-2 leading-relaxed">
                  Full-stack regression suites, API payload stress verification, WebSocket telemetry testing, and research support.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E07A48]/15 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>INTEGRITY VERIFIED</span>
              </div>
            </div>

            {/* Satellite Node 4: Imad */}
            <div className="p-5 rounded-2xl bg-[#0D0502]/90 border border-[#E07A48]/30 hover:border-[#FF8C42] transition-all space-y-3 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#FF8C42] mb-2">
                  <span className="font-bold">04 // LAYER</span>
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="font-display text-xl text-[#D4BC9A] uppercase">SYED IMADUDDIN</h4>
                <p className="text-xs text-[#FF8C42] font-mono font-semibold mt-0.5">APIs + Analytics + Research</p>
                <p className="text-xs text-amber-100/65 mt-2 leading-relaxed">
                  Automated repository grading research, API auth/connectivity, response validation, and analytics pipelines.
                </p>
              </div>
              <div className="pt-3 border-t border-[#E07A48]/15 flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>ANALYTICS PIPELINE ACTIVE</span>
              </div>
            </div>

          </div>

          {/* Central Convergence Core Banner */}
          <div className="mt-8 pt-8 border-t border-[#E07A48]/20 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#160803]/80 p-6 rounded-2xl border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E07A48] via-[#FF8C42] to-[#D96B27] flex items-center justify-center text-[#0D0805] shadow-[0_0_25px_rgba(224,122,72,0.6)] shrink-0">
                <Flame className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="font-display text-xl text-[#D4BC9A] uppercase tracking-wider">
                  CONVERGED CODEBEAST INTELLIGENCE CORE
                </h4>
                <p className="text-xs text-amber-100/65 font-mono">
                  Autonomous Multi-Agent Repository Intelligence & Consensus Scoring Engine
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CodeBeastLiquidButton
                href="/analysis"
                variant="primary"
                size="md"
                label="TRY ANALYSIS ENGINE"
                hasArrow
                icon={<Zap className="w-4 h-4 fill-current" />}
              />
            </div>
          </div>
        </TiltCard>
      </section>

      {/* =========================================================================
          SECTION 4: What We Built Together (Core Technical Capabilities)
          ========================================================================= */}
      <section className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-2">
            <Workflow className="w-3.5 h-3.5" />
            <span>Engineered Capabilities</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-[#D4BC9A] uppercase tracking-tight font-normal">
            WHAT WE BUILT <span className="text-gradient-copper">TOGETHER</span>
          </h2>
          <p className="text-amber-100/70 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl">
            Realized functionality implemented across the multi-agent repository evaluation platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <TiltCard variant="primary" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#231109] border border-[#E07A48]/30 text-[#FF8C42] flex items-center justify-center shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-[#D4BC9A] uppercase tracking-wide">
              Multi-Agent Parallel Mesh
            </h3>
            <p className="text-xs text-amber-100/70 leading-relaxed font-normal">
              5 concurrent LangGraph evaluation agents analyze security, architecture, performance, testing, and database structures in parallel.
            </p>
          </TiltCard>

          <TiltCard variant="primary" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#231109] border border-[#E07A48]/30 text-[#FF8C42] flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-[#D4BC9A] uppercase tracking-wide">
              AutoReview CWE Slicing
            </h3>
            <p className="text-xs text-amber-100/70 leading-relaxed font-normal">
              Automated 3-stage security auditor identifying CWE vulnerability vectors and synthesizing ready-to-merge unified git diff patches.
            </p>
          </TiltCard>

          <TiltCard variant="primary" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#231109] border border-[#E07A48]/30 text-[#FF8C42] flex items-center justify-center shadow-inner">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-[#D4BC9A] uppercase tracking-wide">
              CodeBERT AST Plagiarism
            </h3>
            <p className="text-xs text-amber-100/70 leading-relaxed font-normal">
              Structural abstract syntax tree embeddings and similarity clustering detecting boilerplate clones and open-source template overlap.
            </p>
          </TiltCard>

          <TiltCard variant="primary" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#231109] border border-[#E07A48]/30 text-[#FF8C42] flex items-center justify-center shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-[#D4BC9A] uppercase tracking-wide">
              ConsJudge Consensus Supervisor
            </h3>
            <p className="text-xs text-amber-100/70 leading-relaxed font-normal">
              Dual-pass consensus matrix utilizing Gemini Flash and Groq Llama 3.3 to eliminate LLM hallucinations and certify score confidence.
            </p>
          </TiltCard>

          <TiltCard variant="primary" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#231109] border border-[#E07A48]/30 text-[#FF8C42] flex items-center justify-center shadow-inner">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-[#D4BC9A] uppercase tracking-wide">
              Repo Duel & Batch Ingestion
            </h3>
            <p className="text-xs text-amber-100/70 leading-relaxed font-normal">
              Head-to-head A/B repository comparisons and multi-cohort CSV batch processing for hackathon judging and academic audits.
            </p>
          </TiltCard>

          <TiltCard variant="primary" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#231109] border border-[#E07A48]/30 text-[#FF8C42] flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-display text-xl text-[#D4BC9A] uppercase tracking-wide">
              Copilot & Executive Reports
            </h3>
            <p className="text-xs text-amber-100/70 leading-relaxed font-normal">
              Interactive LLM judge copilot for report interrogation and automated high-resolution PDF brief generation.
            </p>
          </TiltCard>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: System Build Journey Sequence
          ========================================================================= */}
      <section>
        <TiltCard variant="secondary" className="p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E07A48]/15">
            <div>
              <h3 className="font-display text-2xl text-[#D4BC9A] uppercase tracking-wider font-normal">
                ENGINEERING PROGRESSION SEQUENCE
              </h3>
              <p className="text-xs text-amber-200/50 mt-0.5 font-normal">
                How CodeBeast AI evolved from architecture conception to unified multi-agent intelligence
              </p>
            </div>
            <span className="text-xs font-mono text-[#FF8C42] bg-[#120703] px-3 py-1.5 rounded-xl border border-[#E07A48]/25 font-bold">
              BUILD // VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { step: "01", title: "ARCHITECTURE", desc: "FastAPI REST skeleton, SQLite/Postgres schemas & Redis queues" },
              { step: "02", title: "AI INTEGRATION", desc: "LangGraph orchestration, Gemini Flash & Groq Llama models" },
              { step: "03", title: "INTERFACE & UX", desc: "Next.js 16 UI, 3D interaction engine, charts & report viewers" },
              { step: "04", title: "TESTING & QA", desc: "API payload fuzzing, WebSocket checks & workflow validation" },
              { step: "05", title: "INTELLIGENCE", desc: "ConsJudge consensus verification & executive brief generation" }
            ].map((st, i) => (
              <div key={st.step} className="p-4 rounded-xl bg-[#0E0602] border border-[#E07A48]/20 space-y-1.5">
                <span className="text-xs font-mono text-[#FF8C42] font-bold">STAGE {st.step}</span>
                <h4 className="font-display text-base text-[#D4BC9A] uppercase">{st.title}</h4>
                <p className="text-[11px] text-amber-100/60 leading-relaxed font-normal">{st.desc}</p>
              </div>
            ))}
          </div>
        </TiltCard>
      </section>

      {/* =========================================================================
          SECTION 6: Concluding Statement & Team Signature
          ========================================================================= */}
      <section className="text-center py-12 sm:py-16 space-y-4 border-t border-[#E07A48]/20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-[#E07A48]/10 blur-2xl pointer-events-none" />
        
        <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#D4BC9A] uppercase tracking-widest font-normal">
          BUILT WITH CODE. POWERED BY INTELLIGENCE.
        </h3>
        <p className="font-mono text-sm font-bold text-[#FF8C42] tracking-widest uppercase">
          — THE CODEBEAST AI TEAM
        </p>
        <p className="text-xs font-mono text-amber-200/40">
          Iban Nadir Mondal &bull; Umme Misbah Sikandar &bull; Hadi Hameed &bull; Syed Imaduddin
        </p>
      </section>

      {/* =========================================================================
          MODAL: Deep Technical Creator Identity Dossier
          ========================================================================= */}
      <AnimatePresence>
        {selectedCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070402]/92 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl my-auto max-h-[92vh] overflow-y-auto rounded-3xl hide-scrollbar bg-[#120703] border border-[#E07A48]/50 p-6 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.98)] text-[#D4BC9A] space-y-6"
            >
              {/* Close Button */}
              <div className="absolute top-5 right-5 z-50">
                <CodeBeastLiquidButton 
                  onClick={() => setSelectedCreator(null)}
                  variant="secondary"
                  size="sm"
                  viewMode="icon"
                  icon={<X className="w-4 h-4 text-amber-200" />}
                  aria-label="Close dossier"
                />
              </div>

              {/* Dossier Header */}
              <div className="border-b border-[#E07A48]/20 pb-5 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl text-[#FF8C42] font-normal">
                    {selectedCreator.num}
                  </span>
                  <div className="h-5 w-px bg-[#E07A48]/30" />
                  <span className="text-xs font-mono font-bold tracking-widest text-amber-200/60 uppercase">
                    CREATOR_DOSSIER // {selectedCreator.layer}
                  </span>
                </div>
                <h3 className="font-display text-3xl sm:text-4xl text-[#D4BC9A] uppercase tracking-wide">
                  {selectedCreator.name}
                </h3>
                <p className="text-sm font-mono font-bold text-[#FF8C42]">
                  {selectedCreator.role}
                </p>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl bg-[#1A0B05] border border-[#E07A48]/25 text-xs sm:text-sm leading-relaxed text-amber-100/80">
                {selectedCreator.summary}
              </div>

              {/* Detailed Contributions */}
              <div className="space-y-3">
                <h4 className="font-display text-lg text-[#D4BC9A] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF8C42]" />
                  <span>Key Technical Contributions</span>
                </h4>
                <ul className="space-y-2.5 text-xs text-amber-100/70 font-normal">
                  {selectedCreator.detailedContributions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF8C42] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Primary Responsibilities */}
              <div className="space-y-3">
                <h4 className="font-display text-lg text-[#D4BC9A] uppercase tracking-wider flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-[#FF8C42]" />
                  <span>Core Engineering Domains</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-amber-200/80">
                  {selectedCreator.responsibilities.map((resp, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#0E0602] border border-[#E07A48]/20 flex items-center gap-2">
                      <span className="text-[#FF8C42]">&bull;</span>
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technology Tags */}
              <div className="space-y-2 pt-2 border-t border-[#E07A48]/15">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-200/50 block font-bold">
                  Verified Stack & Tooling:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCreator.technologies.map((t) => (
                    <span 
                      key={t}
                      className="text-xs font-mono px-3 py-1 rounded-full bg-[#231109] border border-[#E07A48]/40 text-[#D4BC9A] font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-4 flex justify-end gap-3">
                <CodeBeastLiquidButton
                  onClick={() => setSelectedCreator(null)}
                  variant="primary"
                  size="md"
                  label="CLOSE DOSSIER"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
