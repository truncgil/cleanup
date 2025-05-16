import { languageSelect, darkModeToggle, lastScanDate, appLogo } from './dom.js';
import { changeLanguage } from './translations.js';

export function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  
  // Dil ayarı
  const language = settings.language || 'tr';
  languageSelect.value = language;
  changeLanguage(language);
  
  // Dark mode ayarı
  const isDarkMode = settings.darkMode || false;
  darkModeToggle.checked = isDarkMode;
  lastScanDate.textContent = settings.lastScanDate || 'Hiç';
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    // Logo değiştirme
    appLogo.src = 'assets/cleantr-dark.svg';
  } else {
    appLogo.src = 'assets/cleantr.svg';
  }
}

export function saveSettings() {
  const settings = {
    language: languageSelect.value,
    darkMode: darkModeToggle.checked,
    lastScanDate: lastScanDate.textContent
  };
  localStorage.setItem('settings', JSON.stringify(settings));
}

export function toggleDarkMode() {
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