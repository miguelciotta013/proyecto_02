import React, { useState } from "react";

export default function CambiarContrasenaPage() {
  const accessToken = localStorage.getItem('access_token');
  const emailRecuperacion = localStorage.getItem('email_recuperacion');
  
  // Estados
  const [modoRecuperacion, setModoRecuperacion] = useState(!!emailRecuperacion);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [email, setEmail] = useState(emailRecuperacion || "");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const limpiarFormulario = () => {
    setActual("");
    setNueva("");
    setConfirmar("");
    if (!emailRecuperacion) setEmail("");
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    setError("");
    setMensaje("");

    // Validaciones
    if (nueva !== confirmar) {
      setError("❌ Las contraseñas no coinciden");
      return;
    }

    if (nueva.length < 4) {
      setError("❌ La contraseña debe tener al menos 4 caracteres");
      return;
    }

    if (modoRecuperacion) {
      if (!email.trim()) {
        setError("❌ Ingrese el email de su cuenta");
        return;
      }
      if (!validarEmail(email)) {
        setError("❌ Email inválido");
        return;
      }
    } else {
      if (!accessToken) {
        setError("❌ Debe iniciar sesión para cambiar la contraseña");
        return;
      }
      if (!actual.trim()) {
        setError("❌ Ingrese su contraseña actual");
        return;
      }
    }

    setLoading(true);

    try {
      let payload;
      
      if (modoRecuperacion) {
        payload = {
          email: email.trim(),
          contrasena_nueva: nueva
        };
      } else {
        payload = {
          contrasena_actual: actual,
          contrasena_nueva: nueva
        };
      }

      // Simular API call
      console.log('Enviando:', payload);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMensaje("✅ Contraseña cambiada exitosamente");
      limpiarFormulario();

      // Si era recuperación, limpiar localStorage
      if (modoRecuperacion) {
        localStorage.removeItem("email_recuperacion");
        setTimeout(() => {
          setMensaje("✅ Contraseña cambiada. Redirigiendo al login...");
        }, 1500);
      }

    } catch (err) {
      console.error("Error:", err);
      setError("❌ Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const toggleModo = () => {
    setError("");
    setMensaje("");
    setModoRecuperacion(!modoRecuperacion);
    limpiarFormulario();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconBox}>
          {modoRecuperacion ? "🔑" : "🔒"}
        </div>

        <h2 style={styles.title}>
          {modoRecuperacion ? "Recuperar Contraseña" : "Cambiar Contraseña"}
        </h2>

        <p style={styles.subtitle}>
          {modoRecuperacion 
            ? "Ingrese su email y la nueva contraseña"
            : "Ingrese su contraseña actual y la nueva"}
        </p>

        <div style={styles.formContainer}>
          {modoRecuperacion ? (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                style={styles.input}
                disabled={loading}
              />
            </div>
          ) : (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña Actual</label>
              <input
                type="password"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                disabled={loading}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nueva Contraseña</label>
            <input
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button 
            onClick={handleSubmit}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Cambiar Contraseña"}
          </button>
        </div>

        {mensaje && (
          <div style={styles.success}>
            {mensaje}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <div style={styles.toggleContainer}>
          <button
            onClick={toggleModo}
            style={styles.toggleButton}
            disabled={loading}
          >
            {modoRecuperacion 
              ? "Tengo mi contraseña actual" 
              : "Olvidé mi contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px"
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
  },
  iconBox: {
    fontSize: "3rem",
    textAlign: "center",
    marginBottom: "16px"
  },
  title: {
    textAlign: "center",
    marginBottom: "8px",
    color: "#2d3748",
    fontSize: "1.8rem",
    fontWeight: "700"
  },
  subtitle: {
    textAlign: "center",
    color: "#718096",
    fontSize: "0.9rem",
    marginBottom: "28px"
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#4a5568"
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "2px solid #e2e8f0",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    outline: "none",
    fontFamily: "inherit"
  },
  button: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    marginTop: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
  },
  success: {
    background: "#d4edda",
    color: "#155724",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "20px",
    textAlign: "center",
    border: "1px solid #c3e6cb",
    fontWeight: "500"
  },
  error: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "12px",
    borderRadius: "8px",
    marginTop: "20px",
    textAlign: "center",
    border: "1px solid #f5c6cb",
    fontWeight: "500"
  },
  toggleContainer: {
    marginTop: "24px",
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid #e2e8f0"
  },
  toggleButton: {
    background: "transparent",
    border: "none",
    color: "#667eea",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    textDecoration: "underline",
    transition: "color 0.2s ease"
  }
};