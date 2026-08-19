"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Zap, 
  TestTube, 
  Database, 
  Sparkles,
  Activity,
  ArrowUpRight,
  Fingerprint,
  CheckCircle2,
  GitBranch
} from "lucide-react";

interface AgentNode {
  id: string;
  name: string;
  role: string;
  icon: any;
  // Normalized 3D position [-1 to 1]
  x: number;
  y: number;
  z: number;
  score: number;
  telemetry: {
    status: string;
    metric: string;
    subtext: string;
  };
}

const AGENT_NODES: AgentNode[] = [
  {
    id: "core",
    name: "INTELLIGENCE CORE",
    role: "Consensus Supervisor & LLM Arbiter",
    icon: Cpu,
    x: 0,
    y: 0,
    z: 0.15,
    score: 96,
    telemetry: {
      status: "DUAL-PASS CONSENSUS ACTIVE",
      metric: "ConsJudge 99.4% Confidence",
      subtext: "Gemini Flash + Groq Llama 3.3 Arbiter"
    }
  },
  {
    id: "architecture",
    name: "ARCHITECTURE",
    role: "AST Hierarchy & Modularity",
    icon: Layers,
    x: 0,
    y: -0.78,
    z: 0.05,
    score: 88,
    telemetry: {
      status: "AST SLICING OPERATIONAL",
      metric: "SOLID Index 94.2%",
      subtext: "High Cohesion / Low Coupling"
    }
  },
  {
    id: "security",
    name: "SECURITY",
    role: "AutoReview 3-Stage CWE Auditor",
    icon: ShieldCheck,
    x: 0.72,
    y: -0.38,
    z: -0.05,
    score: 94,
    telemetry: {
      status: "CWE VULNERABILITY SCANNER",
      metric: "Zero Critical Vectors",
      subtext: "Auto-Synthesized Git Diffs Ready"
    }
  },
  {
    id: "performance",
    name: "PERFORMANCE",
    role: "Time/Memory Complexity",
    icon: Zap,
    x: 0.68,
    y: 0.42,
    z: 0.08,
    score: 91,
    telemetry: {
      status: "ASYMPTOTIC PROFILING",
      metric: "O(n) Algorithmic Bound",
      subtext: "Resource Allocation Optimal"
    }
  },
  {
    id: "testing",
    name: "TESTING",
    role: "Regression & Test Matrices",
    icon: TestTube,
    x: 0,
    y: 0.78,
    z: -0.08,
    score: 85,
    telemetry: {
      status: "COVERAGE MATRIX VERIFIED",
      metric: "91.8% Branch Coverage",
      subtext: "Deterministic Regression Passes"
    }
  },
  {
    id: "database",
    name: "DATABASE",
    role: "Schema & ACID Integrity",
    icon: Database,
    x: -0.68,
    y: 0.42,
    z: 0.06,
    score: 89,
    telemetry: {
      status: "SCHEMA RELIABILITY AUDIT",
      metric: "Zero N+1 Query Bottlenecks",
      subtext: "Foreign Key & Index Optimized"
    }
  },
  {
    id: "originality",
    name: "ORIGINALITY",
    role: "CodeBERT Clone Detector",
    icon: Sparkles,
    x: -0.72,
    y: -0.38,
    z: -0.06,
    score: 98,
    telemetry: {
      status: "VECTOR COSINE EMBEDDINGS",
      metric: "0% Template Clones",
      subtext: "AST Semantic Uniqueness Verified"
    }
  }
];

// Structural Connections
const CONNECTIONS = [
  // Star hub to core
  { from: "core", to: "architecture" },
  { from: "core", to: "security" },
  { from: "core", to: "performance" },
  { from: "core", to: "testing" },
  { from: "core", to: "database" },
  { from: "core", to: "originality" },
  // Outer perimeter mesh
  { from: "architecture", to: "security" },
  { from: "security", to: "performance" },
  { from: "performance", to: "testing" },
  { from: "testing", to: "database" },
  { from: "database", to: "originality" },
  { from: "originality", to: "architecture" },
  // Cross synapsing
  { from: "originality", to: "performance" },
  { from: "security", to: "database" },
  { from: "architecture", to: "testing" }
];

export function NeuralMesh3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeNode, setActiveNode] = useState<AgentNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Mouse / Camera coordinates
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false });
  const timeRef = useRef(0);

  // Projected screen coordinates for DOM overlays
  const [projectedNodes, setProjectedNodes] = useState<
    Array<AgentNode & { screenX: number; screenY: number; scale: number; depth: number; opacity: number }>
  >([]);

  // Initialize and run high performance canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;

    // Sub-synaptic background particles
    const bgParticles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      baseAlpha: number;
      pulseSpeed: number;
    }> = [];

    const PARTICLE_COUNT = 32;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 0.3 + Math.random() * 0.85;
      const angle = Math.random() * Math.PI * 2;
      bgParticles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: (Math.random() - 0.5) * 0.6,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: (Math.random() - 0.5) * 0.0006,
        vz: (Math.random() - 0.5) * 0.0004,
        size: 1.5 + Math.random() * 2.5,
        baseAlpha: 0.15 + Math.random() * 0.35,
        pulseSpeed: 1.5 + Math.random() * 2.5
      });
    }

    // Data-flow pulses along connections
    const pulses: Array<{
      connIndex: number;
      progress: number;
      speed: number;
      size: number;
      color: string;
    }> = [];

    const PULSE_COUNT = 16;
    for (let i = 0; i < PULSE_COUNT; i++) {
      pulses.push({
        connIndex: Math.floor(Math.random() * CONNECTIONS.length),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005,
        size: 2.2 + Math.random() * 2,
        color: Math.random() > 0.3 ? "#FF8C42" : "#FFA04A"
      });
    }

    // Resize handler with high-DPI crispness
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const render = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;

      if (!canvas || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      // 3D Pitch and Yaw angles with organic ambient drift
      const yaw = mouseRef.current.x * 0.35 + Math.sin(t * 0.3) * 0.08;
      const pitch = -mouseRef.current.y * 0.25 + Math.cos(t * 0.25) * 0.06;

      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      const fov = 750;
      const centerX = width / 2;
      const centerY = height / 2;

      // 3D Projection Helper (Enhanced Proximity & Scale)
      const project = (x: number, y: number, z: number, scaleMultiplier = 1) => {
        // Apply Yaw (Y-axis rotation)
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        // Apply Pitch (X-axis rotation)
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP + 1.95; // Closer camera distance for larger 3D presence

        const scale = (fov / (fov + z2 * 220)) * scaleMultiplier;
        const screenX = centerX + x1 * width * 0.53 * scale;
        const screenY = centerY + y2 * height * 0.53 * scale;

        return { screenX, screenY, scale, depth: z2 };
      };

      // 1. Draw Concentric Ambient 3D Energy Rings in Background
      ctx.save();
      const ringGlow = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, width * 0.52);
      ringGlow.addColorStop(0, "rgba(255, 140, 66, 0.16)");
      ringGlow.addColorStop(0.5, "rgba(224, 122, 72, 0.06)");
      ringGlow.addColorStop(1, "rgba(20, 8, 4, 0)");
      ctx.fillStyle = ringGlow;
      ctx.fillRect(0, 0, width, height);

      // Rotating dashed orbital rings projected in 3D
      const RING_SEGMENTS = 48;
      [0.55, 1.05].forEach((ringRadius, rIdx) => {
        ctx.beginPath();
        for (let i = 0; i <= RING_SEGMENTS; i++) {
          const theta = (i / RING_SEGMENTS) * Math.PI * 2 + (rIdx === 0 ? t * 0.12 : -t * 0.08);
          const rx = Math.cos(theta) * ringRadius;
          const ry = Math.sin(theta) * ringRadius;
          const p = project(rx, ry, (rIdx - 0.5) * 0.1);
          if (i === 0) ctx.moveTo(p.screenX, p.screenY);
          else ctx.lineTo(p.screenX, p.screenY);
        }
        ctx.strokeStyle = rIdx === 0 ? "rgba(224, 122, 72, 0.22)" : "rgba(255, 140, 66, 0.15)";
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.restore();

      // 2. Update and Render Sub-synapse background particles
      bgParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        if (Math.abs(p.x) > 1.1) p.vx *= -1;
        if (Math.abs(p.y) > 1.1) p.vy *= -1;
        if (Math.abs(p.z) > 0.5) p.vz *= -1;

        const proj = project(p.x, p.y, p.z);
        const alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(t * p.pulseSpeed));

        ctx.beginPath();
        ctx.arc(proj.screenX, proj.screenY, p.size * proj.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 176, 133, ${Math.max(0, Math.min(1, alpha))})`;
        ctx.shadowColor = "#FF8C42";
        ctx.shadowBlur = 6 * proj.scale;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Project Major 7 Agent Nodes with Rock-Solid Stable Anchors (No Jitter)
      const currentProjected = AGENT_NODES.map((node) => {
        // Organic floating wobble
        const floatZ = Math.sin(t * 1.5 + node.x * 2) * 0.02;
        const floatY = Math.cos(t * 1.2 + node.y * 2) * 0.015;

        const isCore = node.id === "core";
        const zBase = isCore ? 0.12 : 0;

        // Keep projected coordinate center 100% stable (scale via CSS/Framer Motion only)
        const proj = project(node.x, node.y + floatY, node.z + floatZ + zBase, 1);

        // Distance from cursor in screen space
        const dx = proj.screenX - (centerX + mouseRef.current.x * width * 0.5);
        const dy = proj.screenY - (centerY + mouseRef.current.y * height * 0.5);
        const dist = Math.sqrt(dx * dx + dy * dy);

        return {
          ...node,
          screenX: proj.screenX,
          screenY: proj.screenY,
          scale: proj.scale,
          depth: proj.depth,
          opacity: Math.max(0.6, Math.min(1, 1.4 - proj.depth * 0.3)),
          dist
        };
      });

      // Update projected nodes for DOM interaction overlay
      setProjectedNodes(currentProjected);

      // Node Map for Connection Lookups
      const nodeMap = new Map(currentProjected.map((n) => [n.id, n]));

      // 4. Draw Connecting Dynamic Lines (Synaptic Energy Streams)
      CONNECTIONS.forEach((conn, index) => {
        const from = nodeMap.get(conn.from);
        const to = nodeMap.get(conn.to);
        if (!from || !to) return;

        const isConnectedToHovered = hoveredNodeId === from.id || hoveredNodeId === to.id;
        const isCoreConn = from.id === "core" || to.id === "core";

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(from.screenX, from.screenY);
        ctx.lineTo(to.screenX, to.screenY);

        // Subtle gradient line
        const grad = ctx.createLinearGradient(from.screenX, from.screenY, to.screenX, to.screenY);
        if (isConnectedToHovered) {
          grad.addColorStop(0, "rgba(255, 140, 66, 0.85)");
          grad.addColorStop(0.5, "rgba(255, 176, 133, 0.95)");
          grad.addColorStop(1, "rgba(255, 140, 66, 0.85)");
          ctx.lineWidth = 2.4 * from.scale;
          ctx.shadowColor = "#FF8C42";
          ctx.shadowBlur = 12;
        } else if (isCoreConn) {
          const pulse = 0.35 + 0.25 * Math.sin(t * 2 + index);
          grad.addColorStop(0, `rgba(255, 140, 66, ${pulse})`);
          grad.addColorStop(0.5, `rgba(224, 122, 72, ${pulse * 0.7})`);
          grad.addColorStop(1, `rgba(255, 140, 66, ${pulse})`);
          ctx.lineWidth = 1.6 * from.scale;
          ctx.shadowColor = "#E07A48";
          ctx.shadowBlur = 6;
        } else {
          grad.addColorStop(0, "rgba(224, 122, 72, 0.22)");
          grad.addColorStop(1, "rgba(224, 122, 72, 0.22)");
          ctx.lineWidth = 1.0 * from.scale;
        }

        ctx.strokeStyle = grad;
        ctx.stroke();
        ctx.restore();
      });

      // 5. Draw Animated Data-Flow Pulses Along Connections
      pulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) {
          pulse.progress = 0;
          pulse.connIndex = Math.floor(Math.random() * CONNECTIONS.length);
        }

        const conn = CONNECTIONS[pulse.connIndex];
        const from = nodeMap.get(conn.from);
        const to = nodeMap.get(conn.to);
        if (!from || !to) return;

        // Interpolate position along line
        const px = from.screenX + (to.screenX - from.screenX) * pulse.progress;
        const py = from.screenY + (to.screenY - from.screenY) * pulse.progress;
        const pScale = from.scale + (to.scale - from.scale) * pulse.progress;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, pulse.size * pScale, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.shadowColor = "#FF8C42";
        ctx.shadowBlur = 10 * pScale;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hoveredNodeId]);

  // Pointer movement tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
    mouseRef.current.isHovering = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    mouseRef.current.isHovering = false;
    setHoveredNodeId(null);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-6xl mx-auto h-[740px] sm:h-[800px] lg:h-[860px] flex items-center justify-center select-none overflow-visible rounded-3xl -mt-6 sm:-mt-10"
    >
      {/* 1. Deep HTML5 3D Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl z-10"
      />

      {/* 2. Interactive 3D Nodes DOM Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto z-20 overflow-visible">
        {projectedNodes.map((node) => {
          const Icon = node.icon;
          const isCore = node.id === "core";
          const isHovered = hoveredNodeId === node.id;
          const isSelected = activeNode?.id === node.id;

          const baseNodeSize = isCore ? 134 : 96;
          const size = baseNodeSize * node.scale;

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: `${node.screenX}px`,
                top: `${node.screenY}px`,
                transform: "translate(-50%, -50%)",
                zIndex: isHovered || isSelected ? 40 : isCore ? 30 : 25
              }}
              className="flex flex-col items-center cursor-pointer group p-3 select-none"
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => setActiveNode(node)}
            >
              {/* Glowing Pulse Rings on Hover/Active */}
              <AnimatePresence>
                {(isHovered || isSelected) && (
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: [1, 1.35, 1.6], opacity: [0.7, 0.35, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2.0, ease: "easeOut" }}
                    className="absolute rounded-full border border-[#FF8C42]/80 pointer-events-none"
                    style={{ width: `${size * 1.4}px`, height: `${size * 1.4}px`, pointerEvents: "none" }}
                  />
                )}
              </AnimatePresence>

              {/* Node Orb Geometry */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                  width: `${size}px`,
                  height: `${size}px`
                }}
                className={`rounded-full p-0.5 relative flex items-center justify-center transition-colors duration-300 ${
                  isCore
                    ? "bg-gradient-to-tr from-[#E07A48] via-[#FF8C42] to-[#FFB085] shadow-[0_0_65px_rgba(224,122,72,0.9)]"
                    : isHovered || isSelected
                    ? "bg-gradient-to-tr from-[#E07A48] to-[#FF8C42] shadow-[0_0_45px_rgba(255,140,66,0.8)]"
                    : "bg-[#281309] border border-[#E07A48]/50 shadow-[0_0_25px_rgba(224,122,72,0.35)] hover:border-[#FF8C42]"
                }`}
              >
                {/* Internal Ambient Core Fill */}
                <div className="w-full h-full rounded-full bg-[#170904] flex flex-col items-center justify-center text-center p-2.5 border border-[#E07A48]/40 overflow-hidden relative">
                  {/* Subtle Shimmer Ray */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FF8C42]/15 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                  <Icon
                    style={{
                      width: isCore ? `${size * 0.36}px` : `${size * 0.40}px`,
                      height: isCore ? `${size * 0.36}px` : `${size * 0.40}px`
                    }}
                    className={`transition-colors relative z-10 ${
                      isCore || isHovered || isSelected
                        ? "text-[#FF8C42] fill-current"
                        : "text-[#D4BC9A] group-hover:text-[#FF8C42]"
                    }`}
                  />

                  {isCore && (
                    <span className="font-display text-xs sm:text-sm tracking-widest text-[#D4BC9A] font-bold mt-1 relative z-10 leading-none">
                      CORE
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Node Label Below */}
              <div className="mt-2.5 text-center pointer-events-none" style={{ pointerEvents: "none" }}>
                <span
                  className={`font-display text-sm sm:text-base tracking-widest uppercase transition-colors duration-200 block whitespace-nowrap ${
                    isCore
                      ? "text-[#FF8C42] font-bold drop-shadow-[0_2px_14px_rgba(224,122,72,0.6)]"
                      : isHovered || isSelected
                      ? "text-white font-bold"
                      : "text-amber-100/85 group-hover:text-[#FF8C42]"
                  }`}
                >
                  {node.name}
                </span>
                {!isCore && (
                  <span className="text-[10px] sm:text-[11px] font-mono text-amber-200/50 block uppercase tracking-wider font-semibold">
                    SCORE: {node.score}
                  </span>
                )}
              </div>

              {/* 3D Floating Telemetry HUD Hover Badge */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{ pointerEvents: "none" }}
                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-3 rounded-2xl bg-[#140803]/95 border border-[#FF8C42]/70 shadow-[0_15px_35px_rgba(0,0,0,0.95)] backdrop-blur-xl pointer-events-none z-50 text-left space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#FF8C42] border-b border-[#E07A48]/30 pb-1">
                      <span className="font-bold tracking-wider">{node.telemetry.status}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-xs font-mono font-bold text-[#D4BC9A]">
                      {node.telemetry.metric}
                    </div>
                    <div className="text-[10px] text-amber-200/60 font-normal">
                      {node.telemetry.subtext}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* 3. Deep Telemetry Dossier Modal on Node Click */}
      <AnimatePresence>
        {activeNode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070402]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg rounded-3xl bg-[#120703] border border-[#E07A48]/60 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-[#D4BC9A] space-y-5"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-[#E07A48]/20 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#231109] border border-[#E07A48]/40 text-[#FF8C42]">
                    <activeNode.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-200/60 uppercase tracking-wider block">
                      NODE_TELEMETRY // {activeNode.id.toUpperCase()}
                    </span>
                    <h3 className="font-display text-2xl text-[#D4BC9A] uppercase tracking-wide">
                      {activeNode.name}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveNode(null)}
                  className="w-8 h-8 rounded-full bg-[#1F0F08] border border-[#E07A48]/30 flex items-center justify-center text-amber-200/70 hover:text-white hover:border-[#FF8C42] transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Role & Score Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#180A04] border border-[#E07A48]/25 space-y-0.5">
                  <span className="text-[10px] font-mono text-amber-200/50 uppercase">Agent Domain</span>
                  <p className="text-xs font-mono font-bold text-[#FF8C42]">{activeNode.role}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#180A04] border border-[#E07A48]/25 space-y-0.5">
                  <span className="text-[10px] font-mono text-amber-200/50 uppercase">Evaluation Weight</span>
                  <p className="text-xs font-mono font-bold text-emerald-400">{activeNode.score}/100 Confirmed</p>
                </div>
              </div>

              {/* Real-Time Telemetry Description */}
              <div className="p-4 rounded-2xl bg-[#1A0B05] border border-[#E07A48]/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FF8C42] font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{activeNode.telemetry.status}</span>
                </div>
                <p className="text-xs text-amber-100/75 leading-relaxed font-normal">
                  {activeNode.telemetry.subtext}. Operates concurrently within the 6-agent LangGraph parallel topology with sub-second WebSocket telemetry streaming.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setActiveNode(null)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#E07A48] to-[#FF8C42] text-[#0D0805] font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  DISMISS NODE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
