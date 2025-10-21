import React from 'react';

export default function CajaTable({ items = [], onView = () => {} }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginTop: 20,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Tabla para pantallas grandes */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
          <thead style={{ background: 'linear-gradient(135deg, #2196f3, #64b5f6)', color: '#fff', textAlign: 'left' }}>
            <tr>
              {['ID', 'Empleado', 'Apertura', 'Cierre', 'Estado', 'Monto apertura', 'Monto cierre', 'Acciones'].map((h, i) => (
                <th key={i} style={{ ...thStyle, textAlign: i === 7 ? 'center' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map((c, i) => (
              <tr
                key={c.id_caja || i}
                style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff', transition: 'background 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e3f2fd'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#f9f9f9' : '#fff'}
              >
                <td style={tdStyle}>{c.id_caja}</td>
                <td style={tdStyle}>{c.empleado || '—'}</td>
                <td style={tdStyle}>{c.fecha_hora_apertura || '—'}</td>
                <td style={tdStyle}>{c.fecha_hora_cierre || '—'}</td>
                <td style={{ ...tdStyle, color: c.estado_caja === 1 ? '#388e3c' : '#d32f2f', fontWeight: 600 }}>
                  {c.estado_caja === 1 ? 'Abierta' : 'Cerrada'}
                </td>
                <td style={tdStyle}>${c.monto_apertura || '0'}</td>
                <td style={tdStyle}>${c.monto_cierre || '0'}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={() => onView(c.id_caja)}
                    style={buttonStyle}
                    onMouseEnter={e => e.target.style.background = '#0d47a1'}
                    onMouseLeave={e => e.target.style.background = '#1976d2'}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 20, color: '#777', fontStyle: 'italic' }}>
                  No hay registros de caja.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas responsive para pantallas pequeñas */}
      <div className="responsive-cards" style={{ display: 'none' }}>
        {items.length ? items.map((c, i) => (
          <div key={c.id_caja || i} style={cardStyle}>
            <p><strong>ID:</strong> {c.id_caja}</p>
            <p><strong>Empleado:</strong> {c.empleado || '—'}</p>
            <p><strong>Apertura:</strong> {c.fecha_hora_apertura || '—'}</p>
            <p><strong>Cierre:</strong> {c.fecha_hora_cierre || '—'}</p>
            <p>
              <strong>Estado:</strong> <span style={{ color: c.estado_caja === 1 ? '#388e3c' : '#d32f2f', fontWeight: 600 }}>
                {c.estado_caja === 1 ? 'Abierta' : 'Cerrada'}
              </span>
            </p>
            <p><strong>Monto apertura:</strong> ${c.monto_apertura || '0'}</p>
            <p><strong>Monto cierre:</strong> ${c.monto_cierre || '0'}</p>
            <button onClick={() => onView(c.id_caja)} style={{ ...buttonStyle, width: '100%' }}>Ver</button>
          </div>
        )) : (
          <p style={{ textAlign: 'center', color: '#777', padding: 10 }}>No hay registros de caja.</p>
        )}
      </div>

      {/* Estilos responsive */}
      <style>{`
        @media (max-width: 800px) {
          table { display: none; }
          .responsive-cards { display: block; }
        }
      `}</style>
    </div>
  );
}

// Estilos
const thStyle = {
  padding: '12px 16px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  borderBottom: '2px solid #1976d2',
};

const tdStyle = {
  padding: '10px 16px',
  fontSize: '0.9rem',
  color: '#333',
  borderBottom: '1px solid #eee',
};

const buttonStyle = {
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  padding: '6px 14px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.3s',
};

const cardStyle = {
  border: '1px solid #eee',
  borderRadius: '12px',
  padding: '16px',
  margin: '12px',
  background: '#fff',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};
