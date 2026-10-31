"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShieldCheck, 
  Layers, 
  FileText, 
  Users, 
  ArrowRight, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Trophy, 
  ExternalLink,
  ChevronRight,
  Zap,
  TestTube,
  Database,
  Fingerprint,
  Code2,
  Cpu
} from "lucide-react";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";
import { AgentInspectorModal } from "@/components/AgentInspectorModal";
import { InteractiveAgentCard } from "@/components/InteractiveAgentCard";
import { apiUrl } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("https://github.com/vercel/next.js");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const [stats, setStats] = useState({
    analyzed: 0,
    avg_score: 0,
    security_findings: 0,
    active_analysis: 0
  });

  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [agentPerformanceData, setAgentPerformanceData] = useState([
    { name: "Security", score: 0 },
    { name: "Architecture", score: 0 },
    { name: "Performance", score: 0 },
    { name: "Testing", score: 0 },
    { name: "Database", score: 0 },
    { name: "Originality", score: 0 },
    { name: "Dev Exp", score: 0 },
    { name: "Cloud", score: 0 }
  ]);

  useEffect(() => {
    // Fetch live dashboard telemetry
    fetch(apiUrl("/api/v1/stats/dashboard"))
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data?.stats) {
          setStats({
            analyzed: data.stats.analyzed ?? 0,
            avg_score: data.stats.avg_score ?? 0,
            security_findings: data.stats.failed ?? 0,
            active_analysis: data.stats.running ?? 0
          });
        }
      })
      .catch(() => {});

    // Fetch real audit history
    fetch(apiUrl("/api/v1/stats/history"))
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data?.history && Array.isArray(data.history) && data.history.length > 0) {
          setRecentAudits(data.history.slice(0, 4).map((h: any) => ({
            repo: h.repoId || h.repo,
            score: h.overall,
            status: h.status || "Completed",
            lastAnalyzed: h.evaluated_at || h.submitted || "Recently"
          })));

          // Calculate real average agent scores across all completed repositories
          const total = data.history.length;
          const avg = (fn: (item: any) => number) => Math.round(data.history.reduce((acc: number, item: any) => acc + (fn(item) || 0), 0) / total);

          setAgentPerformanceData([
            { name: "Security", score: avg((item) => item.sec) },
            { name: "Architecture", score: avg((item) => item.arch) },
            { name: "Performance", score: avg((item) => item.perf) },
            { name: "Testing", score: avg((item) => item.testing_score) },
            { name: "Database", score: avg((item) => item.db_score) },
            { name: "Originality", score: avg((item) => item.orig) },
            { name: "Dev Exp", score: avg((item) => item.overall) },
            { name: "Cloud", score: avg((item) => item.finops || item.perf) }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    router.push(`/analysis?repo=${encodeURIComponent(repoUrl.trim())}`);
  };

  const handleInspectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setIsInspectorOpen(true);
  };

  const sampleRepos = [
    "vercel/next.js",
    "fastapi/fastapi",
    "psf/requests",
    "pallets/flask"
  ];

  const featureCards = [
    {
      num: "01",
      icon: Layers,
      title: "MULTI-AGENT ANALYSIS",
      desc: "Eight specialized agents evaluate different aspects of your repository.",
      link: "/analysis"
    },
    {
      num: "02",
      icon: ShieldCheck,
      title: "SECURITY INTELLIGENCE",
      desc: "Identify vulnerabilities, exposed credentials, and security risks.",
      link: "/analysis"
    },
    {
      num: "03",
      icon: FileText,
      title: "CODE ORIGINALITY",
      desc: "Detect similarity, clones, and potential plagiarism using advanced AI models.",
      link: "/matrix"
    },
    {
      num: "04",
      icon: Users,
      title: "AI CONSENSUS",
      desc: "Combine independent model evaluations for reliable, evidence-driven results.",
      link: "/judges"
    }
  ];

  return (
    <div className="space-y-6 pb-16 text-white font-sans">
      
      {/* ==============================================================================
         1. HERO SECTION: Title & Description + 4 Metric Cards (Clean Executive Layout)
         ============================================================================== */}
      <section className="liquid-glass-card rounded-2xl p-6 lg:p-8 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading & Subtitle */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-[#8EA6C8] uppercase block">
              AI-POWERED REPOSITORY INTELLIGENCE
            </span>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-heading font-bold text-white tracking-tight uppercase leading-[0.95]">
              WELCOME TO <br />
              <span className="text-[#89CFF0]">
                CODE BEAST
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#8EA6C8] leading-relaxed max-w-xl">
              Analyze GitHub repositories with specialized AI agents to uncover{" "}
              <span className="text-[#58A6FF] font-medium">security risks</span>,{" "}
              <span className="text-[#58A6FF] font-medium">architectural weaknesses</span>,{" "}
              <span className="text-[#58A6FF] font-medium">performance issues</span>,{" "}
              <span className="text-[#58A6FF] font-medium">originality concerns</span>, and more.
            </p>
          </div>

          {/* Right Column: 4 Metric Cards in 2x2 Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            {/* Card 1: Repositories Analyzed */}
            <div className="bg-[#08132B]/90 border border-[#387DE6]/30 rounded-xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(2,6,18,0.5)] hover:border-[#58A6FF]/60 transition-all group">
              <div className="flex items-center justify-between text-[#58A6FF] mb-2">
                <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <BarChart3 className="w-4 h-4 text-[#6C85AA]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  {stats.analyzed}
                </div>
                <div className="text-[11px] text-[#8EA6C8] mt-0.5 font-medium leading-tight">
                  Repositories Analyzed
                </div>
              </div>
            </div>

            {/* Card 2: Average Score */}
            <div className="bg-[#08132B]/90 border border-[#387DE6]/30 rounded-xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(2,6,18,0.5)] hover:border-[#58A6FF]/60 transition-all group">
              <div className="flex items-center justify-between text-[#58A6FF] mb-2">
                <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <TrendingUp className="w-4 h-4 text-[#58A6FF]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  {stats.avg_score}
                </div>
                <div className="text-[11px] text-[#8EA6C8] mt-0.5 font-medium leading-tight">
                  Average Score
                </div>
              </div>
            </div>

            {/* Card 3: Security Findings */}
            <div className="bg-[#08132B]/90 border border-[#387DE6]/30 rounded-xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(2,6,18,0.5)] hover:border-[#58A6FF]/60 transition-all group">
              <div className="flex items-center justify-between text-[#58A6FF] mb-2">
                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <TrendingUp className="w-4 h-4 text-[#58A6FF]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  {stats.security_findings}
                </div>
                <div className="text-[11px] text-[#8EA6C8] mt-0.5 font-medium leading-tight">
                  Security Findings
                </div>
              </div>
            </div>

            {/* Card 4: Active Analysis */}
            <div className="bg-[#08132B]/90 border border-[#387DE6]/30 rounded-xl p-4 flex flex-col justify-between shadow-[0_8px_24px_rgba(2,6,18,0.5)] hover:border-[#58A6FF]/60 transition-all group">
              <div className="flex items-center justify-between text-[#58A6FF] mb-2">
                <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="w-3.5 h-3.5 rounded-full border border-[#58A6FF] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#58A6FF] animate-ping" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  {stats.active_analysis < 10 ? `0${stats.active_analysis}` : stats.active_analysis}
                </div>
                <div className="text-[11px] text-[#8EA6C8] mt-0.5 font-medium leading-tight">
                  Active Analysis
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ==============================================================================
         2. ANALYZE A GITHUB REPOSITORY BAR
         ============================================================================== */}
      <section className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-mono font-bold tracking-[0.18em] text-[#8EA6C8] uppercase">
          ANALYZE A GITHUB REPOSITORY
        </h2>

        <form onSubmit={handleStartAnalysis} className="space-y-3.5">
          {/* Main Input Row */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="flex-1 bg-[#0B1A3A]/90 border border-[#387DE6]/35 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-[#58A6FF] focus-within:ring-1 focus-within:ring-[#58A6FF]/40 transition-all">
              {/* GitHub Mark */}
              <svg className="w-5 h-5 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>

              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                className="w-full bg-transparent border-none text-sm text-white placeholder-[#6C85AA] focus:outline-none font-mono"
              />
            </div>

            {/* Prominent Action Button: Analyze Repository -> */}
            <button
              type="submit"
              className="bg-gradient-to-r from-[#89CFF0] via-[#68B2F8] to-[#4693F3] text-[#040914] font-sans font-bold text-sm tracking-wide px-6 py-3 rounded-xl shadow-[0_8px_24px_rgba(70,147,243,0.4)] hover:shadow-[0_12px_30px_rgba(70,147,243,0.6),0_0_20px_rgba(104,178,248,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Analyze Repository</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Sample Pills Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[#6C85AA] font-medium mr-1">Try a sample:</span>
            {sampleRepos.map((repo) => (
              <button
                key={repo}
                type="button"
                onClick={() => setRepoUrl(`https://github.com/${repo}`)}
                className="px-3 py-1 rounded-lg bg-[#0E2248]/70 border border-[#387DE6]/30 hover:border-[#58A6FF] text-[#8EA6C8] hover:text-white font-mono text-xs transition-colors cursor-pointer"
              >
                {repo}
              </button>
            ))}
          </div>
        </form>
      </section>


      {/* ==============================================================================
         3. 4 FEATURE CARDS (01, 02, 03, 04)
         ============================================================================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featureCards.map((feat) => (
          <Link
            key={feat.num}
            href={feat.link}
            className="bg-[#08132B]/80 hover:bg-[#0C1C3E] border border-[#387DE6]/25 hover:border-[#58A6FF]/60 rounded-xl p-5 shadow-[0_8px_24px_rgba(2,6,18,0.5)] transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#6C85AA]">
                  {feat.num}
                </span>
                <div className="w-9 h-9 rounded-lg bg-[#0E2248]/80 border border-[#387DE6]/40 flex items-center justify-center text-[#58A6FF] group-hover:text-white group-hover:border-[#58A6FF] transition-colors">
                  <feat.icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-1 mb-1.5">
                <h3 className="font-heading font-bold text-sm uppercase text-white tracking-wide group-hover:text-[#89CFF0] transition-colors">
                  {feat.title}
                </h3>
                <ArrowRight className="w-3.5 h-3.5 text-[#58A6FF] group-hover:translate-x-1 transition-transform shrink-0" />
              </div>

              <p className="text-xs text-[#8EA6C8] leading-relaxed">
                {feat.desc}
              </p>
            </div>
          </Link>
        ))}
      </section>


      {/* ==============================================================================
         4. BOTTOM SPLIT: RECENT ANALYSES TABLE + AGENT PERFORMANCE BAR CHART
         ============================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Analyses Table */}
        <div className="lg:col-span-7 bg-[#08132B]/80 border border-[#387DE6]/25 rounded-2xl p-6 shadow-[0_12px_32px_rgba(2,6,18,0.6)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#387DE6]/20">
            <h2 className="text-xs font-mono font-bold tracking-[0.18em] text-white uppercase">
              RECENT ANALYSES
            </h2>
            <Link
              href="/reports"
              className="text-xs text-[#58A6FF] hover:text-[#89CFF0] font-medium flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#6C85AA] font-mono uppercase text-[10px] tracking-wider border-b border-[#387DE6]/20 pb-2">
                  <th className="py-2.5 font-semibold">REPOSITORY</th>
                  <th className="py-2.5 font-semibold">SCORE</th>
                  <th className="py-2.5 font-semibold">STATUS</th>
                  <th className="py-2.5 font-semibold">LAST ANALYZED</th>
                  <th className="py-2.5 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#387DE6]/15">
                {recentAudits.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#0E2248]/35 transition-colors group">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#8EA6C8] group-hover:text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        <span className="font-mono font-bold text-white group-hover:text-[#89CFF0] transition-colors">
                          {item.repo}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-mono font-bold text-white">
                      {item.score}
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#0E2248] border border-[#387DE6]/35 text-[#58A6FF] text-[10px] font-semibold">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[#8EA6C8] font-mono text-[11px]">
                      {item.lastAnalyzed}
                    </td>
                    <td className="py-3 pl-2 text-right">
                      <Link
                        href={`/analysis?repo=${encodeURIComponent(item.repo)}`}
                        className="text-[#6C85AA] hover:text-[#58A6FF] transition-colors p-1 inline-block"
                        title="View Report"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Agent Performance Overview Bar Chart */}
        <div className="lg:col-span-5 bg-[#08132B]/80 border border-[#387DE6]/25 rounded-2xl p-6 shadow-[0_12px_32px_rgba(2,6,18,0.6)] space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#387DE6]/20">
            <h2 className="text-xs font-mono font-bold tracking-[0.18em] text-white uppercase">
              AGENT PERFORMANCE OVERVIEW
            </h2>
            <Link
              href="/analytics"
              className="text-xs text-[#58A6FF] hover:text-[#89CFF0] font-medium flex items-center gap-1 transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bar Chart Area */}
          <div className="h-52 flex items-end gap-3 pt-6 pb-2 px-2 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 top-6 border-b border-[#387DE6]/10 text-[9px] font-mono text-[#6C85AA]">
              <span className="absolute -top-3.5 left-0">100</span>
            </div>
            <div className="absolute inset-x-0 top-[45%] border-b border-[#387DE6]/10 text-[9px] font-mono text-[#6C85AA]">
              <span className="absolute -top-3.5 left-0">50</span>
            </div>
            <div className="absolute inset-x-0 bottom-2 border-b border-[#387DE6]/20 text-[9px] font-mono text-[#6C85AA]">
              <span className="absolute -top-3.5 left-0">0</span>
            </div>

            {/* Bars */}
            <div className="w-full flex items-end justify-between gap-2.5 h-full pl-6 relative z-10">
              {agentPerformanceData.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    className="w-full rounded-t-sm bg-gradient-to-t from-[#388BFD] via-[#58A6FF] to-[#89CFF0] shadow-[0_0_12px_rgba(88,166,255,0.35)] group-hover:brightness-125 transition-all relative"
                    style={{ height: `${bar.score}%` }}
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-white bg-[#040914] px-1 py-0.5 rounded border border-[#387DE6]/40 transition-opacity pointer-events-none">
                      {bar.score}
                    </span>
                  </div>
                  <span className="text-[9px] font-sans text-[#8EA6C8] mt-2 truncate w-full text-center">
                    {bar.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>


      {/* ==============================================================================
         5. EXPANDABLE 8 SPECIALIZED AGENTS EXPLORER
         ============================================================================== */}
      <section className="liquid-glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#58A6FF] uppercase tracking-wider block">
              PARALLEL EVALUATION SWARM
            </span>
            <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wide">
              EIGHT SPECIALIZED AGENT EVALUATORS
            </h2>
          </div>
          <Link
            href="/analysis"
            className="text-xs text-[#58A6FF] hover:text-[#89CFF0] font-medium flex items-center gap-1"
          >
            <span>Launch swarm evaluation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            {
              id: "security",
              name: "Security Agent",
              category: "VULNERABILITY DETECTION",
              desc: "Detects OWASP Top 10 & CWE vulnerabilities, isolates exact AST code slices, and synthesizes unified git diff patches.",
              tech: "ACM FSE '25 AutoReview",
              icon: ShieldCheck
            },
            {
              id: "architecture",
              name: "Architecture Agent",
              category: "STRUCTURAL COHESION",
              desc: "Evaluates dependency direction, coupling, module boundaries, architectural layering, and structural separation.",
              tech: "Groq Llama 3.3 70B",
              icon: Layers
            },
            {
              id: "performance",
              name: "Performance Agent",
              category: "COMPUTATIONAL SCALING",
              desc: "Detects blocking I/O, N+1 query patterns, computational complexity spikes, and memory leak vulnerabilities.",
              tech: "Groq Llama 3.3 70B",
              icon: Zap
            },
            {
              id: "testing",
              name: "Testing Agent",
              category: "ASSERTION INTEGRITY",
              desc: "Measures assertion density, test suite coverage breadth, mutation resistance, and continuous integration reliability.",
              tech: "Groq Llama 3.1 8B",
              icon: TestTube
            },
            {
              id: "database",
              name: "Database Agent",
              category: "SCHEMA HYGIENE",
              desc: "Analyzes relational schema normalization, indexing strategies, transaction boundaries, and query efficiency.",
              tech: "NaraRouter Agnes 2.5",
              icon: Database
            },
            {
              id: "similarity",
              name: "Similarity Engine",
              category: "CODE CLONE VECTORS",
              desc: "Converts code into AST statement hashes and CodeBERT vectors in FAISS to detect cross-repository plagiarism.",
              tech: "CodeBERT + FAISS",
              icon: Fingerprint
            },
            {
              id: "dx",
              name: "Developer Experience",
              category: "TOOLING & TYPING",
              desc: "Inspects code style consistency, documentation coverage, lint configurations, and developer ergonomics.",
              tech: "Groq Llama 3.1 8B",
              icon: Code2
            },
            {
              id: "finops",
              name: "FinOps & Cloud",
              category: "RESOURCE SIZING",
              desc: "Models cloud deployment footprint, container image optimization, compute rightsizing, and monthly operating cost.",
              tech: "Groq Llama 3.3 70B",
              icon: Cpu
            }
          ].map((agent) => (
            <InteractiveAgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              category={agent.category}
              desc={agent.desc}
              tech={agent.tech}
              icon={agent.icon}
              onInspect={handleInspectAgent}
            />
          ))}
        </div>
      </section>

      {/* Floating Agent Inspector Modal */}
      <AgentInspectorModal
        agentId={selectedAgentId}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

    </div>
  );
}
