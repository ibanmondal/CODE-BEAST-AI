from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes import security_agent_node, architecture_agent_node, performance_agent_node, testing_agent_node, database_agent_node, gemini_supervisor_node

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
    
    # Define edges
    # We want a fan-out from the start to all three agents to run them in parallel
    # Then a fan-in to the END node
    
    # In LangGraph, if we don't define a conditional edge from start, we can 
    # route to multiple nodes by setting the entry point to multiple nodes?
    # Actually, StateGraph entry point must be a single node or we use conditional edges.
    # The standard pattern for parallel execution is a "dispatcher" node or just routing.
    # Let's create a dummy entry node that just passes state, and connects to all three.
    
    async def dispatcher_node(state: AgentState):
        print("Dispatching tasks to parallel agents...")
        return state
        
    workflow.add_node("dispatcher", dispatcher_node)
    
    workflow.add_node("gemini_supervisor", gemini_supervisor_node)
    
    workflow.set_entry_point("dispatcher")
    
    # Fan out
    workflow.add_edge("dispatcher", "security_agent")
    workflow.add_edge("dispatcher", "architecture_agent")
    workflow.add_edge("dispatcher", "performance_agent")
    workflow.add_edge("dispatcher", "testing_agent")
    workflow.add_edge("dispatcher", "database_agent")
    
    # Fan in to Supervisor
    workflow.add_edge("security_agent", "gemini_supervisor")
    workflow.add_edge("architecture_agent", "gemini_supervisor")
    workflow.add_edge("performance_agent", "gemini_supervisor")
    workflow.add_edge("testing_agent", "gemini_supervisor")
    workflow.add_edge("database_agent", "gemini_supervisor")
    
    # Supervisor to END
    workflow.add_edge("gemini_supervisor", END)
    
    # Compile the graph
    graph = workflow.compile()
    
    return graph
