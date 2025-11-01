import React from "react";
export default function PacienteCard({ paciente, onEditar, onEliminar, onAsignarObra, onAgregarFicha }) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        padding: "20px",
        maxWidth: "400px",
        margin: "20px auto",
        fontFamily: "'Poppins', sans-serif",
        transition: "transform 0.2s",
      }}
    >
      <div style={{ marginBottom: "15px" }}>
        <h2 style={{ margin: 0, color: "#333", fontSize: "22px" }}>
          {paciente.nombre} {paciente.apellido}
        </h2>
        <p style={{ margin: "5px 0", color: "#666" }}>DNI: {paciente.dni}</p>
        <p style={{ margin: "5px 0", color: "#666" }}>Edad: {paciente.edad}</p>
        <p style={{ margin: "5px 0", color: "#666" }}>Teléfono: {paciente.telefono}</p>
        <p style={{ margin: "5px 0", color: "#666" }}>Dirección: {paciente.direccion}</p>
        <p style={{ margin: "5px 0", color: "#666" }}>
          Obra Social: {paciente.obraSocial ? paciente.obraSocial : "No asignada"}
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <button
          onClick={() => onEditar(paciente.id)}
          style={{
            flex: "1",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "#fff",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#45a049"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#4caf50"}
        >
          Editar
        </button>

        <button
          onClick={() => onEliminar(paciente.id)}
          style={{
            flex: "1",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#f44336",
            color: "#fff",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#d32f2f"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#f44336"}
        >
          Dar de bajaaaaaaaaaa
        </button>

        <button
          onClick={() => onAsignarObra(paciente.id)}
          style={{
            flex: "1",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#2196f3",
            color: "#fff",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#1976d2"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#2196f3"}
        >
          Asignar obra sociaaaaal
        </button>

        <button
          onClick={() => onAgregarFicha(paciente.id)}
          style={{
            flex: "1",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#ff9800",
            color: "#fff",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#fb8c00"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#ff9800"}
        >
          Agregar Ficha
        </button>
      </div>
    </div>
  );
}
