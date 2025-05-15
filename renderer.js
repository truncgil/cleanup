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

// Sayfa Yükleme
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadRules();
  
  // Tarama butonu tıklama
  scanButton.addEventListener('click', startScan);
  
  // Temizleme butonu tıklama
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
  });
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

// Taramayı Başlat
async function startScan() {
  // Eğer zaten tarama yapılıyorsa, işlemi tekrarlama
  if (isScanning) return;
  
  isScanning = true;
  scanButton.disabled = true;
  cleanButton.disabled = true;
  
  // UI Değişiklikleri
  rulesContainer.classList.add('hidden');
  resultsContainer.classList.remove('hidden');
  resultsContainer.innerHTML = '<div class="loading">Taranıyor...</div>';
  
  try {
    const selectedRules = currentRules.filter(rule => rule.selected);
    
    // Önceki sonuçları temizle
    scanResults = [];
    
    // Yeni tarama yap
    scanResults = await window.api.scanDirectories(selectedRules);
    renderResults();
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
  // Sonuç konteynerini tamamen temizle
  resultsContainer.innerHTML = '';
  
  if (scanResults.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results">Temizlenecek bir şey bulunamadı.</div>';
    cleanButton.disabled = true;
    return;
  }
  
  let totalSize = 0;
  
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
    const size = result.size;
    resultEl.querySelector('.result-size').textContent = formatSize(size);
    
    totalSize += size;
    resultsContainer.appendChild(resultEl);
  });
  
  totalSizeEl.textContent = `Toplam: ${formatSize(totalSize)}`;
  cleanButton.disabled = false;
}

// Temizlemeyi Başlat
async function startClean() {
  if (!confirm('Seçili öğeleri temizlemek istediğinizden emin misiniz?')) {
    return;
  }
  
  cleanButton.disabled = true;
  
  try {
    const selectedPaths = scanResults
      .filter(result => result.selected)
      .map(result => result.path);
    
    if (selectedPaths.length === 0) {
      alert('Temizlenecek bir şey seçmediniz!');
      cleanButton.disabled = false;
      return;
    }
    
    const results = await window.api.cleanDirectories(selectedPaths);
    const successCount = results.filter(r => r.success).length;
    
    alert(`${successCount} öğe başarıyla temizlendi!`);
    
    // Temizlik sonrası yeniden tarama
    await startScan();
  } catch (error) {
    console.error('Temizleme hatası:', error);
    alert('Temizleme sırasında bir hata oluştu!');
  } finally {
    cleanButton.disabled = false;
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
} 