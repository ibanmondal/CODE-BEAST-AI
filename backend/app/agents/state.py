from typing import TypedDict, Dict, Any, Optional

class AgentState(TypedDict):
    """
    Shared state for the LangGraph orchestrator.
    Contains inputs from previous deterministic stages and outputs from LLM agents.
    """
    # Inputs
    task_id: Optional[str]
    repo_url: str
    metadata: Dict[str, Any]
    context: Dict[str, Any]
    similarity_result: Dict[str, Any]
    deterministic_score_result: Dict[str, Any]
    
    # Outputs from Parallel Agents
    security_report: Optional[Dict[str, Any]]
    architecture_report: Optional[Dict[str, Any]]
    perf_report: Optional[Dict[str, Any]]
    testing_report: Optional[Dict[str, Any]]
    db_report: Optional[Dict[str, Any]]
    
    # Final Output
    final_report: Optional[Dict[str, Any]]
