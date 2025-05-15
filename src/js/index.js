// DOM Elements
import {
  scanButton,
  cleanButton,
  settingsButton,
  languageSelect,
  darkModeToggle,
  clearLogsButton,
  selectAllRulesButton,
  unselectAllRulesButton,
  settingsModal
} from './dom.js';

// Settings
import { loadSettings, saveSettings, toggleDarkMode } from './settings.js';

// Rules
import { loadRules, selectAllRules, unselectAllRules } from './rules.js';

// Scanner
import { startScan, loadScanConfig } from './scanner.js';

// Cleaner
import { startCleanup } from './cleaner.js';

// Logger
import { clearLogs } from './logger.js';

// Translations
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