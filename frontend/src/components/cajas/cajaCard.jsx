import React from 'react';

export default function CajaCard({ caja, onView = () => {} }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        background: '#ffffff',
        borderTop: '10px solid #2e7d9d', // Franja azul superior
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        fontFamily: "'Poppins', sans-serif",
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#2e7d9d', fontSize: 18 }}>
            Caja #{caja.id_caja}
          </div>
          <div style={{ color: '#555', fontSize: 14 }}>
            {caja.empleado_nombre || 'Sin asignar'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#333' }}>
            ${caja.monto_apertura}
          </div>
          <div style={{ color: '#888', fontSize: 13 }}>
            {caja.fecha_hora_apertura || '—'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onView(caja.id_caja)}
          style={{
            backgroundColor: '#1976d2', // Botón azul “ver”
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#1565c0')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#1976d2')}
        >
          Ver
        </button>
      </div>
    </div>
  );
}
