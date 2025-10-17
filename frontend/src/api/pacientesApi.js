import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export async function listPacientes(params = {}) {
  const resp = await axios.get(`${API_BASE}/api/pacientes/`, { params });
  return resp.data;
}

export async function getPaciente(id) {
  const resp = await axios.get(`${API_BASE}/api/pacientes/${id}/`);
  return resp.data;
}

export async function createPaciente(data) {
  const resp = await axios.post(`${API_BASE}/api/pacientes/`, data);
  return resp.data;
}

export async function updatePaciente(id, data) {
  const resp = await axios.put(`${API_BASE}/api/pacientes/${id}/`, data);
  return resp.data;
}

export async function deletePaciente(id) {
  const resp = await axios.delete(`${API_BASE}/api/pacientes/${id}/`);
  return resp.data;
}

export async function listObrasSociales() {
  // endpoint en backend: /api/pacientes/obras-sociales/disponibles/
  const resp = await axios.get(`${API_BASE}/api/pacientes/obras-sociales/disponibles/`);
  return resp.data;
}

export async function addObraSocial(id_paciente, payload) {
  // backend: POST /api/pacientes/<id_paciente>/obras-sociales/
  const resp = await axios.post(`${API_BASE}/api/pacientes/${id_paciente}/obras-sociales/`, payload);
  return resp.data;
}

export async function removeObraSocial(id_paciente, id_paciente_os) {
  // backend: DELETE /api/pacientes/<id_paciente>/obras-sociales/<id_paciente_os>/
  const resp = await axios.delete(`${API_BASE}/api/pacientes/${id_paciente}/obras-sociales/${id_paciente_os}/`);
  return resp.data;
}

export async function getFichaPatologica(id_paciente) {
  const resp = await axios.get(`${API_BASE}/api/pacientes/${id_paciente}/ficha-patologica/`);
  return resp.data;
}

export async function createFichaPatologica(id_paciente, payload) {
  const resp = await axios.post(`${API_BASE}/api/pacientes/${id_paciente}/ficha-patologica/`, payload);
  return resp.data;
}

export async function updateFichaPatologica(id_paciente, payload) {
  const resp = await axios.put(`${API_BASE}/api/pacientes/${id_paciente}/ficha-patologica/`, payload);
  return resp.data;
}
