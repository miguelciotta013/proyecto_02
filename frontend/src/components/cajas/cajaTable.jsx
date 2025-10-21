import React from 'react';

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

export default function CajaTable({ items = [], onView = () => {}, onClose = () => {} }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.1)', overflow: 'hidden', marginTop: 20 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead style={{ background: '#1976d2', color: '#fff' }}>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Descripción</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map((it, i) => {
              const idCaja = it.id_caja || it.id || (it.idCaja && it.idCaja.id) || null;
              const isOpen = (it.estado === 'Abierta') || (it.estado_caja === 1) || (!it.fecha_hora_cierre && it.fecha_hora_cierre !== 0);
              return (
              <tr key={idCaja || i} style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                <td style={tdStyle}>{idCaja || '—'}</td>
                <td style={tdStyle}>{it.tipo || it.tipo_movimiento || it.estado || '—'}</td>
                <td style={tdStyle}>{it.descripcion || it.descripcion_ingreso || it.descripcion_egreso || it.empleado_nombre || '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>${it.monto || it.monto_ingreso || it.monto_egreso || it.monto_apertura || 0}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button style={buttonStyle} onClick={() => onView(idCaja)}>Ver</button>
                    {isOpen && (
                      <button
                        style={{ ...buttonStyle, background: '#d32f2f' }}
                        onClick={() => { if (window.confirm('¿Cerrar esta caja?')) onClose(idCaja); }}
                      >Cerrar</button>
                    )}
                  </div>
                </td>
              </tr>
              )
            }) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 20, color: '#777' }}>No hay registros.</td>
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
