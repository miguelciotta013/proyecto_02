import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/recuperar-contrasena/", { email });

      if (response.data.message) {
        setMensaje("Código enviado al correo.");
        // 👉 Guardamos el email para la siguiente pantalla
        localStorage.setItem("email_recuperacion", email);
        setTimeout(() => navigate("/validar-codigo"), 1500);
      } else {
        setError("No se pudo enviar el código.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor."); 
      setError(err.response.data.message);
      console.log(err)
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Recuperar Contraseña 🔑</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Enviar código</button>
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
