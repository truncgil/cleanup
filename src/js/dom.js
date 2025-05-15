// DOM Elements
export const scanButton = document.getElementById('scan-button');
export const cleanButton = document.getElementById('clean-button');
export const settingsButton = document.getElementById('settings-button');
export const resultsContainer = document.getElementById('results-container');
export const rulesContainer = document.getElementById('rules-container');
export const totalSizeElement = document.getElementById('total-size');
export const languageSelect = document.getElementById('language-select');
export const darkModeToggle = document.getElementById('dark-mode');
export const lastScanDate = document.getElementById('last-scan-date');
export const logContainer = document.getElementById('log-container');
export const logContent = document.getElementById('log-content');
export const clearLogsButton = document.getElementById('clear-logs');
export const appLogo = document.getElementById('app-logo');
export const selectAllRulesButton = document.getElementById('select-all-rules');
export const unselectAllRulesButton = document.getElementById('unselect-all-rules');
export const selectAllResultsButton = document.getElementById('select-all-results');
export const unselectAllResultsButton = document.getElementById('unselect-all-results');

// Bootstrap Modal
export const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));

// Templates
export const ruleTemplate = document.getElementById('rule-template');
export const resultTemplate = document.getElementById('result-template');

// State
export let selectedRules = new Set();
export let scanResults = [];
export let totalSize = 0;
export let scanConfig = null; 