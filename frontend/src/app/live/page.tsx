"use client";

import { useEffect, useState, useRef } from "react";
import { 
  GitBranch, 
  ShieldAlert, 
  Layout, 
  Zap, 
  TestTube, 
  Database, 
  BrainCircuit, 
  CheckCircle2, 
  Loader2,
  ArrowRight
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
  };
  supervisor: NodeState;
  globalStatus: "idle" | "Running" | "Completed" | "Failed";
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
  },
  supervisor: "idle",
  globalStatus: "idle"
};

export default function LiveAnimationPage() {
  const [pipeline, setPipeline] = useState<PipelineState>(initialPipelineState);
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/api/v1/ws/updates`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Update state based on incoming events
        setPipeline((prev) => {
          const newState = { ...prev };
          
          if (data.task_id) {
            // If it's a new task, reset everything
            if (prev.task_id !== data.task_id) {
              return {
                ...initialPipelineState,
                task_id: data.task_id,
                repo_url: data.repo_url,
                globalStatus: "Running"
              };
            }
            newState.repo_url = data.repo_url;
          }

          // State Catch-up: If any agent other than ingestion is running/completed, ingestion must be completed.
          if (data.agent !== "ingestion" && data.agent !== "gemini_supervisor" && data.status) {
            newState.ingestion = "completed";
          }
          if (data.agent === "gemini_supervisor" && data.status) {
            newState.ingestion = "completed";
            Object.keys(newState.agents).forEach(k => {
              newState.agents[k as keyof typeof newState.agents] = "completed";
            });
          }

          if (data.status === "AgentRunning") {
            if (data.agent === "ingestion") newState.ingestion = "running";
            else if (data.agent === "gemini_supervisor") newState.supervisor = "running";
            else if (data.agent in newState.agents) {
              newState.agents[data.agent as keyof typeof newState.agents] = "running";
            }
          } else if (data.status === "AgentCompleted") {
            if (data.agent === "ingestion") newState.ingestion = "completed";
            else if (data.agent === "gemini_supervisor") newState.supervisor = "completed";
            else if (data.agent in newState.agents) {
              newState.agents[data.agent as keyof typeof newState.agents] = "completed";
            }
          } else if (data.status === "Completed" || data.status === "Failed") {
            newState.globalStatus = data.status;
            if (data.status === "Completed") {
              // Ensure all states show as completed if the global job finished
              newState.ingestion = "completed";
              Object.keys(newState.agents).forEach(k => {
                newState.agents[k as keyof typeof newState.agents] = "completed";
              });
              newState.supervisor = "completed";
            }
          }

          return newState;
        });
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
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
      borderClass = "border-blue-500 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.5)]";
      textClass = "text-blue-400";
      iconAnim = "animate-pulse";
    } else if (state === "completed") {
      borderClass = "border-green-500 bg-green-900/10 shadow-[0_0_10px_rgba(34,197,94,0.3)]";
      textClass = "text-green-400";
    } else if (state === "error") {
      borderClass = "border-red-500 bg-red-900/10";
      textClass = "text-red-400";
    }

    return (
      <div className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-500 ${borderClass} ${isLarge ? 'w-64 h-32' : 'w-40 h-32'}`}>
        <Icon className={`w-8 h-8 mb-2 ${textClass} ${iconAnim}`} />
        <span className={`text-sm font-semibold text-center ${state === 'idle' ? 'text-gray-500' : 'text-gray-100'}`}>{title}</span>
        {subtitle && <span className="text-xs text-gray-500 mt-1">{subtitle}</span>}
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Evaluation Animation</h1>
        <p className="text-gray-400 text-sm mt-1">Watch the AI multi-agent pipeline evaluate repositories in real-time.</p>
      </div>
      
      {!pipeline.task_id ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-800 rounded-xl bg-[#0F1523]">
          <Loader2 className="w-10 h-10 text-gray-600 animate-spin mb-4" />
          <h2 className="text-lg text-gray-400">Waiting for a job to start...</h2>
          <p className="text-sm text-gray-600 mt-2">Go to the dashboard and evaluate a repository to watch it live.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-10 space-y-12 relative">
          
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-white mb-2">{pipeline.repo_url}</h2>
            <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-mono">
              Job ID: {pipeline.task_id.split('-')[0]}...
            </span>
          </div>

          {/* Stage 1: Ingestion */}
          <div className="flex flex-col items-center relative z-10">
            {renderNode("GitHub Ingestion", pipeline.ingestion, GitBranch, "Clone & FAISS Vectorize", true)}
          </div>

          {/* Vertical line connecting Stage 1 to Stage 2 */}
          <div className="w-1 h-12 bg-gray-800 relative">
             <div className={`absolute inset-0 bg-blue-500 transition-all duration-1000 origin-top ${pipeline.ingestion === 'completed' ? 'scale-y-100 shadow-[0_0_10px_#3b82f6]' : 'scale-y-0'}`}></div>
          </div>

          {/* Stage 2: Parallel Execution Box */}
          <div className="w-full border-2 border-gray-800 rounded-2xl p-8 relative bg-gradient-to-b from-[#0F1523] to-transparent">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#0A0E17] px-4 text-sm font-semibold text-gray-500">
              Parallel Agent Execution
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              {renderNode("Security Agent", pipeline.agents.security_agent, ShieldAlert, "Qwen 2.5 Coder")}
              {renderNode("Architecture Agent", pipeline.agents.architecture_agent, Layout, "DeepSeek Coder")}
              {renderNode("Performance Agent", pipeline.agents.performance_agent, Zap, "Qwen 2.5 Coder")}
              {renderNode("Testing Agent", pipeline.agents.testing_agent, TestTube, "Llama 3.1 8B")}
              {renderNode("Database Agent", pipeline.agents.database_agent, Database, "Gemini 2.5 Flash")}
            </div>
          </div>

          {/* Vertical line connecting Stage 2 to Stage 3 */}
          <div className="w-1 h-12 bg-gray-800 relative">
             <div className={`absolute inset-0 bg-blue-500 transition-all duration-1000 origin-top ${(Object.values(pipeline.agents).every(s => s === 'completed')) ? 'scale-y-100 shadow-[0_0_10px_#3b82f6]' : 'scale-y-0'}`}></div>
          </div>

          {/* Stage 3: Supervisor */}
          <div className="flex flex-col items-center relative z-10">
            {renderNode("Executive Supervisor", pipeline.supervisor, BrainCircuit, "Gemini 2.5 Flash", true)}
          </div>

          {/* Final state */}
          {pipeline.globalStatus === "Completed" && (
            <div className="mt-12 animate-fade-in-up">
              <button 
                onClick={() => router.push('/reports')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
              >
                View Final Report <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
