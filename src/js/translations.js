export const translations = {
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

export let currentLanguage = 'tr';

export function changeLanguage(lang) {
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