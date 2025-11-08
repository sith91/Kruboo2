"""
Speech-to-Text processing using multiple engines
"""
import asyncio
import speech_recognition as sr
import io
from typing import Optional, Dict, Any

class SpeechToText:
    """Handles speech recognition in multiple languages"""
    
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.supported_languages = {
            'english': 'en-US',
            'spanish': 'es-ES',
            'sinhala': 'si-LK',
            'tamil': 'ta-IN',
            'french': 'fr-FR',
            'german': 'de-DE',
            'chinese': 'zh-CN',
            'japanese': 'ja-JP',
            'hindi': 'hi-IN',
            'arabic': 'ar-SA'
        }
        
    async def initialize(self):
        """Initialize speech recognition"""
        logger.info("Initializing Speech-to-Text engine...")
        # Adjust for ambient noise
        # Note: This would typically use actual audio input
        logger.info("Speech-to-Text engine ready")
    
    async def shutdown(self):
        """Cleanup resources"""
        pass
    
    async def transcribe(self, audio_data: bytes, user_id: str, language: str = 'english') -> Optional[str]:
        """
        Transcribe audio data to text
        """
        try:
            # Convert bytes to AudioData
            audio_file = io.BytesIO(audio_data)
            
            # Use speech_recognition to transcribe
            with sr.AudioFile(audio_file) as source:
                audio = self.recognizer.record(source)
            
            # Get language code
            lang_code = self.supported_languages.get(language, 'en-US')
            
            # Try Google Speech Recognition first
            try:
                text = self.recognizer.recognize_google(audio, language=lang_code)
                logger.info(f"Transcribed: {text}")
                return text
                
            except sr.UnknownValueError:
                logger.warning("Google Speech Recognition could not understand audio")
                return None
                
            except sr.RequestError as e:
                logger.error(f"Google Speech Recognition error: {e}")
                # Fallback to other engines could be implemented here
                return None
                
        except Exception as e:
            logger.error(f"Speech-to-Text error: {e}")
            return None
    
    async def get_supported_languages(self) -> Dict[str, str]:
        """Get list of supported languages"""
        return self.supported_languages
    
    async def set_language(self, user_id: str, language: str):
        """Set preferred language for user"""
        if language not in self.supported_languages:
            raise ValueError(f"Unsupported language: {language}")
        
        # Store user preference
        # This would typically be saved to user profile
        logger.info(f"Set language for user {user_id}: {language}")
