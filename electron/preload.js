// Early polyfills: define `global` and a minimal `process.env` in the renderer
// This runs in the preload (isolated) context before any renderer scripts.
try {
  // Ensure a `global` reference exists for libs that expect Node's global
  if (typeof global === 'undefined') {
    // eslint-disable-next-line no-global-assign
    global = window;
  }
  // Also expose on window for safety
  if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
    window.global = window;
  }

  // Provide a minimal process.env so code that reads process.env won't crash
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    // eslint-disable-next-line no-global-assign
    process = { env: {} };
    if (typeof window !== 'undefined') window.process = process;
  }
} catch (e) {
  // swallow - preload should not crash the app
}

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Menu actions
  onMenuNewPatient: (callback) => ipcRenderer.on('menu-new-patient', callback),

  // File operations
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),

  // Dialogs
  showMessage: (options) => ipcRenderer.invoke('show-message', options),
  showConfirm: (options) => ipcRenderer.invoke('show-confirm', options),

  // System info
  getSystemInfo: () => ({
    platform: process.platform,
    arch: process.arch,
    version: process.versions.electron
  }),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Also expose some Node.js APIs safely
contextBridge.exposeInMainWorld('nodeAPI', {
  // Safe Node.js APIs can be exposed here if needed
  versions: process.versions
});