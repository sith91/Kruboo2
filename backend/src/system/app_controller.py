import logging
import subprocess
import psutil
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class AppController:
    def __init__(self):
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize application controller"""
        try:
            self.is_initialized = True
            logger.info("✅ Application Controller initialized successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize Application Controller: {e}")
            return False
    
    async def open_application(self, app_name: str) -> Dict[str, Any]:
        """Open an application"""
        try:
            # Map common app names to commands
            app_commands = {
                'calculator': 'calc' if os.name == 'nt' else 'gnome-calculator',
                'notepad': 'notepad' if os.name == 'nt' else 'gedit',
                'file explorer': 'explorer' if os.name == 'nt' else 'nautilus',
                'browser': 'start chrome' if os.name == 'nt' else 'google-chrome',
                'terminal': 'cmd' if os.name == 'nt' else 'gnome-terminal'
            }
            
            command = app_commands.get(app_name.lower(), app_name)
            
            # Execute the command
            if os.name == 'nt':
                subprocess.Popen(command, shell=True)
            else:
                subprocess.Popen(command.split())
            
            logger.info(f"🚀 Opened application: {app_name}")
            return {'success': True, 'app': app_name}
            
        except Exception as e:
            logger.error(f"Error opening application {app_name}: {e}")
            return {'success': False, 'error': str(e)}
    
    async def close_application(self, app_name: str) -> Dict[str, Any]:
        """Close an application"""
        try:
            # Find and terminate process
            for proc in psutil.process_iter(['name']):
                if app_name.lower() in proc.info['name'].lower():
                    proc.terminate()
                    logger.info(f"🛑 Closed application: {app_name}")
                    return {'success': True, 'app': app_name}
            
            return {'success': False, 'error': f'Application {app_name} not found'}
            
        except Exception as e:
            logger.error(f"Error closing application {app_name}: {e}")
            return {'success': False, 'error': str(e)}
    
    async def get_running_applications(self) -> Dict[str, Any]:
        """Get list of running applications"""
        try:
            running_apps = []
            for proc in psutil.process_iter(['name', 'pid', 'memory_info']):
                try:
                    app_info = {
                        'name': proc.info['name'],
                        'pid': proc.info['pid'],
                        'memory_usage': proc.info['memory_info'].rss if proc.info['memory_info'] else 0
                    }
                    running_apps.append(app_info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            return {'success': True, 'applications': running_apps}
            
        except Exception as e:
            logger.error(f"Error getting running applications: {e}")
            return {'success': False, 'error': str(e)}
    
    async def cleanup(self):
        """Cleanup resources"""
        self.is_initialized = False
