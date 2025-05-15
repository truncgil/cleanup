import { resultTemplate } from './dom.js';
import { formatSize, updateCleanButton } from './utils.js';
import { updateTotalSize } from './scanner.js';

export function createResultElement(result) {
  const clone = resultTemplate.content.cloneNode(true);
  const checkbox = clone.querySelector('.result-checkbox');
  const name = clone.querySelector('.result-name');
  const path = clone.querySelector('.result-path');
  const size = clone.querySelector('.result-size');

  checkbox.id = `result-${result.id}`;
  name.textContent = result.name;
  path.textContent = result.path;
  size.textContent = formatSize(result.size);

  checkbox.addEventListener('change', () => {
    updateTotalSize();
    updateCleanButton();
  });

  return clone;
} 