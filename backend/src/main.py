#!/usr/bin/env python3
"""
AI Assistant Backend Main Entry Point
"""
import asyncio
import logging
import signal
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from core.assistant_core import AIAssistantCore
from api.fastapi_app import create_app
from database.models import init_database
from config.config_manager import ConfigManager

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_assistant.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

class AIAssistantBackend:
    def __init__(self):
        self.config = ConfigManager()
        self.assistant_core = None
        self.fastapi_app = None
        self.is_running = False

    async def startup(self):
        """Initialize and start all backend services"""
        try:
            logger.info("Starting AI Assistant Backend...")
            
            # Initialize database
            await init_database()
            logger.info("Database initialized")
            
            # Initialize core assistant
            self.assistant_core = AIAssistantCore()
            await self.assistant_core.initialize()
            logger.info("AI Assistant Core initialized")
            
            # Create FastAPI application
            self.fastapi_app = create_app(self.assistant_core)
            logger.info("FastAPI application created")
            
            self.is_running = True
            logger.info("🎯 AI Assistant Backend started successfully!")
            logger.info(f"📡 API Server running on http://{self.config.server.host}:{self.config.server.port}")
            
        except Exception as e:
            logger.error(f"Failed to start backend: {e}")
            raise

    async def shutdown(self):
        """Gracefully shutdown all services"""
        logger.info("Shutting down AI Assistant Backend...")
        
        self.is_running = False
        
        if self.assistant_core:
            await self.assistant_core.shutdown()
        
        logger.info("AI Assistant Backend shutdown complete")

def handle_exception(loop, context):
    """Handle uncaught exceptions"""
    msg = context.get("exception", context["message"])
    logger.error(f"Uncaught exception: {msg}")
    
    # Exit gracefully on critical errors
    if "exception" in context and isinstance(context["exception"], (KeyboardInterrupt, SystemExit)):
        sys.exit(1)

async def main():
    """Main application entry point"""
    backend = AIAssistantBackend()
    
    # Setup signal handlers
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda: asyncio.create_task(backend.shutdown()))
    
    # Set exception handler
    loop.set_exception_handler(handle_exception)
    
    try:
        await backend.startup()
        
        # Keep the application running
        while backend.is_running:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    except Exception as e:
        logger.error(f"Application error: {e}")
    finally:
        await backend.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
