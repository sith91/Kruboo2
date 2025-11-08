"""
Core AI Assistant Logic - Main orchestrator
"""
import asyncio
import json
from typing import Dict, Any, Optional
from dataclasses import dataclass
from pathlib import Path

from ai.model_manager import ModelManager
from voice.speech_to_text import SpeechToText
from voice.text_to_speech import TextToSpeech
from voice.wake_word_detector import WakeWordDetector
from system.automation_engine import AutomationEngine
from web.search_engine import SearchEngine
from blockchain.did_manager import DIDManager
from database.user_repository import UserRepository
from config.config_manager import ConfigManager

@dataclass
class CommandResult:
    """Result of a processed command"""
    text: str
    audio_response: Optional[bytes] = None
    actions_executed: list = None
    needs_confirmation: bool = False
    confidence: float = 1.0

class AIAssistantCore:
    """
    Main AI Assistant core that orchestrates all components
    """
    
    def __init__(self):
        self.config = ConfigManager()
        self.model_manager = ModelManager()
        self.speech_to_text = SpeechToText()
        self.text_to_speech = TextToSpeech()
        self.wake_word_detector = WakeWordDetector()
        self.automation_engine = AutomationEngine()
        self.search_engine = SearchEngine()
        self.did_manager = DIDManager()
        self.user_repository = UserRepository()
        
        self.is_initialized = False
        self.active_sessions: Dict[str, Any] = {}
        self.command_history = []
        
    async def initialize(self):
        """Initialize all core components"""
        if self.is_initialized:
            return
            
        logger.info("Initializing AI Assistant Core...")
        
        # Initialize components in order
        await self.model_manager.initialize()
        await self.speech_to_text.initialize()
        await self.text_to_speech.initialize()
        await self.wake_word_detector.initialize()
        await self.automation_engine.initialize()
        await self.search_engine.initialize()
        await self.did_manager.initialize()
        
        self.is_initialized = True
        logger.info("AI Assistant Core initialized successfully")
    
    async def shutdown(self):
        """Shutdown all components gracefully"""
        logger.info("Shutting down AI Assistant Core...")
        
        await self.model_manager.shutdown()
        await self.speech_to_text.shutdown()
        await self.text_to_speech.shutdown()
        await self.wake_word_detector.shutdown()
        await self.automation_engine.shutdown()
        
        self.is_initialized = False
        logger.info("AI Assistant Core shutdown complete")
    
    async def process_voice_command(self, audio_data: bytes, user_id: str, session_id: str) -> CommandResult:
        """
        Process voice command from audio input
        """
        try:
            # Step 1: Convert speech to text
            transcript = await self.speech_to_text.transcribe(audio_data, user_id)
            
            if not transcript or not transcript.strip():
                return CommandResult(
                    text="I didn't catch that. Could you please repeat?",
                    confidence=0.0
                )
            
            # Step 2: Process command with AI
            context = await self._get_user_context(user_id, session_id)
            ai_response = await self.model_manager.process_command(transcript, context)
            
            # Step 3: Execute any required actions
            executed_actions = []
            if ai_response.actions:
                for action in ai_response.actions:
                    result = await self.automation_engine.execute_action(action, user_id)
                    executed_actions.append({
                        'action': action,
                        'result': result
                    })
            
            # Step 4: Generate audio response
            audio_response = None
            if ai_response.text:
                audio_response = await self.text_to_speech.synthesize(
                    ai_response.text, 
                    user_id
                )
            
            # Step 5: Update command history
            await self._update_command_history(user_id, transcript, ai_response.text)
            
            return CommandResult(
                text=ai_response.text,
                audio_response=audio_response,
                actions_executed=executed_actions,
                needs_confirmation=ai_response.needs_confirmation,
                confidence=ai_response.confidence
            )
            
        except Exception as e:
            logger.error(f"Error processing voice command: {e}")
            return CommandResult(
                text="I encountered an error while processing your request. Please try again.",
                confidence=0.0
            )
    
    async def process_text_command(self, text: str, user_id: str, session_id: str) -> CommandResult:
        """
        Process text command directly
        """
        try:
            context = await self._get_user_context(user_id, session_id)
            ai_response = await self.model_manager.process_command(text, context)
            
            # Execute actions
            executed_actions = []
            if ai_response.actions:
                for action in ai_response.actions:
                    result = await self.automation_engine.execute_action(action, user_id)
                    executed_actions.append({
                        'action': action,
                        'result': result
                    })
            
            return CommandResult(
                text=ai_response.text,
                actions_executed=executed_actions,
                needs_confirmation=ai_response.needs_confirmation,
                confidence=ai_response.confidence
            )
            
        except Exception as e:
            logger.error(f"Error processing text command: {e}")
            return CommandResult(
                text="I encountered an error while processing your request.",
                confidence=0.0
            )
    
    async def start_voice_session(self, user_id: str, session_config: Dict[str, Any]) -> str:
        """
        Start a new voice interaction session
        """
        session_id = f"{user_id}_{int(asyncio.get_event_loop().time())}"
        
        self.active_sessions[session_id] = {
            'user_id': user_id,
            'config': session_config,
            'start_time': asyncio.get_event_loop().time(),
            'wake_word_detected': False,
            'conversation_history': []
        }
        
        # Start wake word detection if configured
        if session_config.get('wake_word_enabled', True):
            await self.wake_word_detector.start_listening(
                session_id,
                self._on_wake_word_detected
            )
        
        return session_id
    
    async def stop_voice_session(self, session_id: str):
        """Stop a voice interaction session"""
        if session_id in self.active_sessions:
            await self.wake_word_detector.stop_listening(session_id)
            del self.active_sessions[session_id]
    
    async def train_wake_word(self, user_id: str, wake_word: str, audio_samples: list) -> bool:
        """Train custom wake word for user"""
        return await self.wake_word_detector.train_custom_wake_word(
            user_id, wake_word, audio_samples
        )
    
    async def search_web(self, query: str, user_id: str) -> Dict[str, Any]:
        """Perform web search"""
        return await self.search_engine.search(query, user_id)
    
    async def execute_system_command(self, command: str, user_id: str) -> Dict[str, Any]:
        """Execute system-level command"""
        return await self.automation_engine.execute_system_command(command, user_id)
    
    async def _get_user_context(self, user_id: str, session_id: str) -> Dict[str, Any]:
        """Get user context for AI processing"""
        user_prefs = await self.user_repository.get_user_preferences(user_id)
        session_data = self.active_sessions.get(session_id, {})
        
        return {
            'user_id': user_id,
            'preferences': user_prefs,
            'conversation_history': session_data.get('conversation_history', []),
            'current_session': session_data
        }
    
    async def _update_command_history(self, user_id: str, command: str, response: str):
        """Update user's command history"""
        self.command_history.append({
            'user_id': user_id,
            'timestamp': asyncio.get_event_loop().time(),
            'command': command,
            'response': response
        })
        
        # Keep only last 1000 commands in memory
        if len(self.command_history) > 1000:
            self.command_history = self.command_history[-1000:]
    
    async def _on_wake_word_detected(self, session_id: str, wake_word: str):
        """Callback when wake word is detected"""
        if session_id in self.active_sessions:
            self.active_sessions[session_id]['wake_word_detected'] = True
            
            # Notify frontend via WebSocket
            # This would be implemented in the WebSocket manager
            logger.info(f"Wake word '{wake_word}' detected for session {session_id}")
