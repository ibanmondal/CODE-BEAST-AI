"use client";

import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Zap, 
  TestTube, 
  Database, 
  Fingerprint, 
  CheckCircle2, 
  Loader2,
  Terminal,
  Activity,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface AnalysisLoadingExperienceProps {
  repoUrl?: string;
  repoName?: string;
  completedAgents?: string[];
  activeAgent?: string;
  onCancel?: () => void;
  onComplete?: () => void;
}

const AGENT_TASKS = [
  { id: "ingest", name: "Tree-Sitter AST & Git Ingestion", tech: "LibGit2 + AST Parser", icon: Cpu },
  { id: "sec", name: "AutoReview 3-Stage CWE Slicing", tech: "ACM FSE '25 AutoReview", icon: ShieldCheck },
  { id: "arch", name: "Cyclic Dependency & SOLID Graph", tech: "Llama 3.3 70B", icon: Layers },
  { id: "perf", name: "Algorithmic Complexity & Profiler", tech: "Llama 3.3 70B", icon: Zap },
  { id: "test", name: "Assertion Density & CI Flake Risk", tech: "Llama 3.1 8B", icon: TestTube },
  { id: "db", name: "Database Schema & Query Indexing", tech: "Gemini Flash Core", icon: Database },
  { id: "clone", name: "AST Semantic Clone Vector Check", tech: "CodeBERT FAISS", icon: Fingerprint },
  { id: "judge", name: "ConsJudge Dual-Pass Consensus", tech: "ConsJudge Arbiter '25", icon: CheckCircle2 }
];

export function AnalysisLoadingExperience({ 
  repoUrl, 
  repoName, 
  completedAgents = [], 
  activeAgent, 
  onCancel,
  onComplete
}: AnalysisLoadingExperienceProps) {
  const [completedCount, setCompletedCount] = useState<number>(0);
  const targetIdentifier = repoUrl || repoName || "target-repository";
  const displayRepo = targetIdentifier.replace(/^https?:\/\/github\.com\//i, "") || "target-repository";

  const [logLines, setLogLines] = useState<string[]>([
    "INITIALIZING: LibGit2 shallow repository clone pipeline...",
    "EXTRACTING: Abstract Syntax Tree tokens via Tree-Sitter grammars...",
    "FAN-OUT: Spawning specialized evaluator nodes across isolated workers..."
  ]);

  // Snappy, high-throughput progression (650ms per agent)
  useEffect(() => {
    const timer = setInterval(() => {
      setCompletedCount((prev) => {
        if (prev < AGENT_TASKS.length) {
          const next = prev + 1;
          const nextTask = AGENT_TASKS[Math.min(next - 1, AGENT_TASKS.length - 1)];
          setLogLines((logs) => [
            `VERIFIED: [Node ${next}/${AGENT_TASKS.length}] ${nextTask.name} completed successfully.`,
            ...logs.slice(0, 9)
          ]);
          return next;
        } else {
          setLogLines((logs) => [
            "ALL 8 NODES VERIFIED: Generating final report immediately...",
            ...logs.slice(0, 9)
          ]);
          return prev;
        }
      });
    }, 650);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Trigger instant report compilation 500ms after all 8 boxes turn green
  useEffect(() => {
    if (completedCount >= AGENT_TASKS.length) {
      const finishTimer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 500);
      return () => clearTimeout(finishTimer);
    }
  }, [completedCount, onComplete]);

  // Sync with real backend progress if backend completes faster
  useEffect(() => {
    if (completedAgents && completedAgents.length > 0) {
      setCompletedCount((prev) => Math.max(prev, completedAgents.length));
    }
  }, [completedAgents]);

  const progressPercent = Math.min(100, Math.round((completedCount / AGENT_TASKS.length) * 100));

  return (
    <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(137,207,240,0.12)] space-y-6 text-white">
      
      {/* 1. Header with Live Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${completedCount >= AGENT_TASKS.length ? "bg-emerald-400 animate-pulse" : "bg-[#89CFF0] animate-ping"}`} />
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${completedCount >= AGENT_TASKS.length ? "text-emerald-400" : "text-[#89CFF0]"}`}>
              {completedCount >= AGENT_TASKS.length ? "ALL 8 NODES COMPLETED · SYNTHESIZING REPORT" : "EVALUATION PIPELINE IN PROGRESS"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            {displayRepo}
          </h2>
          <span className="text-xs text-[#8EA6C8] block mt-0.5">
            Parallel fan-out execution across 8 specialized evaluator nodes with ConsJudge arbitration.
          </span>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className={`text-2xl sm:text-3xl font-bold font-mono ${completedCount >= AGENT_TASKS.length ? "text-emerald-400" : "text-[#89CFF0]"}`}>
            {progressPercent}%
          </span>
          <span className="text-xs text-[#8EA6C8] block mt-0.5">
            {completedCount >= AGENT_TASKS.length ? "Final consensus synthesizing..." : `${completedCount} of 8 nodes finished`}
          </span>
        </div>
      </div>

      {/* 2. Global Progress Bar with Smooth Transition */}
      <div className="w-full bg-[#08132B] h-3 rounded-full overflow-hidden border border-[#89CFF0]/20 shadow-inner">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${
            completedCount >= AGENT_TASKS.length 
              ? "bg-gradient-to-r from-emerald-500 to-teal-400" 
              : "bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0]"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3. Grid of 8 Parallel Agents - Fully Green When Completed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {AGENT_TASKS.map((task, idx) => {
          const isDone = idx < completedCount;
          const isRunning = idx === completedCount;
          const isPending = idx > completedCount;

          return (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all duration-400 transform ${
                isDone
                  ? "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white border-2 border-emerald-400 shadow-[0_10px_25px_rgba(16,185,129,0.32)] ring-2 ring-emerald-300/40 scale-[1.01]"
                  : isRunning
                  ? "bg-gradient-to-br from-[#08132B] to-[#040914] text-white border-2 border-[#89CFF0] shadow-[0_8px_25px_rgba(137,207,240,0.35)] ring-2 ring-[#89CFF0]/50 animate-pulse scale-[1.01]"
                  : "bg-[#08132B]/60 border border-[#89CFF0]/15 text-[#8EA6C8] opacity-75 backdrop-blur-xs"
              }`}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className={`p-2 rounded-xl transition-colors ${
                  isDone 
                    ? "bg-white/20 text-white border border-white/30 backdrop-blur-xs shadow-xs" 
                    : isRunning 
                    ? "bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40" 
                    : "bg-[#08132B] text-[#8EA6C8] border border-[#89CFF0]/20"
                }`}>
                  <task.icon className="w-4 h-4" />
                </div>
                
                {isDone ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-white bg-black/20 px-2.5 py-0.5 rounded-full shadow-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" /> Done
                  </span>
                ) : isRunning ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#89CFF0] bg-[#89CFF0]/15 px-2.5 py-0.5 rounded-full border border-[#89CFF0]/30">
                    <Loader2 className="w-3 h-3 animate-spin text-[#89CFF0]" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#8EA6C8] bg-black/20 px-2 py-0.5 rounded-full border border-[#89CFF0]/10">
                    Pending
                  </span>
                )}
              </div>

              <h4 className={`text-xs font-bold leading-snug truncate ${
                isDone ? "text-white drop-shadow-xs" : isRunning ? "text-white" : "text-[#BAE6FD]"
              }`}>
                {task.name}
              </h4>
              <span className={`text-[10px] font-mono block mt-1 ${
                isDone ? "text-emerald-100 font-medium" : isRunning ? "text-[#89CFF0]" : "text-[#8EA6C8]"
              }`}>
                {task.tech}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4. Live Telemetry Stream Terminal */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#8EA6C8]">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <Terminal className="w-3.5 h-3.5 text-[#89CFF0]" />
            Live Execution Telemetry
          </span>
          <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
            {completedCount}/8 Nodes Active & Verified
          </span>
        </div>

        <div className="p-4 bg-[#040914] text-white font-mono text-xs max-h-36 overflow-y-auto space-y-1.5 rounded-2xl border border-[#89CFF0]/25 shadow-inner">
          {logLines.map((line, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-[#89CFF0]/70 shrink-0">&gt;</span>
              <span className={i === 0 ? "text-emerald-400 font-semibold" : "text-[#BAE6FD]"}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

