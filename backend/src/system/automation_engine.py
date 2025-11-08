"""
System Automation Engine - Handles application and file system operations
"""
import asyncio
import subprocess
import psutil
import os
from typing import Dict, Any, List, Optional
from pathlib import Path

class AutomationEngine:
    """Handles system automation tasks"""
    
    def __init__(self):
        self.supported_actions = {
            'open_app': self._open_application,
            'close_app': self._close_application,
            'create_file': self._create_file,
            'delete_file': self._delete_file,
            'search_files': self._search_files,
            'system_info': self._get_system_info,
            'run_command': self._run_system_command
        }
        
    async def initialize(self):
        """Initialize automation engine"""
        logger.info("Initializing Automation Engine...")
        # Verify we have necessary permissions
        logger.info("Automation Engine ready")
    
    async def shutdown(self):
        """Cleanup resources"""
        pass
    
    async def execute_action(self, action: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Execute a system action"""
        action_type = action.get('type')
        
        if action_type not in self.supported_actions:
            return {
                'success': False,
                'error': f'Unsupported action type: {action_type}'
            }
        
        try:
            handler = self.supported_actions[action_type]
            result = await handler(action.get('parameters', {}), user_id)
            return {
                'success': True,
                'result': result
            }
        except Exception as e:
            logger.error(f"Action execution failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def _open_application(self, params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Open an application"""
        app_name = params.get('name')
        if not app_name:
            raise ValueError("Application name required")
        
        try:
            if os.name == 'nt':  # Windows
                subprocess.Popen(app_name, shell=True)
            elif os.name == 'posix':  # macOS/Linux
                if os.uname().sysname == 'Darwin':  # macOS
                    subprocess.Popen(['open', '-a', app_name])
                else:  # Linux
                    subprocess.Popen([app_name])
            
            return {'message': f'Opened {app_name}'}
            
        except Exception as e:
            raise Exception(f"Failed to open {app_name}: {e}")
    
    async def _close_application(self, params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Close an application"""
        app_name = params.get('name')
        if not app_name:
            raise ValueError("Application name required")
        
        try:
            for proc in psutil.process_iter(['name']):
                if proc.info['name'] and app_name.lower() in proc.info['name'].lower():
                    proc.terminate()
                    return {'message': f'Closed {app_name}'}
            
            raise Exception(f"Application {app_name} not found")
            
        except Exception as e:
            raise Exception(f"Failed to close {app_name}: {e}")
    
    async def _create_file(self, params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Create a new file"""
        file_path = params.get('path')
        content = params.get('content', '')
        
        if not file_path:
            raise ValueError("File path required")
        
        try:
            path = Path(file_path)
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return {'message': f'Created file: {file_path}'}
            
        except Exception as e:
            raise Exception(f"Failed to create file: {e}")
    
    async def _search_files(self, params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Search for files"""
        query = params.get('query')
        directory = params.get('directory', '.')
        
        if not query:
            raise ValueError("Search query required")
        
        try:
            results = []
            search_path = Path(directory)
            
            # Simple file search - in production, use more efficient methods
            for file_path in search_path.rglob('*'):
                if query.lower() in file_path.name.lower():
                    stats = file_path.stat()
                    results.append({
                        'path': str(file_path),
                        'name': file_path.name,
                        'size': stats.st_size,
                        'modified': stats.st_mtime
                    })
            
            return {
                'results': results[:50],  # Limit results
                'count': len(results)
            }
            
        except Exception as e:
            raise Exception(f"File search failed: {e}")
    
    async def _get_system_info(self, params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Get system information"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu': {
                    'percent': cpu_percent,
                    'cores': psutil.cpu_count(),
                    'frequency': psutil.cpu_freq().current if psutil.cpu_freq() else None
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'percent': memory.percent,
                    'used': memory.used
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'percent': disk.percent
                }
            }
            
        except Exception as e:
            raise Exception(f"Failed to get system info: {e}")
    
    async def _run_system_command(self, params: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """Execute a system command"""
        command = params.get('command')
        if not command:
            raise ValueError("Command required")
        
        try:
            # Security: Validate command to prevent injection
            allowed_commands = ['ls', 'pwd', 'dir', 'echo', 'date']
            cmd_parts = command.split()
            base_cmd = cmd_parts[0]
            
            if base_cmd not in allowed_commands:
                raise ValueError(f"Command not allowed: {base_cmd}")
            
            result = subprocess.run(
                cmd_parts,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return {
                'stdout': result.stdout,
                'stderr': result.stderr,
                'return_code': result.returncode
            }
            
        except subprocess.TimeoutExpired:
            raise Exception("Command execution timed out")
        except Exception as e:
            raise Exception(f"Command execution failed: {e}")
