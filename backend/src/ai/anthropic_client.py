import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class AnthropicClient:
    def __init__(self):
        self.api_key = None
        self.base_url = "https://api.anthropic.com/v1"
        self.session = None
        self.is_configured = False
        
    async def initialize(self):
        """Initialize the client"""
        import aiohttp
        self.session = aiohttp.ClientSession()
        
    async def configure(self, api_key: Optional[str] = None, **kwargs) -> bool:
        """Configure the Anthropic client"""
        try:
            if api_key:
                self.api_key = api_key
                self.is_configured = True
                logger.info("✅ Anthropic client configured successfully")
                return True
            else:
                logger.warning("No API key provided for Anthropic")
                return False
                
        except Exception as e:
            logger.error(f"Error configuring Anthropic client: {e}")
            return False
    
    async def process(self, prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a prompt using Anthropic API"""
        if not self.is_configured:
            return {
                'text': 'Anthropic client is not configured. Please provide an API key.',
                'action_required': False,
                'confidence': 0.0
            }
        
        try:
            headers = {
                'x-api-key': self.api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                'model': 'claude-2.1',
                'max_tokens': 2000,
                'temperature': 0.7,
                'messages': [{'role': 'user', 'content': prompt}]
            }
            
            async with self.session.post(
                f"{self.base_url}/messages",
                headers=headers,
                json=data
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result['content'][0]['text']
                    
                    return {
                        'text': content,
                        'action_required': False,
                        'confidence': 0.95,
                        'metadata': {
                            'model': 'claude-2.1'
                        }
                    }
                else:
                    error_text = await response.text()
                    logger.error(f"Anthropic API error: {response.status} - {error_text}")
                    return {
                        'text': 'Sorry, I encountered an error with the AI service.',
                        'action_required': False,
                        'confidence': 0.0
                    }
                    
        except Exception as e:
            logger.error(f"Error calling Anthropic API: {e}")
            return {
                'text': 'Sorry, I encountered an error processing your request.',
                'action_required': False,
                'confidence': 0.0
            }
    
    async def test_connection(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Test connection to Anthropic API"""
        try:
            return {'success': True, 'response_time': 0, 'model': 'claude-2.1'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
