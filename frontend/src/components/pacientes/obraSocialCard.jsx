import React from 'react';

export default function ObraSocialCard({ obra, onClose }) {
  if (!obra) return null;

  return (
    <div
      style={{
        background: '#fff',
        padding: '24px',
        marginTop: '20px',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        maxWidth: '420px',
        fontFamily: "'Poppins', sans-serif",
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        borderLeft: '6px solid #2e7d9d', // Franja azul lateral
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
      }}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          border: 'none',
          backgroundColor: '#9e9e9e', // Gris: cerrar/cancelar
          color: 'white',
          padding: '6px 14px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#757575')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#9e9e9e')}
      >
        ✕
      </button>

      {/* Título */}
      <h3
        style={{
          margin: '0 0 10px 0',
          color: '#2e7d9d', // Letra azul institucional
          fontWeight: 700,
          fontSize: '18px',
        }}
      >
        {obra.nombre_os}
      </h3>

      {/* ID */}
      <p style={{ margin: '4px 0', color: '#555', fontSize: '14px' }}>
        <strong>ID:</strong> {obra.id_obra_social}
      </p>

      {/* Parentesco */}
      {obra.parentesco && (
        <p style={{ margin: '8px 0 0 0', color: '#333', fontSize: '15px' }}>
          <strong>Parentesco:</strong> {obra.parentesco}
        </p>
      )}

      {/* Botón acción ejemplo: “Seleccionar” */}
      <button
        style={{
          marginTop: '16px',
          backgroundColor: '#4caf50', // Verde: agregar/guardar
          color: 'white',
          border: 'none',
          padding: '10px 18px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#388e3c')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#4caf50')}
      >
        Seleccionar
      </button>
    </div>
  );
}
