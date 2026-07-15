import os
import json
import redis
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
    print("-> Running Security Agent (qwen2.5-coder)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "security_agent")
    llm = ChatOllama(model="qwen2.5-coder", temperature=0.1, format="json")
    parser = JsonOutputParser(pydantic_object=SecurityReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Security Engineer. Analyze the provided repository context and code snippets and output a JSON report matching the schema. Focus on hardcoded secrets, dangerous dependencies, and permissions.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        faiss_path = state.get("context", {}).get("faiss_index_path", "")
        snippets = retrieve_code_snippets(faiss_path, "authentication authorization passwords tokens secrets API keys SQL database queries permissions")
        report = await chain.ainvoke({
            "context": format_context(state),
            "snippets": snippets,
            "format_instructions": parser.get_format_instructions()
        })
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "security_agent")
        return {"security_report": report}
    except Exception as e:
        print(f"Security Agent Failed: {e}")
        return {"security_report": {"error": "Offline Mode: Security Agent unreachable."}}

async def architecture_agent_node(state: AgentState) -> dict:
    print("-> Running Architecture Agent (deepseek-coder)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "architecture_agent")
    llm = ChatOllama(model="deepseek-coder", temperature=0.1, format="json")
    parser = JsonOutputParser(pydantic_object=ArchitectureReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Software Architect. Analyze the provided repository context and code snippets (especially the folder structure and dependencies) and output a JSON report matching the schema. Focus on layer separation, modularity, and SOLID principles.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        faiss_path = state.get("context", {}).get("faiss_index_path", "")
        snippets = retrieve_code_snippets(faiss_path, "class interface architecture model view controller repository service pattern component module")
        report = await chain.ainvoke({
            "context": format_context(state),
            "snippets": snippets,
            "format_instructions": parser.get_format_instructions()
        })
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "architecture_agent")
        return {"architecture_report": report}
    except Exception as e:
        print(f"Architecture Agent Failed: {e}")
        return {"architecture_report": {"error": "Offline Mode: Architecture Agent unreachable."}}

async def performance_agent_node(state: AgentState) -> dict:
    print("-> Running Performance Agent (qwen2.5-coder / fallback)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "performance_agent")
    llm = ChatOllama(model="qwen2.5-coder", temperature=0.3, format="json") 
    parser = JsonOutputParser(pydantic_object=PerformanceReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Performance & Efficiency Expert. Analyze the provided repository context and code snippets and output a JSON report matching the schema. Focus on algorithmic complexity, asynchronous operations, query optimization, and resource usage.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        faiss_path = state.get("context", {}).get("faiss_index_path", "")
        snippets = retrieve_code_snippets(faiss_path, "performance async await cache optimize complexity algorithm loop memory efficiency")
        report = await chain.ainvoke({
            "context": format_context(state),
            "snippets": snippets,
            "format_instructions": parser.get_format_instructions()
        })
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "performance_agent")
        return {"perf_report": report}
    except Exception as e:
        print(f"Performance Agent Failed: {e}")
        return {"perf_report": {"error": "Offline Mode: Performance Agent unreachable."}}

async def testing_agent_node(state: AgentState) -> dict:
    print("-> Running Testing Agent (llama-3.1-8b-instant via Groq)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "testing_agent")
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1, api_key=os.getenv("GROQ_API_KEY"))
    parser = JsonOutputParser(pydantic_object=TestingReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert QA and Testing Engineer. Analyze the provided repository context and code snippets and output a JSON report matching the schema. Focus on the presence and quality of unit/integration tests.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        faiss_path = state.get("context", {}).get("faiss_index_path", "")
        snippets = retrieve_code_snippets(faiss_path, "test testing pytest jest mock assert spec coverage unit integration")
        report = await chain.ainvoke({
            "context": format_context(state),
            "snippets": snippets,
            "format_instructions": parser.get_format_instructions()
        })
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "testing_agent")
        return {"testing_report": report}
    except Exception as e:
        print(f"Testing Agent Failed: {e}")
        return {"testing_report": {"error": "Testing Agent unreachable."}}

async def database_agent_node(state: AgentState) -> dict:
    print("-> Running Database Agent (gemini-2.5-flash)...")
    task_id = state.get("task_id")
    repo_url = state.get("repo_url", "")
    broadcast_agent_status(task_id, repo_url, "AgentRunning", "database_agent")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1, api_key=os.getenv("GEMINI_API_KEY"))
    parser = JsonOutputParser(pydantic_object=DatabaseReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert Database Architect. Analyze the provided repository context and code snippets and output a JSON report matching the schema. Focus on schemas, ORM usage, queries, and data models.\n{format_instructions}"),
        ("user", "Repository Context:\n{context}\n\nRelevant Code Snippets:\n{snippets}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        faiss_path = state.get("context", {}).get("faiss_index_path", "")
        snippets = retrieve_code_snippets(faiss_path, "database schema ORM Prisma SQLAlchemy query table model SQL MongoDB PostgreSQL")
        report = await chain.ainvoke({
            "context": format_context(state),
            "snippets": snippets,
            "format_instructions": parser.get_format_instructions()
        })
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "database_agent")
        return {"db_report": report}
    except Exception as e:
        print(f"Database Agent Failed: {e}")
        return {"db_report": {"error": "Database Agent unreachable."}}

async def gemini_supervisor_node(state: AgentState) -> dict:
    print("-> Running Gemini Supervisor Node...")
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
    
    # We use gemini-2.5-flash to stay within free tier quotas
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0.2,
        api_key=os.getenv("GEMINI_API_KEY")
    )
    parser = JsonOutputParser(pydantic_object=FinalReport)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an Executive AI Supervisor. You receive sub-reports from Security, Architecture, Performance, Testing, and Database agents, along with a deterministic score. Synthesize them into a single, cohesive final JSON report matching the schema. EXTREMELY IMPORTANT: You MUST include the exact `security_score`, `arch_score`, `perf_score`, `testing_score`, `db_score`, and `originality_score` from the input reports into your final JSON.\n{format_instructions}"),
        ("user", "Security:\n{sec}\n\nArchitecture:\n{arch}\n\nPerformance:\n{perf}\n\nTesting:\n{test_rep}\n\nDatabase:\n{db_rep}\n\nDeterministic Score:\n{det_score}")
    ])
    
    chain = prompt | llm | parser
    
    try:
        report = await chain.ainvoke({
            "sec": json.dumps(sec, indent=2),
            "arch": json.dumps(arch, indent=2),
            "perf": json.dumps(perf, indent=2),
            "test_rep": json.dumps(test_rep, indent=2),
            "db_rep": json.dumps(db_rep, indent=2),
            "det_score": json.dumps(det_score, indent=2),
            "format_instructions": parser.get_format_instructions()
        })
        broadcast_agent_status(task_id, repo_url, "AgentCompleted", "gemini_supervisor")
        return {"final_report": report}
    except Exception as e:
        print(f"Gemini Supervisor Failed: {e}")
        score = det_score.get("score", 0) if isinstance(det_score, dict) else 0
        return {"final_report": {
            "executive_summary": "Offline Mode: Full AI synthesis was unavailable due to network or quota errors. This report was generated using the deterministic scoring engine.",
            "strengths": ["Evaluated using static heuristics and deterministic rules."],
            "weaknesses": ["Advanced LLM synthesis was unavailable. Detailed insights are missing."],
            "overall_score": score
        }}

