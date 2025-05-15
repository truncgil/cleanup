const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Ayarlar
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Kurallar
  getRules: () => ipcRenderer.invoke('get-rules'),
  
  // Tarama ve Temizleme
  scanDirectories: (rules) => ipcRenderer.invoke('scan-directories', rules),
  cleanDirectories: (paths) => ipcRenderer.invoke('clean-directories', paths),
  
  // Yardımcı fonksiyonlar
  formatBytes: (bytes) => ipcRenderer.invoke('format-bytes', bytes)
}); 