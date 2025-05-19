const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
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
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f5f5f5',
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Geliştirici araçlarını aç
  //mainWindow.webContents.openDevTools();

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
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

// ~ işaretini ev dizini ile değiştiren fonksiyon
function resolveHome(filepath) {
  if (filepath.startsWith('~')) {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

// Dizin içeriğini temizleyen fonksiyon
function cleanDirectoryContents(dirPath) {
  const resolvedPath = resolveHome(dirPath);
  if (!fs.existsSync(resolvedPath)) return;

  fs.readdirSync(resolvedPath).forEach(file => {
    const fullPath = path.join(resolvedPath, file);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } catch (err) {
      console.error(`Silinemedi: ${fullPath}`, err);
    }
  });
}

// Geriye uyumluluk için eski cleanDirectory fonksiyonu
function cleanDirectory(dirPath) {
  try {
    cleanDirectoryContents(dirPath);
    return { success: true };
  } catch (error) {
    console.error(`Temizleme hatası: ${dirPath}`, error);
    return { 
      success: false, 
      error: error.message
    };
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
    try {
      cleanDirectoryContents(dirPath);
      results.push({ 
        path: dirPath, 
        success: true
      });
    } catch (error) {
      console.error(`Temizleme hatası: ${dirPath}`, error);
      results.push({ 
        path: dirPath, 
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
});

ipcMain.handle('remove-directory', (event, dirPath) => {
  return cleanDirectory(dirPath);
});

ipcMain.handle('get-folder-size', async (event, dirPath) => {
  try {
    const expandedPath = dirPath.replace(/^~/, os.homedir());
    const resolvedPath = path.resolve(expandedPath);
    
    if (fs.existsSync(resolvedPath)) {
      const size = getDirSize(resolvedPath);
      return { success: true, size: size };
    } else {
      return { success: false, error: 'Dizin bulunamadı', size: 0 };
    }
  } catch (error) {
    console.error(`Klasör boyutu hesaplama hatası: ${dirPath}`, error);
    return { success: false, error: error.message, size: 0 };
  }
});

ipcMain.handle('format-bytes', (event, bytes) => {
  return bytes.format(bytes);
});

// API'ler
ipcMain.handle('openInFinder', async (event, folderPath) => {
  try {
    console.log('Ana süreçte openInFinder çağrıldı, yol:', folderPath);
    
    // ~ karakterini ev diziniyle değiştir
    const resolvedPath = resolveHome(folderPath);
    console.log('Çözümlenmiş yol:', resolvedPath);
    
    // Yolun varlığını kontrol et
    if (!fs.existsSync(resolvedPath)) {
      console.error('Yol bulunamadı:', resolvedPath);
      return { success: false, error: 'Yol bulunamadı: ' + resolvedPath };
    }
    
    // macOS'ta showItemInFolder kullan - bu direkt olarak Finder'da klasörü gösterir
    shell.showItemInFolder(resolvedPath);
    return { success: true };
  } catch (error) {
    console.error('Finder açılırken hata:', error);
    return { success: false, error: error.message };
  }
}); 