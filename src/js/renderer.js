import {
  scanButton,
  cleanButton,
  settingsButton,
  languageSelect,
  darkModeToggle,
  clearLogsButton,
  selectAllRulesButton,
  unselectAllRulesButton
} from './dom.js';

import { loadSettings, saveSettings, toggleDarkMode } from './settings.js';
import { loadRules, selectAllRules, unselectAllRules } from './rules.js';
import { startScan } from './scanner.js';
import { startCleanup } from './cleaner.js';
import { clearLogs } from './logger.js';
import { changeLanguage } from './translations.js';

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