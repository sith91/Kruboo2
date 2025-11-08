"""
AI Model Manager - Handles multiple AI model integrations
"""
import asyncio
import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

from .deepseek_client import DeepSeekClient
from .openai_client import OpenAIClient
from .local_llama import LocalLlama
from .anthropic_client import AnthropicClient

class ModelType(Enum):
    DEEPSEEK = "deepseek"
    OPENAI = "openai"
    LOCAL_LLAMA = "llama"
    ANTHROPIC = "anthropic"

@dataclass
class AIResponse:
    """Structured AI response"""
    text: str
    actions: List[Dict[str, Any]]
    needs_confirmation: bool
    confidence: float
    model_used: str

class ModelManager:
    """
    Manages multiple AI models and routes requests appropriately
    """
    
    def __init__(self):
        self.clients = {}
        self.active_models = {}
        self.default_model = None
        
    async def initialize(self):
        """Initialize model manager"""
        logger.info("Initializing Model Manager...")
        
        # Initialize clients
        self.clients = {
            ModelType.DEEPSEEK: DeepSeekClient(),
            ModelType.OPENAI: OpenAIClient(),
            ModelType.LOCAL_LLAMA: LocalLlama(),
            ModelType.ANTHROPIC: AnthropicClient()
        }
        
        # Initialize each client
        for client in self.clients.values():
            await client.initialize()
        
        logger.info("Model Manager initialized")
    
    async def shutdown(self):
        """Shutdown all model clients"""
        for client in self.clients.values():
            await client.shutdown()
    
    async def configure_model(self, user_id: str, model_config: Dict[str, Any]) -> bool:
        """
        Configure AI model for a user
        """
        try:
            model_type = ModelType(model_config['type'])
            config = model_config.get('config', {})
            
            # Test connection
            client = self.clients[model_type]
            success = await client.test_connection(config)
            
            if success:
                self.active_models[user_id] = {
                    'type': model_type,
                    'config': config,
                    'client': client
                }
                
                if not self.default_model:
                    self.default_model = user_id
                
                logger.info(f"Model configured for user {user_id}: {model_type.value}")
                return True
            else:
                logger.error(f"Model connection test failed for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error configuring model for user {user_id}: {e}")
            return False
    
    async def process_command(self, command: str, context: Dict[str, Any]) -> AIResponse:
        """
        Process command using appropriate AI model
        """
        user_id = context.get('user_id')
        model_info = self.active_models.get(user_id)
        
        if not model_info:
            raise ValueError(f"No AI model configured for user {user_id}")
        
        client = model_info['client']
        model_type = model_info['type']
        
        # Determine if we need to switch models based on task type
        best_model_type = self._select_best_model(command, context, model_type)
        
        if best_model_type != model_type:
            client = self.clients[best_model_type]
            logger.info(f"Switched to {best_model_type.value} for specialized task")
        
        # Process command
        response = await client.process_command(command, context)
        
        # Parse response for actions
        actions = self._extract_actions(response)
        needs_confirmation = self._check_confirmation_required(command, actions)
        
        return AIResponse(
            text=response['text'],
            actions=actions,
            needs_confirmation=needs_confirmation,
            confidence=response.get('confidence', 0.9),
            model_used=best_model_type.value
        )
    
    def _select_best_model(self, command: str, context: Dict[str, Any], current_model: ModelType) -> ModelType:
        """
        Select the best model for the given command
        """
        command_lower = command.lower()
        
        # Coding tasks - DeepSeek excels at coding
        coding_keywords = ['code', 'program', 'function', 'algorithm', 'debug', 'python', 'javascript']
        if any(keyword in command_lower for keyword in coding_keywords):
            return ModelType.DEEPSEEK
        
        # Creative writing - GPT-4 is strong here
        creative_keywords = ['write', 'create', 'story', 'poem', 'article', 'blog']
        if any(keyword in command_lower for keyword in creative_keywords):
            return ModelType.OPENAI
        
        # Privacy-sensitive tasks - use local model
        privacy_keywords = ['private', 'confidential', 'personal', 'sensitive']
        if any(keyword in command_lower for keyword in privacy_keywords):
            return ModelType.LOCAL_LLAMA
        
        # Enterprise/business tasks - Claude is good here
        business_keywords = ['business', 'enterprise', 'corporate', 'professional']
        if any(keyword in command_lower for keyword in business_keywords):
            return ModelType.ANTHROPIC
        
        # Default to current model
        return current_model
    
    def _extract_actions(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract actions from AI response
        """
        actions = []
        
        # Look for action markers in response
        if 'actions' in response:
            actions.extend(response['actions'])
        
        # Parse text for implicit actions
        text = response.get('text', '')
        
        # Example: "I'll open Chrome for you" -> open_app action
        if any(phrase in text.lower() for phrase in ['open ', 'launch ', 'start ']):
            # Simple heuristic - in production, use more sophisticated NLP
            pass
        
        return actions
    
    def _check_confirmation_required(self, command: str, actions: List[Dict[str, Any]]) -> bool:
        """
        Check if confirmation is required for dangerous actions
        """
        dangerous_keywords = ['delete', 'remove', 'uninstall', 'format', 'shutdown']
        command_lower = command.lower()
        
        if any(keyword in command_lower for keyword in dangerous_keywords):
            return True
        
        # Check for dangerous actions
        for action in actions:
            if action.get('type') in ['delete_file', 'uninstall_app', 'shutdown_system']:
                return True
        
        return False
