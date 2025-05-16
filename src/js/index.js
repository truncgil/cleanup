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
  selectAllResultsButton,
  unselectAllResultsButton,
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

// Utils
import { updateStep } from './utils.js';

// Logger
import { clearLogs } from './logger.js';

// Results
import { selectAllResults, unselectAllResults } from './results.js';

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
selectAllResultsButton.addEventListener('click', selectAllResults);
unselectAllResultsButton.addEventListener('click', unselectAllResults);

// Wizard steps handling
function updateWizardSteps() {
  updateStep(1);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  loadSettings();
  await loadScanConfig();
  loadRules();
  updateWizardSteps();
}); 