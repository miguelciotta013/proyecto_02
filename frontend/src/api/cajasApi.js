
import apiClient from './axiosConfig';

async function safeRequest(promise) {
  try {
    const resp = await promise;
    return resp.data;
  } catch (err) {
    if (err.response && err.response.data) {
      return err.response.data;
    }
    return { success: false, error: err.message || 'Error de red' };
  }
}

export async function listCajas(params = {}) {
  return safeRequest(apiClient.get('/caja/', { params }));
}

export async function aperturaCaja(payload) {
  return safeRequest(apiClient.post('/caja/apertura/', payload));
}

export async function cierreCaja(id_caja, payload) {
  return safeRequest(apiClient.post(`/caja/${id_caja}/cierre/`, payload));
}

export async function getCajaDetail(id_caja) {
  return safeRequest(apiClient.get(`/caja/${id_caja}/`));
}

export async function addIngreso(id_caja, payload) {
  return safeRequest(apiClient.post(`/caja/${id_caja}/ingresos/`, payload));
}

export async function addEgreso(id_caja, payload) {
  return safeRequest(apiClient.post(`/caja/${id_caja}/egresos/`, payload));
}

export async function listMetodosCobro() {
  return safeRequest(apiClient.get('/caja/metodos-cobro/'));
}

