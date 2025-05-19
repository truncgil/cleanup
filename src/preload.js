const { contextBridge, ipcRenderer } = require('electron');

// API işlevlerini tanımla
const apiInterface = {
  // Ayarlar
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Kurallar
  getRules: () => ipcRenderer.invoke('get-rules'),
  
  // Tarama ve Temizleme
  scanDirectories: (rules) => ipcRenderer.invoke('scan-directories', rules),
  cleanDirectories: (paths) => ipcRenderer.invoke('clean-directories', paths),
  removeDirectory: (path) => ipcRenderer.invoke('remove-directory', path),
  getFolderSize: (path) => ipcRenderer.invoke('get-folder-size', path),
  
  // Yardımcı fonksiyonlar
  formatBytes: (bytes) => ipcRenderer.invoke('format-bytes', bytes),
  
  // Finder'da açma
  openInFinder: (folderPath) => ipcRenderer.invoke('openInFinder', folderPath)
};

// API'yi expose et
contextBridge.exposeInMainWorld('api', apiInterface);
contextBridge.exposeInMainWorld('electronAPI', apiInterface); 