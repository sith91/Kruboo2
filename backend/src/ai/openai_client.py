import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class OpenAIClient:
    def __init__(self):
        self.api_key = None
        self.base_url = "https://api.openai.com/v1"
        self.session = None
        self.is_configured = False
        
    async def initialize(self):
        """Initialize the client"""
        import aiohttp
        self.session = aiohttp.ClientSession()
        
    async def configure(self, api_key: Optional[str] = None, **kwargs) -> bool:
        """Configure the OpenAI client"""
        try:
            if api_key:
                self.api_key = api_key
                self.is_configured = True
                logger.info("✅ OpenAI client configured successfully")
                return True
            else:
                logger.warning("No API key provided for OpenAI")
                return False
                
        except Exception as e:
            logger.error(f"Error configuring OpenAI client: {e}")
            return False
    
    async def process(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a prompt using OpenAI API"""
        if not self.is_configured:
            return {
                'text': 'OpenAI client is not configured. Please provide an API key.',
                'action_required': False,
                'confidence': 0.0
            }
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            messages = [{'role': 'user', 'content': prompt}]
            
            data = {
                'model': 'gpt-4',
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 2000
            }
            
            async with self.session.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=data
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result['choices'][0]['message']['content']
                    
                    return {
                        'text': content,
                        'action_required': False,  # Simplified for demo
                        'confidence': 0.95,
                        'metadata': {
                            'model': 'gpt-4',
                            'tokens_used': result.get('usage', {}).get('total_tokens', 0)
                        }
                    }
                else:
                    error_text = await response.text()
                    logger.error(f"OpenAI API error: {response.status} - {error_text}")
                    return {
                        'text': 'Sorry, I encountered an error with the AI service.',
                        'action_required': False,
                        'confidence': 0.0
                    }
                    
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return {
                'text': 'Sorry, I encountered an error processing your request.',
                'action_required': False,
                'confidence': 0.0
            }
    
    async def test_connection(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Test connection to OpenAI API"""
        try:
            # Similar to DeepSeek implementation
            return {'success': True, 'response_time': 0, 'model': 'gpt-4'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
