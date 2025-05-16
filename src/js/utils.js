import { cleanButton, scanButton } from './dom.js';

export function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function updateStep(step) {
  // Wizard adımlarını güncelle
  document.querySelectorAll('.wizard-step').forEach((el, index) => {
    if (index + 1 < step) {
      el.classList.add('completed');
      el.classList.remove('active');
    } else if (index + 1 === step) {
      el.classList.add('active');
      el.classList.remove('completed');
    } else {
      el.classList.remove('active', 'completed');
    }
  });

  // İçerik alanlarını güncelle
  document.querySelectorAll('.step-content').forEach((el, index) => {
    if (index + 1 === step) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  
  // Butonları adıma göre güncelle
  if (step === 1) {
    scanButton.classList.remove('d-none');
    cleanButton.classList.add('d-none');
  } else if (step === 2) {
    scanButton.classList.add('d-none');
    cleanButton.classList.remove('d-none');
    updateCleanButton();
  } else if (step === 3) {
    scanButton.classList.add('d-none');
    cleanButton.classList.add('d-none');
  }
}

export function updateCleanButton() {
  const hasSelectedResults = document.querySelectorAll('.result-checkbox:checked').length > 0;
  const cleanBtn = document.getElementById('clean-button');
  
  if (hasSelectedResults) {
    cleanBtn.classList.remove('btn-outline-primary');
    cleanBtn.classList.add('btn-primary');
    cleanBtn.disabled = false;
  } else {
    cleanBtn.classList.remove('btn-primary');
    cleanBtn.classList.add('btn-outline-primary');
    cleanBtn.disabled = false; // Butonu aktif bırakıyoruz, tıklanınca uyarı vereceğiz
  }
}

// SweetAlert2 için dark mode desteği ekleyen yardımcı fonksiyon
export function showSwal(options) {
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  // Dark mode varsa SweetAlert2 tema ayarlarını ekle
  if (isDarkMode) {
    options = {
      ...options,
      background: '#2d2d2d',
      color: '#f5f5f5',
      confirmButtonColor: '#6c599f', // Dark mode primary color
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'swal2-dark',
        header: 'swal2-dark-header',
        content: 'swal2-dark-content',
        input: 'swal2-dark-input',
        actions: 'swal2-dark-actions'
      }
    };
  } else {
    options = {
      ...options,
      confirmButtonColor: '#473185', // Light mode primary color
    };
  }
  
  return Swal.fire(options);
} 