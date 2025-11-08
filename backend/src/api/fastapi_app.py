"""
FastAPI Application Setup
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Dict, Any
import json

from core.assistant_core import AIAssistantCore
from api.websocket_manager import WebSocketManager
from api.routes import auth, voice, ai, system, blockchain

def create_app(assistant_core: AIAssistantCore) -> FastAPI:
    """Create and configure FastAPI application"""
    
    app = FastAPI(
        title="AI Assistant API",
        description="Backend API for Privacy-First AI Assistant",
        version="1.0.0"
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # WebSocket manager
    websocket_manager = WebSocketManager(assistant_core)
    
    # Include routers
    app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
    app.include_router(voice.router, prefix="/api/voice", tags=["voice"])
    app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
    app.include_router(system.router, prefix="/api/system", tags=["system"])
    app.include_router(blockchain.router, prefix="/api/blockchain", tags=["blockchain"])
    
    @app.get("/")
    async def root():
        return {"message": "AI Assistant API", "status": "running"}
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "core_initialized": assistant_core.is_initialized}
    
    # WebSocket endpoint for real-time communication
    @app.websocket("/ws/{user_id}")
    async def websocket_endpoint(websocket: WebSocket, user_id: str):
        await websocket_manager.connect(websocket, user_id)
        try:
            while True:
                data = await websocket.receive_text()
                await websocket_manager.handle_message(user_id, json.loads(data))
        except WebSocketDisconnect:
            websocket_manager.disconnect(user_id)
    
    return app
