import React, { useState } from "react";
import axios from "axios";

export default function CambiarContrasenaPage() {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const email = localStorage.getItem("email_recuperacion");
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/cambiar/", { email, password });
      setMensaje(response.data.message || "Contraseña cambiada correctamente.");
      localStorage.removeItem("email_recuperacion");
    } catch (err) {
      setError("Error al cambiar la contraseña.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Cambiar Contraseña 🔒</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nueva contraseña"
            required
            style={styles.input}
          />
          <input
            type="password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Confirmar contraseña"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Guardar</button>
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
  success: { color: "green", textAlign: "center" },
  error: { color: "red", textAlign: "center" },
};
