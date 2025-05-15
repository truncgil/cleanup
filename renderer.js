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
const selectAllRulesButton = document.getElementById('select-all-rules');
const unselectAllRulesButton = document.getElementById('unselect-all-rules');

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

// Dil değişkenleri
const translations = {
  tr: {
    scan: 'Tara',
    clean: 'Temizle',
    selectAll: 'Tümünü Seç',
    unselectAll: 'Tümünü Kaldır',
    loading: 'Yükleniyor...',
    scanLogs: 'Tarama Logları',
    clear: 'Temizle',
    settings: 'Ayarlar',
    language: 'Dil',
    darkMode: 'Koyu Tema',
    lastScan: 'Son Tarama',
    never: 'Hiç',
    scanStarted: 'Tarama başlatıldı...',
    scanCompleted: 'Tarama tamamlandı',
    scanError: 'Tarama sırasında hata oluştu',
    rulesLoaded: 'Kurallar yüklendi',
    rulesError: 'Kurallar yüklenirken hata oluştu'
  },
  en: {
    scan: 'Scan',
    clean: 'Clean',
    selectAll: 'Select All',
    unselectAll: 'Unselect All',
    loading: 'Loading...',
    scanLogs: 'Scan Logs',
    clear: 'Clear',
    settings: 'Settings',
    language: 'Language',
    darkMode: 'Dark Mode',
    lastScan: 'Last Scan',
    never: 'Never',
    scanStarted: 'Scan started...',
    scanCompleted: 'Scan completed',
    scanError: 'Error during scan',
    rulesLoaded: 'Rules loaded',
    rulesError: 'Error loading rules'
  }
};

let currentLanguage = 'tr';

// Event Listeners
scanButton.addEventListener('click', startScan);
cleanButton.addEventListener('click', startCleanup);
settingsButton.addEventListener('click', () => settingsModal.show());
languageSelect.addEventListener('change', (e) => {
  changeLanguage(e.target.value);
});
darkModeToggle.addEventListener('change', toggleDarkMode);
clearLogsButton.addEventListener('click', clearLogs);
selectAllRulesButton.addEventListener('click', selectAllRules);
unselectAllRulesButton.addEventListener('click', unselectAllRules);

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  loadSettings();
  await loadScanConfig();
  loadRules();
  changeLanguage('tr');
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
  addLog(translations[currentLanguage].loading);
  updateStep(1);
  
  fetch('scan-config.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Kurallar yüklenemedi');
      }
      return response.json();
    })
    .then(config => {
      rulesContainer.innerHTML = '';
      config.scanFolders.forEach(rule => {
        const ruleElement = createRuleElement(rule);
        rulesContainer.appendChild(ruleElement);
        addLog(`${rule.name} kuralı yüklendi`);
      });
      addLog(translations[currentLanguage].rulesLoaded);
    })
    .catch(error => {
      console.error('Kurallar yüklenirken hata:', error);
      rulesContainer.innerHTML = `<div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        ${translations[currentLanguage].rulesError}
      </div>`;
      addLog(`HATA: ${translations[currentLanguage].rulesError}`);
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
  description.textContent = rule.description[currentLanguage];

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

  // Seçili kuralları kontrol et
  const selectedRuleCheckboxes = document.querySelectorAll('.rule-checkbox:checked');
  if (selectedRuleCheckboxes.length === 0) {
    addLog('Lütfen en az bir kural seçin.');
    return;
  }

  scanButton.disabled = true;
  scanButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Tara...';
  logContainer.classList.remove('d-none');
  addLog(translations[currentLanguage].scanStarted);
  updateStep(2);
  
  scanResults = [];
  
  // Sadece seçili kuralları tara
  for (const checkbox of selectedRuleCheckboxes) {
    const ruleId = checkbox.id.replace('rule-', '');
    const folder = scanConfig.scanFolders.find(f => f.id === ruleId);
    
    if (!folder) {
      addLog(`HATA: ${ruleId} ID'li kural bulunamadı`);
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
        description: folder.description[currentLanguage]
      });
      
      addLog(`${folder.name} klasörü tarandı. Boyut: ${formatSize(size)}`);
    } catch (error) {
      addLog(`HATA: ${folder.name} klasörü taranırken hata: ${error.message}`);
    }
  }
  
  displayResults();
  scanButton.disabled = false;
  scanButton.textContent = translations[currentLanguage].scan;
  lastScanDate.textContent = new Date().toLocaleDateString();
  saveSettings();
  addLog(translations[currentLanguage].scanCompleted);
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

// Adım göstergelerini güncelleme
function updateStep(step) {
  // Wizard adımlarını güncelle
  document.querySelectorAll('.wizard-step').forEach((el, index) => {
    if (index + 1 < step) {
      el.classList.add('completed');
      el.classList.remove('active');
    } else if (index + 1 === step) {
      el.classList.add('active');
      el.classList.remove('completed');
    } else {
      el.classList.remove('active', 'completed');
    }
  });

  // İçerik alanlarını güncelle
  document.querySelectorAll('.step-content').forEach((el, index) => {
    if (index + 1 === step) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

// Log işlevleri
let currentToast = null;

async function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  
  // Log içeriğini güncelle
  logContent.textContent += logEntry + '\n';
  logContent.scrollTop = logContent.scrollHeight;
  
  // Log container'ı görünür yap
  logContainer.classList.remove('d-none');

  // SweetAlert2 toast göster
  if (currentToast) {
    await currentToast.close();
  }

  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  currentToast = Toast.fire({
    icon: type,
    title: logEntry
  });
}

function clearLogs() {
  logContent.textContent = '';
}

// Dil değiştirme fonksiyonu
function changeLanguage(lang) {
  currentLanguage = lang;
  document.getElementById('scan-button').textContent = translations[lang].scan;
  document.getElementById('clean-button').textContent = translations[lang].clean;
  document.getElementById('select-all-rules').textContent = translations[lang].selectAll;
  document.getElementById('unselect-all-rules').textContent = translations[lang].unselectAll;
  document.querySelector('.loading p').textContent = translations[lang].loading;
  document.querySelector('#log-container h5').textContent = translations[lang].scanLogs;
  document.getElementById('clear-logs').textContent = translations[lang].clear;
  document.querySelector('.modal-title').textContent = translations[lang].settings;
  document.querySelector('label[for="language-select"]').textContent = translations[lang].language;
  document.querySelector('label[for="dark-mode"]').textContent = translations[lang].darkMode;
  document.querySelector('.text-muted small').textContent = translations[lang].lastScan + ': ';
  
  // Başlıkları güncelle
  document.querySelector('#step-1-content h2').textContent = lang === 'tr' ? 'Temizlenecek Klasörler' : 'Folders to Clean';
  document.querySelector('#step-2-content h2').textContent = lang === 'tr' ? 'Tarama Logları' : 'Scan Logs';
  document.querySelector('#step-3-content h2').textContent = lang === 'tr' ? 'Temizleme Sonuçları' : 'Cleanup Results';
  
  // İstatistik etiketlerini güncelle
  const stats = {
    tr: {
      totalCleaned: 'Toplam Temizlenen',
      spaceSaved: 'Yer Kazanıldı',
      filesCleaned: 'Temizlenen Dosya'
    },
    en: {
      totalCleaned: 'Total Cleaned',
      spaceSaved: 'Space Saved',
      filesCleaned: 'Files Cleaned'
    }
  };
  
  document.querySelector('#total-cleaned + p').textContent = stats[lang].totalCleaned;
  document.querySelector('#space-saved + p').textContent = stats[lang].spaceSaved;
  document.querySelector('#files-cleaned + p').textContent = stats[lang].filesCleaned;
}

// Temizleme işlemi
async function startCleanup() {
  const result = await Swal.fire({
    title: 'Onay',
    text: 'Seçili dosyaları silmek istediğinizden emin misiniz?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Evet',
    cancelButtonText: 'İptal'
  });

  if (!result.isConfirmed) {
    return;
  }

  // 3. adıma geç
  updateStep(3);

  cleanButton.disabled = true;
  cleanButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Temizleniyor...';

  const selectedResults = document.querySelectorAll('.result-checkbox:checked');
  const totalFiles = selectedResults.length;
  let cleanedFiles = 0;
  let totalCleanedSize = 0;

  // İlerleme çubuğunu göster
  const progressBar = document.querySelector('#cleanup-progress');
  const progressBarInner = progressBar.querySelector('.progress-bar');
  progressBar.classList.remove('d-none');

  // Temizleme başladı bildirimi
  Swal.fire({
    title: 'Temizleme Başladı',
    html: 'Seçili dosyalar temizleniyor...',
    icon: 'info',
    showConfirmButton: false,
    allowOutsideClick: false
  });

  for (const checkbox of selectedResults) {
    const resultElement = checkbox.closest('.card');
    const result = scanResults.find(r => `result-${r.id}` === checkbox.id);

    if (result) {
      try {
        // Burada gerçek silme işlemi yapılacak
        await new Promise(resolve => setTimeout(resolve, 500)); // Simülasyon
        
        totalCleanedSize += result.size;
        cleanedFiles++;
      
        // İstatistikleri güncelle
        document.getElementById('total-cleaned').textContent = formatSize(totalCleanedSize);
        document.getElementById('files-cleaned').textContent = cleanedFiles;
        
        // İlerleme çubuğunu güncelle
        const progress = (cleanedFiles / totalFiles) * 100;
        progressBarInner.style.width = `${progress}%`;
        progressBarInner.setAttribute('aria-valuenow', progress);
        
        // Log ekle
        addLog(`${result.name} temizlendi (${formatSize(result.size)})`, 'success');
        
        // Kartı kaldır
        resultElement.remove();
      } catch (error) {
        addLog(`HATA: ${result.name} temizlenirken hata: ${error.message}`, 'error');
      }
    }
  }

  // İşlem tamamlandı
  cleanButton.disabled = false;
  cleanButton.textContent = translations[currentLanguage].clean;
  
  // İlerleme çubuğunu gizle
  progressBar.classList.add('d-none');
  
  // Son istatistikleri göster
  const spaceSaved = ((totalCleanedSize / (1024 * 1024 * 1024)) * 100).toFixed(1);
  document.getElementById('space-saved').textContent = `${spaceSaved}%`;
  
  // Temizleme tamamlandı bildirimi
  await Swal.fire({
    title: 'Temizleme Tamamlandı',
    html: `Toplam ${formatSize(totalCleanedSize)} temizlendi.<br>${cleanedFiles} dosya işlendi.`,
    icon: 'success',
    confirmButtonText: 'Tamam'
  });

  addLog(`Temizleme tamamlandı. Toplam ${formatSize(totalCleanedSize)} temizlendi.`, 'success');
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

function selectAllRules() {
  const checkboxes = document.querySelectorAll('.rule-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.checked = true;
    const ruleId = checkbox.id.replace('rule-', '');
    selectedRules.add(ruleId);
  });
  updateCleanButton();
}

function unselectAllRules() {
  const checkboxes = document.querySelectorAll('.rule-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
    const ruleId = checkbox.id.replace('rule-', '');
    selectedRules.delete(ruleId);
  });
  updateCleanButton();
} 