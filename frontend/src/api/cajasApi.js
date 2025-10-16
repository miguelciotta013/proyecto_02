
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

async function safeRequest(promise) {
  try {
    const resp = await promise;
    return resp.data;
  } catch (err) {
    // axios error: try to extract server response
    if (err.response && err.response.data) {
      return err.response.data;
    }
    return { success: false, error: err.message || 'Error de red' };
  }
}

export async function listCajas(params = {}) {
  return safeRequest(axios.get(`${API_BASE}/api/caja/`, { params }));
}

export async function aperturaCaja(payload) {
  return safeRequest(axios.post(`${API_BASE}/api/caja/apertura/`, payload));
}

export async function cierreCaja(id_caja, payload) {
  return safeRequest(axios.post(`${API_BASE}/api/caja/${id_caja}/cierre/`, payload));
}

export async function getCajaDetail(id_caja) {
  return safeRequest(axios.get(`${API_BASE}/api/caja/${id_caja}/`));
}

export async function addIngreso(id_caja, payload) {
  return safeRequest(axios.post(`${API_BASE}/api/caja/${id_caja}/ingresos/`, payload));
}

export async function addEgreso(id_caja, payload) {
  return safeRequest(axios.post(`${API_BASE}/api/caja/${id_caja}/egresos/`, payload));
}

export async function listMetodosCobro() {
  return safeRequest(axios.get(`${API_BASE}/api/caja/metodos-cobro/`));
}

