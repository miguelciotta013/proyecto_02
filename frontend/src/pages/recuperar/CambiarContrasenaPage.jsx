import React, { useState, useEffect } from "react";
import apiClient from "../../api/axiosConfig"; // tu cliente axios
import { useNavigate } from "react-router-dom";

export default function CambiarContrasenaPage() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [modoRecuperacion, setModoRecuperacion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Si hay email guardado en recuperación, activamos modo recuperación
    const emailRecuperacion = localStorage.getItem("email_recuperacion");
    if (emailRecuperacion) {
      setModoRecuperacion(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    // Validaciones
    if (nueva !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (nueva.length < 4) {
      setError("La nueva contraseña debe tener al menos 4 caracteres.");
      return;
    }

    try {
      let payload = {};

      if (modoRecuperacion) {
        // Recuperación: enviamos email + nueva contraseña
        const email = localStorage.getItem("email_recuperacion");
        payload = {
          contrasena_nueva: nueva,
          email: email,
        };
      } else {
        // Cambio normal: enviamos contraseña actual + nueva
        payload = {
          contrasena_actual: actual,
          contrasena_nueva: nueva,
        };
      }

      const response = await apiClient.post("/auth/cambiar/", payload);

      setMensaje(response.data?.message || "✅ Contraseña cambiada correctamente.");

      // Si era recuperación, redirigir al login y limpiar email
      if (modoRecuperacion) {
        localStorage.removeItem("email_recuperacion");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error("Error Axios:", err.response?.status, err.response?.data);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al cambiar la contraseña. Verifique los datos."
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {modoRecuperacion ? "Crear Nueva Contraseña 🔑" : "Cambiar Contraseña 🔒"}
        </h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          {!modoRecuperacion && (
            <input
              type="password"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="Contraseña actual"
              required
              style={styles.input}
            />
          )}
          <input
            type="password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            placeholder="Nueva contraseña"
            required
            style={styles.input}
          />
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Confirmar nueva contraseña"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Guardar
          </button>
        </form>

        {mensaje && <p style={styles.success}>{mensaje}</p>}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f4f8" },
  card: { background: "#fff", padding: "30px", borderRadius: "10px", width: "400px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" },
  title: { textAlign: "center", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column" },
  input: { marginBottom: "10px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { background: "#007bff", color: "#fff", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" },
  success: { color: "green", textAlign: "center", marginTop: "10px" },
  error: { color: "red", textAlign: "center", marginTop: "10px" },
};
