/**
 * IPC Handlers - Main process communication with renderer
 */
const { ipcMain, dialog, shell, app, powerMonitor } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { PythonShell } = require('python-shell');

class IPCHandlers {
  constructor(mainWindow, pythonBackend) {
    this.mainWindow = mainWindow;
    this.pythonBackend = pythonBackend;
    this.userSessions = new Map();
    this.voiceSessions = new Map();
    this.setupHandlers();
  }

  setupHandlers() {
    // Authentication Handlers
    this.setupAuthHandlers();
    
    // Voice & Audio Handlers
    this.setupVoiceHandlers();
    
    // AI Model Handlers
    this.setupAIHandlers();
    
    // System Integration Handlers
    this.setupSystemHandlers();
    
    // File System Handlers
    this.setupFileSystemHandlers();
    
    // Configuration Handlers
    this.setupConfigHandlers();
    
    // Blockchain Handlers
    this.setupBlockchainHandlers();
    
    // Utility Handlers
    this.setupUtilityHandlers();
  }

  // ===== AUTHENTICATION HANDLERS =====
  setupAuthHandlers() {
    ipcMain.handle('auth:check', this.handleAuthCheck.bind(this));
    ipcMain.handle('auth:wallet-login', this.handleWalletLogin.bind(this));
    ipcMain.handle('auth:social-login', this.handleSocialLogin.bind(this));
    ipcMain.handle('auth:email-login', this.handleEmailLogin.bind(this));
    ipcMain.handle('auth:logout', this.handleLogout.bind(this));
    ipcMain.handle('auth:get-user', this.handleGetUser.bind(this));
  }

  async handleAuthCheck() {
    try {
      // Check if user session exists
      const userDataPath = this.getUserDataPath();
      try {
        const userData = await fs.readFile(path.join(userDataPath, 'user-session.json'), 'utf8');
        const session = JSON.parse(userData);
        
        if (session.expires > Date.now()) {
          return { isAuthenticated: true, user: session.user };
        }
      } catch (error) {
        // Session file doesn't exist or is invalid
      }
      
      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.error('Auth check error:', error);
      return { isAuthenticated: false, user: null, error: error.message };
    }
  }

  async handleWalletLogin(event, walletType) {
    try {
      // Simulate wallet connection and verification
      // In production, this would use web3.js or ethers.js
      await this.simulateDelay(1000);
      
      const walletAddress = this.generateMockAddress();
      const user = {
        id: `wallet_${walletAddress}`,
        walletAddress: walletAddress,
        authMethod: 'wallet',
        walletType: walletType,
        name: 'Wallet User',
        did: `did:ethr:${walletAddress}`,
        createdAt: new Date().toISOString()
      };

      // Create user session
      await this.createUserSession(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Wallet login error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleSocialLogin(event, provider) {
    try {
      // Simulate social login process
      await this.simulateDelay(1500);
      
      const user = {
        id: `social_${provider}_${Date.now()}`,
        authMethod: 'social',
        provider: provider,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        email: `user@${provider}.com`,
        createdAt: new Date().toISOString()
      };

      await this.createUserSession(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Social login error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleEmailLogin(event, email, password) {
    try {
      // Basic validation
      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Invalid email address' };
      }

      if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }

      await this.simulateDelay(1000);
      
      const user = {
        id: `email_${Buffer.from(email).toString('base64')}`,
        authMethod: 'email',
        email: email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      };

      await this.createUserSession(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Email login error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleLogout(event, userId) {
    try {
      const userDataPath = this.getUserDataPath();
      const sessionFile = path.join(userDataPath, 'user-session.json');
      
      try {
        await fs.unlink(sessionFile);
      } catch (error) {
        // File might not exist
      }
      
      // Clear any active sessions
      this.userSessions.delete(userId);
      this.voiceSessions.delete(userId);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGetUser(event, userId) {
    try {
      const userDataPath = this.getUserDataPath();
      const sessionFile = path.join(userDataPath, 'user-session.json');
      
      try {
        const userData = await fs.readFile(sessionFile, 'utf8');
        const session = JSON.parse(userData);
        return { success: true, user: session.user };
      } catch (error) {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== VOICE HANDLERS =====
  setupVoiceHandlers() {
    ipcMain.handle('voice:start-listening', this.handleStartListening.bind(this));
    ipcMain.handle('voice:stop-listening', this.handleStopListening.bind(this));
    ipcMain.handle('voice:train-wake-word', this.handleTrainWakeWord.bind(this));
    ipcMain.handle('voice:get-microphones', this.handleGetMicrophones.bind(this));
    ipcMain.handle('voice:test-microphone', this.handleTestMicrophone.bind(this));
    ipcMain.handle('voice:synthesize-speech', this.handleSynthesizeSpeech.bind(this));
    ipcMain.handle('voice:toggle-mute', this.handleToggleMute.bind(this));
  }

  async handleStartListening(event, sessionId, userId) {
    try {
      // Initialize voice session
      const session = {
        id: sessionId,
        userId: userId,
        startTime: Date.now(),
        isListening: true,
        audioData: []
      };
      
      this.voiceSessions.set(sessionId, session);
      
      // Notify Python backend to start voice recognition
      if (this.pythonBackend && this.pythonBackend.isRunning) {
        // Send message to Python backend via WebSocket or HTTP
        this.sendToPythonBackend('start_voice_session', {
          session_id: sessionId,
          user_id: userId
        });
      }
      
      // Send wake word detection status
      this.mainWindow.webContents.send('voice:status', {
        sessionId,
        status: 'listening',
        wakeWordDetected: false
      });
      
      return { success: true, sessionId };
    } catch (error) {
      console.error('Start listening error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleStopListening(event, sessionId) {
    try {
      const session = this.voiceSessions.get(sessionId);
      if (session) {
        session.isListening = false;
        
        // Notify Python backend
        if (this.pythonBackend && this.pythonBackend.isRunning) {
          this.sendToPythonBackend('stop_voice_session', { session_id: sessionId });
        }
        
        this.mainWindow.webContents.send('voice:status', {
          sessionId,
          status: 'stopped'
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Stop listening error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleTrainWakeWord(event, userId, wakeWord, audioSamples) {
    try {
      // Send training data to Python backend
      if (this.pythonBackend && this.pythonBackend.isRunning) {
        const result = await this.sendToPythonBackend('train_wake_word', {
          user_id: userId,
          wake_word: wakeWord,
          audio_samples: audioSamples
        });
        
        return { success: result.success, accuracy: result.accuracy };
      }
      
      // Simulate training for development
      await this.simulateDelay(3000);
      return { success: true, accuracy: 0.85 };
    } catch (error) {
      console.error('Wake word training error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGetMicrophones() {
    try {
      // This would typically use a native module to list microphones
      // For now, return mock data
      const microphones = [
        { id: 'default', name: 'Default Microphone', isDefault: true },
        { id: 'internal', name: 'Built-in Microphone', isDefault: false },
        { id: 'usb', name: 'USB Microphone', isDefault: false },
        { id: 'bluetooth', name: 'Bluetooth Headset', isDefault: false }
      ];
      
      return { success: true, microphones };
    } catch (error) {
      console.error('Get microphones error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleTestMicrophone(event, deviceId) {
    try {
      // Simulate microphone test
      await this.simulateDelay(2000);
      
      // Random success/failure for simulation
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        return { 
          success: true, 
          message: 'Microphone test successful! Your microphone is working properly.',
          audioLevel: 0.7
        };
      } else {
        return { 
          success: false, 
          error: 'Microphone test failed. Please check your microphone permissions and connections.'
        };
      }
    } catch (error) {
      console.error('Microphone test error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleSynthesizeSpeech(event, text, voiceSettings) {
    try {
      // Send text to Python backend for TTS
      if (this.pythonBackend && this.pythonBackend.isRunning) {
        const result = await this.sendToPythonBackend('synthesize_speech', {
          text: text,
          voice_settings: voiceSettings
        });
        
        return { 
          success: true, 
          audioData: result.audio_data,
          duration: result.duration
        };
      }
      
      // Simulate TTS for development
      await this.simulateDelay(1000);
      return { 
        success: true, 
        audioData: Buffer.from('simulated_audio_data').toString('base64'),
        duration: text.length * 0.1 // Rough estimate
      };
    } catch (error) {
      console.error('Speech synthesis error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleToggleMute(event, muted) {
    try {
      // Handle mute/unmute logic
      this.mainWindow.webContents.send('voice:status', {
        muted: muted,
        status: muted ? 'muted' : 'active'
      });
      
      return { success: true, muted };
    } catch (error) {
      console.error('Toggle mute error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== AI MODEL HANDLERS =====
  setupAIHandlers() {
    ipcMain.handle('ai:test-connection', this.handleTestAIConnection.bind(this));
    ipcMain.handle('ai:process-command', this.handleProcessCommand.bind(this));
    ipcMain.handle('ai:configure-model', this.handleConfigureModel.bind(this));
    ipcMain.handle('ai:get-models', this.handleGetModels.bind(this));
    ipcMain.handle('ai:switch-model', this.handleSwitchModel.bind(this));
  }

  async handleTestAIConnection(event, modelConfig) {
    try {
      // Test connection to AI model
      if (this.pythonBackend && this.pythonBackend.isRunning) {
        const result = await this.sendToPythonBackend('test_ai_connection', modelConfig);
        return result;
      }
      
      // Simulate connection test for development
      await this.simulateDelay(2000);
      
      // Simulate different outcomes based on model type
      const successRates = {
        'deepseek': 0.95,
        'openai': 0.90,
        'llama': 0.80,
        'anthropic': 0.92
      };
      
      const success = Math.random() < (successRates[modelConfig.type] || 0.8);
      
      if (success) {
        return {
          success: true,
          responseTime: Math.random() * 500 + 200, // 200-700ms
          modelInfo: {
            name: modelConfig.type,
            version: '1.0.0',
            capabilities: this.getModelCapabilities(modelConfig.type)
          }
        };
      } else {
        return {
          success: false,
          error: 'Connection failed. Please check your API key and network connection.'
        };
      }
    } catch (error) {
      console.error('AI connection test error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleProcessCommand(event, command, context = {}) {
    try {
      // Send command to Python backend for processing
      if (this.pythonBackend && this.pythonBackend.isRunning) {
        const result = await this.sendToPythonBackend('process_command', {
          command: command,
          context: context
        });
        
        return result;
      }
      
      // Simulate AI response for development
      await this.simulateDelay(1000);
      
      const responses = {
        greeting: [
          "Hello! I'm your AI assistant. How can I help you today?",
          "Hi there! I'm here and ready to assist you.",
          "Greetings! What can I do for you?"
        ],
        weather: [
          "I don't have real-time weather data access yet, but I can help you search for it online.",
          "For weather information, I recommend checking your favorite weather website or app."
        ],
        time: [
          `The current time is ${new Date().toLocaleTimeString()}.`,
          `It's ${new Date().toLocaleTimeString()} right now.`
        ],
        default: [
          "I understand you're asking about something. I'm still learning, but I'll do my best to help!",
          "That's an interesting question. Let me think about how I can assist you with that.",
          "I've processed your request. Is there anything specific you'd like me to help with?"
        ]
      };
      
      const commandLower = command.toLowerCase();
      let responseType = 'default';
      
      if (commandLower.includes('hello') || commandLower.includes('hi')) {
        responseType = 'greeting';
      } else if (commandLower.includes('weather')) {
        responseType = 'weather';
      } else if (commandLower.includes('time')) {
        responseType = 'time';
      }
      
      const possibleResponses = responses[responseType];
      const response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
      
      return {
        success: true,
        response: {
          text: response,
          confidence: 0.8 + Math.random() * 0.2,
          actions: this.extractActionsFromCommand(command),
          model_used: 'simulated'
        }
      };
    } catch (error) {
      console.error('Process command error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleConfigureModel(event, modelConfig) {
    try {
      // Send model configuration to Python backend
      if (this.pythonBackend && this.pythonBackend.isRunning) {
        const result = await this.sendToPythonBackend('configure_model', modelConfig);
        return result;
      }
      
      // Simulate configuration for development
      await this.simulateDelay(1500);
      return { success: true, message: 'Model configured successfully' };
    } catch (error) {
      console.error('Configure model error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGetModels() {
    try {
      const models = {
        'deepseek': {
          name: 'DeepSeek AI',
          description: 'Advanced reasoning and coding capabilities',
          type: 'cloud',
          supports: ['coding', 'reasoning', 'analysis'],
          pricing: 'Free tier available'
        },
        'openai': {
          name: 'OpenAI GPT-4',
          description: 'Creative writing and comprehensive analysis',
          type: 'cloud',
          supports: ['creative', 'analysis', 'conversation'],
          pricing: 'Pay-per-use'
        },
        'llama': {
          name: 'Local Llama 2',
          description: 'Complete privacy with offline processing',
          type: 'local',
          supports: ['privacy', 'offline', 'general'],
          requirements: '8GB+ RAM, 4GB storage'
        },
        'anthropic': {
          name: 'Anthropic Claude',
          description: 'Helpful and harmless enterprise-focused AI',
          type: 'cloud',
          supports: ['enterprise', 'reasoning', 'safety'],
          pricing: 'Business pricing'
        }
      };
      
      return { success: true, models };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleSwitchModel(event, newModelConfig) {
    try {
      // Test new model connection first
      const testResult = await this.handleTestAIConnection(event, newModelConfig);
      
      if (!testResult.success) {
        return testResult;
      }
      
      // Configure the new model
      return await this.handleConfigureModel(event, newModelConfig);
    } catch (error) {
      console.error('Switch model error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== SYSTEM INTEGRATION HANDLERS =====
  setupSystemHandlers() {
    ipcMain.handle('system:open-app', this.handleOpenApp.bind(this));
    ipcMain.handle('system:close-app', this.handleCloseApp.bind(this));
    ipcMain.handle('system:get-system-info', this.handleGetSystemInfo.bind(this));
    ipcMain.handle('system:execute-command', this.handleExecuteCommand.bind(this));
    ipcMain.handle('system:monitor-resources', this.handleMonitorResources.bind(this));
    ipcMain.handle('system:get-running-apps', this.handleGetRunningApps.bind(this));
  }

  async handleOpenApp(event, appName) {
    try {
      let command;
      
      switch (process.platform) {
        case 'win32':
          command = `start "" "${appName}"`;
          break;
        case 'darwin':
          command = `open -a "${appName}"`;
          break;
        case 'linux':
          command = `${appName}`;
          break;
        default:
          throw new Error(`Unsupported platform: ${process.platform}`);
      }
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error opening app ${appName}:`, error);
        }
      });
      
      return { success: true, message: `Opened ${appName}` };
    } catch (error) {
      console.error('Open app error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleCloseApp(event, appName) {
    try {
      let command;
      
      switch (process.platform) {
        case 'win32':
          command = `taskkill /IM ${appName}.exe /F`;
          break;
        case 'darwin':
          command = `pkill -f "${appName}"`;
          break;
        case 'linux':
          command = `pkill -f "${appName}"`;
          break;
        default:
          throw new Error(`Unsupported platform: ${process.platform}`);
      }
      
      exec(command, (error, stdout, stderr) => {
        if (error && !error.message.includes('not found')) {
          console.error(`Error closing app ${appName}:`, error);
        }
      });
      
      return { success: true, message: `Closed ${appName}` };
    } catch (error) {
      console.error('Close app error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGetSystemInfo() {
    try {
      const systemInfo = {
        platform: process.platform,
        arch: process.arch,
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAverage: os.loadavg(),
        uptime: os.uptime(),
        userInfo: os.userInfo(),
        networkInterfaces: os.networkInterfaces()
      };
      
      return { success: true, systemInfo };
    } catch (error) {
      console.error('Get system info error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleExecuteCommand(event, command) {
    try {
      // Security: Only allow safe commands
      const safeCommands = ['ls', 'pwd', 'dir', 'echo', 'date', 'whoami'];
      const commandParts = command.split(' ');
      const baseCommand = commandParts[0];
      
      if (!safeCommands.includes(baseCommand)) {
        return { 
          success: false, 
          error: `Command '${baseCommand}' is not allowed for security reasons.` 
        };
      }
      
      return new Promise((resolve) => {
        exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
          if (error) {
            resolve({ 
              success: false, 
              error: error.message,
              stderr: stderr
            });
          } else {
            resolve({
              success: true,
              stdout: stdout,
              stderr: stderr
            });
          }
        });
      });
    } catch (error) {
      console.error('Execute command error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleMonitorResources() {
    try {
      const usage = {
        cpu: process.cpuUsage(),
        memory: process.memoryUsage(),
        system: {
          cpu: os.loadavg(),
          memory: {
            total: os.totalmem(),
            free: os.freemem(),
            used: os.totalmem() - os.freemem()
          }
        }
      };
      
      return { success: true, usage };
    } catch (error) {
      console.error('Monitor resources error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGetRunningApps() {
    try {
      // This would typically use ps-list or similar
      // For now, return mock data
      const apps = [
        { name: 'Chrome', pid: 1234, memory: 1024 },
        { name: 'Code', pid: 5678, memory: 512 },
        { name: 'Terminal', pid: 9012, memory: 256 }
      ];
      
      return { success: true, apps };
    } catch (error) {
      console.error('Get running apps error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== FILE SYSTEM HANDLERS =====
  setupFileSystemHandlers() {
    ipcMain.handle('fs:open-dialog', this.handleOpenDialog.bind(this));
    ipcMain.handle('fs:save-dialog', this.handleSaveDialog.bind(this));
    ipcMain.handle('fs:read-file', this.handleReadFile.bind(this));
    ipcMain.handle('fs:write-file', this.handleWriteFile.bind(this));
    ipcMain.handle('fs:search-files', this.handleSearchFiles.bind(this));
    ipcMain.handle('fs:create-file', this.handleCreateFile.bind(this));
    ipcMain.handle('fs:delete-file', this.handleDeleteFile.bind(this));
  }

  async handleOpenDialog(event, options = {}) {
    try {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        title: options.title || 'Select File or Directory',
        defaultPath: options.defaultPath || app.getPath('documents'),
        properties: options.properties || ['openFile'],
        filters: options.filters || [
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.canceled) {
        return { success: false, error: 'User cancelled file selection' };
      }
      
      return { success: true, filePaths: result.filePaths };
    } catch (error) {
      console.error('Open dialog error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleSaveDialog(event, options = {}) {
    try {
      const result = await dialog.showSaveDialog(this.mainWindow, {
        title: options.title || 'Save File',
        defaultPath: options.defaultPath || app.getPath('documents'),
        filters: options.filters || [
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.canceled) {
        return { success: false, error: 'User cancelled save' };
      }
      
      return { success: true, filePath: result.filePath };
    } catch (error) {
      console.error('Save dialog error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleReadFile(event, filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return { success: true, data };
    } catch (error) {
      console.error('Read file error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleWriteFile(event, filePath, data) {
    try {
      await fs.writeFile(filePath, data, 'utf8');
      return { success: true };
    } catch (error) {
      console.error('Write file error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleSearchFiles(event, query, directory = '.') {
    try {
      // Simple file search implementation
      // In production, this would be more efficient
      const results = [];
      const searchDir = path.isAbsolute(directory) ? directory : path.join(process.cwd(), directory);
      
      async function searchRecursively(currentPath) {
        try {
          const items = await fs.readdir(currentPath);
          
          for (const item of items) {
            const itemPath = path.join(currentPath, item);
            
            try {
              const stat = await fs.stat(itemPath);
              
              if (stat.isDirectory()) {
                // Recursively search directories
                await searchRecursively(itemPath);
              } else if (item.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                  name: item,
                  path: itemPath,
                  size: stat.size,
                  modified: stat.mtime,
                  isDirectory: false
                });
              }
            } catch (error) {
              // Skip files we can't access
            }
          }
        } catch (error) {
          // Skip directories we can't access
        }
      }
      
      await searchRecursively(searchDir);
      
      return { success: true, results: results.slice(0, 100) }; // Limit results
    } catch (error) {
      console.error('Search files error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleCreateFile(event, filePath, content = '') {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Create file
      await fs.writeFile(filePath, content, 'utf8');
      
      return { success: true, message: `Created file: ${filePath}` };
    } catch (error) {
      console.error('Create file error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleDeleteFile(event, filePath) {
    try {
      await fs.unlink(filePath);
      return { success: true, message: `Deleted file: ${filePath}` };
    } catch (error) {
      console.error('Delete file error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== CONFIGURATION HANDLERS =====
  setupConfigHandlers() {
    ipcMain.handle('config:save', this.handleSaveConfig.bind(this));
    ipcMain.handle('config:load', this.handleLoadConfig.bind(this));
    ipcMain.handle('config:complete-setup', this.handleCompleteSetup.bind(this));
    ipcMain.handle('config:reset', this.handleResetConfig.bind(this));
  }

  async handleSaveConfig(event, config) {
    try {
      const userDataPath = this.getUserDataPath();
      const configFile = path.join(userDataPath, 'user-config.json');
      
      let existingConfig = {};
      try {
        const existingData = await fs.readFile(configFile, 'utf8');
        existingConfig = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist, start with empty config
      }
      
      const newConfig = { ...existingConfig, ...config };
      await fs.writeFile(configFile, JSON.stringify(newConfig, null, 2));
      
      return { success: true };
    } catch (error) {
      console.error('Save config error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleLoadConfig(event) {
    try {
      const userDataPath = this.getUserDataPath();
      const configFile = path.join(userDataPath, 'user-config.json');
      
      try {
        const data = await fs.readFile(configFile, 'utf8');
        const config = JSON.parse(data);
        return { success: true, config };
      } catch (error) {
        // Return default config if file doesn't exist
        return { 
          success: true, 
          config: this.getDefaultConfig() 
        };
      }
    } catch (error) {
      console.error('Load config error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleCompleteSetup(event) {
    try {
      await this.handleSaveConfig(event, { setupComplete: true });
      return { success: true };
    } catch (error) {
      console.error('Complete setup error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleResetConfig(event) {
    try {
      const userDataPath = this.getUserDataPath();
      const configFile = path.join(userDataPath, 'user-config.json');
      
      try {
        await fs.unlink(configFile);
      } catch (error) {
        // File might not exist
      }
      
      return { success: true };
    } catch (error) {
      console.error('Reset config error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== BLOCKCHAIN HANDLERS =====
  setupBlockchainHandlers() {
    ipcMain.handle('blockchain:connect-wallet', this.handleConnectWallet.bind(this));
    ipcMain.handle('blockchain:create-did', this.handleCreateDID.bind(this));
    ipcMain.handle('blockchain:sign-message', this.handleSignMessage.bind(this));
    ipcMain.handle('blockchain:verify-signature', this.handleVerifySignature.bind(this));
    ipcMain.handle('blockchain:get-balance', this.handleGetBalance.bind(this));
  }

  async handleConnectWallet(event, walletType) {
    try {
      // Simulate wallet connection
      await this.simulateDelay(2000);
      
      const address = this.generateMockAddress();
      
      return {
        success: true,
        address: address,
        chainId: 1,
        walletType: walletType
      };
    } catch (error) {
      console.error('Connect wallet error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleCreateDID(event, options = {}) {
    try {
      const { address } = options;
      const did = `did:ethr:${address || this.generateMockAddress()}`;
      
      return {
        success: true,
        did: did
      };
    } catch (error) {
      console.error('Create DID error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleSignMessage(event, message, walletType) {
    try {
      // Simulate message signing
      await this.simulateDelay(1000);
      
      const signature = '0x' + Array.from({ length: 130 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      return {
        success: true,
        signature: signature,
        message: message
      };
    } catch (error) {
      console.error('Sign message error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleVerifySignature(event, message, signature, address) {
    try {
      // Simulate signature verification
      await this.simulateDelay(500);
      
      return {
        success: true,
        verified: true
      };
    } catch (error) {
      console.error('Verify signature error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGetBalance(event, address) {
    try {
      // Simulate balance check
      await this.simulateDelay(1000);
      
      const balance = (Math.random() * 10).toFixed(4);
      
      return {
        success: true,
        balance: balance,
        currency: 'ETH'
      };
    } catch (error) {
      console.error('Get balance error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== UTILITY HANDLERS =====
  setupUtilityHandlers() {
    ipcMain.handle('util:get-platform', this.handleGetPlatform.bind(this));
    ipcMain.handle('util:open-external', this.handleOpenExternal.bind(this));
    ipcMain.handle('util:show-item-in-folder', this.handleShowItemInFolder.bind(this));
    ipcMain.handle('util:get-version', this.handleGetVersion.bind(this));
  }

  async handleGetPlatform() {
    return { platform: process.platform, arch: process.arch };
  }

  async handleOpenExternal(event, url) {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleShowItemInFolder(event, filePath) {
    try {
      shell.showItemInFolder(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handleGetVersion() {
    return { 
      version: app.getVersion(),
      electron: process.versions.electron,
      node: process.versions.node,
      chrome: process.versions.chrome
    };
  }

  // ===== HELPER METHODS =====
  getUserDataPath() {
    const userDataPath = path.join(app.getPath('userData'), 'ai-assistant');
    // Ensure directory exists
    fs.mkdir(userDataPath, { recursive: true }).catch(console.error);
    return userDataPath;
  }

  async createUserSession(user) {
    const session = {
      user: user,
      created: Date.now(),
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    const userDataPath = this.getUserDataPath();
    await fs.writeFile(
      path.join(userDataPath, 'user-session.json'),
      JSON.stringify(session, null, 2)
    );
    
    this.userSessions.set(user.id, session);
  }

  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateMockAddress() {
    return '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getModelCapabilities(modelType) {
    const capabilities = {
      deepseek: ['coding', 'reasoning', 'mathematics', 'analysis'],
      openai: ['creative', 'conversation', 'analysis', 'writing'],
      llama: ['privacy', 'offline', 'general', 'research'],
      anthropic: ['safety', 'reasoning', 'enterprise', 'analysis']
    };
    
    return capabilities[modelType] || ['general'];
  }

  extractActionsFromCommand(command) {
    const actions = [];
    const commandLower = command.toLowerCase();
    
    if (commandLower.includes('open') || commandLower.includes('launch')) {
      actions.push({ type: 'open_app', target: this.extractAppName(command) });
    }
    
    if (commandLower.includes('search') || commandLower.includes('find')) {
      actions.push({ type: 'web_search', query: this.extractSearchQuery(command) });
    }
    
    if (commandLower.includes('create') || commandLower.includes('make')) {
      actions.push({ type: 'create_file', name: this.extractFileName(command) });
    }
    
    return actions;
  }

  extractAppName(command) {
    // Simple extraction - in production, use NLP
    const words = command.toLowerCase().split(' ');
    const openIndex = words.findIndex(word => word === 'open' || word === 'launch');
    return openIndex !== -1 && words[openIndex + 1] ? words[openIndex + 1] : 'application';
  }

  extractSearchQuery(command) {
    const words = command.toLowerCase().split(' ');
    const searchIndex = words.findIndex(word => word === 'search' || word === 'find');
    return searchIndex !== -1 ? words.slice(searchIndex + 1).join(' ') : command;
  }

  extractFileName(command) {
    const words = command.toLowerCase().split(' ');
    const createIndex = words.findIndex(word => word === 'create' || word === 'make');
    return createIndex !== -1 && words[createIndex + 1] ? words[createIndex + 1] : 'document';
  }

  getDefaultConfig() {
    return {
      setupComplete: false,
      languages: {
        primary: 'english',
        secondary: null
      },
      voiceSettings: {
        primaryVoice: 'default',
        secondaryVoice: null,
        speechRate: 1.0,
        pitch: 1.0
      },
      aiModel: null,
      microphone: null,
      features: ['filesystem', 'apps', 'websearch', 'monitoring'],
      privacySettings: {
        dataCollection: 'minimal',
        cloudSync: true,
        shareAnalytics: false
      }
    };
  }

  sendToPythonBackend(action, data) {
    // This would send data to the Python backend via WebSocket or HTTP
    // For now, simulate the response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, action, data });
      }, 100);
    });
  }
}

module.exports = IPCHandlers;
