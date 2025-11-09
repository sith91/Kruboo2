import logging
import psutil
import platform
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SystemMonitor:
    def __init__(self):
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize system monitor"""
        try:
            self.is_initialized = True
            logger.info("✅ System Monitor initialized successfully")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to initialize System Monitor: {e}")
            return False
    
    async def get_system_info(self) -> Dict[str, Any]:
        """Get comprehensive system information"""
        try:
            # CPU information
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # Memory information
            memory = psutil.virtual_memory()
            swap = psutil.swap_memory()
            
            # Disk information
            disk = psutil.disk_usage('/')
            
            # Network information
            network = psutil.net_io_counters()
            
            # System information
            system_info = {
                'platform': platform.system(),
                'platform_version': platform.version(),
                'architecture': platform.architecture()[0],
                'processor': platform.processor(),
            }
            
            info = {
                'cpu': {
                    'usage_percent': cpu_percent,
                    'core_count': cpu_count,
                    'frequency': psutil.cpu_freq().current if psutil.cpu_freq() else None
                },
                'memory': {
                    'total': memory.total,
                    'available': memory.available,
                    'used': memory.used,
                    'usage_percent': memory.percent
                },
                'swap': {
                    'total': swap.total,
                    'used': swap.used,
                    'usage_percent': swap.percent
                },
                'disk': {
                    'total': disk.total,
                    'used': disk.used,
                    'free': disk.free,
                    'usage_percent': disk.percent
                },
                'network': {
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv
                },
                'system': system_info
            }
            
            return {'success': True, 'info': info}
            
        except Exception as e:
            logger.error(f"Error getting system info: {e}")
            return {'success': False, 'error': str(e)}
    
    async def get_process_info(self) -> Dict[str, Any]:
        """Get information about running processes"""
        try:
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            # Sort by CPU usage
            processes.sort(key=lambda x: x['cpu_percent'] or 0, reverse=True)
            
            return {'success': True, 'processes': processes[:20]}  # Top 20 processes
            
        except Exception as e:
            logger.error(f"Error getting process info: {e}")
            return {'success': False, 'error': str(e)}
    
    async def get_detailed_metrics(self) -> Dict[str, Any]:
        """Get detailed system metrics"""
        try:
            metrics = {
                'cpu_times': dict(psutil.cpu_times()._asdict()),
                'memory_details': {
                    'active': getattr(psutil.virtual_memory(), 'active', None),
                    'inactive': getattr(psutil.virtual_memory(), 'inactive', None),
                    'buffers': getattr(psutil.virtual_memory(), 'buffers', None),
                    'cached': getattr(psutil.virtual_memory(), 'cached', None),
                },
                'disk_io': dict(psutil.disk_io_counters()._asdict()) if psutil.disk_io_counters() else {},
                'network_details': dict(psutil.net_io_counters()._asdict()) if psutil.net_io_counters() else {},
            }
            
            return {'success': True, 'metrics': metrics}
            
        except Exception as e:
            logger.error(f"Error getting detailed metrics: {e}")
            return {'success': False, 'error': str(e)}
    
    async def cleanup(self):
        """Cleanup resources"""
        self.is_initialized = False
