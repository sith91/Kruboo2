const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

// Python backend process
let pythonBackend = null;

class AppWindow {
  constructor() {
    this.mainWindow = null;
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: !isDev
      },
      icon: path.join(__dirname, '../../public/icon.png'),
      titleBarStyle: 'default',
      show: false,
      frame: true,
      transparent: false
    });

    // Load the app
    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    // Show window when ready to prevent visual flash
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Handle external links
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }
}

class PythonBackend {
  constructor() {
    this.process = null;
    this.isRunning = false;
  }

  start() {
    return new Promise((resolve, reject) => {
      const backendPath = isDev 
        ? path.join(__dirname, '../../../backend/src/main.py')
        : path.join(process.resourcesPath, 'backend/src/main.py');

      const pythonExecutable = isDev ? 'python' : path.join(process.resourcesPath, 'python/python.exe');

      this.process = spawn(pythonExecutable, [backendPath], {
        cwd: isDev ? path.join(__dirname, '../../../backend') : path.join(process.resourcesPath, 'backend'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.process.stdout.on('data', (data) => {
        console.log(`Python Backend: ${data}`);
        if (data.toString().includes('Application startup complete')) {
          this.isRunning = true;
          resolve();
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error(`Python Backend Error: ${data}`);
      });

      this.process.on('close', (code) => {
        console.log(`Python Backend process exited with code ${code}`);
        this.isRunning = false;
      });

      this.process.on('error', (err) => {
        console.error('Failed to start Python Backend:', err);
        reject(err);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!this.isRunning) {
          reject(new Error('Python Backend startup timeout'));
        }
      }, 30000);
    });
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.isRunning = false;
    }
  }
}

class IPCHandlers {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.setupHandlers();
  }

  setupHandlers() {
    // Auth handlers
    ipcMain.handle('auth:check', this.handleAuthCheck.bind(this));
    ipcMain.handle('auth:wallet-login', this.handleWalletLogin.bind(this));
    ipcMain.handle('auth:social-login', this.handleSocialLogin.bind(this));
    ipcMain.handle('auth:email-login', this.handleEmailLogin.bind(this));
    ipcMain.handle('auth:logout', this.handleLogout.bind(this));

    // Voice handlers
    ipcMain.handle('voice:start-listening', this.handleStartListening.bind(this));
    ipcMain.handle('voice:stop-listening', this.handleStopListening.bind(this));
    ipcMain.handle('voice:train-wake-word', this.handleTrainWakeWord.bind(this));

    // AI Model handlers
    ipcMain.handle('ai:test-connection', this.handleTestAIConnection.bind(this));
    ipcMain.handle('ai:process-command', this.handleProcessCommand.bind(this));

    // System handlers
    ipcMain.handle('system:open-app', this.handleOpenApp.bind(this));
    ipcMain.handle('system:file-dialog', this.handleFileDialog.bind(this));
    ipcMain.handle('system:get-microphones', this.handleGetMicrophones.bind(this));

    // Config handlers
    ipcMain.handle('config:save', this.handleSaveConfig.bind(this));
    ipcMain.handle('config:complete-setup', this.handleCompleteSetup.bind(this));

    // Blockchain handlers
    ipcMain.handle('blockchain:connect-wallet', this.handleConnectWallet.bind(this));
    ipcMain.handle('blockchain:create-did', this.handleCreateDID.bind(this));
  }

  // Auth Handlers
  async handleAuthCheck() {
    // Simulate auth check - replace with actual implementation
    return { isAuthenticated: false, user: null };
  }

  async handleWalletLogin(event, walletType) {
    try {
      // Simulate wallet login - replace with actual Web3 implementation
      const user = {
        id: 'user_' + Date.now(),
        name: 'Wallet User',
        authMethod: 'wallet',
        walletType: walletType,
        did: 'did:ethr:0x123...'
      };
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleSocialLogin(event, provider) {
    try {
      // Simulate social login - replace with actual OAuth implementation
      const user = {
        id: 'user_' + Date.now(),
        name: 'Social User',
        authMethod: 'social',
        provider: provider,
        email: 'user@example.com'
      };
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleEmailLogin(event, email, password) {
    try {
      // Simulate email login - replace with actual authentication
      const user = {
        id: 'user_' + Date.now(),
        name: 'Email User',
        authMethod: 'email',
        email: email
      };
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleLogout() {
    return { success: true };
  }

  // Voice Handlers
  async handleStartListening() {
    try {
      // Start voice recognition through Python backend
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleStopListening() {
    try {
      // Stop voice recognition
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleTrainWakeWord(event, wakeWord, audioSamples) {
    try {
      // Train custom wake word
      return { success: true, trained: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // AI Model Handlers
  async handleTestAIConnection(event, modelConfig) {
    try {
      // Test AI model connection
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      return { success: true, responseTime: 450 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleProcessCommand(event, command, context) {
    try {
      // Process command through AI model
      const response = {
        text: `I received your command: "${command}". This is a simulated response.`,
        action_required: false,
        confidence: 0.95
      };
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // System Handlers
  async handleOpenApp(event, appName) {
    try {
      const { exec } = require('child_process');
      
      let command;
      switch (process.platform) {
        case 'win32':
          command = `start ${appName}`;
          break;
        case 'darwin':
          command = `open -a "${appName}"`;
          break;
        case 'linux':
          command = `${appName}`;
          break;
        default:
          throw new Error('Unsupported platform');
      }

      exec(command);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleFileDialog(event, options = {}) {
    try {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        title: options.title || 'Select File or Directory',
        properties: options.properties || ['openFile'],
        filters: options.filters || []
      });

      if (result.canceled) {
        return { success: false, error: 'User cancelled' };
      }

      return { success: true, path: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleGetMicrophones() {
    try {
      // This would typically use a native module to list microphones
      const microphones = [
        { id: 'default', name: 'Default Microphone' },
        { id: 'mic1', name: 'Built-in Microphone' },
        { id: 'mic2', name: 'External USB Microphone' }
      ];
      return { success: true, microphones };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Config Handlers
  async handleSaveConfig(event, config) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'user-config.json');
      
      let existingConfig = {};
      try {
        const existingData = await fs.readFile(configPath, 'utf8');
        existingConfig = JSON.parse(existingData);
      } catch (e) {
        // File doesn't exist or is invalid, start fresh
      }

      const newConfig = { ...existingConfig, ...config };
      await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleCompleteSetup() {
    try {
      // Mark setup as complete
      const config = { setupComplete: true, setupDate: new Date().toISOString() };
      return await this.handleSaveConfig(null, config);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Blockchain Handlers
  async handleConnectWallet(event, walletType) {
    try {
      // Connect to blockchain wallet
      return { 
        success: true, 
        address: '0x742E4C2F5D4eA5C4a29d8a421cD8B569b9c8E9F1',
        chainId: 1 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleCreateDID(event, options = {}) {
    try {
      // Create decentralized identity
      const did = `did:ethr:0x742E4C2F5D4eA5C4a29d8a421cD8B569b9c8E9F1`;
      return { success: true, did };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// App initialization
app.whenReady().then(async () => {
  // Start Python backend
  pythonBackend = new PythonBackend();
  
  try {
    await pythonBackend.start();
    console.log('Python Backend started successfully');
  } catch (error) {
    console.error('Failed to start Python Backend:', error);
    dialog.showErrorBox('Backend Error', 'Failed to start AI backend services. The app may not function correctly.');
  }

  // Create main window
  const appWindow = new AppWindow();
  appWindow.createWindow();

  // Setup IPC handlers
  new IPCHandlers(appWindow.mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      appWindow.createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (pythonBackend) {
    pythonBackend.stop();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (pythonBackend) {
    pythonBackend.stop();
  }
});
