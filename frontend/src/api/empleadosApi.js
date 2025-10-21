import apiClient from './axiosConfig';

async function listEmpleados() {
  try {
    const res = await apiClient.get('/caja/empleados/');
    return res.data;
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export default {
  listEmpleados,
};
