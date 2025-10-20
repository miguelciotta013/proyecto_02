import apiClient from './axiosConfig';

// Lista de pacientes (página inicial)
export const getPacientes = () => apiClient.get('/ficha_medica/');

// Detalle del paciente
export const getPacienteDetalle = (idPaciente) => 
  apiClient.get(`/ficha_medica/paciente/${idPaciente}/`);

// Fichas médicas de un paciente específico
export const getFichasPorPaciente = (idPaciente) => 
  apiClient.get(`/ficha_medica/fichas/?id_paciente=${idPaciente}`);

// Crear nueva ficha médica
export const createFichaMedica = (data) => 
  apiClient.post('/ficha_medica/', data);

// Catálogos (dientes, caras, tratamientos)
export const getCatalogos = () => 
  apiClient.get('/ficha_medica/catalogos/');

// Pacientes con obra social
export const getPacientesConOS = () => 
  apiClient.get('/ficha_medica/pacientes-os/');

// Ficha patológica
export const getFichaPatologica = (idPacienteOS) => 
  apiClient.get(`/ficha_medica/patologia/?id_paciente_os=${idPacienteOS}`);

// Actualizar cobro
export const updateCobro = (idCobro, data) => 
  apiClient.patch(`/ficha_medica/cobros/${idCobro}/`, data);

// Métodos de cobro
export const getMetodosCobro = () => 
  apiClient.get('/caja/metodos-cobro/');

export default {
  getPacientes,
  getPacienteDetalle,
  getFichasPorPaciente,
  createFichaMedica,
  getCatalogos,
  getPacientesConOS,
  getFichaPatologica,
  updateCobro,
  getMetodosCobro
};