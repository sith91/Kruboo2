"""
Wake Word Detection using Porcupine or similar
"""
import asyncio
import numpy as np
from typing import Dict, Any, Callable, Optional

class WakeWordDetector:
    """Handles wake word detection and training"""
    
    def __init__(self):
        self.is_listening = False
        self.sessions = {}
        self.custom_wake_words = {}
        
    async def initialize(self):
        """Initialize wake word detection"""
        logger.info("Initializing Wake Word Detector...")
        
        try:
            # Initialize Porcupine for wake word detection
            import pvporcupine
            self.porcupine = pvporcupine.create(
                keywords=['computer', 'hey computer']  # Default wake words
            )
            logger.info("Wake Word Detector initialized with Porcupine")
        except ImportError:
            logger.warning("Porcupine not available, using simulated wake word detection")
            self.porcupine = None
    
    async def shutdown(self):
        """Cleanup wake word detection"""
        if hasattr(self, 'porcupine') and self.porcupine:
            self.porcupine.delete()
    
    async def start_listening(self, session_id: str, callback: Callable):
        """Start listening for wake words in a session"""
        self.sessions[session_id] = {
            'callback': callback,
            'is_active': True,
            'wake_words': ['assistant', 'hey assistant']  # Default wake words
        }
        
        logger.info(f"Started wake word listening for session {session_id}")
    
    async def stop_listening(self, session_id: str):
        """Stop listening for wake words in a session"""
        if session_id in self.sessions:
            self.sessions[session_id]['is_active'] = False
            del self.sessions[session_id]
            logger.info(f"Stopped wake word listening for session {session_id}")
    
    async def process_audio_frame(self, audio_frame: np.ndarray, session_id: str) -> bool:
        """
        Process audio frame for wake word detection
        Returns True if wake word detected
        """
        if session_id not in self.sessions:
            return False
        
        session = self.sessions[session_id]
        
        if self.porcupine:
            # Use Porcupine for detection
            keyword_index = self.porcupine.process(audio_frame)
            if keyword_index >= 0:
                wake_word = self.porcupine.keywords[keyword_index]
                await session['callback'](session_id, wake_word)
                return True
        else:
            # Simulated detection for development
            # In production, this would use proper wake word detection
            if np.random.random() < 0.001:  # 0.1% chance for simulation
                wake_word = "assistant"
                await session['callback'](session_id, wake_word)
                return True
        
        return False
    
    async def train_custom_wake_word(self, user_id: str, wake_word: str, audio_samples: list) -> bool:
        """Train custom wake word from audio samples"""
        try:
            logger.info(f"Training custom wake word '{wake_word}' for user {user_id}")
            
            # In production, this would use proper wake word training
            # For now, simulate training process
            await asyncio.sleep(2)  # Simulate training time
            
            # Store the custom wake word
            if user_id not in self.custom_wake_words:
                self.custom_wake_words[user_id] = []
            
            self.custom_wake_words[user_id].append(wake_word)
            
            logger.info(f"Custom wake word '{wake_word}' trained successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to train custom wake word: {e}")
            return False
    
    async def get_wake_words(self, user_id: str) -> list:
        """Get available wake words for user"""
        default_words = ['assistant', 'hey assistant']
        custom_words = self.custom_wake_words.get(user_id, [])
        return default_words + custom_words
