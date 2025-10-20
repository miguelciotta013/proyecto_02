import React from 'react';

export default function ObraSocialCard({ obra, onClose }) {
  if (!obra) return null;

  return (
    <div style={{
      backgroundColor: "#fff",
      padding: 20,
      marginTop: 16,
      borderRadius: 12,
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      maxWidth: 400,
      fontFamily: "'Poppins', sans-serif",
      position: "relative"
    }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          border: "none",
          backgroundColor: "#f44336",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: 8,
          cursor: "pointer",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={e => e.target.style.backgroundColor = "#d32f2f"}
        onMouseLeave={e => e.target.style.backgroundColor = "#f44336"}
      >
        Cerrar
      </button>

      <h4 style={{ margin: "0 0 8px 0", color: "#333" }}>{obra.nombre_os}</h4>
      <p style={{ margin: 0, color: "#666" }}>ID: {obra.id_obra_social}</p>
    </div>
  );
}