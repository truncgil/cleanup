import { logContent, logContainer } from './dom.js';

let currentToast = null;

export async function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  
  // Log içeriğini güncelle
  logContent.textContent += logEntry + '\n';
  logContent.scrollTop = logContent.scrollHeight;
  
  // Log container'ı görünür yap
  logContainer.classList.remove('d-none');

  // SweetAlert2 toast göster
  if (currentToast) {
    await currentToast.close();
  }

  // Dark mode kontrolü
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  const toastOptions = {
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  };
  
  // Dark mode ayarlarını ekle
  if (isDarkMode) {
    toastOptions.background = '#2d2d2d';
    toastOptions.color = '#f5f5f5';
    toastOptions.iconColor = '#f5f5f5';
    toastOptions.customClass = {
      popup: 'swal2-dark',
      title: 'swal2-dark-title'
    };
  }

  const Toast = Swal.mixin(toastOptions);

  currentToast = Toast.fire({
    icon: type,
    title: logEntry
  });
}

export function clearLogs() {
  logContent.textContent = '';
} 