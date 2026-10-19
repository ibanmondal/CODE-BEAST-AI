"use client";

import { useEffect, useState, useRef } from "react";
import { 
  ShieldCheck, 
  Layers, 
  Zap, 
  TestTube, 
  Database, 
  Fingerprint, 
  CheckCircle2, 
  Loader2,
  Radio,
  Terminal,
  Sparkles
} from "lucide-react";
import { ScrollReveal } from "@/components/ui/motion-primitives";

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

export default function LiveMonitorPage() {
  const [pipeline, setPipeline] = useState<PipelineState>(initialPipelineState);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (message: string, type: "info" | "success" | "warning" | "agent" = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message, type }, ...prev.slice(0, 19)]);
  };

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
      .catch(() => {});

    function connectWS() {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      const wsUrl = `ws://${host}:8000/api/v1/ws/updates`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        addLog("WebSocket connected to live agent runner", "success");
      };

      ws.onclose = () => {
        setWsConnected(false);
        addLog("WebSocket disconnected. Retrying in 2.5s...", "warning");
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
              addLog("All LangGraph evaluator nodes & ConsJudge synthesized successfully", "success");
              return current;
            }

            if (data.agent) {
              const nodeKey = data.agent as keyof typeof current.agents;
              if (nodeKey in current.agents) {
                current.agents[nodeKey] = data.status === "AgentRunning" ? "running" : "completed";
              }
              if (data.agent === "ingestion") {
                current.ingestion = data.status === "AgentRunning" ? "running" : "completed";
              }
              if (data.agent === "supervisor" || data.agent === "gemini_supervisor" || data.agent === "nararouter_supervisor") {
                current.supervisor = data.status === "AgentRunning" ? "running" : "completed";
              }
              addLog(`Node '${data.agent}' transitioned to state: ${data.status}`, "agent");
            }
            
            return current;
          });
        } catch (e) {}
      };
    }

    connectWS();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const getNodeBadge = (state: NodeState) => {
    switch (state) {
      case "running":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold bg-[#89CFF0]/15 text-[#89CFF0] border border-[#89CFF0]/30 rounded-full shadow-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#89CFF0]" />
            Running
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-400/30 rounded-full shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-400/30 rounded-full shadow-xs">
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium bg-[#08132B] text-[#8EA6C8] border border-[#89CFF0]/20 rounded-full shadow-xs">
            Standby
          </span>
        );
    }
  };

  const agentNodesList = [
    { id: "security_agent", name: "AutoReview Security", tech: "ACM FSE '25", icon: ShieldCheck, state: pipeline.agents.security_agent },
    { id: "architecture_agent", name: "Architecture & SOLID", tech: "Llama 3.3 70B", icon: Layers, state: pipeline.agents.architecture_agent },
    { id: "performance_agent", name: "Resource Performance", tech: "Llama 3.3 70B", icon: Zap, state: pipeline.agents.performance_agent },
    { id: "testing_agent", name: "Testing & CI Flakes", tech: "Llama 3.1 8B", icon: TestTube, state: pipeline.agents.testing_agent },
    { id: "database_agent", name: "Database & Schema", tech: "NaraRouter", icon: Database, state: pipeline.agents.database_agent },
    { id: "similarity_agent", name: "AST Neural Clones", tech: "CodeBERT FAISS", icon: Fingerprint, state: pipeline.agents.similarity_agent },
  ];

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Page Header */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <Radio className="w-3.5 h-3.5" />
              Live Execution Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Agent Swarm Real-Time Monitor
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
              Live telemetry stream tracking parallel LangGraph evaluator nodes and supervisor consensus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-full border shadow-xs ${
              wsConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30' 
                : 'bg-amber-500/10 text-amber-300 border-amber-400/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'} animate-ping`} />
              <span>{wsConnected ? "Connected (Port 8000)" : "Reconnecting..."}</span>
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. Pipeline Stage Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stage 1: Ingestion */}
        <div className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8EA6C8]">Phase 01</span>
            {getNodeBadge(pipeline.ingestion)}
          </div>
          <h3 className="text-base font-bold text-white">Git Tree & Context Ingestion</h3>
          <p className="text-xs text-[#8EA6C8] leading-relaxed">
            LibGit2 shallow clone, AST normalized extraction, and repository metadata collection.
          </p>
        </div>

        {/* Stage 2: Parallel Evaluator Swarm */}
        <div className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8EA6C8]">Phase 02</span>
            <span className="text-xs font-semibold px-3 py-1 bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 rounded-full shadow-xs">
              6 Parallel Nodes
            </span>
          </div>
          <h3 className="text-base font-bold text-white">LangGraph Parallel Fan-Out</h3>
          <p className="text-xs text-[#8EA6C8] leading-relaxed">
            Concurrent execution of Security, Architecture, Performance, Testing, Database, and Clone analysis.
          </p>
        </div>

        {/* Stage 3: ConsJudge Consensus */}
        <div className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#8EA6C8]">Phase 03</span>
            {getNodeBadge(pipeline.supervisor)}
          </div>
          <h3 className="text-base font-bold text-white">ConsJudge Consensus Arbiter</h3>
          <p className="text-xs text-[#8EA6C8] leading-relaxed">
            Dual concurrent supervisor passes bounding variance and issuing verified executive audit reports.
          </p>
        </div>

      </div>

      {/* 3. Six Parallel Evaluator Nodes Cards */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] space-y-6">
        <h2 className="text-base font-bold text-white">
          Parallel Evaluator Node Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agentNodesList.map((node) => (
            <div 
              key={node.id}
              className="p-4 border border-[#89CFF0]/20 bg-[#08132B]/80 backdrop-blur-md rounded-2xl flex items-center justify-between gap-3 hover:border-[#89CFF0]/50 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] flex items-center justify-center shrink-0 shadow-xs">
                  <node.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{node.name}</h4>
                  <span className="text-[11px] text-[#8EA6C8] block truncate font-mono">{node.tech}</span>
                </div>
              </div>
              <div className="shrink-0">
                {getNodeBadge(node.state)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Event Log Terminal */}
      <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#89CFF0]" />
            Live Execution Telemetry Stream
          </h3>
          <span className="text-xs text-[#8EA6C8] font-mono">
            {logs.length} events logged
          </span>
        </div>

        <div className="p-4 bg-[#040914] text-white rounded-2xl font-mono text-xs max-h-56 overflow-y-auto space-y-2 leading-relaxed border border-[#89CFF0]/25 shadow-inner">
          {logs.length === 0 ? (
            <span className="text-[#8EA6C8]">Awaiting evaluation events...</span>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#89CFF0] shrink-0">[{log.time}]</span>
                <span className={log.type === "success" ? "text-emerald-400 font-semibold" : log.type === "warning" ? "text-amber-300 font-semibold" : "text-white"}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
