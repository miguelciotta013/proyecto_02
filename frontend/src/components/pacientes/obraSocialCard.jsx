import React from 'react';

export default function ObraSocialCard({ obra, onClose }) {
  if (!obra) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
        padding: "24px",
        marginTop: "20px",
        borderRadius: "16px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        maxWidth: "420px",
        fontFamily: "'Poppins', sans-serif",
        position: "relative",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
      }}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          border: "none",
          background: "#2196f3",
          color: "#fff",
          padding: "6px 14px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.background = "#1976d2")}
        onMouseLeave={(e) => (e.target.style.background = "#2196f3")}
      >
        ✕
      </button>

      {/* Título */}
      <h3 style={{ margin: "0 0 6px 0", color: "#0d47a1" }}>
        {obra.nombre_os}
      </h3>

      {/* ID */}
      <p style={{ margin: "4px 0", color: "#555", fontSize: "14px" }}>
        <strong>ID:</strong> {obra.id_obra_social}
      </p>

      {/* Parentesco */}
      {obra.parentesco && (
        <p style={{ margin: "8px 0 0 0", color: "#333", fontSize: "15px" }}>
          <strong>Parentesco:</strong> {obra.parentesco}
        </p>
      )}
    </div>
  );
}
