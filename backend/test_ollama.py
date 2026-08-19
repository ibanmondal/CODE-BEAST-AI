import asyncio
import json
from app.agents.nodes import security_agent_node, dx_agent_node

async def run():
    state = {'context': {'directory_tree': 'src/main.py', 'dependencies': ['requests'], 'readme_content': '# test', 'faiss_index_path': ''}}
    sec = await security_agent_node(state)
    print('SEC:', json.dumps(sec, indent=2))

if __name__ == "__main__":
    asyncio.run(run())
