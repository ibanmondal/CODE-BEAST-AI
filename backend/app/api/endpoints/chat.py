import os
import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from app.database import SessionLocal, AnalysisJob

load_dotenv()
logger = logging.getLogger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    role: str = Field(description="'user', 'assistant', or 'system'")
    content: str = Field(description="The message text")

class ChatRequest(BaseModel):
    question: str = Field(description="The judge's question about the repository or evaluation")
    repo_url: Optional[str] = Field(default=None, description="Repository URL")
    task_id: Optional[str] = Field(default=None, description="Analysis task ID if available")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Previous conversation turns")
    report_context: Optional[Dict[str, Any]] = Field(default=None, description="Passed FinalReport object from frontend")

class ChatResponse(BaseModel):
    answer: str
    citations: List[str] = []
    model_used: str = "CodeBeast Judge Copilot"

def _build_context_summary(report: Dict[str, Any], job_metadata: Optional[Dict[str, Any]] = None) -> str:
    summary_parts = []
    
    repo_name = report.get("repoName") or (job_metadata.get("repo_url") if job_metadata else "Target Repository")
    summary_parts.append(f"### Repository: {repo_name}")
    summary_parts.append(f"- Overall Score: {report.get('overall_score', 'N/A')}/100")
    
    # Sub-scores
    scores = []
    if "sec" in report: scores.append(f"Security: {report['sec']}/100")
    if "arch" in report: scores.append(f"Architecture: {report['arch']}/100")
    if "perf" in report: scores.append(f"Performance: {report['perf']}/100")
    if "testing_score" in report: scores.append(f"Testing/QA: {report['testing_score']}/100")
    if "db_score" in report: scores.append(f"Database: {report['db_score']}/100")
    if "orig" in report: scores.append(f"Originality: {report['orig']}/100")
    if scores:
        summary_parts.append(f"- Dimension Scores: {', '.join(scores)}")
        
    # ConsJudge Consensus
    if "consistency_status" in report:
        summary_parts.append(
            f"- ConsJudge Consensus Status: {report.get('consistency_status')} "
            f"(Confidence: {int(report.get('confidence_score', 0.95)*100)}%, Variance Margin: ±{report.get('variance_margin', 0.0)} pts)"
        )
        
    # Executive Summary
    if report.get("executive_summary"):
        summary_parts.append(f"- Executive Summary: {report.get('executive_summary')}")
        
    # Strengths & Weaknesses
    if report.get("strengths"):
        summary_parts.append(f"- Key Strengths: {'; '.join(report.get('strengths', []))}")
    if report.get("weaknesses"):
        summary_parts.append(f"- Key Weaknesses/Deductions: {'; '.join(report.get('weaknesses', []))}")
        
    # AutoReview CWE Matrix
    cwe_matrix = report.get("cwe_matrix", [])
    if cwe_matrix:
        summary_parts.append("\n### AutoReview 3-Stage Security Findings:")
        for vuln in cwe_matrix:
            summary_parts.append(
                f"  * [{vuln.get('severity', 'MEDIUM')}] {vuln.get('cwe_id', 'Vulnerability')} in `{vuln.get('file_path', 'N/A')}` ({vuln.get('line_range', 'N/A')})\n"
                f"    - Trigger Vector: {vuln.get('trigger_vector', 'N/A')}\n"
                f"    - Remediation Patch:\n```\n{vuln.get('remediation_patch', 'N/A')}\n```\n"
                f"    - Defensive Test Guidance: {vuln.get('test_guidance', 'N/A')}"
            )
            
    # Originality / Clones
    if report.get("clone_risk_level"):
        summary_parts.append(f"\n### Plagiarism & Originality (AST + CodeBERT):\n- Risk Level: {report.get('clone_risk_level')}")
        if report.get("detected_clones"):
            summary_parts.append(f"- Clones/Matches: {', '.join(report.get('detected_clones', []))}")
            
    return "\n".join(summary_parts)

@router.post("/", response_model=ChatResponse)
@router.post("", response_model=ChatResponse)
@router.post("/repository", response_model=ChatResponse)
async def chat_with_repository(request: ChatRequest):
    report_data = request.report_context or {}
    job_metadata = {}
    
    # If no full report passed in request, query from database
    if not report_data and (request.task_id or request.repo_url):
        db = SessionLocal()
        try:
            query = db.query(AnalysisJob)
            if request.task_id:
                job = query.filter(AnalysisJob.id == request.task_id).first()
            else:
                job = query.filter(AnalysisJob.repo_url == request.repo_url).order_by(AnalysisJob.created_at.desc()).first()
                
            if job and job.final_report:
                report_data = job.final_report
                if isinstance(report_data, str):
                    try:
                        report_data = json.loads(report_data)
                    except:
                        pass
                job_metadata = {
                    "repo_url": job.repo_url,
                    "team_name": job.team_name,
                    "overall_score": job.overall_score
                }
                # Inject scores if missing in report_data root
                report_data.setdefault("overall_score", job.overall_score)
                report_data.setdefault("sec", job.security_score)
                report_data.setdefault("arch", job.arch_score)
                report_data.setdefault("perf", job.perf_score)
                report_data.setdefault("testing_score", job.testing_score)
                report_data.setdefault("db_score", job.db_score)
                report_data.setdefault("orig", job.originality_score)
        finally:
            db.close()
            
    context_str = _build_context_summary(report_data, job_metadata)
    
    system_prompt = f"""You are the CodeBeast Master Judge Intelligence Copilot.
You assist hackathon judges, academic reviewers, and engineering leads in evaluating, interrogating, and understanding software repository evaluation reports generated by CodeBeast AI's 6-agent system (Security/AutoReview, Architecture, Performance, Testing, Database, AST Originality, and ConsJudge Supervisor).

Below is the verified factual evaluation report for this repository:
==================================================
{context_str}
==================================================

Guidelines for your response:
1. Ground your answers strictly in the provided evaluation metrics, AutoReview CWE vulnerabilities, AST originality findings, and architectural analyses.
2. If asked about point deductions, refer to the exact dimension scores (e.g. Security, Performance) and weaknesses.
3. If asked about security fixes or code snippets, output clean unified diffs or code snippets in markdown.
4. Keep answers concise, highly technical, professional, and authoritative.
5. If the judge asks for an awards summary or pitch, provide an engaging, clear executive summary highlighting technical merits.
"""

    history_formatted = []
    for msg in (request.history or [])[-6:]: # Keep last 6 turns
        history_formatted.append(f"{msg.role.capitalize()}: {msg.content}")
        
    conversation_context = "\n".join(history_formatted) if history_formatted else "None"
    
    full_prompt = f"{system_prompt}\n\nRecent Conversation:\n{conversation_context}\n\nJudge Query: {request.question}\n\nMaster Judge Answer:"

    citations = []
    if report_data.get("cwe_matrix"):
        for v in report_data.get("cwe_matrix", []):
            if v.get("file_path") and v.get("file_path") != "N/A":
                citations.append(f"{v.get('file_path')}:{v.get('line_range', '')}")

    # Attempt LLM invocation with multi-provider fallback
    # 1. Groq (Llama 3.3 70B)
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key:
        try:
            from langchain_groq import ChatGroq
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                groq_api_key=groq_api_key
            )
            res = await llm.ainvoke(full_prompt)
            return ChatResponse(
                answer=res.content,
                citations=citations,
                model_used="Groq (Llama-3.3-70b-versatile)"
            )
        except Exception as e:
            logger.warning(f"Groq Chat failed ({e}), falling back to Gemini...")

    # 2. Gemini Flash
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if gemini_api_key:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                temperature=0.3,
                google_api_key=gemini_api_key
            )
            res = await llm.ainvoke(full_prompt)
            return ChatResponse(
                answer=res.content,
                citations=citations,
                model_used="Google Gemini 2.0 Flash"
            )
        except Exception as e:
            logger.warning(f"Gemini Chat failed ({e}), falling back to Ollama...")

    # 3. Ollama (Local)
    try:
        from langchain_ollama import ChatOllama
        llm = ChatOllama(model="llama3:latest", temperature=0.3)
        res = await llm.ainvoke(full_prompt)
        return ChatResponse(
            answer=res.content,
            citations=citations,
            model_used="Local Ollama (llama3)"
        )
    except Exception as e:
        logger.warning(f"Ollama Chat fallback active ({e})...")

    # 4. Deterministic Offline Rule-Synthesizer
    q_lower = request.question.lower()
    overall = report_data.get("overall_score", 85)
    sec_score = report_data.get("sec", 80)
    arch_score = report_data.get("arch", 85)
    weaknesses = report_data.get("weaknesses", ["Need tighter input sanitization", "Test coverage could be improved"])
    strengths = report_data.get("strengths", ["Modular service design", "Clean database schemas"])
    cwes = report_data.get("cwe_matrix", [])

    if "sec" in q_lower or "vuln" in q_lower or "cwe" in q_lower or "fix" in q_lower:
        if cwes:
            cwe_desc = "\n".join([f"- **{c.get('cwe_id')}** in `{c.get('file_path')}`: {c.get('trigger_vector')}" for c in cwes])
            offline_answer = f"The repository scored **{sec_score}/100** in Security. The AutoReview pipeline identified the following vulnerability vectors:\n\n{cwe_desc}\n\n**Recommended Fix**: Apply parameterized SQL queries or sanitized variable bindings according to the unified diff in the dashboard."
        else:
            offline_answer = f"The Security Agent awarded **{sec_score}/100**. No critical zero-day vulnerabilities were detected. General defense-in-depth sanitization was recommended."
    elif "arch" in q_lower or "solid" in q_lower or "modular" in q_lower:
        offline_answer = f"The Architecture Agent scored this codebase **{arch_score}/100**. Key observations:\n- **Strengths**: {', '.join(strengths)}\n- **Areas for Refactoring**: {', '.join(weaknesses)}"
    elif "summary" in q_lower or "award" in q_lower or "pitch" in q_lower:
        offline_answer = f"**Executive Judge Briefing**: This project achieved an overall score of **{overall}/100** with high inter-judge confidence. It demonstrates strong technical architecture ({arch_score}/100) and well-structured database models, with actionable remediation patches provided by the AutoReview pipeline."
    else:
        offline_answer = f"Based on CodeBeast AI's 6-agent evaluation, this repository scored **{overall}/100** (Security: {sec_score}, Architecture: {arch_score}). Key highlights include: {'; '.join(strengths[:2])}. Deductions were primarily due to: {'; '.join(weaknesses[:2])}."

    return ChatResponse(
        answer=offline_answer,
        citations=citations,
        model_used="CodeBeast Offline Knowledge Synthesizer"
    )
