const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth methods
  checkAuth: () => ipcRenderer.invoke('auth:check'),
  loginWithWallet: (walletType) => ipcRenderer.invoke('auth:wallet-login', walletType),
  loginWithSocial: (provider) => ipcRenderer.invoke('auth:social-login', provider),
  loginWithEmail: (email, password) => ipcRenderer.invoke('auth:email-login', email, password),
  logout: () => ipcRenderer.invoke('auth:logout'),

  // Voice methods
  startVoiceRecognition: () => ipcRenderer.invoke('voice:start-listening'),
  stopVoiceRecognition: () => ipcRenderer.invoke('voice:stop-listening'),
  trainWakeWord: (wakeWord, audioSamples) => ipcRenderer.invoke('voice:train-wake-word', wakeWord, audioSamples),
  toggleMute: (muted) => ipcRenderer.invoke('voice:toggle-mute', muted),

  // AI Model methods
  testAIConnection: (modelConfig) => ipcRenderer.invoke('ai:test-connection', modelConfig),
  processCommand: (command, context) => ipcRenderer.invoke('ai:process-command', command, context),

  // System methods
  openApplication: (appName) => ipcRenderer.invoke('system:open-app', appName),
  openFileDialog: (options) => ipcRenderer.invoke('system:file-dialog', options),
  getMicrophones: () => ipcRenderer.invoke('system:get-microphones'),

  // Config methods
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),
  completeSetup: () => ipcRenderer.invoke('config:complete-setup'),

  // Blockchain methods
  connectWallet: (walletType) => ipcRenderer.invoke('blockchain:connect-wallet', walletType),
  createDID: (options) => ipcRenderer.invoke('blockchain:create-did', options),

  // Event listeners
  onVoiceTranscript: (callback) => ipcRenderer.on('voice:transcript', callback),
  onWakeWordDetected: (callback) => ipcRenderer.on('voice:wake-word-detected', callback),
  onAIResponse: (callback) => ipcRenderer.on('ai:response', callback),
  onSystemEvent: (callback) => ipcRenderer.on('system:event', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
