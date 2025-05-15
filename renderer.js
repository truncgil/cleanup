// DOM Elementleri
const rulesContainer = document.getElementById('rules-container');
const resultsContainer = document.getElementById('results-container');
const scanButton = document.getElementById('scan-button');
const cleanButton = document.getElementById('clean-button');
const totalSizeEl = document.getElementById('total-size');
const settingsButton = document.getElementById('settings-button');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsButton = document.getElementById('close-settings');
const languageSelect = document.getElementById('language-select');
const darkModeToggle = document.getElementById('dark-mode');
const lastScanDate = document.getElementById('last-scan-date');

// Şablonlar
const ruleTemplate = document.getElementById('rule-template');
const resultTemplate = document.getElementById('result-template');

// Durum Değişkenleri
let currentRules = [];
let scanResults = [];
let currentLanguage = 'tr';
let isScanning = false; // Tarama durumu
let currentStep = 1; // 1: Tara, 2: Önizle, 3: Temizle

// Stepper aktif adım vurgusu
function updateStepper() {
  for (let i = 1; i <= 3; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    if (stepEl) {
      if (i === currentStep) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }
    }
  }
}

// Adım arayüzlerini güncelle (güncellendi)
function updateStepUI() {
  updateStepper();
  updateLogoForTheme();
  if (currentStep === 1) {
    rulesContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    scanButton.classList.remove('hidden');
    cleanButton.classList.add('hidden');
    scanButton.textContent = 'Tara';
    totalSizeEl.textContent = '';
  } else if (currentStep === 2) {
    rulesContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    scanButton.classList.add('hidden');
    cleanButton.classList.remove('hidden');
    cleanButton.textContent = 'Temizle';
  } else if (currentStep === 3) {
    rulesContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    scanButton.classList.add('hidden');
    cleanButton.classList.add('hidden');
    totalSizeEl.textContent = 'Temizlik tamamlandı!';
    setTimeout(() => {
      currentStep = 1;
      updateStepUI();
    }, 2000);
  }
}

// Sayfa Yükleme
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadRules();
  updateStepUI();
  scanButton.addEventListener('click', startScan);
  cleanButton.addEventListener('click', startClean);
  
  // Ayarlar butonu tıklama
  settingsButton.addEventListener('click', toggleSettings);
  
  // Ayarları kapat butonu tıklama
  closeSettingsButton.addEventListener('click', toggleSettings);
  
  // Dil değişikliği
  languageSelect.addEventListener('change', async (e) => {
    currentLanguage = e.target.value;
    const settings = await window.api.getSettings();
    settings.language = currentLanguage;
    await window.api.saveSettings(settings);
    updateUILanguage();
  });
  
  // Koyu tema değişikliği
  darkModeToggle.addEventListener('change', async (e) => {
    const isDarkMode = e.target.checked;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    const settings = await window.api.getSettings();
    settings.darkMode = isDarkMode;
    await window.api.saveSettings(settings);
    updateLogoForTheme();
  });
  
  // Toplu seçim butonları
  document.getElementById('select-all-rules').addEventListener('click', selectAllRules);
  document.getElementById('unselect-all-rules').addEventListener('click', unselectAllRules);
  document.getElementById('select-all-results').addEventListener('click', selectAllResults);
  document.getElementById('unselect-all-results').addEventListener('click', unselectAllResults);
});

// Ayarları Yükle
async function loadSettings() {
  const settings = await window.api.getSettings();
  
  currentLanguage = settings.language;
  languageSelect.value = currentLanguage;
  
  if (settings.darkMode) {
    darkModeToggle.checked = true;
    document.body.classList.add('dark-mode');
  }
  
  if (settings.lastScan) {
    const date = new Date(settings.lastScan);
    lastScanDate.textContent = date.toLocaleString(currentLanguage === 'tr' ? 'tr-TR' : 'en-US');
  }
}

// Kuralları Yükle
async function loadRules() {
  rulesContainer.innerHTML = '<div class="loading">Yükleniyor...</div>';
  
  try {
    currentRules = await window.api.getRules();
    renderRules();
  } catch (error) {
    console.error('Kurallar yüklenirken hata:', error);
    rulesContainer.innerHTML = '<div class="error">Kurallar yüklenemedi!</div>';
  }
}

// Kuralları Render Et
function renderRules() {
  rulesContainer.innerHTML = '';
  
  currentRules.forEach(rule => {
    const ruleEl = document.importNode(ruleTemplate.content, true);
    const ruleItem = ruleEl.querySelector('.rule-item');
    
    const checkbox = ruleEl.querySelector('.rule-checkbox');
    checkbox.checked = rule.selected;
    checkbox.addEventListener('change', e => {
      rule.selected = e.target.checked;
    });
    
    ruleEl.querySelector('.rule-name').textContent = rule.name;
    ruleEl.querySelector('.rule-path').textContent = rule.path;
    
    const description = currentLanguage === 'tr' ? rule.description?.tr : rule.description?.en;
    ruleEl.querySelector('.rule-description').textContent = description || '';
    
    rulesContainer.appendChild(ruleEl);
  });
}

// Taramayı Başlat (Wizard 1. adım)
async function startScan() {
  if (isScanning) return;
  isScanning = true;
  scanButton.disabled = true;
  cleanButton.disabled = true;
  totalSizeEl.textContent = '';
  scanResults = [];
  resultsContainer.classList.add('hidden');
  rulesContainer.classList.remove('hidden');
  try {
    const selectedRules = currentRules.filter(rule => rule.selected);
    if (selectedRules.length === 0) {
      alert('Lütfen en az bir klasör seçin.');
      isScanning = false;
      scanButton.disabled = false;
      return;
    }
    rulesContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    resultsContainer.innerHTML = '<div class="loading">Taranıyor...";</div>';
    scanResults = await window.api.scanDirectories(selectedRules);
    renderResults();
    currentStep = 2;
    updateStepUI();
  } catch (error) {
    console.error('Tarama hatası:', error);
    resultsContainer.innerHTML = '<div class="error">Tarama başarısız oldu!</div>';
  } finally {
    scanButton.disabled = false;
    isScanning = false;
  }
}

// Sonuçları Render Et
function renderResults() {
  // Sonuçları göstermeden önce içeriği tamamen temizle
  resultsContainer.innerHTML = '';
  
  if (!scanResults || scanResults.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results">Temizlenecek bir şey bulunamadı.</div>';
    cleanButton.disabled = true;
    return;
  }
  
  let totalSize = 0;
  
  // Her sonuç için bir öğe oluştur
  scanResults.forEach(result => {
    const resultEl = document.importNode(resultTemplate.content, true);
    
    const checkbox = resultEl.querySelector('.result-checkbox');
    checkbox.checked = result.selected;
    checkbox.addEventListener('change', e => {
      result.selected = e.target.checked;
      updateTotalSize();
    });
    
    resultEl.querySelector('.result-name').textContent = result.name;
    resultEl.querySelector('.result-path').textContent = result.path;
    
    // Boyut formatı
    const size = result.size || 0;
    resultEl.querySelector('.result-size').textContent = formatSize(size);
    
    totalSize += size;
    
    // Sonuç öğesini listenin sonuna ekle
    resultsContainer.appendChild(resultEl);
  });
  
  // Toplam boyutu güncelle
  totalSizeEl.textContent = `Toplam: ${formatSize(totalSize)}`;
  cleanButton.disabled = false;
}

// Temizlemeyi Başlat (Wizard 2. adım)
async function startClean() {
  if (!confirm('Seçili öğeleri temizlemek istediğinizden emin misiniz?')) {
    return;
  }
  cleanButton.disabled = true;
  scanButton.disabled = true;
  try {
    const selectedPaths = scanResults.filter(result => result.selected).map(result => result.path);
    if (selectedPaths.length === 0) {
      alert('Temizlenecek bir şey seçmediniz!');
      cleanButton.disabled = false;
      scanButton.disabled = false;
      return;
    }
    const results = await window.api.cleanDirectories(selectedPaths);
    const successCount = results.filter(r => r.success).length;
    alert(`${successCount} öğe başarıyla temizlendi!`);
    currentStep = 3;
    updateStepUI();
  } catch (error) {
    console.error('Temizleme hatası:', error);
    alert('Temizleme sırasında bir hata oluştu!');
    cleanButton.disabled = false;
    scanButton.disabled = false;
  }
}

// Ayarlar Panelini Aç/Kapat
function toggleSettings() {
  settingsPanel.classList.toggle('hidden');
}

// Toplam Boyutu Güncelle
function updateTotalSize() {
  const selectedSize = scanResults
    .filter(result => result.selected)
    .reduce((total, result) => total + result.size, 0);
  
  totalSizeEl.textContent = `Toplam: ${formatSize(selectedSize)}`;
}

// Boyutu Formatla
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

// UI Dilini Güncelle
function updateUILanguage() {
  // Kuralları yeniden yükle (farklı dil açıklamaları için)
  renderRules();
  
  if (currentLanguage === 'tr') {
    scanButton.textContent = 'Tara';
    cleanButton.textContent = 'Temizle';
    document.querySelector('h2').textContent = 'Ayarlar';
    document.querySelector('label[for="language-select"]').textContent = 'Dil';
    document.querySelector('label[for="dark-mode"]').textContent = 'Koyu Tema';
    document.querySelector('.last-scan-info span:first-child').textContent = 'Son Tarama: ';
  } else {
    scanButton.textContent = 'Scan';
    cleanButton.textContent = 'Clean';
    document.querySelector('h2').textContent = 'Settings';
    document.querySelector('label[for="language-select"]').textContent = 'Language';
    document.querySelector('label[for="dark-mode"]').textContent = 'Dark Mode';
    document.querySelector('.last-scan-info span:first-child').textContent = 'Last Scan: ';
  }
  updateLogoForTheme();
}

// Toplu seçim fonksiyonları
function selectAllRules() {
  currentRules.forEach(rule => rule.selected = true);
  renderRules();
}
function unselectAllRules() {
  currentRules.forEach(rule => rule.selected = false);
  renderRules();
}
function selectAllResults() {
  scanResults.forEach(result => result.selected = true);
  renderResults();
}
function unselectAllResults() {
  scanResults.forEach(result => result.selected = false);
  renderResults();
}

function updateLogoForTheme() {
  const logo = document.getElementById('app-logo');
  if (document.body.classList.contains('dark-mode')) {
    logo.src = 'assets/cleantr-dark.svg';
  } else {
    logo.src = 'assets/cleantr.svg';
  }
} 