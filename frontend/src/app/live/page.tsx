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
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";

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

  // Stopwatch for running jobs
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
    // Initial fetch of latest job state if available
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    fetch(`http://${host}:8000/api/v1/stats/history`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[0];
          setPipeline((prev) => {
            if (prev.task_id && prev.globalStatus === "Running") return prev;
            
            const isCompleted = latest.status === "Completed";
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
      .catch((e) => console.log("Failed to load initial history:", e));

    // Connect WebSocket with Auto-Reconnect
    function connectWS() {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return;
      }

      const wsUrl = `ws://${host}:8000/api/v1/ws/updates`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        addLog("Real-time WebSocket connected to pipeline runner", "success");
      };

      ws.onclose = () => {
        setWsConnected(false);
        addLog("WebSocket disconnected. Auto-reconnecting in 2.5s...", "warning");
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
            } else if (data.task_id && !prev.task_id) {
              current.task_id = data.task_id;
              current.repo_url = data.repo_url;
            }
            
            if (data.repo_url) {
              current.repo_url = data.repo_url;
            }

            // Handle global task status
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

            if (data.status === "Failed") {
              current.globalStatus = "Failed";
              if (current.ingestion === "running") current.ingestion = "error";
              if (current.supervisor === "running") current.supervisor = "error";
              Object.keys(current.agents).forEach(k => {
                if (current.agents[k as keyof typeof current.agents] === "running") {
                  current.agents[k as keyof typeof current.agents] = "error";
                }
              });
              addLog(`Job execution encountered an error`, "warning");
              return current;
            }

            if (data.status === "Running") {
              current.globalStatus = "Running";
            }

            // Handle granular agent status
            if (data.status === "AgentRunning") {
              current.globalStatus = "Running";
              if (data.agent === "ingestion") {
                current.ingestion = "running";
                addLog("GitHub Ingestion: Cloning repository & building FAISS index...", "agent");
              } else if (data.agent === "gemini_supervisor") {
                current.ingestion = "completed";
                Object.keys(current.agents).forEach(k => {
                  current.agents[k as keyof typeof current.agents] = "completed";
                });
                current.supervisor = "running";
                addLog("Executive Supervisor: ConsJudge multi-pass consensus synthesis started...", "agent");
              } else if (data.agent in current.agents) {
                current.ingestion = "completed";
                current.agents[data.agent as keyof typeof current.agents] = "running";
                addLog(`Dispatched ${data.agent.replace('_', ' ').toUpperCase()}...`, "agent");
              }
            } else if (data.status === "AgentCompleted") {
              if (data.agent === "ingestion") {
                current.ingestion = "completed";
                addLog("GitHub Ingestion completed.", "success");
              } else if (data.agent === "gemini_supervisor") {
                current.ingestion = "completed";
                Object.keys(current.agents).forEach(k => {
                  current.agents[k as keyof typeof current.agents] = "completed";
                });
                current.supervisor = "completed";
                current.globalStatus = "Completed";
                addLog("Executive Supervisor synthesized final report.", "success");
              } else if (data.agent in current.agents) {
                current.ingestion = "completed";
                current.agents[data.agent as keyof typeof current.agents] = "completed";
                addLog(`✓ ${data.agent.replace('_', ' ').toUpperCase()} finished analysis.`, "success");
              }
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
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Helper to render nodes
  const renderNode = (
    title: string, 
    state: NodeState, 
    Icon: any, 
    subtitle?: string,
    isLarge: boolean = false
  ) => {
    let borderClass = "border-gray-800 bg-[#0F1523]";
    let textClass = "text-gray-500";
    let iconAnim = "";

    if (state === "running") {
      borderClass = "border-blue-500 bg-blue-900/20 shadow-[0_0_20px_rgba(59,130,246,0.6)] ring-1 ring-blue-400";
      textClass = "text-blue-400";
      iconAnim = "animate-pulse";
    } else if (state === "completed") {
      borderClass = "border-green-500/80 bg-green-950/20 shadow-[0_0_12px_rgba(34,197,94,0.3)]";
      textClass = "text-green-400";
    } else if (state === "error") {
      borderClass = "border-red-500 bg-red-950/30";
      textClass = "text-red-400";
    }

    return (
      <div className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-500 ${borderClass} ${isLarge ? 'w-64 h-32' : 'w-44 h-32'}`}>
        <Icon className={`w-8 h-8 mb-2 ${textClass} ${iconAnim}`} />
        <span className={`text-sm font-semibold text-center ${state === 'idle' ? 'text-gray-500' : 'text-gray-100'}`}>{title}</span>
        {subtitle && <span className="text-xs text-gray-400 mt-1">{subtitle}</span>}
        {state === "running" && (
          <div className="absolute top-2 right-2">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>
        )}
        {state === "completed" && (
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Live Evaluation Animation
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" /> LangGraph Orchestrated
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Watch the AI multi-agent pipeline evaluate repositories in real-time over WebSockets.</p>
        </div>

        {/* WebSocket Connection Diagnostic Badge */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            wsConnected 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60' 
              : 'bg-amber-950/40 text-amber-300 border-amber-800/60'
          }`}>
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
            <Radio className="w-3.5 h-3.5" />
            <span>{wsConnected ? 'WebSocket Live: 8000' : 'WebSocket Reconnecting...'}</span>
          </div>

          {pipeline.globalStatus === "Running" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-blue-950/50 text-blue-300 border border-blue-800">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{elapsedSeconds}s elapsed</span>
            </div>
          )}
        </div>
      </div>
      
      {!pipeline.task_id ? (
        <div className="flex flex-col items-center justify-center h-72 border border-dashed border-gray-800 rounded-2xl bg-[#0F1523]/60 backdrop-blur-md">
          <Loader2 className="w-10 h-10 text-gray-600 animate-spin mb-4" />
          <h2 className="text-lg font-medium text-gray-300">Waiting for a job to start...</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
            Trigger a repository evaluation from the <strong className="text-blue-400">Analysis</strong> or <strong className="text-blue-400">Upload</strong> page to see real-time streaming agent node state.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-6 space-y-10 relative">
          
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">{pipeline.repo_url}</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-mono border border-blue-800/50">
                Job ID: {pipeline.task_id?.split('-')[0]}...
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                pipeline.globalStatus === 'Running' ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50 animate-pulse' :
                pipeline.globalStatus === 'Completed' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' :
                'bg-zinc-800 text-gray-400'
              }`}>
                {pipeline.globalStatus}
              </span>
            </div>
          </div>

          {/* Stage 1: Ingestion */}
          <div className="flex flex-col items-center relative z-10">
            {renderNode("GitHub Ingestion", pipeline.ingestion, GitBranch, "Clone & FAISS Vectorize", true)}
          </div>

          {/* Vertical line connecting Stage 1 to Stage 2 */}
          <div className="w-1 h-12 bg-gray-800 relative rounded-full overflow-hidden">
             <div className={`absolute inset-0 bg-blue-500 transition-all duration-1000 origin-top ${pipeline.ingestion === 'completed' ? 'scale-y-100 shadow-[0_0_12px_#3b82f6]' : 'scale-y-0'}`}></div>
          </div>

          {/* Stage 2: Parallel Execution Box */}
          <div className="w-full border-2 border-gray-800/90 rounded-3xl p-8 relative bg-gradient-to-b from-[#0F1523] to-[#0A0E17]/80 backdrop-blur-sm shadow-xl">
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#0A0E17] border border-gray-800 px-4 py-0.5 rounded-full text-xs font-semibold text-gray-400">
              Parallel Multi-Agent Execution Layer
            </div>
            
            <div className="flex flex-wrap justify-center gap-5 mt-2">
              {renderNode("Security Agent", pipeline.agents.security_agent, ShieldAlert, "Llama 3.3 (Groq)")}
              {renderNode("Architecture Agent", pipeline.agents.architecture_agent, Layout, "Llama 3.3 (Groq)")}
              {renderNode("Performance Agent", pipeline.agents.performance_agent, Zap, "Llama 3.3 (Groq)")}
              {renderNode("Testing Agent", pipeline.agents.testing_agent, TestTube, "Llama 3.1 8B (Groq)")}
              {renderNode("Database Agent", pipeline.agents.database_agent, Database, "Gemini Flash / Groq")}
              {renderNode("Similarity Agent", pipeline.agents.similarity_agent, Fingerprint, "AST & CodeBERT")}
            </div>
          </div>

          {/* Vertical line connecting Stage 2 to Stage 3 */}
          <div className="w-1 h-12 bg-gray-800 relative rounded-full overflow-hidden">
             <div className={`absolute inset-0 bg-blue-500 transition-all duration-1000 origin-top ${(Object.values(pipeline.agents).every(s => s === 'completed')) ? 'scale-y-100 shadow-[0_0_12px_#3b82f6]' : 'scale-y-0'}`}></div>
          </div>

          {/* Stage 3: Supervisor */}
          <div className="flex flex-col items-center relative z-10">
            {renderNode("Executive Supervisor", pipeline.supervisor, BrainCircuit, "ConsJudge Multi-Pass", true)}
          </div>

          {/* Final state Button */}
          {pipeline.globalStatus === "Completed" && (
            <div className="mt-6 animate-fade-in-up flex gap-4">
              <button 
                onClick={() => router.push('/analysis')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all hover:scale-[1.02]"
              >
                View in Repository Analysis <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Live Real-time WebSocket Event Log Stream */}
          <div className="w-full mt-8 bg-[#090D16] border border-gray-800/90 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span>Live Event Stream (Redis / WebSockets)</span>
              </div>
              <span className="text-[11px] text-gray-500 font-mono">channel: job_updates</span>
            </div>
            
            <div className="space-y-1.5 font-mono text-xs max-h-36 overflow-y-auto pr-2">
              {logs.length === 0 ? (
                <div className="text-gray-600 italic">Listening for live pipeline events...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-gray-300">
                    <span className="text-gray-600 shrink-0">[{log.time}]</span>
                    <span className={
                      log.type === "success" ? "text-emerald-400" :
                      log.type === "warning" ? "text-amber-400" :
                      log.type === "agent" ? "text-blue-400" : "text-gray-300"
                    }>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
