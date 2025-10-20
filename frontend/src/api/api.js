
// src/Api/api.js
import axios from "axios";

// Base URL: usa la variable de entorno REACT_APP_API_URL si está definida,
// si no, por defecto asume que el backend corre en el puerto 8000.
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const sistemaApi = axios.create({
    baseURL: API_BASE
});

/*
=======================================================================================================================
METODOS PARA APP "HOME"
=======================================================================================================================
*/

export const getHome = async () => {
    try {
        const response = await sistemaApi.get("/home/");
        return response.data;
    } catch (error) {
        console.error("Error al iniciar el sistema", error);
        throw error;
    }
};

export default sistemaApi;


