import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ValidarCodigoPage() {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const codigoGuardado = "123456"; // 🔹 Simulado por ahora
    if (codigo === codigoGuardado) {
      navigate("/cambiar-contraseña");
    } else {
      setError("Código incorrecto.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Validar Código 📩</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ingresá el código recibido"
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Validar</button>
        </form>
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
  error: { color: "red", textAlign: "center" },
};
