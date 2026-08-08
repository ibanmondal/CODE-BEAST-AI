import os
import json
import asyncio
import redis
from dotenv import load_dotenv

load_dotenv()

from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from app.agents.state import AgentState
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(redis_url)

def broadcast_agent_status(task_id, repo_url, status, agent_name):
    if task_id:
        try:
            payload = json.dumps({
                "task_id": task_id,
                "repo_url": repo_url,
                "status": status,
                "agent": agent_name
            })
            redis_client.publish("job_updates", payload)
            redis_client.set("last_eval_task", payload)
        except Exception as e:
            print(f"Redis publish error: {e}")

class SecurityReport(BaseModel):
    vulnerabilities_found: list[str] = Field(default_factory=list, description="List of security vulnerabilities found.")
    risk_level: str = Field(default="UNKNOWN", description="Overall risk level: LOW, MEDIUM, HIGH, CRITICAL")
    recommendations: list[str] = Field(default_factory=list, description="Actionable security recommendations.")
    security_score: int = Field(default=0, description="Score from 0-100 indicating how secure the codebase is.")

class ArchitectureReport(BaseModel):
    patterns_identified: list[str] = Field(default_factory=list, description="Architectural patterns identified (e.g., MVC, Microservices).")
    modularity_score: int = Field(default=0, description="Score from 0-100 indicating how modular the codebase is.")
    concerns: list[str] = Field(default_factory=list, description="Any architectural concerns or violations of SOLID principles.")

class PerformanceReport(BaseModel):
    algorithmic_complexity: str = Field(default="UNKNOWN", description="Assessment of algorithmic complexity and efficiency.")
    resource_optimization: str = Field(default="UNKNOWN", description="Assessment of resource usage, caching, and async operations.")
    perf_score: int = Field(default=0, description="Score from 0-100 indicating performance and efficiency.")

class TestingReport(BaseModel):
    test_coverage: str = Field(default="UNKNOWN", description="Description of the test coverage (e.g., none, partial, extensive).")
    frameworks_used: list[str] = Field(default_factory=list, description="Testing frameworks used (e.g., jest, pytest).")
    testing_score: int = Field(default=0, description="Score from 0-100 indicating the quality and presence of tests.")

class DatabaseReport(BaseModel):
    schema_quality: str = Field(default="UNKNOWN", description="Quality of the database schema design.")
    orms_used: list[str] = Field(default_factory=list, description="ORMs or DB libraries used.")
    db_score: int = Field(default=0, description="Score from 0-100 indicating database modeling quality.")

class FinalReport(BaseModel):
    executive_summary: str = Field(description="A high level summary of the repository's quality.")
    strengths: list[str] = Field(description="List of key strengths.")
    weaknesses: list[str] = Field(description="List of key weaknesses.")
    overall_score: int = Field(description="Final score out of 100.")
    security_score: int = Field(description="Security score out of 100 passed from the Security Report.")
    arch_score: int = Field(description="Architecture score out of 100 passed from the Architecture Report.")
    perf_score: int = Field(description="Performance score out of 100 passed from the Performance Report.")
    testing_score: int = Field(description="Testing score out of 100 passed from the Testing Report.")
    db_score: int = Field(description="Database score out of 100 passed from the Database Report.")
    originality_score: int = Field(description="Originality score out of 100 passed from the Deterministic Score.")
    confidence_score: float = Field(default=0.95, description="Confidence score from 0.0 to 1.0 based on inter-judge consistency.")
    variance_margin: float = Field(default=0.0, description="Margin of score variance (± points) across consensus passes.")
    consistency_status: str = Field(default="HIGH_CONFIDENCE", description="'HIGH_CONFIDENCE', 'MODERATE_CONFIDENCE', or 'LOW_CONFIDENCE'")
    judge_passes: int = Field(default=2, description="Number of judge evaluation passes completed.")

# --- Helper to format context ---
def format_context(state: AgentState) -> str:
    ctx = state.get("context", {})
    return f"""
Directory Tree:
{ctx.get('directory_tree', 'N/A')}

Dependencies:
{', '.join(ctx.get('dependencies', []))}

README Content:
{ctx.get('readme_content', 'N/A')[:2000]} # Truncated for token limits
"""

def retrieve_code_snippets(faiss_path: str, query: str) -> str:
    if not faiss_path or not os.path.exists(faiss_path):
        return "No code snippets available."
    try:
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vectorstore = FAISS.load_local(faiss_path, embeddings, allow_dangerous_deserialization=True)
        docs = vectorstore.similarity_search(query, k=4)
        snippets = "\n\n".join([f"--- snippet from {d.metadata.get('source', 'unknown')} ---\n{d.page_content}" for d in docs])
        return snippets[:3000] # Cap length
    except Exception as e:
        print(f"FAISS Retrieval Error: {e}")
        return "Failed to retrieve code snippets."

# --- Nodes ---

async def security_agent_node(state: AgentState) -> dict:
    print("-> Running Security Agent (Groq / Ollama fallback)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "security_agent")
    parser = JsonOutputParser(pydantic_object=SecurityReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Security Engineer. Analyze the provided repository context and code snippets and output a JSON report matching the schema. Focus on hardcoded secrets, dangerous dependencies, and permissions.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    faiss_path = state.get("context", {}).get("faiss_index_path", "")
    snippets = retrieve_code_snippets(faiss_path, "authentication authorization passwords tokens secrets API keys SQL database queries permissions")
    invoke_data = {
        "context": format_context(state),
        "snippets": snippets,
        "format_instructions": parser.get_format_instructions()
    }
    
    # Try Groq first for ultra-fast evaluation
    try:
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1, api_key=os.getenv("GROQ_API_KEY"))
        chain = prompt | llm | parser
        report = await chain.ainvoke(invoke_data)
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "security_agent")
        return {"security_report": report}
    except Exception as e:
        print(f"Security Agent Groq failed ({e}), falling back to Ollama...")
        try:
            llm_fallback = ChatOllama(model="qwen2.5-coder", temperature=0.1, format="json")
            chain = prompt | llm_fallback | parser
            report = await chain.ainvoke(invoke_data)
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "security_agent")
            return {"security_report": report}
        except Exception as e2:
            print(f"Security Agent Fallback Failed: {e2}")
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "security_agent")
            return {"security_report": {"error": "Offline Mode: Security Agent unreachable."}}

async def architecture_agent_node(state: AgentState) -> dict:
    print("-> Running Architecture Agent (Groq / Ollama fallback)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "architecture_agent")
    parser = JsonOutputParser(pydantic_object=ArchitectureReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Software Architect. Analyze the provided repository context and code snippets (especially the folder structure and dependencies) and output a JSON report matching the schema. Focus on layer separation, modularity, and SOLID principles.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    faiss_path = state.get("context", {}).get("faiss_index_path", "")
    snippets = retrieve_code_snippets(faiss_path, "class interface architecture model view controller repository service pattern component module")
    invoke_data = {
        "context": format_context(state),
        "snippets": snippets,
        "format_instructions": parser.get_format_instructions()
    }
    
    try:
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1, api_key=os.getenv("GROQ_API_KEY"))
        chain = prompt | llm | parser
        report = await chain.ainvoke(invoke_data)
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "architecture_agent")
        return {"architecture_report": report}
    except Exception as e:
        print(f"Architecture Agent Groq failed ({e}), falling back to Ollama...")
        try:
            llm_fallback = ChatOllama(model="deepseek-coder", temperature=0.1, format="json")
            chain = prompt | llm_fallback | parser
            report = await chain.ainvoke(invoke_data)
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "architecture_agent")
            return {"architecture_report": report}
        except Exception as e2:
            print(f"Architecture Agent Fallback Failed: {e2}")
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "architecture_agent")
            return {"architecture_report": {"error": "Offline Mode: Architecture Agent unreachable."}}

async def performance_agent_node(state: AgentState) -> dict:
    print("-> Running Performance Agent (Groq / Ollama fallback)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "performance_agent")
    parser = JsonOutputParser(pydantic_object=PerformanceReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Performance & Efficiency Expert. Analyze the provided repository context and code snippets and output a JSON report matching the schema. Focus on algorithmic complexity, asynchronous operations, query optimization, and resource usage.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    faiss_path = state.get("context", {}).get("faiss_index_path", "")
    snippets = retrieve_code_snippets(faiss_path, "performance async await cache optimize complexity algorithm loop memory efficiency")
    invoke_data = {
        "context": format_context(state),
        "snippets": snippets,
        "format_instructions": parser.get_format_instructions()
    }
    
    try:
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2, api_key=os.getenv("GROQ_API_KEY"))
        chain = prompt | llm | parser
        report = await chain.ainvoke(invoke_data)
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "performance_agent")
        return {"perf_report": report}
    except Exception as e:
        print(f"Performance Agent Groq failed ({e}), falling back to Ollama...")
        try:
            llm_fallback = ChatOllama(model="qwen2.5-coder", temperature=0.3, format="json") 
            chain = prompt | llm_fallback | parser
            report = await chain.ainvoke(invoke_data)
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "performance_agent")
            return {"perf_report": report}
        except Exception as e2:
            print(f"Performance Agent Fallback Failed: {e2}")
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "performance_agent")
            return {"perf_report": {"error": "Offline Mode: Performance Agent unreachable."}}

async def testing_agent_node(state: AgentState) -> dict:
    print("-> Running Testing Agent (llama-3.1-8b-instant via Groq / fallback)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "testing_agent")
    parser = JsonOutputParser(pydantic_object=TestingReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert QA and Testing Engineer. Analyze the provided repository context and code snippets and output a JSON report matching the schema. Focus on the presence and quality of unit/integration tests.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    faiss_path = state.get("context", {}).get("faiss_index_path", "")
    snippets = retrieve_code_snippets(faiss_path, "test testing pytest jest mock assert spec coverage unit integration")
    invoke_data = {
        "context": format_context(state),
        "snippets": snippets,
        "format_instructions": parser.get_format_instructions()
    }
    
    try:
        llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1, api_key=os.getenv("GROQ_API_KEY"))
        chain = prompt | llm | parser
        report = await chain.ainvoke(invoke_data)
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "testing_agent")
        return {"testing_report": report}
    except Exception as e:
        print(f"Testing Agent Groq failed ({e}), falling back to Ollama...")
        try:
            llm_fallback = ChatOllama(model="qwen2.5-coder", temperature=0.1, format="json")
            chain = prompt | llm_fallback | parser
            report = await chain.ainvoke(invoke_data)
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "testing_agent")
            return {"testing_report": report}
        except Exception as e2:
            print(f"Testing Agent Fallback Failed: {e2}")
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "testing_agent")
            return {"testing_report": {"test_coverage": "none", "frameworks_used": [], "testing_score": 0}}

async def database_agent_node(state: AgentState) -> dict:
    print("-> Running Database Agent (gemini-flash-latest / Groq fallback)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "database_agent")
    
    parser = JsonOutputParser(pydantic_object=DatabaseReport)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Database Architect. Analyze the provided repository context and code snippets and output a JSON report matching the schema. Focus on schemas, ORM usage, queries, and data models.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    faiss_path = state.get("context", {}).get("faiss_index_path", "")
    snippets = retrieve_code_snippets(faiss_path, "database schema ORM Prisma SQLAlchemy query table model SQL MongoDB PostgreSQL")
    invoke_data = {
        "context": format_context(state),
        "snippets": snippets,
        "format_instructions": parser.get_format_instructions()
    }
    
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.1, api_key=os.getenv("GEMINI_API_KEY"))
        chain = prompt | llm | parser
        report = await chain.ainvoke(invoke_data)
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "database_agent")
        return {"db_report": report}
    except Exception as e:
        print(f"Gemini Database Agent failed ({e}), falling back to Groq...")
        try:
            llm_fallback = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1, api_key=os.getenv("GROQ_API_KEY"))
            chain = prompt | llm_fallback | parser
            report = await chain.ainvoke(invoke_data)
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "database_agent")
            return {"db_report": report}
        except Exception as e2:
            print(f"Database Agent Fallback Failed: {e2}")
            broadcast_agent_status(task_id, repo_url, "AgentCompleted", "database_agent")
            return {"db_report": {"error": "Database Agent unreachable."}}

async def gemini_supervisor_node(state: AgentState) -> dict:
    print("-> Running Supervisor Node with ConsJudge Multi-Pass Consistency...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "gemini_supervisor")
    
    # Read outputs
    sec = state.get("security_report", {})
    arch = state.get("architecture_report", {})
    perf = state.get("perf_report", {})
    test_rep = state.get("testing_report", {})
    db_rep = state.get("db_report", {})
    det_score = state.get("deterministic_score_result", {})
    
    parser = JsonOutputParser(pydantic_object=FinalReport)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an Executive AI Supervisor. You receive sub-reports from Security, Architecture, Performance, Testing, and Database agents, along with a deterministic score. Synthesize them into a single, cohesive final JSON report matching the schema. EXTREMELY IMPORTANT: You MUST include the exact `security_score`, `arch_score`, `perf_score`, `testing_score`, `db_score`, and `originality_score` from the input reports into your final JSON.\n{format_instructions}"),
        ("user", "Security:\n{sec}\n\nArchitecture:\n{arch}\n\nPerformance:\n{perf}\n\nTesting:\n{test_rep}\n\nDatabase:\n{db_rep}\n\nDeterministic Score:\n{det_score}")
    ])
    
    invoke_args = {
        "sec": json.dumps(sec, indent=2),
        "arch": json.dumps(arch, indent=2),
        "perf": json.dumps(perf, indent=2),
        "test_rep": json.dumps(test_rep, indent=2),
        "db_rep": json.dumps(db_rep, indent=2),
        "det_score": json.dumps(det_score, indent=2),
        "format_instructions": parser.get_format_instructions()
    }
    
    async def run_single_pass(model_type: str, temp: float):
        try:
            if model_type == "gemini" and os.getenv("GEMINI_API_KEY"):
                llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=temp, api_key=os.getenv("GEMINI_API_KEY"))
            elif os.getenv("GROQ_API_KEY"):
                llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=temp, api_key=os.getenv("GROQ_API_KEY"))
            else:
                llm = ChatOllama(model="qwen2.5-coder", temperature=temp, format="json")
            chain = prompt | llm | parser
            return await chain.ainvoke(invoke_args)
        except Exception as err:
            print(f"Supervisor pass ({model_type}, temp={temp}) failed: {err}")
            return None

    # Run dual-pass consensus concurrently
    passes = await asyncio.gather(
        run_single_pass("gemini", 0.1),
        run_single_pass("groq", 0.3)
    )
    valid_passes = [p for p in passes if p and isinstance(p, dict) and "overall_score" in p]
    
    if len(valid_passes) >= 2:
        p1, p2 = valid_passes[0], valid_passes[1]
        s1 = float(p1.get("overall_score", 0))
        s2 = float(p2.get("overall_score", 0))
        diff = abs(s1 - s2)
        variance_margin = round(diff / 2.0, 1)
        mean_score = int(round((s1 + s2) / 2.0))
        
        if diff <= 5.0:
            status = "HIGH_CONFIDENCE"
            conf_score = round(max(0.85, 1.0 - (diff / 50.0)), 2)
        elif diff <= 10.0:
            status = "MODERATE_CONFIDENCE"
            conf_score = round(max(0.70, 0.90 - (diff / 40.0)), 2)
        else:
            status = "LOW_CONFIDENCE"
            conf_score = round(max(0.50, 0.70 - (diff / 30.0)), 2)
            
        final_rep = p1
        final_rep["overall_score"] = mean_score
        final_rep["variance_margin"] = variance_margin
        final_rep["confidence_score"] = conf_score
        final_rep["consistency_status"] = status
        final_rep["judge_passes"] = len(valid_passes)
        
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "gemini_supervisor")
        return {"final_report": final_rep}
    elif len(valid_passes) == 1:
        p = valid_passes[0]
        p["variance_margin"] = 0.0
        p["confidence_score"] = 0.85
        p["consistency_status"] = "MODERATE_CONFIDENCE"
        p["judge_passes"] = 1
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "gemini_supervisor")
        return {"final_report": p}
    else:
        # Fallback to deterministic scoring
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "gemini_supervisor")
        score = det_score.get("score", 0) if isinstance(det_score, dict) else 0
        return {"final_report": {
            "executive_summary": "Offline Mode: Full AI synthesis was unavailable due to network or quota errors. This report was generated using the deterministic scoring engine.",
            "strengths": ["Evaluated using static heuristics and deterministic rules."],
            "weaknesses": ["Advanced LLM synthesis was unavailable. Detailed insights are missing."],
            "overall_score": score,
            "security_score": 0,
            "arch_score": 0,
            "perf_score": 0,
            "testing_score": 0,
            "db_score": 0,
            "originality_score": score,
            "confidence_score": 0.99,
            "variance_margin": 0.0,
            "consistency_status": "DETERMINISTIC_HEURISTIC",
            "judge_passes": 0
        }}

