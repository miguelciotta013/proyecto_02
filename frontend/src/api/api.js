
// src/Api/api.js
import axios from "axios";

// Configuración general para todo el sistema
const sistemaApi = axios.create({
  baseURL: "http://localhost:8000/api/", // el backend 
  timeout: 10000,
});

// Interceptor para agregar token automáticamente
sistemaApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =====================
// Métodos para HOME
// =====================
export const getHome = async () => {
  try {
    const response = await sistemaApi.get("home/"); // ajustá el endpoint según tu backend
    return response.data;
  } catch (error) {
    console.error("Error al iniciar el sistema:", error);
    throw error;
  }
};

export default sistemaApi;


