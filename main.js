const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const Store = require('electron-store');
const bytes = require('bytes');
const os = require('os');

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f5f5f5',
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Ayarları kur
const defaultSettings = {
  language: 'tr',
  darkMode: false,
  lastScan: null
};

if (!store.has('settings')) {
  store.set('settings', defaultSettings);
}

// Temizleme kurallarını oku
function readRules() {
  const rulesPath = path.join(__dirname, '.cursorrules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  const rules = [];
  
  let currentRule = null;
  
  rulesContent.split('\n').forEach(line => {
    line = line.trim();
    if (line.startsWith('#') || line === '') return;
    
    if (line.startsWith('[') && line.endsWith(']')) {
      if (currentRule) rules.push(currentRule);
      currentRule = {
        id: line.slice(1, -1),
        selected: true
      };
    } else if (currentRule && line.includes('=')) {
      const [key, value] = line.split('=', 2);
      currentRule[key] = value;
    }
  });
  
  if (currentRule) rules.push(currentRule);
  return rules;
}

// Dizin boyutunu hesapla
function getDirSize(dirPath) {
  try {
    const result = execSync(`du -sk "${dirPath}" 2>/dev/null || echo "0"`, { encoding: 'utf8' });
    const size = parseInt(result.split('\t')[0]) * 1024; // KB to bytes
    return size;
  } catch (error) {
    console.error(`Dizin boyutu hesaplanamadı: ${dirPath}`, error);
    return 0;
  }
}

// Dizin taraması
function scanDirectories(rules) {
  const results = [];
  
  for (const rule of rules) {
    try {
      const expandedPath = rule.path.replace(/^~/, os.homedir());
      const resolvedPath = path.resolve(expandedPath);
      
      if (fs.existsSync(resolvedPath)) {
        const size = getDirSize(resolvedPath);
        
        results.push({
          id: rule.id,
          name: rule.name,
          path: resolvedPath,
          size: size,
          selected: rule.selected
        });
      }
    } catch (error) {
      console.error(`Tarma hatası: ${rule.id}`, error);
    }
  }
  
  return results;
}

// Dizin temizleme
function cleanDirectory(dirPath) {
  try {
    execSync(`rm -rf "${dirPath}"`);
    return true;
  } catch (error) {
    console.error(`Temizleme hatası: ${dirPath}`, error);
    return false;
  }
}

// IPC Olayları
ipcMain.handle('get-settings', () => {
  return store.get('settings');
});

ipcMain.handle('save-settings', (event, settings) => {
  store.set('settings', settings);
  return true;
});

ipcMain.handle('get-rules', () => {
  return readRules();
});

ipcMain.handle('scan-directories', (event, rules) => {
  const results = scanDirectories(rules);
  store.set('settings.lastScan', new Date().toISOString());
  return results;
});

ipcMain.handle('clean-directories', (event, paths) => {
  const results = [];
  
  for (const dirPath of paths) {
    const success = cleanDirectory(dirPath);
    results.push({ path: dirPath, success });
  }
  
  return results;
});

ipcMain.handle('format-bytes', (event, bytes) => {
  return bytes.format(bytes);
}); 