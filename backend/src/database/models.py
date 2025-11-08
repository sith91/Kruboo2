"""
SQLAlchemy database models
"""
from sqlalchemy import Column, String, Text, DateTime, JSON, Boolean, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, nullable=True)
    wallet_address = Column(String(42), unique=True, nullable=True)  # Ethereum address format
    auth_method = Column(String(20), nullable=False)  # email, wallet, social
    social_provider = Column(String(20), nullable=True)  # google, github, apple
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    preferences = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), nullable=False)
    session_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=func.now())
    last_activity = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)

class CommandHistory(Base):
    __tablename__ = "command_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), nullable=False)
    session_id = Column(String(64), nullable=False)
    command_text = Column(Text, nullable=False)
    command_type = Column(String(20), default="voice")  # voice, text
    ai_response = Column(Text, nullable=True)
    actions_executed = Column(JSON, default=list)
    confidence = Column(Integer, default=0) 
