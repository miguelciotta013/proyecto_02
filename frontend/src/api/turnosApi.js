// src/api/turnosApi.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
const API_URL = `${API_BASE}/api/turnos/`;

const turnosApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: convierte errores de Axios en Error(mensaje_claro)
turnosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    let mensaje = "Error en la comunicación con el servidor";

    if (error.response && error.response.data) {
      const data = error.response.data;

      if (typeof data === "string") {
        mensaje = data;
      } else if (data.error) {
        // lo que devolvemos en el backend: {'success': False, 'error': '...'}
        mensaje = data.error;
      } else if (data.message) {
        mensaje = data.message;
      } else if (data.detail) {
        mensaje = data.detail;
      } else {
        try {
          mensaje = JSON.stringify(data);
        } catch {
          // dejamos el mensaje por defecto
        }
      }
    } else if (error.message) {
      mensaje = error.message;
    }

    return Promise.reject(new Error(mensaje));
  }
);

export const obtenerTurnos = async (params = "") => {
  const res = await turnosApi.get(`${params}`);
  return res.data;
};

export const obtenerTurno = async (id_turno) => {
  const res = await turnosApi.get(`${id_turno}/`);
  return res.data;
};

export const crearTurno = async (nuevoTurno) => {
  const res = await turnosApi.post("", nuevoTurno);
  return res.data;
};

export const actualizarTurno = async (id_turno, turnoActualizado) => {
  const res = await turnosApi.put(`${id_turno}/`, turnoActualizado);
  return res.data;
};

export const eliminarTurno = async (id_turno) => {
  const res = await turnosApi.delete(`${id_turno}/`);
  return res.data;
};

export const cambiarEstadoTurno = async (id_turno, id_estado) => {
  const res = await turnosApi.patch(`${id_turno}/estado/`, {
    id_turno_estado: id_estado,
  });
  return res.data;
};

export const obtenerEstados = async () => {
  const res = await turnosApi.get(`estados/`);
  return res.data;
};

export const obtenerHorariosDisponibles = async (fecha) => {
  const res = await turnosApi.get(`horarios-disponibles/?fecha=${fecha}`);
  return res.data;
};

