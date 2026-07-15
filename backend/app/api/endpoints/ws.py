from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from typing import List
import redis.asyncio as redis
import os
import asyncio

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

async def redis_listener(pubsub, websocket: WebSocket):
    try:
        async for message in pubsub.listen():
            if message['type'] == 'message':
                # Send ONLY to this specific client to avoid duplicate broadcasts
                await websocket.send_text(message['data'].decode('utf-8'))
    except Exception as e:
        print(f"Redis listener error: {e}")

async def ws_listener(websocket: WebSocket):
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass

@router.websocket("/updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    r = redis.from_url(redis_url)
    
    # Immediately send the last known task state to avoid buffering UI
    last_event = await r.get("last_eval_task")
    if last_event:
        await websocket.send_text(last_event.decode('utf-8'))
        
    pubsub = r.pubsub()
    await pubsub.subscribe("job_updates")
    
    try:
        # Run both listeners concurrently
        redis_task = asyncio.create_task(redis_listener(pubsub, websocket))
        ws_task = asyncio.create_task(ws_listener(websocket))
        
        # Wait until either the client disconnects or Redis fails
        done, pending = await asyncio.wait(
            [redis_task, ws_task],
            return_when=asyncio.FIRST_COMPLETED
        )
        
        # Cancel any pending tasks
        for task in pending:
            task.cancel()
            
    except Exception as e:
        print(f"WebSocket endpoint error: {e}")
    finally:
        manager.disconnect(websocket)
        try:
            await pubsub.unsubscribe("job_updates")
            await r.aclose()
        except:
            pass
