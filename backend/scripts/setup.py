#!/usr/bin/env python3
"""
AI Assistant Backend Setup Script
"""

import os
import sys
import subprocess
import platform
import venv
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a shell command"""
    print(f"Running: {cmd}")
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception: {e}")
        return False

def setup_backend():
    """Setup Python backend environment"""
    print("🚀 Setting up AI Assistant Backend...")
    
    # Determine platform
    system = platform.system().lower()
    is_windows = system == 'windows'
    is_mac = system == 'darwin'
    is_linux = system == 'linux'
    
    print(f"📋 Detected platform: {system}")
    
    # Create virtual environment
    venv_path = Path('.venv')
    print(f"🐍 Creating virtual environment at {venv_path}...")
    
    if not venv_path.exists():
        venv.create(venv_path, with_pip=True)
    
    # Determine Python executable
    if is_windows:
        python_exe = venv_path / 'Scripts' / 'python.exe'
        pip_exe = venv_path / 'Scripts' / 'pip.exe'
    else:
        python_exe = venv_path / 'bin' / 'python'
        pip_exe = venv_path / 'bin' / 'pip'
    
    # Install requirements
    print("📦 Installing Python dependencies...")
    if not run_command(f'"{pip_exe}" install -r requirements.txt'):
        print("❌ Failed to install requirements")
        return False
    
    # Create necessary directories
    print("📁 Creating necessary directories...")
    directories = ['data', 'models', 'temp', 'logs']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    # Initialize database
    print("🗄️ Initializing database...")
    init_script = f'"{python_exe}" -c "from src.database.models import init_db; import asyncio; asyncio.run(init_db())"'
    if not run_command(init_script):
        print("⚠️ Database initialization had issues, but continuing...")
    
    print("✅ Backend setup completed successfully!")
    return True

def create_start_script():
    """Create platform-specific start scripts"""
    system = platform.system().lower()
    
    if system == 'windows':
        # Create Windows batch file
        script_content = """@echo off
cd /d %~dp0
.venv\\Scripts\\python.exe src\\main.py
pause
"""
        with open('start_backend.bat', 'w') as f:
            f.write(script_content)
        print("📝 Created start_backend.bat")
        
    else:
        # Create Unix shell script
        script_content = """#!/bin/bash
cd "$(dirname "$0")"
./.venv/bin/python src/main.py
"""
        with open('start_backend.sh', 'w') as f:
            f.write(script_content)
        # Make executable
        os.chmod('start_backend.sh', 0o755)
        print("📝 Created start_backend.sh")
    
    return True

if __name__ == '__main__':
    success = setup_backend()
    if success:
        create_start_script()
        print("\n🎉 Setup completed! You can now:")
        print("   - On Windows: Run 'start_backend.bat'")
        print("   - On Linux/Mac: Run './start_backend.sh'")
        print("   - Or use: .venv/bin/python src/main.py")
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)
