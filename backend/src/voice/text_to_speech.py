import logging
import pyttsx3
import io
from typing import Optional

logger = logging.getLogger(__name__)

class TextToSpeech:
    def __init__(self):
        self.engine = None
        self.is_initialized = False
        self.voices = {}
        
    async def initialize(self):
        """Initialize text-to-speech engine"""
        try:
            self.engine = pyttsx3.init()
            
            # Configure engine settings
            self.engine.setProperty('rate', 150)  # Speech rate
            self.engine.setProperty('volume', 0.8)  # Volume level
            
            # Get available voices
            voices = self.engine.getProperty('voices')
            for voice in voices:
                self.voices[voice.id] = {
                    'name': voice.name,
                    'languages': voice.languages if hasattr(voice, 'languages') else ['en']
                }
            
            self.is_initialized = True
            logger.info("✅ Text-to-Speech initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Text-to-Speech: {e}")
            return False
    
    async def synthesize(self, text: str, language: str = "en") -> Optional[bytes]:
        """Synthesize text to speech audio"""
        if not self.is_initialized:
            logger.error("Text-to-Speech not initialized")
            return None
        
        try:
            # Set voice based on language
            self._set_voice_for_language(language)
            
            # For pyttsx3, we need to save to a file and read back
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_path = temp_file.name
            
            self.engine.save_to_file(text, temp_path)
            self.engine.runAndWait()
            
            # Read the generated audio file
            with open(temp_path, 'rb') as f:
                audio_data = f.read()
            
            # Clean up temp file
            os.unlink(temp_path)
            
            logger.info(f"🔊 Synthesized speech for text: {text[:50]}...")
            return audio_data
            
        except Exception as e:
            logger.error(f"Error synthesizing speech: {e}")
            return None
    
    def _set_voice_for_language(self, language: str):
        """Set appropriate voice for the given language"""
        try:
            for voice_id, voice_info in self.voices.items():
                if language in voice_info['languages']:
                    self.engine.setProperty('voice', voice_id)
                    return
            
            # Fallback to first available voice
            if self.voices:
                first_voice = next(iter(self.voices.keys()))
                self.engine.setProperty('voice', first_voice)
                
        except Exception as e:
            logger.warning(f"Could not set voice for language {language}: {e}")
    
    def get_available_voices(self) -> dict:
        """Get available voices"""
        return self.voices
    
    def set_voice_properties(self, rate: int = None, volume: float = None, voice_id: str = None):
        """Set TTS voice properties"""
        try:
            if rate is not None:
                self.engine.setProperty('rate', rate)
            if volume is not None:
                self.engine.setProperty('volume', volume)
            if voice_id is not None and voice_id in self.voices:
                self.engine.setProperty('voice', voice_id)
        except Exception as e:
            logger.error(f"Error setting voice properties: {e}")
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.engine:
            self.engine.stop()
        self.is_initialized = False
