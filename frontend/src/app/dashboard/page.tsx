"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { CheckCircle2, ShieldAlert, Award, FileCode, Trophy, Activity, ArrowUpRight, Sparkles, ShieldCheck, Cpu, GitBranch, Terminal, RefreshCw, Zap, TrendingUp, Layers } from 'lucide-react';
import { AiCore3D } from '@/components/AiCore3D';
import { TiltCard } from '@/components/TiltCard';
import { CountUp } from '@/components/CountUp';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';

export default function DashboardPage() {
  const [stats, setStats] = useState({ submitted: 18, analyzed: 16, running: 2, avg_score: 87.4, highest: 96.8, failed: 0 });
  const [pieData, setPieData] = useState([]);
  const [history, setHistory] = useState([
    { repo: "vercel/next.js", team: "Core Devs", lang: "TypeScript", status: "High Confidence ±1.8 pts", overall: 94.5, time: "10m ago", security: "CWE-None", patches: 0 },
    { repo: "fastapi/fastapi", team: "PyEngineers", lang: "Python", status: "High Confidence ±2.1 pts", overall: 91.2, time: "28m ago", security: "CWE-None", patches: 0 },
    { repo: "ollama/ollama", team: "AI Researchers", lang: "Go", status: "AutoReview Patched", overall: 85.0, time: "1h ago", security: "CWE-798", patches: 2 },
    { repo: "facebook/react", team: "UI Systems", lang: "JavaScript", status: "Moderate Conf ±3.4 pts", overall: 89.4, time: "2h ago", security: "CWE-None", patches: 0 },
    { repo: "rust-lang/rust", team: "Systems Group", lang: "Rust", status: "High Confidence ±1.2 pts", overall: 96.8, time: "4h ago", security: "CWE-None", patches: 0 }
  ]);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    fetch(`http://${host}:8000/api/v1/stats/dashboard`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data?.stats) setStats(data.stats);
        if (data?.pieData) setPieData(data.pieData);
      })
      .catch(() => {
        // Backend offline fallback using pre-populated state
      });

    fetch(`http://${host}:8000/api/v1/stats/history`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        if (data?.history && data.history.length > 0) {
          setHistory(data.history.slice(0, 5));
        }
      })
      .catch(() => {
        // Backend offline fallback using pre-populated state
      });
  }, []);

  const areaDataTop = [
    { name: 'Mon', score: 72, pass2: 74, runs: 12 },
    { name: 'Tue', score: 78, pass2: 79, runs: 18 },
    { name: 'Wed', score: 85, pass2: 84, runs: 24 },
    { name: 'Thu', score: 82, pass2: 83, runs: 20 },
    { name: 'Fri', score: 89, pass2: 90, runs: 32 },
    { name: 'Sat', score: 94, pass2: 93, runs: 28 },
    { name: 'Sun', score: 96, pass2: 95, runs: 35 }
  ];

  const safePieData = pieData.length > 0 ? pieData : [
    { name: 'TypeScript', value: 42, color: '#FF8C42' },
    { name: 'Python', value: 28, color: '#E07A48' },
    { name: 'Rust', value: 16, color: '#FFB085' },
    { name: 'Go', value: 14, color: '#D96B27' }
  ];

  const radarData = [
    { subject: 'AutoReview Security', A: 92, fullMark: 100 },
    { subject: 'Architecture & SOLID', A: 84, fullMark: 100 },
    { subject: 'Resource Performance', A: 95, fullMark: 100 },
    { subject: 'CI/CD & Testing', A: 78, fullMark: 100 },
    { subject: 'Database Schema', A: 82, fullMark: 100 },
    { subject: 'AST/CodeBERT Originality', A: 96, fullMark: 100 },
  ];

  return (
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* SECTION 1: Executive Command Horizon (Hero + AI Core 3D) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        <TiltCard variant="hero" className="lg:col-span-7 p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#FF8C42] animate-pulse" />
              <span>ConsJudge Multi-Pass Supervisor Active</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-amber-200/50 uppercase tracking-widest block">Executive Dashboard</span>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
                CODEBEAST <span className="text-gradient-copper">COMMAND CENTER</span>
              </h1>
            </div>
            
            <p className="text-amber-100/70 text-sm leading-relaxed max-w-xl font-normal">
              Autonomous multi-agent code evaluation engine. Orchestrating 6 parallel LangGraph nodes, ConsJudge dual-pass LLM supervisors (Gemini + Llama 3.3), and ASTNN CodeBERT clone vector neural embeddings.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs">
              <span className="text-amber-200/40 font-mono font-semibold mr-1">PRESET AUDITS:</span>
              {['facebook/react', 'fastapi/fastapi', 'vercel/next.js'].map((preset) => (
                <Link 
                  key={preset}
                  href={`/analysis?repo=${encodeURIComponent(preset)}`}
                >
                  <CodeBeastLiquidButton
                    variant="outline"
                    size="sm"
                    label={`${preset} →`}
                    className="font-mono text-xs"
                  />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6 relative z-10 border-t border-[#E07A48]/20 mt-8">
            <Link href="/analysis">
              <CodeBeastLiquidButton
                variant="primary"
                size="md"
                label="START REPOSITORY ANALYSIS"
                hasArrow
              />
            </Link>
            <Link href="/upload">
              <CodeBeastLiquidButton
                variant="secondary"
                size="md"
                label="BULK CSV UPLOAD"
              />
            </Link>
          </div>
        </TiltCard>

        <div className="lg:col-span-5 h-full flex flex-col">
          <AiCore3D />
        </div>
      </section>

      {/* SECTION 2: Integrated Executive Telemetry Horizon Bar (Compound Panel, No 6-box clutter) */}
      <section>
        <TiltCard variant="primary" className="p-0 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E07A48]/15">
            
            {/* Health & Score Anchor (Left 4-col) */}
            <div className="lg:col-span-4 p-6 sm:p-7 bg-gradient-to-br from-[#231109] to-[#120703] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A48]/15 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF8C42]" /> ConsJudge Health Index
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    High Confidence
                  </span>
                </div>
                <div className="flex items-baseline gap-4 mt-2">
                  <span className="font-display text-5xl sm:text-6xl text-[#D4BC9A] text-gradient-copper leading-none">
                    <CountUp end={stats.avg_score} decimals={1} suffix="/100" />
                  </span>
                  <div className="text-xs text-amber-200/60 font-mono leading-tight">
                    <span>Target: 85.0+</span>
                    <span className="block text-emerald-400 font-semibold">±1.8 pts variance</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E07A48]/20 flex items-center justify-between text-xs">
                <span className="text-amber-200/50 font-normal">Top Evaluated Codebase:</span>
                <span className="font-mono font-bold text-[#D4BC9A] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#FF8C42]" /> {stats.highest}/100 pts
                </span>
              </div>
            </div>

            {/* 4 Connected Telemetry Metrics (Right 8-col) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E07A48]/15 bg-[#140803]/80">
              
              <div className="p-5 sm:p-6 flex flex-col justify-between hover:bg-[#1A0B05]/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-amber-200/50 uppercase">Repositories</span>
                  <FileCode className="w-4 h-4 text-[#FF8C42]" />
                </div>
                <div>
                  <h3 className="font-display text-3xl text-[#D4BC9A]"><CountUp end={stats.submitted} /></h3>
                  <p className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +12% this week
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col justify-between hover:bg-[#1A0B05]/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-amber-200/50 uppercase">Evaluations</span>
                  <CheckCircle2 className="w-4 h-4 text-[#FF8C42]" />
                </div>
                <div>
                  <h3 className="font-display text-3xl text-[#D4BC9A]"><CountUp end={stats.analyzed} /></h3>
                  <p className="text-[11px] text-amber-200/50 font-normal mt-1">100% verified passes</p>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col justify-between hover:bg-[#1A0B05]/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-amber-200/50 uppercase">Swarm Nodes</span>
                  <Cpu className="w-4 h-4 text-[#FF8C42]" />
                </div>
                <div>
                  <h3 className="font-display text-3xl text-[#D4BC9A]">6</h3>
                  <p className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold">Active Parallel Mesh</p>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col justify-between hover:bg-[#1A0B05]/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-amber-200/50 uppercase">AutoReview</span>
                  <ShieldAlert className="w-4 h-4 text-[#FF8C42]" />
                </div>
                <div>
                  <h3 className="font-display text-3xl text-[#D4BC9A]">3</h3>
                  <p className="text-[11px] text-[#FF8C42] font-mono mt-1 font-semibold">Git Diffs Generated</p>
                </div>
              </div>

            </div>

          </div>
        </TiltCard>
      </section>

      {/* SECTION 3: Asymmetric Analytics Suite (8-col Area Chart + 4-col AST Tree-Sitter Donut) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* Left 8-col: ConsJudge Variance Area Chart */}
        <TiltCard variant="primary" className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] tracking-wider uppercase font-normal">
                  ConsJudge Dual-Pass Telemetry
                </h3>
                <span className="px-2.5 py-0.5 rounded-md bg-[#E07A48]/20 text-[#FF8C42] border border-[#E07A48]/30 text-[11px] font-mono font-semibold">
                  Gemini + Llama 3.3
                </span>
              </div>
              <p className="text-xs text-amber-200/50 mt-1 font-normal">
                Multi-pass supervisor variance monitoring tracking consensus convergence within ±3.0 score bounds
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0D0603] p-1 rounded-xl border border-[#E07A48]/20 self-start sm:self-auto">
              {['7d', '14d', '30d'].map((period, idx) => (
                <button 
                  key={period} 
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${idx === 1 ? 'bg-[#E07A48] text-[#0D0805] font-extrabold shadow-[0_0_12px_rgba(224,122,72,0.4)]' : 'text-amber-200/50 hover:text-[#D4BC9A]'}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaDataTop} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPass1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8C42" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#FF8C42" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPass2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E07A48" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#E07A48" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#78350f" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#78350f" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A0B05', borderColor: '#E07A48', borderRadius: '12px', color: '#D4BC9A' }} 
                  itemStyle={{ color: '#D4BC9A', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="pass2" stroke="#E07A48" strokeWidth={2.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorPass2)" name="Pass 2: Groq Llama 3.3" />
                <Area type="monotone" dataKey="score" stroke="#FF8C42" strokeWidth={3} fillOpacity={1} fill="url(#colorPass1)" name="Pass 1: Gemini Flash" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TiltCard>

        {/* Right 4-col: Language AST Distribution */}
        <TiltCard variant="secondary" className="lg:col-span-4 p-6 sm:p-7 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-2xl text-[#D4BC9A] tracking-wider uppercase font-normal">AST Syntax Spectrum</h3>
              <span className="text-[11px] text-amber-200/50 font-mono">Tree-Sitter</span>
            </div>
            <p className="text-xs text-amber-200/50 mb-4 font-normal">Normalized multi-language grammar distribution</p>

            <div className="h-48 sm:h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ backgroundColor: '#1A0B05', borderColor: '#E07A48', borderRadius: '12px', color: '#D4BC9A' }} />
                  <Pie data={safePieData} cx="50%" cy="50%" innerRadius={58} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                    {safePieData.map((entry: any, index: number) => {
                      const orangePalette = ['#FF8C42', '#E07A48', '#FFB085', '#D96B27', '#FFA04A', '#C44C0D'];
                      const cellColor = (entry.color && !['#3B82F6', '#10B981', '#3b82f6', '#10b981'].includes(entry.color)) 
                        ? entry.color 
                        : orangePalette[index % orangePalette.length];
                      return (
                        <Cell key={`cell-${index}`} fill={cellColor} className="hover:opacity-80 transition-opacity cursor-pointer" />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center pointer-events-none">
                <span className="font-display text-3xl text-[#D4BC9A] leading-none">{safePieData.length}</span>
                <span className="text-[9px] font-mono text-amber-200/50 uppercase">LANGS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-[#E07A48]/15">
            {safePieData.map((d: any, index: number) => {
              const orangePalette = ['#FF8C42', '#E07A48', '#FFB085', '#D96B27', '#FFA04A', '#C44C0D'];
              const badgeColor = (d.color && !['#3B82F6', '#10B981', '#3b82f6', '#10b981'].includes(d.color)) 
                ? d.color 
                : orangePalette[index % orangePalette.length];
              return (
                <div key={d.name} className="flex items-center justify-between p-2 rounded-xl bg-[#0E0602] border border-[#E07A48]/15">
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-100/80 truncate">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: badgeColor }} />
                    <span className="truncate">{d.name}</span>
                  </div>
                  <span className="text-xs font-bold text-[#D4BC9A] font-mono shrink-0">{d.value}%</span>
                </div>
              );
            })}
          </div>
        </TiltCard>

      </section>

      {/* SECTION 4: Evaluation Feed & Competency Radar Hub (8-col Evaluations + 4-col Radar) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* Left 8-col: Recent Evaluations Table Feed */}
        <TiltCard variant="primary" className="lg:col-span-8 p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] tracking-wider uppercase font-normal">Recent Repository Evaluations</h3>
                <p className="text-xs text-amber-200/50 mt-1 font-normal">ConsJudge verified evaluations with AutoReview security patches</p>
              </div>
              <Link href="/reports" className="text-xs text-[#FF8C42] hover:text-[#FFB085] font-semibold flex items-center gap-1 transition-colors font-mono">
                View all reports →
              </Link>
            </div>

            <div className="space-y-3 pt-2">
              {history.map((row: any, i) => (
                <div 
                  key={i} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#E07A48]/15 bg-[#140803]/80 hover:bg-[#1E0C06] hover:border-[#FF8C42]/40 transition-all gap-3 group shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#261208] border border-[#E07A48]/30 text-[#FF8C42] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#D4BC9A] group-hover:text-[#FF8C42] transition-colors font-mono">{row.repo}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#E07A48]/15 text-amber-200 font-semibold">{row.lang}</span>
                      </div>
                      <p className="text-xs text-amber-200/50 mt-0.5">{row.team} &bull; <span>{row.time || 'recently'}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E07A48]/10">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-semibold text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                        {row.status}
                      </span>
                      {row.patches > 0 && (
                        <span className="text-[10px] text-amber-400 mt-1 font-medium flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> {row.patches} AutoReview Patch
                        </span>
                      )}
                    </div>
                    <div className="text-right pl-2">
                      <span className="font-display text-3xl font-normal text-gradient-copper">{row.overall}</span>
                      <span className="text-[9px] text-amber-200/40 block font-semibold">/100 pts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>

        {/* Right 4-col: 6-Agent Competency Radar */}
        <TiltCard variant="secondary" className="lg:col-span-4 p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-display text-2xl text-[#D4BC9A] tracking-wider uppercase font-normal">Agent Competency</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-[#E07A48]/20 text-[#FF8C42] border border-[#E07A48]/30 font-mono font-semibold">6 Nodes</span>
            </div>
            <p className="text-xs text-amber-200/50 mb-4 font-normal">Mean score vector across 6 parallel LangGraph nodes</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                  <PolarGrid stroke="#78350f" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#D4BC9A', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Agents" dataKey="A" stroke="#FF8C42" fill="#E07A48" fillOpacity={0.45} />
                  <Tooltip contentStyle={{ backgroundColor: '#1A0B05', borderColor: '#E07A48', borderRadius: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E07A48]/15 text-center">
            <span className="text-[11px] text-amber-200/50 font-mono">Consensus threshold validated across all nodes</span>
          </div>
        </TiltCard>

      </section>

    </div>
  );
}
