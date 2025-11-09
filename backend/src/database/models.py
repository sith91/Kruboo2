import sqlite3
import logging
from datetime import datetime
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self, db_path: str = "data/assistant.db"):
        self.db_path = db_path
        self.connection = None
        
    async def initialize(self):
        """Initialize database connection"""
        try:
            self.connection = sqlite3.connect(self.db_path)
            self.connection.row_factory = sqlite3.Row
            
            # Create tables
            await self._create_tables()
            logger.info("✅ Database initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize database: {e}")
            return False
    
    async def _create_tables(self):
        """Create database tables"""
        cursor = self.connection.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE,
                auth_method TEXT,
                wallet_address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # AI Configurations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_configs (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                model_type TEXT,
                api_key TEXT,
                model_path TEXT,
                is_active BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Conversations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                message TEXT,
                response TEXT,
                message_type TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # User Settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id TEXT PRIMARY KEY,
                language TEXT DEFAULT 'en',
                voice_settings TEXT,
                privacy_settings TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        self.connection.commit()
    
    async def create_user(self, user_data: Dict[str, Any]) -> bool:
        """Create new user"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                INSERT INTO users (id, email, auth_method, wallet_address)
                VALUES (?, ?, ?, ?)
            ''', (
                user_data['id'],
                user_data.get('email'),
                user_data.get('auth_method'),
                user_data.get('wallet_address')
            ))
            
            # Create default settings
            cursor.execute('''
                INSERT INTO user_settings (user_id, language, voice_settings, privacy_settings)
                VALUES (?, ?, ?, ?)
            ''', (
                user_data['id'],
                'en',
                '{}',
                '{"data_collection": "minimal", "cloud_sync": true}'
            ))
            
            self.connection.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return False
    
    async def get_user(self, user_id: str) -> Dict[str, Any]:
        """Get user by ID"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT u.*, us.language, us.voice_settings, us.privacy_settings
                FROM users u
                LEFT JOIN user_settings us ON u.id = us.user_id
                WHERE u.id = ?
            ''', (user_id,))
            
            row = cursor.fetchone()
            if row:
                return dict(row)
            return {}
            
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            return {}
    
    async def save_conversation(self, conversation_data: Dict[str, Any]) -> bool:
        """Save conversation message"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                INSERT INTO conversations (id, user_id, message, response, message_type)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                conversation_data['id'],
                conversation_data['user_id'],
                conversation_data['message'],
                conversation_data.get('response', ''),
                conversation_data.get('message_type', 'text')
            ))
            
            self.connection.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error saving conversation: {e}")
            return False
    
    async def get_conversation_history(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get conversation history for user"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM conversations 
                WHERE user_id = ? 
                ORDER BY timestamp DESC 
                LIMIT ?
            ''', (user_id, limit))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
            
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []
    
    async def save_ai_config(self, config_data: Dict[str, Any]) -> bool:
        """Save AI model configuration"""
        try:
            cursor = self.connection.cursor()
            
            # Deactivate other configs for this user
            cursor.execute('''
                UPDATE ai_configs SET is_active = FALSE 
                WHERE user_id = ?
            ''', (config_data['user_id'],))
            
            # Insert new config
            cursor.execute('''
                INSERT INTO ai_configs (id, user_id, model_type, api_key, model_path, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                config_data['id'],
                config_data['user_id'],
                config_data['model_type'],
                config_data.get('api_key'),
                config_data.get('model_path'),
                True
            ))
            
            self.connection.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error saving AI config: {e}")
            return False
    
    async def get_active_ai_config(self, user_id: str) -> Dict[str, Any]:
        """Get active AI configuration for user"""
        try:
            cursor = self.connection.cursor()
            cursor.execute('''
                SELECT * FROM ai_configs 
                WHERE user_id = ? AND is_active = TRUE
                ORDER BY created_at DESC 
                LIMIT 1
            ''', (user_id,))
            
            row = cursor.fetchone()
            return dict(row) if row else {}
            
        except Exception as e:
            logger.error(f"Error getting AI config: {e}")
            return {}
    
    async def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()

# Global database instance
db = DatabaseManager()

async def init_db():
    """Initialize database"""
    return await db.initialize()

# Model classes for type hints
class User:
    def __init__(self, user_data: Dict[str, Any]):
        self.id = user_data.get('id')
        self.email = user_data.get('email')
        self.auth_method = user_data.get('auth_method')
        self.wallet_address = user_data.get('wallet_address')

class Conversation:
    def __init__(self, conversation_data: Dict[str, Any]):
        self.id = conversation_data.get('id')
        self.user_id = conversation_data.get('user_id')
        self.message = conversation_data.get('message')
        self.response = conversation_data.get('response')
        self.message_type = conversation_data.get('message_type')

class AIConfig:
    def __init__(self, config_data: Dict[str, Any]):
        self.id = config_data.get('id')
        self.user_id = config_data.get('user_id')
        self.model_type = config_data.get('model_type')
        self.api_key = config_data.get('api_key')
        self.model_path = config_data.get('model_path')
        self.is_active = config_data.get('is_active', False)
