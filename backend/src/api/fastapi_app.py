from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
from typing import Dict, Any, List
from datetime import datetime
import json
from datetime import datetime

from core.assistant_core import AIAssistantCore

logger = logging.getLogger(__name__)

def create_app(assistant_core: AIAssistantCore) -> FastAPI:
    """Create FastAPI application"""
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
    
    # WebSocket manager for real-time communication
    class ConnectionManager:
        def __init__(self):
            self.active_connections: List[WebSocket] = []
        
        async def connect(self, websocket: WebSocket):
            await websocket.accept()
            self.active_connections.append(websocket)
        
        def disconnect(self, websocket: WebSocket):
            self.active_connections.remove(websocket)
        
        async def send_personal_message(self, message: str, websocket: WebSocket):
            await websocket.send_text(message)
        
        async def broadcast(self, message: str):
            for connection in self.active_connections:
                await connection.send_text(message)
    
    manager = ConnectionManager()
    
    @app.get("/")
    async def root():
        return {"message": "AI Assistant API", "status": "running"}
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "timestamp": datetime.now().isoformat()}
    
    @app.post("/api/process-command")
    async def process_command(command_data: Dict[str, Any]):
        """Process text command"""
        try:
            text = command_data.get('text')
            context = command_data.get('context', {})
            
            if not text:
                raise HTTPException(status_code=400, detail="Text is required")
            
            result = await assistant_core.process_text_command(text, context)
            return result
            
        except Exception as e:
            logger.error(f"Error processing command: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/process-voice")
    async def process_voice(audio_data: Dict[str, Any]):
        """Process voice command"""
        try:
            audio_bytes = audio_data.get('audio')
            language = audio_data.get('language', 'en')
            
            if not audio_bytes:
                raise HTTPException(status_code=400, detail="Audio data is required")
            
            result = await assistant_core.process_voice_command(audio_bytes, language)
            return result
            
        except Exception as e:
            logger.error(f"Error processing voice: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/configure-ai")
    async def configure_ai(config_data: Dict[str, Any]):
        """Configure AI model"""
        try:
            model_type = config_data.get('type')
            api_key = config_data.get('api_key')
            model_path = config_data.get('model_path')
            
            if not model_type:
                raise HTTPException(status_code=400, detail="Model type is required")
            
            # This would configure the model in the assistant core
            result = await assistant_core.model_manager.configure_model(config_data)
            return {"success": result}
            
        except Exception as e:
            logger.error(f"Error configuring AI: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        """WebSocket for real-time communication"""
        await manager.connect(websocket)
        try:
            while True:
                data = await websocket.receive_text()
                # Handle real-time messages
                await manager.send_personal_message(f"Message received: {data}", websocket)
        except WebSocketDisconnect:
            manager.disconnect(websocket)
    
    @app.get("/api/system/info")
    async def get_system_info():
        """Get system information"""
        try:
            result = await assistant_core.automation_engine.system_monitor.get_system_info()
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/auth/wallet")
    async def wallet_auth(auth_data: Dict[str, Any]):
        """Wallet authentication"""
        try:
            wallet_type = auth_data.get('wallet_type')
            signature = auth_data.get('signature')
            address = auth_data.get('address')
            
            # Authenticate wallet
            result = await assistant_core.did_manager.wallet_integration.connect_wallet(
                wallet_type, auth_data
            )
            return result
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    logger.info("✅ FastAPI application created successfully")
    return app

# Add these endpoints after the existing ones:

@app.post("/api/auth/social")
async def social_auth(auth_data: Dict[str, Any]):
    """Social authentication"""
    try:
        provider = auth_data.get('provider')
        token = auth_data.get('token')
        
        if not provider or not token:
            raise HTTPException(status_code=400, detail="Provider and token are required")
        
        social_auth = assistant_core.did_manager.wallet_integration.social_auth
        if provider == 'google':
            result = await social_auth.authenticate_google(token)
        elif provider == 'github':
            result = await social_auth.authenticate_github(token)
        elif provider == 'apple':
            result = await social_auth.authenticate_apple(token)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/email")
async def email_auth(auth_data: Dict[str, Any]):
    """Email authentication"""
    try:
        email = auth_data.get('email')
        password = auth_data.get('password')
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        # Mock authentication - in production, use proper authentication
        user_info = {
            'user_id': f"email_{hash(email) % 1000000}",
            'email': email,
            'auth_method': 'email'
        }
        
        return {'success': True, 'user': user_info}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test-ai-connection")
async def test_ai_connection(config_data: Dict[str, Any]):
    """Test AI model connection"""
    try:
        model_type = config_data.get('type')
        api_key = config_data.get('api_key')
        model_path = config_data.get('model_path')
        
        if not model_type:
            raise HTTPException(status_code=400, detail="Model type is required")
        
        result = await assistant_core.model_manager.test_connection(config_data)
        return result
        
    except Exception as e:
        logger.error(f"Error testing AI connection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/available-models")
async def get_available_models():
    """Get list of available AI models"""
    try:
        models = assistant_core.model_manager.get_available_models()
        return {'success': True, 'models': models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-config")
async def save_config(config_data: Dict[str, Any]):
    """Save user configuration"""
    try:
        user_id = config_data.get('user_id')
        config_type = config_data.get('type')
        config_value = config_data.get('value')
        
        if not user_id or not config_type:
            raise HTTPException(status_code=400, detail="User ID and config type are required")
        
        # Save to database
        if config_type == 'languages':
            # Save language preferences
            pass
        elif config_type == 'voice_settings':
            # Save voice settings
            pass
        elif config_type == 'ai_model':
            # Save AI model configuration
            pass
        elif config_type == 'features':
            # Save enabled features
            pass
        elif config_type == 'privacy_settings':
            # Save privacy settings
            pass
        
        return {'success': True, 'message': 'Configuration saved'}
        
    except Exception as e:
        logger.error(f"Error saving config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/microphones")
async def get_microphones():
    """Get available microphones"""
    try:
        # This would list available audio devices
        microphones = [
            {'id': 'default', 'name': 'Default Microphone'},
            {'id': 'mic1', 'name': 'Built-in Microphone'},
            {'id': 'mic2', 'name': 'External USB Microphone'}
        ]
        return {'success': True, 'microphones': microphones}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/train-wake-word")
async def train_wake_word(training_data: Dict[str, Any]):
    """Train custom wake word"""
    try:
        wake_word = training_data.get('wake_word')
        audio_samples = training_data.get('audio_samples', [])
        
        if not wake_word:
            raise HTTPException(status_code=400, detail="Wake word is required")
        
        result = await assistant_core.speech_to_text.wake_word_detector.train_custom_wake_word(
            audio_samples, wake_word
        )
        return {'success': result}
        
    except Exception as e:
        logger.error(f"Error training wake word: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/open-application")
async def open_application(app_data: Dict[str, Any]):
    """Open application"""
    try:
        app_name = app_data.get('name')
        
        if not app_name:
            raise HTTPException(status_code=400, detail="Application name is required")
        
        result = await assistant_core.automation_engine.app_controller.open_application(app_name)
        return result
        
    except Exception as e:
        logger.error(f"Error opening application: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/file-operations")
async def file_operations(operation_data: Dict[str, Any]):
    """Perform file operations"""
    try:
        operation = operation_data.get('operation')
        path = operation_data.get('path')
        content = operation_data.get('content')
        
        if not operation:
            raise HTTPException(status_code=400, detail="Operation type is required")
        
        file_manager = assistant_core.automation_engine.file_manager
        
        if operation == 'open':
            result = await file_manager.open_file(path)
        elif operation == 'find':
            pattern = operation_data.get('pattern')
            result = await file_manager.find_file(pattern, path)
        elif operation == 'create':
            result = await file_manager.create_file(path, content)
        elif operation == 'delete':
            result = await file_manager.delete_file(path)
        elif operation == 'list':
            result = await file_manager.list_directory(path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported operation: {operation}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error performing file operation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/system/processes")
async def get_running_processes():
    """Get running processes"""
    try:
        result = await assistant_core.automation_engine.system_monitor.get_process_info()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/system/metrics")
async def get_system_metrics():
    """Get detailed system metrics"""
    try:
        result = await assistant_core.automation_engine.system_monitor.get_detailed_metrics()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/web/search")
async def web_search(search_data: Dict[str, Any]):
    """Perform web search"""
    try:
        query = search_data.get('query')
        max_results = search_data.get('max_results', 10)
        
        if not query:
            raise HTTPException(status_code=400, detail="Search query is required")
        
        result = await assistant_core.search_engine.search_web(query, max_results)
        return result
        
    except Exception as e:
        logger.error(f"Error performing web search: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/research/topic")
async def research_topic(research_data: Dict[str, Any]):
    """Research a topic"""
    try:
        topic = research_data.get('topic')
        depth = research_data.get('depth', 'basic')
        
        if not topic:
            raise HTTPException(status_code=400, detail="Research topic is required")
        
        result = await assistant_core.research_assistant.research_topic(topic, depth)
        return result
        
    except Exception as e:
        logger.error(f"Error researching topic: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/blockchain/create-did")
async def create_did(did_data: Dict[str, Any]):
    """Create decentralized identity"""
    try:
        user_data = did_data.get('user_data', {})
        
        result = await assistant_core.did_manager.create_did(user_data)
        return result
        
    except Exception as e:
        logger.error(f"Error creating DID: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/blockchain/store-data")
async def store_blockchain_data(storage_data: Dict[str, Any]):
    """Store data on blockchain"""
    try:
        data = storage_data.get('data')
        storage_type = storage_data.get('storage_type', 'ipfs')
        
        if not data:
            raise HTTPException(status_code=400, detail="Data is required")
        
        result = await assistant_core.did_manager.decentralized_storage.store_data(data, storage_type)
        return result
        
    except Exception as e:
        logger.error(f"Error storing blockchain data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/conversation/history")
async def get_conversation_history(user_id: str, limit: int = 50):
    """Get conversation history"""
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        # This would fetch from database
        history = []  # Placeholder
        return {'success': True, 'history': history, 'user_id': user_id}
        
    except Exception as e:
        logger.error(f"Error getting conversation history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/complete-setup")
async def complete_setup(setup_data: Dict[str, Any]):
    """Mark setup as complete"""
    try:
        user_id = setup_data.get('user_id')
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        # Update user settings in database
        return {'success': True, 'message': 'Setup completed'}
        
    except Exception as e:
        logger.error(f"Error completing setup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voices")
async def get_available_voices(language: str = "en"):
    """Get available TTS voices for language"""
    try:
        voices = assistant_core.text_to_speech.get_available_voices()
        
        # Filter voices by language if specified
        if language:
            filtered_voices = {
                voice_id: voice_info 
                for voice_id, voice_info in voices.items() 
                if language in voice_info.get('languages', [])
            }
        else:
            filtered_voices = voices
        
        return {'success': True, 'voices': filtered_voices, 'language': language}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test-voice")
async def test_voice(voice_data: Dict[str, Any]):
    """Test voice synthesis"""
    try:
        text = voice_data.get('text', 'Hello, this is a test voice.')
        voice_id = voice_data.get('voice_id')
        language = voice_data.get('language', 'en')
        
        # Set voice if specified
        if voice_id:
            assistant_core.text_to_speech.set_voice_properties(voice_id=voice_id)
        
        # Generate audio
        audio_data = await assistant_core.text_to_speech.synthesize(text, language)
        
        if audio_data:
            return {
                'success': True, 
                'audio_data': audio_data.hex(),  # Convert bytes to hex for JSON
                'text': text
            }
        else:
            return {'success': False, 'error': 'Failed to generate audio'}
            
    except Exception as e:
        logger.error(f"Error testing voice: {e}")
        raise HTTPException(status_code=500, detail=str(e))


