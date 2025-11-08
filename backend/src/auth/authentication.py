"""
Authentication and user management
"""
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class User:
    id: str
    email: Optional[str] = None
    wallet_address: Optional[str] = None
    auth_method: str = "email"  # email, wallet, social
    created_at: datetime = None
    preferences: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()
        if self.preferences is None:
            self.preferences = {}

class AuthManager:
    """Handles user authentication and session management"""
    
    def __init__(self, jwt_secret: str, token_expiry_minutes: int = 1440):
        self.jwt_secret = jwt_secret
        self.token_expiry_minutes = token_expiry_minutes
        self.users = {}  # In production, use database
    
    async def authenticate_email(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        # In production, this would verify against database
        user_id = f"user_{hash(email)}"
        
        if email and password:  # Simple validation
            user = User(
                id=user_id,
                email=email,
                auth_method="email"
            )
            self.users[user_id] = user
            return user
        
        return None
    
    async def authenticate_wallet(self, wallet_address: str, signature: str) -> Optional[User]:
        """Authenticate user with wallet signature"""
        # In production, this would verify the signature
        user_id = f"wallet_{wallet_address}"
        
        user = User(
            id=user_id,
            wallet_address=wallet_address,
            auth_method="wallet"
        )
        self.users[user_id] = user
        return user
    
    async def authenticate_social(self, provider: str, token: str) -> Optional[User]:
        """Authenticate user with social provider"""
        # In production, this would verify the social token
        user_id = f"social_{provider}_{hash(token)}"
        
        user = User(
            id=user_id,
            auth_method="social",
            preferences={"social_provider": provider}
        )
        self.users[user_id] = user
        return user
    
    def generate_token(self, user: User) -> str:
        """Generate JWT token for user"""
        payload = {
            'user_id': user.id,
            'auth_method': user.auth_method,
            'exp': datetime.utcnow() + timedelta(minutes=self.token_expiry_minutes)
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm='HS256')
    
    def verify_token(self, token: str) -> Optional[User]:
        """Verify JWT token and return user"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            user_id = payload.get('user_id')
            return self.users.get(user_id)
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    async def create_did(self, user: User) -> str:
        """Create Decentralized Identity for user"""
        # In production, this would create a real DID
        if user.wallet_address:
            return f"did:ethr:{user.wallet_address}"
        else:
            return f"did:web:ai-assistant.com:users:{user.id}"
