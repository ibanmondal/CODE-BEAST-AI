"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ShieldCheck, 
  Layers, 
  Zap, 
  TestTube, 
  Database, 
  Fingerprint, 
  Cpu, 
  Award,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight
} from "lucide-react";
import { CodeBeastLiquidButton } from "@/components/ui/codebeast-liquid-button";

export interface AgentDetails {
  id: string;
  name: string;
  category: string;
  model: string;
  tech: string;
  iconName: string;
  description: string;
  evaluationMetrics: string[];
  sampleOutput: string;
  latencyAvg: string;
  researchCitation: string;
}

const AGENT_DATA: Record<string, AgentDetails> = {
  security: {
    id: "security",
    name: "AutoReview Security Evaluator",
    category: "VULNERABILITY & CWE REMEDIATION",
    model: "Google Gemini 2.5 Flash / Groq Llama 3.3",
    tech: "AST Slicing + OWASP Top 10 Taxonomy",
    iconName: "ShieldCheck",
    description: "Executes the 3-stage AutoReview sequential pipeline (ACM FSE 2025): Detects vulnerabilities against the CWE taxonomy, locates precise line ranges via AST code slicing, and synthesizes verifiable unified git diff patches.",
    evaluationMetrics: [
      "SQL Injection (CWE-89) AST Statement Slicing",
      "Hardcoded Credentials & Tokens (CWE-798)",
      "Unsanitized Cross-Site Scripting (CWE-79)",
      "Cryptographic Insecurities & Insecure Deserialization"
    ],
    sampleOutput: "LOCATE: database.py:L42-L47\nCWE-89 SQL Injection detected in cursor.execute formatted string.\nREPAIR: Synthesized parameterized cursor.execute with binding tuple.",
    latencyAvg: "2.1s",
    researchCitation: "AutoReview: Three-Stage Program Slicing for Automated CWE Remediation (ACM FSE 2025)"
  },
  architecture: {
    id: "architecture",
    name: "Architecture & Modularity Evaluator",
    category: "STRUCTURAL COHESION & SOLID",
    model: "Groq Llama 3.3 70B Versatile",
    tech: "Tree-Sitter Directed Graph Dependency Analysis",
    iconName: "Layers",
    description: "Evaluates dependency graph cyclic relationships, package coupling metrics, single-responsibility boundaries, and domain layer separation across multi-module codebases.",
    evaluationMetrics: [
      "Cyclomatic Complexity & Branch Depth",
      "Circular Import Detection & Module Coupling",
      "SOLID Architectural Conformance",
      "Layer Isolation (Controllers, Services, Repositories)"
    ],
    sampleOutput: "AFFINITY INDEX: 0.88\nCyclic Dependency: app.api.auth <-> app.services.users resolved.\nRecommended dependency inversion abstraction interface.",
    latencyAvg: "1.8s",
    researchCitation: "Deterministic AST Graph Slicing for Architectural Boundary Verification"
  },
  performance: {
    id: "performance",
    name: "Resource Performance & Algorithmic Scaling",
    category: "COMPUTE & ASYNC BOTTLENECKS",
    model: "Groq Llama 3.3 70B Versatile",
    tech: "Algorithmic Big-O AST Analysis + Memory Profiling",
    iconName: "Zap",
    description: "Scans for nested quadratic loop iterations O(n^2), synchronous blocking I/O inside asynchronous event loops, unindexed database collection lookups, and memory leaks.",
    evaluationMetrics: [
      "Big-O Algorithmic Time & Space Bounds",
      "Event-Loop Blocking Synchronous Operations",
      "Memory Allocation Pools & Garbage Collection Pressure",
      "Concurrent Connection Throttling & Connection Pooling"
    ],
    sampleOutput: "EFFICIENCY: 88/100\nDetected blocking time.sleep() call inside async def worker handler.\nRemediated to non-blocking asyncio.sleep().",
    latencyAvg: "1.4s",
    researchCitation: "Static Asynchronous Event-Loop Blocking Detection in Modern Python Runtimes"
  },
  testing: {
    id: "testing",
    name: "Testing & CI Flakiness Evaluator",
    category: "COVERAGE & ASSERTION VALIDITY",
    model: "Groq Llama 3.1 8B Instant",
    tech: "PyTest / Jest AST Test Suite Inspection",
    iconName: "TestTube",
    description: "Audits assertion density per test function, mocks isolation, non-deterministic sleep or timestamp race conditions, and edge-case boundary verification.",
    evaluationMetrics: [
      "Assertion Density (Assertions / Function LOC)",
      "Mock Isolation & External Network Leakage",
      "Flaky Timing Race-Condition Vulnerabilities",
      "Boundary & Error-Path Branch Coverage"
    ],
    sampleOutput: "SUITE AUDIT: 42 test cases analyzed across 5 test suites.\nZero unmocked network sockets. Assertion density: 2.8 per test method.",
    latencyAvg: "1.1s",
    researchCitation: "Assertion Density Metrics as Predictors of Software Regression Defect Rates"
  },
  database: {
    id: "database",
    name: "Database & Schema Engine Evaluator",
    category: "TRANSACTION INTEGRITY & QUERY HYGIENE",
    model: "Google Gemini 2.5 Flash",
    tech: "SQLAlchemy & ORM Query Slicing",
    iconName: "Database",
    description: "Detects classic ORM N+1 query antipatterns, missing composite indexes on frequently filtered foreign keys, long-running transaction locks, and improper connection handling.",
    evaluationMetrics: [
      "N+1 Query Detection across ORM Relationship Loaders",
      "Index Selectivity & Foreign Key Constraints",
      "Transaction Isolation Level Deadlock Risks",
      "Migration Script Idempotency & Rollback Safety"
    ],
    sampleOutput: "QUERY EFFICIENCY: 86/100\nDetected lazy-loaded foreign key in list traversal.\nSuggested selectinload / joinedload eager query optimization.",
    latencyAvg: "1.9s",
    researchCitation: "Automated Identification of Database Access Antipatterns in High-Throughput Web Applications"
  },
  similarity: {
    id: "similarity",
    name: "AST & CodeBERT Originality Engine",
    category: "PLAGIARISM & SEMANTIC CODE CLONES",
    model: "CodeBERT Transformer Vectors + FAISS",
    tech: "Normalized AST Statement Hashes + Neural Embeddings",
    iconName: "Fingerprint",
    description: "Surpasses simple text matching by normalizing source code into Abstract Syntax Trees, hashing structural tokens, and projecting semantic embeddings into a high-dimensional FAISS index to catch Type-1 through Type-4 semantic clones.",
    evaluationMetrics: [
      "Type-1 (Exact Matches with Whitespace Variations)",
      "Type-2 (Renamed Identifiers & Types)",
      "Type-3 (Inserted / Deleted Statements)",
      "Type-4 (Semantic Equivalents with Alternate Control Flow)"
    ],
    sampleOutput: "ORIGINALITY SCORE: 94/100\nCosine Distance in FAISS index: 0.14 vs. standard boilerplate templates.\nHigh structural novelty verified.",
    latencyAvg: "1.2s",
    researchCitation: "Deep Neural Code Representation for Semantic Clone Detection (IEEE TSE)"
  },
  dx: {
    id: "dx",
    name: "Developer Experience & Documentation",
    category: "CODE HEALTH & MAINTAINABILITY",
    model: "Groq Llama 3.1 8B Instant",
    tech: "Docstring Coverage & Typing Strictness",
    iconName: "Cpu",
    description: "Evaluates API documentation completeness, TypeScript / Python Type Annotations, clear error messages, and onboarding ease for new contributors.",
    evaluationMetrics: [
      "Public API Function Docstring Coverage",
      "Strict Type Annotation Ratio",
      "README Setup & Reproducibility Instructions",
      "Standard Linter & Formatter Configuration"
    ],
    sampleOutput: "DX SCORE: 85/100\nComprehensive type annotations present across 91% of functions.\nInteractive Swagger and OpenAPI definitions active.",
    latencyAvg: "1.0s",
    researchCitation: "Documentation Completeness and Developer Velocity in Enterprise Codebases"
  },
  finops: {
    id: "finops",
    name: "Cloud Cost & FinOps Efficiency",
    category: "INFRASTRUCTURE & COMPUTE OPTIMIZATION",
    model: "Google Gemini 2.5 Flash",
    tech: "Cloud Resource Mapping & Dockerfile Optimization",
    iconName: "Award",
    description: "Evaluates container layer caching, memory limits, excessive cloud egress patterns, and serverless cold-start footprint to maximize compute efficiency.",
    evaluationMetrics: [
      "Multi-stage Dockerfile Cache Optimization",
      "Container Base Image Attack Surface & Size",
      "Stateless Compute Autoscaling Readiness",
      "Network Egress & CDN Caching Policies"
    ],
    sampleOutput: "FINOPS SCORE: 88/100\nMulti-stage Docker build verified with Alpine base image.\nMinimal memory consumption on cold start.",
    latencyAvg: "1.5s",
    researchCitation: "Container Optimization and Cloud Compute Resource Minimization Strategies"
  }
};

interface ModalProps {
  agentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentInspectorModal({ agentId, isOpen, onClose }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const agent = (agentId && AGENT_DATA[agentId]) || AGENT_DATA.security;

  return (
    <AnimatePresence>
      {isOpen && agentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          
          {/* 1. Modal Scrim Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#040914]/85 backdrop-blur-md" 
          />

          {/* 2. Floating Liquid Glass Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#08132B] border border-[#387DE6]/35 rounded-2xl shadow-[0_24px_64px_rgba(2,6,18,0.9)] z-10 overflow-hidden text-white"
          >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B1A3A]/80 border-b border-[#387DE6]/25 backdrop-blur-md">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#58A6FF] uppercase block">
              {agent.category}
            </span>
            <h2 className="text-lg font-heading font-black text-white tracking-wide uppercase mt-0.5">
              {agent.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8EA6C8] hover:text-white hover:bg-[#0E2248] rounded-lg transition-colors cursor-pointer"
            title="Close dialog (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Metadata Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0B1A3A]/70 border border-[#387DE6]/25 rounded-xl shadow-xs">
              <span className="text-[10px] font-mono text-[#6C85AA] uppercase block mb-0.5">Model Engine</span>
              <span className="text-xs font-bold text-white font-mono block truncate">{agent.model}</span>
            </div>
            <div className="p-3 bg-[#0B1A3A]/70 border border-[#387DE6]/25 rounded-xl shadow-xs">
              <span className="text-[10px] font-mono text-[#6C85AA] uppercase block mb-0.5">Analysis Tech</span>
              <span className="text-xs font-bold text-[#58A6FF] font-mono block truncate">{agent.tech}</span>
            </div>
            <div className="p-3 bg-[#0B1A3A]/70 border border-[#387DE6]/25 rounded-xl shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-[#6C85AA] uppercase block mb-0.5">Inference Latency</span>
              <span className="text-xs font-bold text-[#89CFF0] font-mono block">{agent.latencyAvg}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-heading font-black uppercase tracking-wider text-white mb-1.5">
              Architectural Methodology
            </h3>
            <p className="text-xs text-[#8EA6C8] leading-relaxed">
              {agent.description}
            </p>
          </div>

          {/* Core Evaluation Metrics */}
          <div>
            <h3 className="text-xs font-heading font-black uppercase tracking-wider text-white mb-2">
              Verified Evaluation Dimensions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {agent.evaluationMetrics.map((metric, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-[#0B1A3A]/60 border border-[#387DE6]/20 rounded-xl text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#58A6FF] shrink-0 mt-0.5" />
                  <span className="text-[#8EA6C8] font-medium">{metric}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Output Terminal */}
          <div>
            <h3 className="text-xs font-heading font-black uppercase tracking-wider text-white mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#58A6FF]" />
              Sample Agent Synthesis Telemetry
            </h3>
            <pre className="p-4 bg-[#040914] text-[#89CFF0] font-mono text-[11px] leading-relaxed rounded-xl overflow-x-auto border border-[#387DE6]/30 shadow-inner">
              {agent.sampleOutput}
            </pre>
          </div>

          {/* Academic Citation */}
          <div className="p-3.5 bg-[#0B1A3A]/70 border border-[#387DE6]/25 rounded-xl text-[11px] text-white">
            <span className="font-bold block mb-0.5 text-[#58A6FF]">Academic Research Grounding:</span>
            <span className="text-[#8EA6C8] italic">{agent.researchCitation}</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0B1A3A]/80 border-t border-[#387DE6]/25 backdrop-blur-md">
          <span className="text-[11px] text-[#6C85AA] font-mono">
            LangGraph Parallel Node &bull; Operational
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 liquid-btn-primary text-xs font-bold rounded-lg cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
