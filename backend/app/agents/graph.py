from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes import (
    security_agent_node,
    architecture_agent_node,
    performance_agent_node,
    testing_agent_node,
    database_agent_node,
    similarity_agent_node,
    dx_agent_node,
    finops_agent_node,
    nararouter_supervisor_node
)

def create_orchestrator_graph():
    """
    Creates and compiles the LangGraph that runs the specialized agents in parallel.
    """
    
    # Initialize the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("security_agent", security_agent_node)
    workflow.add_node("architecture_agent", architecture_agent_node)
    workflow.add_node("performance_agent", performance_agent_node)
    workflow.add_node("testing_agent", testing_agent_node)
    workflow.add_node("database_agent", database_agent_node)
    workflow.add_node("similarity_agent", similarity_agent_node)
    workflow.add_node("dx_agent", dx_agent_node)
    workflow.add_node("finops_agent", finops_agent_node)
    
    # Define edges
    # Fan-out dispatcher node
    async def dispatcher_node(state: AgentState):
        print("Dispatching tasks to 8 parallel specialized agents...")
        return state
        
    workflow.add_node("dispatcher", dispatcher_node)
    workflow.add_node("nararouter_supervisor", nararouter_supervisor_node)
    
    workflow.set_entry_point("dispatcher")
    
    # Fan out
    workflow.add_edge("dispatcher", "security_agent")
    workflow.add_edge("dispatcher", "architecture_agent")
    workflow.add_edge("dispatcher", "performance_agent")
    workflow.add_edge("dispatcher", "testing_agent")
    workflow.add_edge("dispatcher", "database_agent")
    workflow.add_edge("dispatcher", "similarity_agent")
    workflow.add_edge("dispatcher", "dx_agent")
    workflow.add_edge("dispatcher", "finops_agent")
    
    # Fan in to Supervisor
    workflow.add_edge("security_agent", "nararouter_supervisor")
    workflow.add_edge("architecture_agent", "nararouter_supervisor")
    workflow.add_edge("performance_agent", "nararouter_supervisor")
    workflow.add_edge("testing_agent", "nararouter_supervisor")
    workflow.add_edge("database_agent", "nararouter_supervisor")
    workflow.add_edge("similarity_agent", "nararouter_supervisor")
    workflow.add_edge("dx_agent", "nararouter_supervisor")
    workflow.add_edge("finops_agent", "nararouter_supervisor")
    
    # Supervisor to END
    workflow.add_edge("nararouter_supervisor", END)
    
    # Compile the graph
    graph = workflow.compile()
    
    return graph
