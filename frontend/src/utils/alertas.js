// src/utils/alertas.js
import Swal from 'sweetalert2';

// Ajustá estos colores a los de tu sistema (navbar, fondo, etc.)
const SYSTEM_PRIMARY = '#4e73df';   // azul del sistema
const SYSTEM_BG = '#f4f6f9';        // fondo claro
const SYSTEM_TEXT = '#1b1e23';      // texto principal

export function showError(title = 'Error', message = 'Ocurrió un error.') {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: SYSTEM_PRIMARY,
    background: SYSTEM_BG,
    color: SYSTEM_TEXT,
  });
}

export function showWarning(title = 'Atención', message = '') {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: SYSTEM_PRIMARY,
    background: SYSTEM_BG,
    color: SYSTEM_TEXT,
  });
}

export function showSuccess(title = 'Listo', message = '') {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: SYSTEM_PRIMARY,
    background: SYSTEM_BG,
    color: SYSTEM_TEXT,
  });
}

export function confirmAction(
  title = '¿Estás seguro?',
  message = '',
  confirmText = 'Sí',
  cancelText = 'No'
) {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,

    // 👇 Invertimos botones: Sí izquierda, No derecha
    reverseButtons: false,

    confirmButtonText: confirmText,
    cancelButtonText: cancelText,

    // Estilo
    confirmButtonColor: SYSTEM_PRIMARY,
    cancelButtonColor: '#6c757d', // gris suave para "No" (opcional)
    background: SYSTEM_BG,
    color: SYSTEM_TEXT,
  }).then((result) => result.isConfirmed);
}
