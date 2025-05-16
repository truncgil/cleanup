import { cleanButton } from './dom.js';
import { translations, currentLanguage } from './translations.js';
import { addLog } from './logger.js';
import { updateStep, formatSize, showSwal } from './utils.js';

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

  for (const checkbox of selectedResults) {
    const resultElement = checkbox.closest('.card');
    const result = window.scanResults.find(r => `result-${r.id}` === checkbox.id);

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
  await showSwal({
    title: 'Temizleme Tamamlandı',
    html: `Toplam ${formatSize(totalCleanedSize)} temizlendi.<br>${cleanedFiles} dosya işlendi.`,
    icon: 'success',
    confirmButtonText: 'Tamam'
  });

  addLog(`Temizleme tamamlandı. Toplam ${formatSize(totalCleanedSize)} temizlendi.`, 'success');
} 