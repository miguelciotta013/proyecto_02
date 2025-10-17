import React from "react";

export default function Home() {
  const turnos = [
    { estado: "Confirmado", nombre: "Messi", apellido: "Ronaldo", hora: "14:40", asunto: "Limpieza", comentario: "usa brackets" },
    { estado: "Cancelado", nombre: "Neymar", apellido: "CR7", hora: "14:50", asunto: "Control", comentario: "-" },
    { estado: "Confirmado", nombre: "Homero", apellido: "Simpson", hora: "16:00", asunto: "Limpieza", comentario: "-" },
  ];

  const accesos = [
    { nombre: "Pacientes", color: "#1976d2" },
    { nombre: "Turnos", color: "#0288d1" },
    { nombre: "Caja", color: "#2e7d32" },
    { nombre: "Historial", color: "#f57c00" },
  ];

  return (
    <div style={styles.container}>
      {/* 🔵 Decoraciones suaves al fondo */}
      <div style={styles.bgShape1}></div>
      <div style={styles.bgShape2}></div>

      <div style={styles.wrapper}>
        {/* Encabezado */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>¡Bienvenida de vuelta! 👋</h1>
          <p style={styles.headerSubtitle}>Esta es tu agenda de hoy 📅</p>
        </div>

        {/* Tabla de Turnos */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Turnos del Día</h2>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                {["Estado", "Nombre", "Apellido", "Hora", "Asunto", "Comentario"].map((col) => (
                  <th key={col} style={styles.th}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {turnos.map((t, i) => (
                <tr
                  key={i}
                  style={{
                    ...styles.tr,
                    background: i % 2 === 0 ? "#f8faff" : "#ffffff",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e3f2fd")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "#f8faff" : "#ffffff")}
                >
                  <td style={{ ...styles.td, color: t.estado === "Cancelado" ? "#d32f2f" : "#2e7d32", fontWeight: 600 }}>{t.estado}</td>
                  <td style={styles.td}>{t.nombre}</td>
                  <td style={styles.td}>{t.apellido}</td>
                  <td style={styles.td}>{t.hora}</td>
                  <td style={styles.td}>{t.asunto}</td>
                  <td style={styles.td}>{t.comentario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Accesos Rápidos */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Accesos Rápidos ⚡</h2>
          <div style={styles.accesosGrid}>
            {accesos.map((a) => (
              <div
                key={a.nombre}
                style={{
                  ...styles.accesoBox,
                  background: a.color,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = "0 10px 18px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
                }}
              >
                {a.nombre}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Poppins, sans-serif",
    background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
    minHeight: "100vh",
    padding: "40px",
    display: "flex",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  bgShape1: {
    position: "absolute",
    top: "-100px",
    left: "-150px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle at center, #90caf9 0%, transparent 70%)",
    opacity: 0.5,
    zIndex: 0,
  },
  bgShape2: {
    position: "absolute",
    bottom: "-120px",
    right: "-120px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "radial-gradient(circle at center, #64b5f6 0%, transparent 70%)",
    opacity: 0.5,
    zIndex: 0,
  },
  wrapper: {
    width: "100%",
    maxWidth: "950px",
    display: "flex",
    flexDirection: "column",
    gap: "35px",
    animation: "fadeIn 0.8s ease",
    zIndex: 1,
  },
  header: {
    background: "linear-gradient(135deg, #1565c0, #42a5f5)",
    borderRadius: "20px",
    color: "white",
    textAlign: "center",
    padding: "40px 20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  },
  headerTitle: {
    fontSize: "2.2rem",
    marginBottom: "10px",
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: "1.1rem",
    opacity: 0.9,
  },
  card: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    padding: "25px 30px",
  },
  sectionTitle: {
    color: "#0d47a1",
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    background: "#1976d2",
    color: "white",
  },
  th: {
    padding: "12px",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  td: {
    padding: "10px",
    fontSize: "0.9rem",
    color: "#333",
  },
  accesosGrid: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  accesoBox: {
    flex: "1 1 180px",
    textAlign: "center",
    padding: "18px 10px",
    borderRadius: "14px",
    color: "white",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
};
