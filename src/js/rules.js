import { rulesContainer, ruleTemplate, selectedRules } from './dom.js';
import { translations, currentLanguage } from './translations.js';
import { addLog } from './logger.js';
import { updateCleanButton, updateStep } from './utils.js';

export function loadRules() {
  addLog(translations[currentLanguage].loading);
  updateStep(1);
  
  fetch('scan-config.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Kurallar yüklenemedi');
      }
      return response.json();
    })
    .then(config => {
      rulesContainer.innerHTML = '';
      config.scanFolders.forEach(rule => {
        const ruleElement = createRuleElement(rule);
        rulesContainer.appendChild(ruleElement);
        addLog(`${rule.name} kuralı yüklendi`);
      });
      addLog(translations[currentLanguage].rulesLoaded);
    })
    .catch(error => {
      console.error('Kurallar yüklenirken hata:', error);
      rulesContainer.innerHTML = `<div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        ${translations[currentLanguage].rulesError}
      </div>`;
      addLog(`HATA: ${translations[currentLanguage].rulesError}`);
    });
}

function createRuleElement(rule) {
  const clone = ruleTemplate.content.cloneNode(true);
  const checkbox = clone.querySelector('.rule-checkbox');
  const name = clone.querySelector('.rule-name');
  const path = clone.querySelector('.rule-path');
  const description = clone.querySelector('.rule-description');

  checkbox.id = `rule-${rule.id}`;
  name.textContent = rule.name;
  path.textContent = rule.path;
  description.textContent = rule.description[currentLanguage];

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      selectedRules.add(rule.id);
    } else {
      selectedRules.delete(rule.id);
    }
    updateCleanButton();
  });

  return clone;
}

export function selectAllRules() {
  const checkboxes = document.querySelectorAll('.rule-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.checked = true;
    const ruleId = checkbox.id.replace('rule-', '');
    selectedRules.add(ruleId);
  });
  updateCleanButton();
}

export function unselectAllRules() {
  const checkboxes = document.querySelectorAll('.rule-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.checked = false;
    const ruleId = checkbox.id.replace('rule-', '');
    selectedRules.delete(ruleId);
  });
  updateCleanButton();
} 