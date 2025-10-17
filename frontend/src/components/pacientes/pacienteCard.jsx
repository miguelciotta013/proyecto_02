import React, { useState } from 'react';

export default function PacienteCard({
  paciente,
  onClose,
  onEditar,
  onEliminar,
  onAsignarObra,
  onAgregarFicha
}) {
  const [closing, setClosing] = useState(false);

  if (!paciente) return null;

  const handleEliminar = () => {
    if (window.confirm(`¿Seguro que querés dar de baja a ${paciente.nombre_paciente}?`)) {
      onEliminar(paciente.id_paciente);
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose && onClose();
    }, 300); // tiempo de animación
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        opacity: closing ? 0 : 1,
        transition: "opacity 0.3s ease"
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: 30,
          borderRadius: 20,
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
          maxWidth: 550,
          width: "90%",
          fontFamily: "'Poppins', sans-serif",
          position: "relative",
          transform: closing ? "scale(0.9)" : "scale(1)",
          transition: "transform 0.3s ease"
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: "none",
            backgroundColor: "#f44336",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={e => (e.target.style.backgroundColor = "#d32f2f")}
          onMouseLeave={e => (e.target.style.backgroundColor = "#f44336")}
        >
          ✕ Cerrar
        </button>

        <h2
          style={{
            marginBottom: 10,
            color: "#1976d2",
            borderBottom: "2px solid #e0e0e0",
            paddingBottom: 8
          }}
        >
          {paciente.nombre_paciente} {paciente.apellido_paciente}
        </h2>

        <div style={{ marginBottom: 16, color: "#555", lineHeight: "1.6" }}>
          <p><strong>DNI:</strong> {paciente.dni_paciente}</p>
          <p><strong>Fecha Nac.:</strong> {paciente.fecha_nacimiento}</p>
          <p><strong>Teléfono:</strong> {paciente.telefono}</p>
          <p><strong>Correo:</strong> {paciente.correo}</p>
        </div>

        <h4 style={{ marginBottom: 8, color: "#333" }}>Obras Sociales</h4>
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: 12,
            borderRadius: 10,
            maxHeight: 130,
            overflowY: "auto",
            marginBottom: 20,
            border: "1px solid #e0e0e0"
          }}
        >
          {paciente.obras_sociales && paciente.obras_sociales.length ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {paciente.obras_sociales.map(os => (
                <li key={os.id_paciente_os} style={{ marginBottom: 6 }}>
                  {os.obra_social_nombre} —{" "}
                  <span style={{ color: "#555" }}>
                    {os.credencial_paciente || "sin credencial"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: "#777" }}>
              Sin obras sociales registradas
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center"
          }}
        >
          <button
            onClick={() => onEditar(paciente.id_paciente)}
            style={{
              flex: "1",
              minWidth: "45%",
              padding: "10px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#1976d2",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = "#1565c0")}
            onMouseLeave={e => (e.target.style.backgroundColor = "#1976d2")}
          >
            Editar
          </button>

          <button
            onClick={handleEliminar}
            style={{
              flex: "1",
              minWidth: "45%",
              padding: "10px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#d32f2f",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = "#b71c1c")}
            onMouseLeave={e => (e.target.style.backgroundColor = "#d32f2f")}
          >
            Dar de baja
          </button>

          <button
            onClick={() => onAsignarObra(paciente.id_paciente)}
            style={{
              flex: "1",
              minWidth: "45%",
              padding: "10px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#0288d1",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = "#0277bd")}
            onMouseLeave={e => (e.target.style.backgroundColor = "#0288d1")}
          >
            Asignar Obra Social
          </button>

          <button
            onClick={() => onAgregarFicha(paciente.id_paciente)}
            style={{
              flex: "1",
              minWidth: "45%",
              padding: "10px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#2e7d32",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={e => (e.target.style.backgroundColor = "#1b5e20")}
            onMouseLeave={e => (e.target.style.backgroundColor = "#2e7d32")}
          >
            Agregar Ficha Patológica
          </button>
        </div>
      </div>
    </div>
  );
}
