import { scanButton, resultsContainer, totalSizeElement, scanConfig, scanResults, logContainer, lastScanDate } from './dom.js';
import { translations, currentLanguage } from './translations.js';
import { addLog } from './logger.js';
import { updateStep, formatSize } from './utils.js';
import { createResultElement } from './results.js';
import { saveSettings } from './settings.js';

export async function loadScanConfig() {
  try {
    const response = await fetch('scan-config.json');
    const config = await response.json();
    window.scanConfig = config; // Global değişkeni güncelle
    addLog('Tarama yapılandırması yüklendi.');
  } catch (error) {
    console.error('Tarama yapılandırması yüklenirken hata:', error);
    addLog(`HATA: Tarama yapılandırması yüklenirken hata: ${error.message}`);
  }
}

export async function startScan() {
  if (!window.scanConfig) {
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
  
  window.scanResults = [];
  
  // Sadece seçili kuralları tara
  for (const checkbox of selectedRuleCheckboxes) {
    const ruleId = checkbox.id.replace('rule-', '');
    const folder = window.scanConfig.scanFolders.find(f => f.id === ruleId);
    
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
      window.scanResults.push({
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

export function displayResults() {
  resultsContainer.innerHTML = '';
  resultsContainer.classList.remove('d-none');
  
  window.scanResults.forEach(result => {
    const resultElement = createResultElement(result);
    resultsContainer.appendChild(resultElement);
  });
  
  updateTotalSize();
}

export function updateTotalSize() {
  const selectedResults = document.querySelectorAll('.result-checkbox:checked');
  window.totalSize = Array.from(selectedResults).reduce((total, checkbox) => {
    const result = window.scanResults.find(r => `result-${r.id}` === checkbox.id);
    return total + (result ? result.size : 0);
  }, 0);
  
  totalSizeElement.textContent = `Toplam: ${formatSize(window.totalSize)}`;
} 