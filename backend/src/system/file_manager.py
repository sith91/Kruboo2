import logging
import os
import shutil
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class FileManager:
    def __init__(self):
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize file manager"""
        try:
            self.is_initialized = True
            logger.info("✅ File Manager initialized successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize File Manager: {e}")
            return False
    
    async def open_file(self, file_path: str) -> Dict[str, Any]:
        """Open a file"""
        try:
            if not os.path.exists(file_path):
                return {'success': False, 'error': 'File does not exist'}
            
            # Open file with default application
            if os.name == 'nt':  # Windows
                os.startfile(file_path)
            elif os.name == 'posix':  # macOS, Linux
                os.system(f'open "{file_path}"' if os.uname().sysname == 'Darwin' else f'xdg-open "{file_path}"')
            
            logger.info(f"📁 Opened file: {file_path}")
            return {'success': True, 'path': file_path}
            
        except Exception as e:
            logger.error(f"Error opening file {file_path}: {e}")
            return {'success': False, 'error': str(e)}
    
    async def find_file(self, pattern: str, search_path: str = None) -> Dict[str, Any]:
        """Find files matching pattern"""
        try:
            if search_path is None:
                search_path = os.path.expanduser("~")
            
            matches = []
            for root, dirs, files in os.walk(search_path):
                for file in files:
                    if pattern.lower() in file.lower():
                        full_path = os.path.join(root, file)
                        matches.append({
                            'path': full_path,
                            'name': file,
                            'size': os.path.getsize(full_path),
                            'modified': os.path.getmtime(full_path)
                        })
                
                # Limit results for performance
                if len(matches) >= 50:
                    break
            
            logger.info(f"🔍 Found {len(matches)} files matching '{pattern}'")
            return {'success': True, 'matches': matches}
            
        except Exception as e:
            logger.error(f"Error finding files: {e}")
            return {'success': False, 'error': str(e)}
    
    async def create_file(self, file_path: str, content: str = "") -> Dict[str, Any]:
        """Create a new file"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"📄 Created file: {file_path}")
            return {'success': True, 'path': file_path}
            
        except Exception as e:
            logger.error(f"Error creating file {file_path}: {e}")
            return {'success': False, 'error': str(e)}
    
    async def delete_file(self, file_path: str) -> Dict[str, Any]:
        """Delete a file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"🗑️ Deleted file: {file_path}")
                return {'success': True, 'path': file_path}
            else:
                return {'success': False, 'error': 'File does not exist'}
                
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            return {'success': False, 'error': str(e)}
    
    async def list_directory(self, directory: str = None) -> Dict[str, Any]:
        """List directory contents"""
        try:
            if directory is None:
                directory = os.getcwd()
            
            if not os.path.exists(directory):
                return {'success': False, 'error': 'Directory does not exist'}
            
            items = []
            for item in os.listdir(directory):
                full_path = os.path.join(directory, item)
                item_info = {
                    'name': item,
                    'path': full_path,
                    'is_directory': os.path.isdir(full_path),
                    'size': os.path.getsize(full_path) if os.path.isfile(full_path) else 0,
                    'modified': os.path.getmtime(full_path)
                }
                items.append(item_info)
            
            return {'success': True, 'items': items, 'directory': directory}
            
        except Exception as e:
            logger.error(f"Error listing directory {directory}: {e}")
            return {'success': False, 'error': str(e)}
    
    async def cleanup(self):
        """Cleanup resources"""
        self.is_initialized = False
