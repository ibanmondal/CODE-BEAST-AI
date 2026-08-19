"use client";

import { useEffect, useState, useRef } from "react";
import { 
  GitBranch, 
  ShieldAlert, 
  Layout, 
  Zap, 
  TestTube, 
  Database, 
  Fingerprint, 
  BrainCircuit, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  Radio,
  Terminal,
  Clock,
  Sparkles,
  Flame,
  Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { TiltCard } from "@/components/TiltCard";

type NodeState = "idle" | "running" | "completed" | "error";

interface PipelineState {
  task_id: string | null;
  repo_url: string | null;
  ingestion: NodeState;
  agents: {
    security_agent: NodeState;
    architecture_agent: NodeState;
    performance_agent: NodeState;
    testing_agent: NodeState;
    database_agent: NodeState;
    similarity_agent: NodeState;
  };
  supervisor: NodeState;
  globalStatus: "idle" | "Running" | "Completed" | "Failed";
}

interface EventLog {
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "agent";
}

const initialPipelineState: PipelineState = {
  task_id: null,
  repo_url: null,
  ingestion: "idle",
  agents: {
    security_agent: "idle",
    architecture_agent: "idle",
    performance_agent: "idle",
    testing_agent: "idle",
    database_agent: "idle",
    similarity_agent: "idle",
  },
  supervisor: "idle",
  globalStatus: "idle"
};

export default function LiveAnimationPage() {
  const [pipeline, setPipeline] = useState<PipelineState>(initialPipelineState);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (message: string, type: "info" | "success" | "warning" | "agent" = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message, type }, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (pipeline.globalStatus === "Running") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pipeline.globalStatus]);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    fetch(`http://${host}:8000/api/v1/stats/history`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        const historyList = data?.history || (Array.isArray(data) ? data : []);
        if (Array.isArray(historyList) && historyList.length > 0) {
          const latest = historyList[0];
          setPipeline((prev) => {
            if (prev.task_id && prev.globalStatus === "Running") return prev;
            
            const isCompleted = latest.status === "Completed" || latest.overall;
            return {
              task_id: latest.repoId || latest.repo,
              repo_url: latest.repoId?.startsWith("http") ? latest.repoId : `https://github.com/${latest.team || 'user'}/${latest.repo}`,
              ingestion: isCompleted ? "completed" : "idle",
              agents: {
                security_agent: isCompleted ? "completed" : "idle",
                architecture_agent: isCompleted ? "completed" : "idle",
                performance_agent: isCompleted ? "completed" : "idle",
                testing_agent: isCompleted ? "completed" : "idle",
                database_agent: isCompleted ? "completed" : "idle",
                similarity_agent: isCompleted ? "completed" : "idle",
              },
              supervisor: isCompleted ? "completed" : "idle",
              globalStatus: isCompleted ? "Completed" : "idle"
            };
          });
          addLog(`Synchronized initial state for ${latest.repo || 'repository'}`, "info");
        }
      })
      .catch(() => {
        // Silently handle offline state
      });

    function connectWS() {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      const wsUrl = `ws://${host}:8000/api/v1/ws/updates`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        addLog("Real-time WebSocket connected to 6-agent runner", "success");
      };

      ws.onclose = () => {
        setWsConnected(false);
        addLog("WebSocket disconnected. Reconnecting in 2.5s...", "warning");
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connectWS, 2500);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          setPipeline((prev) => {
            let current = { ...prev };
            
            if (data.task_id && prev.task_id && prev.task_id !== data.task_id) {
              setElapsedSeconds(0);
              addLog(`New evaluation job queued: ${data.task_id.substring(0, 8)}`, "info");
              current = {
                ...initialPipelineState,
                task_id: data.task_id,
                repo_url: data.repo_url || prev.repo_url,
                globalStatus: "Running"
              };
            }
            
            if (data.status === "Completed") {
              current.globalStatus = "Completed";
              current.ingestion = "completed";
              current.agents = {
                security_agent: "completed",
                architecture_agent: "completed",
                performance_agent: "completed",
                testing_agent: "completed",
                database_agent: "completed",
                similarity_agent: "completed"
              };
              current.supervisor = "completed";
              addLog(`Job ${data.task_id?.substring(0, 8) || ''} fully verified and completed!`, "success");
              return current;
            }

            return current;
          });
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };
    }

    connectWS();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const renderNode = (
    title: string, 
    state: NodeState, 
    Icon: any, 
    subtitle?: string,
    isLarge: boolean = false
  ) => {
    let borderClass = "border-[#E07A48]/20 bg-[#0E0602]";
    let textClass = "text-amber-200/50";
    let iconAnim = "";

    if (state === "running") {
      borderClass = "border-[#FF8C42] bg-[#29130A] shadow-[0_0_25px_rgba(255,140,66,0.4)] ring-1 ring-[#FF8C42]";
      textClass = "text-[#FF8C42]";
      iconAnim = "animate-pulse";
    } else if (state === "completed") {
      borderClass = "border-emerald-500/80 bg-emerald-950/20 shadow-[0_0_15px_rgba(34,197,94,0.25)]";
      textClass = "text-emerald-400";
    }

    return (
      <TiltCard variant="secondary" className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-500 ${borderClass} ${isLarge ? 'w-64 h-32' : 'w-48 h-32'}`}>
        <Icon className={`w-8 h-8 mb-2 ${textClass} ${iconAnim}`} />
        <span className={`text-xs font-bold text-center uppercase tracking-wider font-mono ${state === 'idle' ? 'text-amber-200/50' : 'text-[#D4BC9A]'}`}>{title}</span>
        {subtitle && <span className="text-[10px] text-amber-200/40 mt-1 font-mono">{subtitle}</span>}
        {state === "running" && (
          <div className="absolute top-2.5 right-2.5">
            <Loader2 className="w-4 h-4 text-[#FF8C42] animate-spin" />
          </div>
        )}
        {state === "completed" && (
          <div className="absolute top-2.5 right-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </TiltCard>
    );
  };

  return (
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* SECTION 1: Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#E07A48]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-3">
            <Activity className="w-3.5 h-3.5 text-[#FF8C42]" />
            <span>Real-Time WebSocket Stream</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
            LIVE <span className="text-gradient-copper">NEURAL TOPOLOGY MESH</span>
          </h1>
          <p className="text-amber-100/70 text-sm mt-2 max-w-xl font-normal leading-relaxed">
            Real-time 3D telemetry streaming multi-agent execution states and ConsJudge synthesis over WebSockets.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold font-mono border transition-all ${
            wsConnected 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
          }`}>
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
            <Radio className="w-3.5 h-3.5" />
            <span>{wsConnected ? 'LIVE: WS 8000' : 'RECONNECTING...'}</span>
          </div>

          {pipeline.globalStatus === "Running" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-mono bg-[#28130B] text-[#FF8C42] border border-[#E07A48]/30">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{elapsedSeconds}s elapsed</span>
            </div>
          )}
        </div>
      </section>
      
      {/* SECTION 2: Pipeline Visualizer */}
      <section>
        {!pipeline.task_id ? (
          <TiltCard variant="secondary" className="flex flex-col items-center justify-center h-88 border border-dashed border-[#E07A48]/30 rounded-3xl p-8 text-center">
            <Loader2 className="w-10 h-10 text-[#FF8C42] animate-spin mb-4" />
            <h2 className="font-display text-2xl text-[#D4BC9A] tracking-wider uppercase font-normal">WAITING FOR EVALUATION RUN...</h2>
            <p className="text-xs text-amber-200/50 mt-2 max-w-md">
              Trigger a repository evaluation from the <strong className="text-[#FF8C42]">Analysis</strong> page to stream live 3D neural mesh telemetry.
            </p>
          </TiltCard>
        ) : (
          <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-6 space-y-10 relative">
            
            <div className="text-center space-y-2">
              <h2 className="font-mono text-xl font-bold text-[#D4BC9A] tracking-tight">{pipeline.repo_url}</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-[#28130B] text-[#FF8C42] rounded-full text-xs font-mono border border-[#E07A48]/30">
                  JOB ID: {pipeline.task_id?.split('-')[0]}...
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase bg-emerald-950/40 text-emerald-400 border border-emerald-500/40">
                  {pipeline.globalStatus}
                </span>
              </div>
            </div>

            {/* Stage 1: Ingestion */}
            <div className="flex flex-col items-center relative z-10">
              {renderNode("GitHub Ingestion", pipeline.ingestion, GitBranch, "Clone & FAISS Vectorize", true)}
            </div>

            {/* Vertical line connecting Stage 1 to Stage 2 */}
            <div className="w-1 h-12 bg-[#E07A48]/20 relative rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[#FF8C42] shadow-[0_0_15px_#FF8C42]" />
            </div>

            {/* Stage 2: Parallel 6-Agent Execution Layer */}
            <TiltCard variant="hero" className="w-full p-8 relative shadow-2xl">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#0D0805] border border-[#E07A48]/40 px-5 py-1 rounded-full text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider">
                6-Agent Parallel Execution Layer
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 mt-4">
                {renderNode("Security Agent", pipeline.agents.security_agent, ShieldAlert, "AutoReview CWE")}
                {renderNode("Architecture Agent", pipeline.agents.architecture_agent, Layout, "SOLID & Layering")}
                {renderNode("Performance Agent", pipeline.agents.performance_agent, Zap, "Bundle & Cache")}
                {renderNode("Testing Agent", pipeline.agents.testing_agent, TestTube, "CI & Flake Risk")}
                {renderNode("Database Agent", pipeline.agents.database_agent, Database, "Schema Normalization")}
                {renderNode("Similarity Agent", pipeline.agents.similarity_agent, Fingerprint, "AST & CodeBERT")}
              </div>
            </TiltCard>

            {/* Vertical line connecting Stage 2 to Stage 3 */}
            <div className="w-1 h-12 bg-[#E07A48]/20 relative rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-[#FF8C42] shadow-[0_0_15px_#FF8C42]" />
            </div>

            {/* Stage 3: Supervisor */}
            <div className="flex flex-col items-center relative z-10">
              {renderNode("Executive Supervisor", pipeline.supervisor, BrainCircuit, "ConsJudge Multi-Pass", true)}
            </div>

            {/* Real-time WebSocket Event Log Stream */}
            <TiltCard variant="primary" className="w-full mt-8 p-6 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E07A48]/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-100 uppercase tracking-wider font-mono">
                  <Terminal className="w-4 h-4 text-[#FF8C42]" />
                  <span>Live Event Stream (WebSockets / Redis)</span>
                </div>
                <span className="text-[11px] text-amber-200/50 font-mono">channel: job_updates</span>
              </div>
              
              <div className="space-y-2 font-mono text-xs max-h-48 overflow-y-auto pr-2">
                {logs.length === 0 ? (
                  <div className="text-amber-200/40 italic">Listening for live pipeline execution events...</div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-amber-100/80">
                      <span className="text-amber-200/40 shrink-0">[{log.time}]</span>
                      <span className={
                        log.type === "success" ? "text-emerald-400" :
                        log.type === "warning" ? "text-amber-300" :
                        log.type === "agent" ? "text-[#FF8C42]" : "text-amber-100/80"
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TiltCard>

          </div>
        )}
      </section>

    </div>
  );
}
