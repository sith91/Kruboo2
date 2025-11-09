# -*- mode: python ; coding: utf-8 -*-

import sys
import os
from pathlib import Path

# Add the src directory to the path
sys.path.append(str(Path(__file__).parent / 'src'))

block_cipher = None

# Include data files
def get_data_files():
    datas = []
    
    # Include config files
    config_files = [
        'config/default.yaml',
        'requirements.txt'
    ]
    
    for file in config_files:
        if os.path.exists(file):
            datas.append((file, 'config'))
    
    # Include data directory
    if os.path.exists('data'):
        datas.append(('data', 'data'))
    
    return datas

a = Analysis(
    ['src/main.py'],
    pathex=[],
    binaries=[],
    datas=get_data_files(),
    hiddenimports=[
        'aiohttp',
        'aiofiles',
        'fastapi',
        'uvicorn',
        'speech_recognition',
        'pyttsx3',
        'pvporcupine',
        'psutil',
        'web3',
        'jwt',
        'cryptography',
        'sqlite3',
        'asyncio'
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='ai_assistant_backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Set to False for production
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='ai_assistant_backend',
)
