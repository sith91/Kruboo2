const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platform = process.platform;
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

console.log(`🚀 Building AI Assistant for ${platform}...`);

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  if (fs.existsSync('dist-electron')) {
    fs.rmSync('dist-electron', { recursive: true });
  }
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
} catch (error) {
  console.log('No previous builds to clean');
}

// Build frontend
console.log('📦 Building frontend...');
execSync('npm run build', { stdio: 'inherit' });

// Build backend
console.log('🐍 Building backend...');
const backendPath = path.join(__dirname, '..', '..', 'backend');
process.chdir(backendPath);

// Create Python executable
console.log('🔨 Creating Python executable...');
try {
  if (isWindows) {
    execSync('pyinstaller --onefile --name ai_assistant_backend src/main.py', { stdio: 'inherit' });
  } else {
    execSync('python -m PyInstaller --onefile --name ai_assistant_backend src/main.py', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Failed to build backend:', error);
  process.exit(1);
}

// Copy backend to electron resources
console.log('📁 Copying backend to electron resources...');
const backendDist = path.join(backendPath, 'dist');
const electronBackendPath = path.join(__dirname, '..', 'backend');

if (fs.existsSync(electronBackendPath)) {
  fs.rmSync(electronBackendPath, { recursive: true });
}
fs.mkdirSync(electronBackendPath, { recursive: true });

// Copy backend files
function copyBackendFiles(src, dest) {
  if (fs.existsSync(src)) {
    const files = fs.readdirSync(src);
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(srcPath).isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyBackendFiles(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

copyBackendFiles(backendPath, electronBackendPath);

// Remove unnecessary files
const filesToRemove = [
  '__pycache__',
  '*.pyc',
  '.venv',
  'env',
  'venv',
  'node_modules',
  'dist',
  'build'
];

for (const pattern of filesToRemove) {
  try {
    execSync(`find ${electronBackendPath} -name "${pattern}" -type d -exec rm -rf {} + 2>/dev/null || true`);
  } catch (error) {
    // Ignore errors for non-existent files
  }
}

// Build electron app
console.log('⚡ Building Electron app...');
process.chdir(path.join(__dirname, '..'));

let buildCommand = 'npm run electron:build';
if (isWindows) {
  buildCommand += ' --win';
} else if (isMac) {
  buildCommand += ' --mac';
} else if (isLinux) {
  buildCommand += ' --linux';
}

execSync(buildCommand, { stdio: 'inherit' });

console.log('✅ Build completed successfully!');
console.log('📁 Installers are in: dist-electron/');
