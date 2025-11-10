// src/api/api.js
import axios from "axios";

// 🧩 URL base del backend Django
// Usa la variable de entorno si existe (útil para producción)
// o "http://127.0.0.1:8000/api" por defecto.
const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

const sistemaApi = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // ⏱ evita que se cuelgue si el servidor no responde
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Función de ejemplo para testear conexión
export const getHome = async () => {
  try {
    const response = await sistemaApi.get("/home/");
    return response.data;
  } catch (error) {
    console.error("❌ Error al conectar con el backend:", error.message);
    throw error;
  }
};



export default sistemaApi;
