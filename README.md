# CodeBeast – Master Development Roadmap

CodeBeast is a production-grade AI-powered GitHub Repository Intelligence Platform that automatically evaluates software repositories for hackathons, hiring, academic submissions, and code reviews.

This document serves as the **Master Checklist and Roadmap**. We will build the project sequentially, strictly following these phases from start to finish.

---

## 🟢 Phase 1: Project Setup & Infrastructure *(Completed)*
**Goal:** Scaffold the monorepo, set up the backend/frontend frameworks, and configure the local infrastructure.
- [x] Scaffold Next.js frontend with Tailwind CSS and shadcn/ui.
- [x] Scaffold FastAPI backend with `requirements.txt`.
- [x] Create core backend architecture (`main.py`, config, routers, SQLAlchemy models).
- [x] Configure Docker Compose with PostgreSQL, Redis, and Ollama (with auto-pull scripts for `qwen2.5-coder` and `deepseek-coder`).

---

## 🟢 Phase 2: Data Ingestion & Context Building *(Completed)*
**Goal:** Fetch, clone, and build a deterministic understanding of a repository.
- [x] **Stage 1: GitHub Metadata Collector**
  - Extract repo name, description, stars, forks, languages, topics via GitHub API.
- [x] **Stage 2: Repository Cloner**
  - Use `GitPython` to securely clone repositories to a local temporary directory.
- [x] **Stage 3: Repository Context Builder**
  - Generate a repository folder tree.
  - Parse files to create summaries and extract dependencies.
  - (MVP) Generate basic code embeddings and store them in local FAISS.

---

## 🟢 Phase 3: Core Analysis Engine *(Completed)*
**Goal:** Implement fast, non-LLM-based evaluations to save compute and enforce strict rules.
- [x] **Stage 4: Early Exit Engine**
  - Implement heuristics to reject empty repos, single-commit dumps, or template-only repositories before any LLM processing.
- [x] **Similarity Engine (Plagiarism Detection)**
  - Implement AST parsing (e.g., using `tree-sitter` or native parsers).
  - Compare repository structure and logic against known templates.
  - Raise "Red Plagiarism Alerts" if similarity > 80%.
- [x] **Deterministic Scoring Engine**
  - Apply hard caps (e.g., No tests = Max 60 points).
  - Calculate baseline scores without using LLMs.

---

## 🟢 Phase 4: AI Agent Orchestration (LangGraph) *(Completed)*
**Goal:** Run specialized agents in parallel using local LLMs (via Ollama).
- [x] **Initialize LangGraph State**
  - Define the shared state object passed between agents.
- [x] **Agent 1: Security**
  - Prompt `qwen2.5-coder` to analyze the Context Builder output for hardcoded secrets, bad permissions, and unsafe dependencies.
- [x] **Agent 2: Architecture**
  - Prompt `deepseek-coder` to analyze folder organization, layer separation, and SOLID principles.
- [x] **Agent 3: Developer Experience (DX)**
  - Prompt `qwen2.5-instruct` (or fallback) to analyze README quality, setup experience, and CI/CD presence.
- [x] **Parallel Execution**
  - Configure LangGraph to run these three agents concurrently and aggregate their JSON outputs.

---

## 🟢 Phase 5: Synthesis & Reporting
**Goal:** Generate the final executive summary and deliverable reports using a large model.
- [x] **Gemini Supervisor**
  - Implement `Gemini Supervisor` node to synthesize agent reports into a final JSON payload.
  - Implement final structured output schema (Executive Summary, Strengths, Weaknesses, Score).
- [x] **Report Generation**
  - Output results as structured JSON.
  - Generate a formatted Markdown report.
  - (Optional for MVP) Generate a PDF version of the report.

---

## 🟢 Phase 6: Web Dashboard & API Integration *(Completed)*
**Goal:** Connect the backend pipeline to the frontend and build a beautiful UI.
- [x] **Celery Background Tasks**
  - Move the LangGraph execution into a Celery background worker to prevent API timeouts.
- [x] **Backend Status API**
  - Implement endpoints for the frontend to poll analysis status (`PENDING`, `ANALYZING`, `COMPLETED`).
- [x] **Next.js Dashboard UI**
  - Build a sleek input form for GitHub URLs.
  - Build a live loading screen showing agent status.
  - Build the final Score Dashboard and Evidence Explorer UI.

---

## 🟢 Phase 7: Advanced Optimizations & Deployment *(Completed)*
**Goal:** Prepare the system for production deployment.
- [x] **Offline Mode Fallback**
  - Ensure the pipeline completes using purely deterministic scoring if Ollama/Gemini are down.
- [x] **Production Dockerization**
  - Write `Dockerfile` for the FastAPI backend and Celery workers.
  - Write `Dockerfile` for the Next.js frontend.
- [x] **Documentation & Cleanup**
  - Ensure all APIs are documented via Swagger.
  - Final pass on codebase modularity and error handling.
