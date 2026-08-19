# CodeBeast – Master Development Prompt

You are a Senior AI Architect and Senior Full Stack Engineer.

Your task is to build **CodeBeast**, a production-grade AI-powered GitHub Repository Intelligence Platform that automatically evaluates software repositories for hackathons, hiring, academic submissions, and code reviews.

This is NOT a chatbot.
This is NOT a code generator.
This is a repository intelligence platform that combines deterministic static analysis, semantic code understanding, multi-agent reasoning, plagiarism detection, and AI-generated reports.

The system should be modular, scalable, explainable, and cost-efficient.

---

# Primary Goal

Given a GitHub repository URL, CodeBeast should automatically:
* Clone the repository
* Extract repository metadata
* Build a semantic understanding of the repository
* Run multiple specialized AI agents in parallel
* Detect plagiarism
* Compute deterministic scores
* Apply hard-cap rules
* Generate evidence-backed explanations
* Produce a final professional report

The system should minimize LLM usage by using deterministic analysis wherever possible and reserve a large model only for final report synthesis.

---

# High-Level Pipeline

```text
GitHub URL
↓
GitHub Metadata Collector
↓
Repository Cloner
↓
Repository Context Builder
↓
Early Exit Engine
↓
LangGraph Orchestrator
↓
Parallel Specialized Agents
↓
Similarity Engine
↓
Deterministic Scoring Engine
↓
Gemini Supervisor
↓
Markdown + PDF + JSON Report
```

---

# Stage 1 – GitHub Metadata Collector
Responsibilities:
Extract:
* Repository name, Owner, Description, Topics, Stars, Forks
* Language distribution, Contributors, Branches, Commit history, Releases
* License, Issues, Pull Requests, Workflow files

Use: GitHub API, GitPython
Do not use any LLM.

---

# Stage 2 – Repository Cloner
Clone the repository locally.
Detect: Programming languages, Frameworks, Build systems, Configuration files, Docker, CI/CD, Documentation.

---

# Stage 3 – Repository Context Builder
The Context Builder analyzes the repository only once.
Generate: Repository graph, Folder tree, Module graph, Dependency graph, File summaries, README summary, API endpoints, Configuration summary, Test summary, Security metadata, Code embeddings.
Store embeddings inside FAISS.
All downstream agents must use this shared context instead of rescanning the repository.

---

# Stage 4 – Early Exit Engine
Reject repositories before any expensive inference.
Reject conditions: Empty repository, Single commit dump, Only README, Template-only repository, No source code, Invalid repository.
Future scope: Allow replacing rule-based logic with an ML classifier trained on repository metadata.

---

# Stage 5 – LangGraph Orchestrator
Use LangGraph as the orchestration framework.
Requirements: Shared state, Parallel execution, Retry handling, Agent communication, Conditional routing, Structured outputs, Checkpointing.
Do not use CrewAI as the main orchestration framework.

---

# Specialized Agents
Each agent receives only the relevant context retrieved from the Context Builder.
Agents must never analyze the entire repository independently.
All agents must return structured JSON.

## Agent 1 – Security
Responsibilities: Hardcoded secrets, API keys, SQL Injection, XSS, Unsafe dependencies, Dangerous permissions, Credential leaks, Security best practices.
Preferred Model: Qwen2.5-Coder (Fine-tuned Local)

## Agent 2 – Architecture
Responsibilities: Folder organization, Layer separation, Design patterns, Modularity, Scalability, Maintainability, SOLID principles, Project structure.
Preferred Model: DeepSeek-Coder (Local) or Gemini

## Agent 3 – Developer Experience (DX)
Responsibilities: README quality, Documentation, Code comments, CI/CD, Docker, Tests, Setup experience.
Preferred Model: Qwen2.5-Instruct (Local) or Gemini

## Agent 4 – Originality
This agent should primarily rely on deterministic methods.
Pipeline: Tree-sitter -> AST -> CodeBERT Embeddings -> FAISS -> Similarity -> Optional Local LLM Verification
Responsibilities: Detect copied logic, Detect template cloning, Detect AI-generated scaffolding, Detect repository similarity.
Do not rely solely on LLM reasoning.

---

# Similarity Engine
Use: Tree-sitter, AST comparison, CodeBERT embeddings, FAISS vector search.
Compare: Functions, Classes, Modules, API structure, I/O patterns.
Output: Similarity score.
If similarity exceeds 80%: Raise Red Plagiarism Alert.

---

# Deterministic Scoring Engine
The scoring engine should never use LLMs.
Apply Hard Caps.
Examples: Single commit (Max score = 30), No tests (Max score = 60), Template repository (Max score = 40), Plagiarism (Final score = 0).
Return: Final score, Individual scores, Evidence, Confidence.

---

# Gemini Supervisor
Gemini is used only once.
Responsibilities: Receive JSON outputs, Scores, Evidence, Findings.
Generate: Executive summary, Strengths, Weaknesses, Recommendations, Professional report, Markdown output, PDF-ready output.
Gemini must never analyze raw repository code.

---

# Offline Mode
If Gemini or Local models are unavailable, fallback to deterministic heuristics. The system must never fail.

---

# Backend
Use: FastAPI, PostgreSQL, Redis, Celery, GitPython, FAISS.

---

# Frontend
Use: Next.js, TailwindCSS, shadcn/ui.
Features: Repository input, Live analysis, Agent status, Score dashboard, Evidence explorer, PDF export, Markdown export, JSON export.

---

# Future Roadmap
Do not implement now.
Design the system so that later it supports: LoRA fine-tuned agents, Fine-tuned CodeBERT similarity model, ML-based Early Exit classifier, Local report generation replacing Gemini.

---

# Engineering Principles
The system must prioritize: Modular architecture, Low API cost, High explainability, Deterministic scoring, Evidence-backed reports, Parallel execution, Scalable design, Production-ready code, Type safety, Unit testing, Logging, Monitoring.

---

# Deliverables
Build a complete, production-ready application with:
* Clean architecture
* Modular codebase
* Well-defined APIs
* LangGraph orchestration
* Multi-agent execution
* Context Builder
* Similarity Engine
* Scoring Engine
* Professional UI
* Docker support
* Comprehensive documentation

---

**Do not over-engineer the first version. Build a complete MVP first with clean extension points for future fine-tuning, additional agents, and model replacements. Prioritize a working end-to-end pipeline over implementing every advanced optimization immediately.**
