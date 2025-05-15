import { languageSelect, darkModeToggle, lastScanDate, appLogo } from './dom.js';

export function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  languageSelect.value = settings.language || 'tr';
  darkModeToggle.checked = settings.darkMode || false;
  lastScanDate.textContent = settings.lastScanDate || 'Hiç';
  
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
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