import React from "react";

export default function Home() {
  const turnos = [
    { estado: "Confirmado", nombre: "Marcos", apellido: "Mendez", hora: "14:40", asunto: "Limpieza", comentario: "usa brackets" },
    { estado: "Cancelado", nombre: "Mateo", apellido: "Lopez", hora: "14:50", asunto: "Control", comentario: "-" },
    { estado: "Confirmado", nombre: "Noa", apellido: "Soria", hora: "16:00", asunto: "Limpieza", comentario: "-" },
  ];

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
        minHeight: "100vh",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          padding: "40px",
          width: "100%",
          maxWidth: "700px",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#1565c0", marginBottom: "10px" }}>¡Bienvenida de vuelta!</h1>
        <p style={{ color: "#444", fontSize: "16px", marginBottom: "30px" }}>
          Esta es tu agenda de hoy 📅
        </p>

        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ color: "#0d47a1", marginBottom: "15px" }}>Turnos del día</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
            <thead>
              <tr style={{ background: "#1976d2", color: "white" }}>
                {["Estado", "Nombre", "Apellido", "Hora", "Asunto", "Comentario"].map((col) => (
                  <th key={col} style={{ padding: "12px" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {turnos.map((t, index) => (
                <tr key={index} style={{ background: index % 2 === 0 ? "#e3f2fd" : "#f5f5f5" }}>
                  <td style={{ padding: "10px" }}>{t.estado}</td>
                  <td>{t.nombre}</td>
                  <td>{t.apellido}</td>
                  <td>{t.hora}</td>
                  <td>{t.asunto}</td>
                  <td>{t.comentario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section>
          <h3 style={{ color: "#0d47a1", marginBottom: "15px" }}>Accesos rápidos</h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            {["Pacientes", "Turnos", "Caja", "Historial"].map((item) => (
              <li
                key={item}
                style={{
                  background: "#1976d2",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#0d47a1")}
                onMouseLeave={(e) => (e.target.style.background = "#1976d2")}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}