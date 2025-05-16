import { cleanButton } from './dom.js';
import { translations, currentLanguage } from './translations.js';
import { addLog } from './logger.js';
import { updateStep, formatSize, showSwal } from './utils.js';

// Temizleme loglarına ekleme yapan fonksiyon
function addCleanupLog(message, type = 'info') {
  const logContent = document.getElementById('cleanup-log-content');
  if (!logContent) return;

  const timestamp = new Date().toLocaleTimeString();
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry log-${type}`;
  logEntry.innerHTML = `[${timestamp}] ${message}`;
  logContent.appendChild(logEntry);
  logContent.scrollTop = logContent.scrollHeight;
}

// Dizin temizleme fonksiyonu
async function cleanDirectory(dirPath) {
  try {
    const result = await window.api.removeDirectory(dirPath);
    return result.success;
  } catch (error) {
    console.error(`Temizleme hatası: ${dirPath}`, error);
    return false;
  }
}

export async function startCleanup() {
  // Seçili öğeleri kontrol et
  const selectedResults = document.querySelectorAll('.result-checkbox:checked');
  if (selectedResults.length === 0) {
    await showSwal({
      title: 'Uyarı',
      text: 'Temizlenecek hiçbir öğe seçilmedi!',
      icon: 'warning',
      confirmButtonText: 'Tamam'
    });
    return;
  }

  const result = await showSwal({
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

  const totalFiles = selectedResults.length;
  let cleanedFiles = 0;
  let totalCleanedSize = 0;
  
  // Temizleme loglarını temizle
  const cleanupLogContent = document.getElementById('cleanup-log-content');
  if (cleanupLogContent) {
    cleanupLogContent.innerHTML = '';
  }

  // İlerleme çubuğunu göster
  const progressBar = document.querySelector('#cleanup-progress');
  const progressBarInner = progressBar.querySelector('.progress-bar');
  progressBar.classList.remove('d-none');

  // Temizleme başladı bildirimi
  showSwal({
    title: 'Temizleme Başladı',
    html: 'Seçili dosyalar temizleniyor...',
    icon: 'info',
    showConfirmButton: false,
    allowOutsideClick: false
  });
  
  // Temizleme başladı logunu ekle
  addCleanupLog('Temizleme işlemi başlatıldı...', 'info');

  for (const checkbox of selectedResults) {
    const resultElement = checkbox.closest('.card');
    const result = window.scanResults.find(r => `result-${r.id}` === checkbox.id);

    if (result) {
      try {
        // Temizleme başlangıç logu
        addCleanupLog(`"${result.name}" temizleniyor... (${formatSize(result.size)})`, 'info');
        
        // Dizini temizle
        const path = result.path;
        const success = await cleanDirectory(path);
        
        // İşlem başarılıysa
        if (success) {
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
          addCleanupLog(`"${result.name}" başarıyla temizlendi (${formatSize(result.size)})`, 'success');
          
          // Kartı kaldır
          resultElement.remove();
        } else {
          // Hata durumu - silme işlemi başarısız
          const errorDetails = 'Dizin temizleme hatası';
          addCleanupLog(`HATA: "${result.name}" temizlenemedi: ${errorDetails}`, 'error');
          throw new Error(`Silme işlemi başarısız oldu: ${errorDetails}`);
        }
      } catch (error) {
        addLog(`HATA: ${result.name} temizlenirken hata: ${error.message}`, 'error');
        addCleanupLog(`HATA: "${result.name}" temizlenemedi: ${error.message}`, 'error');
        
        // Hata detaylarını göster
        if (error.message) {
          addCleanupLog(`Detaylar: ${error.message}`, 'error');
        }
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
  
  // Temizleme tamamlandı logu
  addCleanupLog(`Temizleme tamamlandı. Toplam ${formatSize(totalCleanedSize)} temizlendi.`, 'success');
  
  // Temizleme tamamlandı bildirimi
  await showSwal({
    title: 'Temizleme Tamamlandı',
    html: `Toplam ${formatSize(totalCleanedSize)} temizlendi.<br>${cleanedFiles} dosya işlendi.`,
    icon: 'success',
    confirmButtonText: 'Tamam'
  });

  addLog(`Temizleme tamamlandı. Toplam ${formatSize(totalCleanedSize)} temizlendi.`, 'success');
}

// Temizleme loglarını temizleme butonu için olay dinleyicisi
document.addEventListener('DOMContentLoaded', () => {
  const clearCleanupLogsButton = document.getElementById('clear-cleanup-logs');
  if (clearCleanupLogsButton) {
    clearCleanupLogsButton.addEventListener('click', () => {
      const cleanupLogContent = document.getElementById('cleanup-log-content');
      if (cleanupLogContent) {
        cleanupLogContent.innerHTML = '';
      }
    });
  }
}); 