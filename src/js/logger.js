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

  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  currentToast = Toast.fire({
    icon: type,
    title: logEntry
  });
}

export function clearLogs() {
  logContent.textContent = '';
} 