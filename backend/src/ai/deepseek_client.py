"""
DeepSeek AI Client Implementation
"""
import aiohttp
import json
from typing import Dict, Any, Optional

class DeepSeekClient:
    """Client for DeepSeek AI API"""
    
    def __init__(self):
        self.base_url = "https://api.deepseek.com/v1"
        self.api_key = None
        self.session = None
        self.model = "deepseek-chat"
        
    async def initialize(self):
        """Initialize HTTP session"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30)
        )
    
    async def shutdown(self):
        """Close HTTP session"""
        if self.session:
            await self.session.close()
    
    async def test_connection(self, config: Dict[str, Any]) -> bool:
        """Test API connection"""
        self.api_key = config.get('api_key')
        if not self.api_key:
            return False
            
        try:
            # Simple test request
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with self.session.get(f"{self.base_url}/models", headers=headers) as response:
                return response.status == 200
        except Exception as e:
            logger.error(f"DeepSeek connection test failed: {e}")
            return False
    
    async def process_command(self, command: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Process command using DeepSeek AI"""
        if not self.api_key:
            raise ValueError("DeepSeek API key not configured")
        
        try:
            # Prepare conversation history
            messages = self._build_messages(command, context)
            
            # API request
            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000,
                "stream": False
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            async with self.session.post(
                f"{self.base_url}/chat/completions",
                json=payload,
                headers=headers
            ) as response:
                
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"API error {response.status}: {error_text}")
                
                data = await response.json()
                return self._parse_response(data, command)
                
        except Exception as e:
            logger.error(f"DeepSeek API error: {e}")
            return {
                "text": "I apologize, but I'm having trouble processing your request right now.",
                "confidence": 0.0
            }
    
    def _build_messages(self, command: str, context: Dict[str, Any]) -> list:
        """Build conversation messages for API"""
        messages = [
            {
                "role": "system",
                "content": self._build_system_prompt(context)
            }
        ]
        
        # Add conversation history
        history = context.get('conversation_history', [])
        for msg in history[-10:]:  # Last 10 messages for context
            messages.append({
                "role": "user" if msg['type'] == 'user' else "assistant",
                "content": msg['content']
            })
        
        # Add current command
        messages.append({
            "role": "user",
            "content": command
        })
        
        return messages
    
    def _build_system_prompt(self, context: Dict[str, Any]) -> str:
        """Build system prompt based on context"""
        base_prompt = """You are an AI assistant that helps users with various tasks. 
        You can control applications, search the web, manage files, and automate workflows.
        
        When responding:
        1. Be helpful, concise, and natural
        2. If you're performing an action, mention it clearly
        3. For complex tasks, break them down into steps
        4. Always maintain user privacy and security
        
        Available capabilities:
        - Application control (open, close apps)
        - File system operations
        - Web search and research
        - Email management
        - System monitoring
        - Task automation
        """
        
        # Add user-specific context
        prefs = context.get('preferences', {})
        if prefs.get('language'):
            base_prompt += f"\nUser's preferred language: {prefs['language']}"
        
        return base_prompt
    
    def _parse_response(self, data: Dict[str, Any], original_command: str) -> Dict[str, Any]:
        """Parse API response"""
        choice = data['choices'][0]
        message = choice['message']
        
        return {
            "text": message['content'],
            "confidence": 0.9,
            "usage": data.get('usage', {})
        }
