// DOM Elements
const scanButton = document.getElementById('scan-button');
const cleanButton = document.getElementById('clean-button');
const settingsButton = document.getElementById('settings-button');
const resultsContainer = document.getElementById('results-container');
const rulesContainer = document.getElementById('rules-container');
const totalSizeElement = document.getElementById('total-size');
const languageSelect = document.getElementById('language-select');
const darkModeToggle = document.getElementById('dark-mode');
const lastScanDate = document.getElementById('last-scan-date');
const logContainer = document.getElementById('log-container');
const logContent = document.getElementById('log-content');
const clearLogsButton = document.getElementById('clear-logs');
const appLogo = document.getElementById('app-logo');

// Bootstrap Modal
const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));

// Templates
const ruleTemplate = document.getElementById('rule-template');
const resultTemplate = document.getElementById('result-template');

// State
let selectedRules = new Set();
let scanResults = [];
let totalSize = 0;
let scanConfig = null;

// Event Listeners
scanButton.addEventListener('click', startScan);
cleanButton.addEventListener('click', startCleanup);
settingsButton.addEventListener('click', () => settingsModal.show());
languageSelect.addEventListener('change', updateLanguage);
darkModeToggle.addEventListener('change', toggleDarkMode);
clearLogsButton.addEventListener('click', clearLogs);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  loadSettings();
  await loadScanConfig();
  loadRules();
});

// Functions
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  languageSelect.value = settings.language || 'tr';
  darkModeToggle.checked = settings.darkMode || false;
  lastScanDate.textContent = settings.lastScanDate || 'Hiç';
  
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
  }
}

function saveSettings() {
  const settings = {
    language: languageSelect.value,
    darkMode: darkModeToggle.checked,
    lastScanDate: lastScanDate.textContent
  };
  localStorage.setItem('settings', JSON.stringify(settings));
}

function updateLanguage() {
  // Dil değişikliği işlemleri
  saveSettings();
}

function toggleDarkMode() {
  const isDarkMode = darkModeToggle.checked;
  document.body.classList.toggle('dark-mode', isDarkMode);
  
  // Logo değiştirme
  if (isDarkMode) {
    appLogo.src = 'assets/cleantr-dark.svg';
  } else {
    appLogo.src = 'assets/cleantr.svg';
  }
  
  // Modal arka planını güncelle
  const modalBackdrops = document.querySelectorAll('.modal-backdrop');
  modalBackdrops.forEach(backdrop => {
    backdrop.classList.toggle('dark-mode', isDarkMode);
  });
  
  saveSettings();
}

function loadRules() {
  addLog('Kurallar yükleniyor...');
  fetch('rules.json')
    .then(response => response.json())
    .then(rules => {
      rulesContainer.innerHTML = '';
      rules.forEach(rule => {
        const ruleElement = createRuleElement(rule);
        rulesContainer.appendChild(ruleElement);
        addLog(`Kural yüklendi: ${rule.name}`);
      });
      addLog('Tüm kurallar başarıyla yüklendi.');
    })
    .catch(error => {
      console.error('Kurallar yüklenirken hata oluştu:', error);
      rulesContainer.innerHTML = '<div class="alert alert-danger">Kurallar yüklenirken bir hata oluştu.</div>';
      addLog(`HATA: Kurallar yüklenirken hata oluştu: ${error.message}`);
    });
}

function createRuleElement(rule) {
  const clone = ruleTemplate.content.cloneNode(true);
  const checkbox = clone.querySelector('.rule-checkbox');
  const name = clone.querySelector('.rule-name');
  const path = clone.querySelector('.rule-path');
  const description = clone.querySelector('.rule-description');

  checkbox.id = `rule-${rule.id}`;
  name.textContent = rule.name;
  path.textContent = rule.path;
  description.textContent = rule.description[languageSelect.value];

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      selectedRules.add(rule.id);
    } else {
      selectedRules.delete(rule.id);
    }
    updateCleanButton();
  });

  return clone;
}

function createResultElement(result) {
  const clone = resultTemplate.content.cloneNode(true);
  const checkbox = clone.querySelector('.result-checkbox');
  const name = clone.querySelector('.result-name');
  const path = clone.querySelector('.result-path');
  const size = clone.querySelector('.result-size');

  checkbox.id = `result-${result.id}`;
  name.textContent = result.name;
  path.textContent = result.path;
  size.textContent = formatSize(result.size);

  checkbox.addEventListener('change', () => {
    updateTotalSize();
    updateCleanButton();
  });

  return clone;
}

async function loadScanConfig() {
  try {
    const response = await fetch('scan-config.json');
    scanConfig = await response.json();
    addLog('Tarama yapılandırması yüklendi.');
  } catch (error) {
    console.error('Tarama yapılandırması yüklenirken hata:', error);
    addLog(`HATA: Tarama yapılandırması yüklenirken hata: ${error.message}`);
  }
}

async function startScan() {
  if (!scanConfig) {
    addLog('HATA: Tarama yapılandırması yüklenemedi.');
    return;
  }

  scanButton.disabled = true;
  scanButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Tara...';
  logContainer.classList.remove('d-none');
  addLog('Tarama başlatılıyor...');
  
  scanResults = [];
  
  for (const folder of scanConfig.scan_folders) {
    if (!folder.enabled) {
      addLog(`${folder.name} klasörü devre dışı bırakıldı, atlanıyor...`);
      continue;
    }

    addLog(`${folder.name} klasörü taranıyor...`);
    
    try {
      // Burada gerçek klasör tarama işlemi yapılacak
      // Şimdilik simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const size = Math.floor(Math.random() * 1024 * 1024 * 1000); // Rastgele boyut
      scanResults.push({
        id: folder.id,
        name: folder.name,
        path: folder.path,
        size: size,
        description: folder.description[languageSelect.value]
      });
      
      addLog(`${folder.name} klasörü tarandı. Boyut: ${formatSize(size)}`);
    } catch (error) {
      addLog(`HATA: ${folder.name} klasörü taranırken hata: ${error.message}`);
    }
  }
  
  displayResults();
  scanButton.disabled = false;
  scanButton.textContent = 'Tara';
  lastScanDate.textContent = new Date().toLocaleDateString();
  saveSettings();
  addLog('Tarama tamamlandı.');
}

function displayResults() {
  resultsContainer.innerHTML = '';
  resultsContainer.classList.remove('d-none');
  
  scanResults.forEach(result => {
    const resultElement = createResultElement(result);
    resultsContainer.appendChild(resultElement);
  });
  
  updateTotalSize();
}

function updateTotalSize() {
  const selectedResults = document.querySelectorAll('.result-checkbox:checked');
  totalSize = Array.from(selectedResults).reduce((total, checkbox) => {
    const result = scanResults.find(r => `result-${r.id}` === checkbox.id);
    return total + (result ? result.size : 0);
  }, 0);
  
  totalSizeElement.textContent = `Toplam: ${formatSize(totalSize)}`;
}

function updateCleanButton() {
  const hasSelectedResults = document.querySelectorAll('.result-checkbox:checked').length > 0;
  cleanButton.disabled = !hasSelectedResults;
}

function startCleanup() {
  if (!confirm('Seçili dosyaları silmek istediğinizden emin misiniz?')) {
    return;
  }

  cleanButton.disabled = true;
  cleanButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Temizleniyor...';

  // Temizleme işlemi simülasyonu
  setTimeout(() => {
    const selectedResults = document.querySelectorAll('.result-checkbox:checked');
    selectedResults.forEach(checkbox => {
      const resultElement = checkbox.closest('.card');
      resultElement.remove();
    });

    cleanButton.disabled = false;
    cleanButton.textContent = 'Temizle';
    updateTotalSize();
    updateCleanButton();
  }, 2000);
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Log işlevleri
function addLog(message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}\n`;
  logContent.textContent += logEntry;
  logContent.scrollTop = logContent.scrollHeight;
}

function clearLogs() {
  logContent.textContent = '';
} 