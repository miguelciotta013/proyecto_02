import apiClient from './axiosConfig';

// ============================================
// PACIENTES
// ============================================

/**
 * Obtener lista de pacientes con búsqueda opcional
 * @param {string} search - Término de búsqueda (nombre, apellido o DNI)
 * @returns {Promise} Response con lista de pacientes
 */
export const getPacientes = (search = '') => {
  const url = search 
    ? `/ficha_medica/?search=${encodeURIComponent(search)}`
    : '/ficha_medica/';
  return apiClient.get(url);
};

/**
 * Obtener detalle completo de un paciente
 * @param {number} idPaciente - ID del paciente
 * @returns {Promise} Response con datos del paciente y sus obras sociales
 */
export const getPacienteDetalle = (idPaciente) => 
  apiClient.get(`/ficha_medica/paciente/${idPaciente}/`);

/**
 * Obtener obras sociales asociadas a un paciente
 * @param {number} idPaciente - ID del paciente
 * @returns {Promise} Response con lista de obras sociales del paciente
 */
export const getObrasSocialesPaciente = (idPaciente) => 
  apiClient.get(`/ficha_medica/paciente/${idPaciente}/obras-sociales/`);

// ============================================
// FICHAS MÉDICAS
// ============================================

/**
 * Obtener fichas médicas con filtros opcionales
 * @param {Object} params - Parámetros de filtro
 * @param {number} [params.id_paciente] - Filtrar por paciente
 * @param {string} [params.estado_pago] - Filtrar por estado (pendiente, pagado, parcial)
 * @returns {Promise} Response con lista de fichas médicas
 */
export const getFichasMedicas = (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.id_paciente) queryParams.append('id_paciente', params.id_paciente);
  if (params.estado_pago) queryParams.append('estado_pago', params.estado_pago);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/ficha_medica/fichas/?${queryString}` : '/ficha_medica/fichas/';
  
  return apiClient.get(url);
};

/**
 * Obtener fichas médicas de un paciente específico
 * @param {number} idPaciente - ID del paciente
 * @returns {Promise} Response con fichas del paciente
 */
export const getFichasPorPaciente = (idPaciente) => 
  apiClient.get(`/ficha_medica/fichas/?id_paciente=${idPaciente}`);

/**
 * Obtener detalle de una ficha médica específica
 * @param {number} idFicha - ID de la ficha médica
 * @returns {Promise} Response con detalle completo de la ficha y cobro
 */
export const getFichaDetalle = (idFicha) => 
  apiClient.get(`/ficha_medica/ficha/${idFicha}/`);

/**
 * Crear nueva ficha médica
 * @param {Object} data - Datos de la ficha médica
 * @param {number} data.id_paciente_os - ID relación paciente-obra social
 * @param {number} data.id_empleado - ID del empleado
 * @param {number} data.id_ficha_patologica - ID de ficha patológica
 * @param {number} data.id_caja - ID de la caja abierta
 * @param {string} [data.observaciones] - Observaciones
 * @param {number} [data.nro_autorizacion] - Número de autorización
 * @param {number} [data.nro_coseguro] - Número de coseguro
 * @param {Array} data.detalles_consulta - Array de tratamientos
 * @returns {Promise} Response con ficha creada
 */
export const createFichaMedica = (data) => 
  apiClient.post('/ficha_medica/', data);

/**
 * Actualizar ficha médica existente
 * @param {number} idFicha - ID de la ficha médica
 * @param {Object} data - Datos a actualizar
 * @param {string} [data.observaciones] - Observaciones
 * @param {number} [data.nro_autorizacion] - Número de autorización
 * @param {number} [data.nro_coseguro] - Número de coseguro
 * @returns {Promise} Response con ficha actualizada
 */
export const updateFichaMedica = (idFicha, data) => 
  apiClient.put(`/ficha_medica/ficha/${idFicha}/`, data);

/**
 * Eliminar ficha médica (soft delete)
 * @param {number} idFicha - ID de la ficha médica
 * @returns {Promise} Response de confirmación
 */
export const deleteFichaMedica = (idFicha) => 
  apiClient.delete(`/ficha_medica/ficha/${idFicha}/`);

/**
 * Descargar PDF de ficha médica
 * @param {number} idFicha - ID de la ficha médica
 * @returns {Promise} Response con blob del PDF
 */
export const downloadFichaPDF = (idFicha) => 
  apiClient.get(`/ficha_medica/ficha/${idFicha}/pdf/`, {
    responseType: 'blob'
  });
/**
 * Actualizar conformidad del paciente en un detalle
 * @param {number} idDetalle - ID del detalle de consulta
 * @param {boolean} conformidad - Valor de conformidad (true/false)
 */
export const updateConformidad = (idDetalle, conformidad) => 
  apiClient.patch(`/ficha_medica/detalle/${idDetalle}/conformidad/`, {
    conformidad_paciente: conformidad
  });
// ============================================
// ODONTOGRAMA
// ============================================

/**
 * Obtener odontograma de una ficha médica
 * @param {number} idFicha - ID de la ficha médica
 * @returns {Promise} Response con dientes tratados y ficha patológica
 */
export const getOdontograma = (idFicha) => 
  apiClient.get(`/ficha_medica/ficha/${idFicha}/odontograma/`);

// ============================================
// FICHA PATOLÓGICA
// ============================================

/**
 * Verificar si existe ficha patológica para un paciente-OS
 * @param {number} idPacienteOS - ID de la relación paciente-obra social
 * @returns {Promise} Response indicando si existe y sus datos
 */

/**
 * Crear nueva ficha patológica
 * @param {Object} data - Datos de la ficha patológica (0 o 1 para cada campo)
 * @param {number} data.id_paciente_os - ID relación paciente-obra social
 * @returns {Promise} Response con ID de ficha creada
 */
export const createFichaPatologica = (data) => 
  apiClient.post('/ficha_medica/patologia/', data);

/**
 * Actualizar ficha patológica existente
 * @param {Object} data - Datos a actualizar
 * @param {number} data.id_ficha_patologica - ID de la ficha patológica
 * @returns {Promise} Response de confirmación
 */
export const updateFichaPatologica = (data) => 
  apiClient.put('/ficha_medica/patologia/', data);

// ============================================
// COBROS
// ============================================

/**
 * Actualizar información de cobro
 * @param {number} idCobro - ID del cobro
 * @param {Object} data - Datos a actualizar
 * @param {number} [data.monto_pagado_paciente] - Monto pagado por paciente
 * @param {number} [data.monto_pagado_obra_social] - Monto pagado por obra social
 * @param {number} [data.id_metodo_cobro] - ID método de cobro
 * @param {number} [data.id_estado_pago] - ID estado de pago
 * @returns {Promise} Response con cobro actualizado
 */
export const updateCobro = (idCobro, data) => 
  apiClient.patch(`/ficha_medica/cobros/${idCobro}/`, data);

// ============================================
// CATÁLOGOS
// ============================================

/**
 * Obtener todos los catálogos odontológicos
 * @returns {Promise} Response con dientes, caras, parentescos y tratamientos
 */
export const getCatalogos = () => 
  apiClient.get('/ficha_medica/catalogos/');

/**
 * Obtener tratamientos con o sin cobertura de obra social
 * @param {number|null} idObraSocial - ID de obra social (null para sin descuento)
 * @returns {Promise} Response con tratamientos y sus precios
 */
export const getTratamientos = (idObraSocial = null) => {
  const url = idObraSocial 
    ? `/ficha_medica/tratamientos/?id_obra_social=${idObraSocial}`
    : '/ficha_medica/tratamientos/';
  return apiClient.get(url);
};

/**
 * Obtener métodos de cobro disponibles
 * @returns {Promise} Response con lista de métodos de cobro
 */
export const getMetodosCobro = () => 
  apiClient.get('/ficha_medica/metodos-cobro/');

/**
 * Obtener estados de pago disponibles
 * @returns {Promise} Response con lista de estados
 */
export const getEstadosPago = () => 
  apiClient.get('/ficha_medica/estados-pago/');

/**
 * Obtener todas las relaciones paciente-obra social
 * @returns {Promise} Response con lista completa
 */
export const getPacientesConOS = () => 
  apiClient.get('/ficha_medica/pacientes-os/');

// ============================================
// CAJA
// ============================================

/**
 * Verificar si hay una caja abierta
 * @returns {Promise} Response indicando estado de caja
 */
export const getCajaEstado = () => 
  apiClient.get('/ficha_medica/caja/estado/');

export const getFichaPatologica = (idPacienteOS) => 
  apiClient.get(`/ficha_medica/patologia/?id_paciente_os=${idPacienteOS}`);


// ============================================
// HELPERS
// ============================================

/**
 * Helper para descargar archivo PDF
 * @param {Blob} blob - Blob del archivo
 * @param {string} filename - Nombre para el archivo
 */
export const downloadPDF = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Helper para manejar errores de API
 * @param {Error} error - Error de axios
 * @returns {string} Mensaje de error legible para el usuario
 */
export const handleApiError = (error) => {
  if (error.response) {
    const { data, status } = error.response;
    
    // Errores específicos por código
    switch (status) {
      case 400:
        return data.error || 'Datos inválidos. Verifica la información ingresada.';
      case 404:
        return data.error || 'Recurso no encontrado.';
      case 500:
        return data.error || 'Error en el servidor. Intenta nuevamente.';
      default:
        return data.error || data.message || 'Error en la solicitud.';
    }
  } else if (error.request) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión.';
  } else {
    return error.message || 'Error desconocido.';
  }



};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  // Pacientes
  getPacientes,
  getPacienteDetalle,
  getObrasSocialesPaciente,
  
  // Fichas Médicas
  getFichasMedicas,
  getFichasPorPaciente,
  getFichaDetalle,
  createFichaMedica,
  updateFichaMedica,
  deleteFichaMedica,
  downloadFichaPDF,
  updateConformidad,
  
  // Odontograma
  getOdontograma,
  
  // Ficha Patológica
  getFichaPatologica,
  createFichaPatologica,
  updateFichaPatologica,
  
  
  // Cobros
  updateCobro,
  
  // Catálogos
  getCatalogos,
  getTratamientos,
  getMetodosCobro,
  getEstadosPago,
  getPacientesConOS,
  
  // Caja
  getCajaEstado,
  
  // Helpers
  downloadPDF,
  handleApiError
};