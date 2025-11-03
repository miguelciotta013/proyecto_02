import React from 'react';

const thStyle = {
  padding: '12px 16px',
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  borderBottom: '2px solid #2e7d9d',
  backgroundColor: '#2e7d9d',
  color: 'white',
};

const tdStyle = {
  padding: '10px 16px',
  fontSize: '0.9rem',
  color: '#333',
  borderBottom: '1px solid #eee',
};

const buttonBase = {
  border: 'none',
  padding: '6px 14px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 500,
  transition: 'all 0.3s ease',
};

// Colores definidos según tu guía
const buttonColors = {
  ver: { backgroundColor: '#1976d2', color: 'white' },
  cerrar: { backgroundColor: '#d32f2f', color: 'white' },
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
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginTop: 20,
        borderTop: '10px solid #2e7d9d', // Franja azul superior
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Apertura</th>
              <th style={thStyle}>Cierre</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.length ? (
              items.map((it, i) => {
                const idCaja = it.id_caja || it.id;
                const abierta = it.estado_caja === 1 || !it.fecha_hora_cierre;

                return (
                  <tr
                    key={idCaja || i}
                    style={{
                      background: i % 2 === 0 ? '#f9f9f9' : '#fff',
                    }}
                  >
                    <td style={tdStyle}>{idCaja || '—'}</td>
                    <td style={tdStyle}>{it.tipo || '—'}</td>

                    {/* Fecha de Apertura */}
                    <td style={tdStyle}>
                      {it.fecha_hora_apertura
                        ? new Date(it.fecha_hora_apertura).toLocaleString('es-AR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>

                    {/* Fecha de Cierre */}
                    <td style={tdStyle}>
                      {it.fecha_hora_cierre
                        ? new Date(it.fecha_hora_cierre).toLocaleString('es-AR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : <span style={{ color: '#388e3c', fontWeight: 600 }}>Abierta</span>}
                    </td>

                    {/* Monto */}
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      ${it.monto_cierre || it.monto_apertura || it.monto || 0}
                    </td>

                    {/* Estado */}
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          color: '#fff',
                          backgroundColor: abierta ? '#4caf50' : '#d32f2f',
                        }}
                      >
                        {abierta ? 'Abierta' : 'Cerrada'}
                      </span>
                    </td>

                    {/* Botones */}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          style={{ ...buttonBase, ...buttonColors.ver }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = '#1565c0')
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = '#1976d2')
                          }
                          onClick={() => onView(idCaja)}
                        >
                          Ver
                        </button>

                        {abierta && (
                          <button
                            style={{ ...buttonBase, ...buttonColors.cerrar }}
                            onMouseEnter={(e) =>
                              (e.target.style.backgroundColor = '#b71c1c')
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.backgroundColor = '#d32f2f')
                            }
                            onClick={() => {
                              if (window.confirm('¿Cerrar esta caja?')) onClose(idCaja);
                            }}
                          >
                            Cerrar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: 'center',
                    padding: 20,
                    color: '#777',
                  }}
                >
                  No hay registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas responsive */}
      <div className="responsive-cards" style={{ display: 'none' }}>
        {items.length ? (
          items.map((c, i) => (
            <div key={c.id_caja || i} style={cardStyle}>
              <p><strong>ID:</strong> {c.id_caja}</p>
              <p><strong>Tipo:</strong> {c.tipo || '—'}</p>
              <p><strong>Apertura:</strong> {c.fecha_hora_apertura ? new Date(c.fecha_hora_apertura).toLocaleString('es-AR') : '—'}</p>
              <p><strong>Cierre:</strong> {c.fecha_hora_cierre ? new Date(c.fecha_hora_cierre).toLocaleString('es-AR') : <span style={{ color: '#388e3c', fontWeight: 600 }}>Abierta</span>}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <span
                  style={{
                    color: c.estado_caja === 1 ? '#388e3c' : '#d32f2f',
                    fontWeight: 600,
                  }}
                >
                  {c.estado_caja === 1 ? 'Abierta' : 'Cerrada'}
                </span>
              </p>
              <p><strong>Monto:</strong> ${c.monto_cierre || c.monto_apertura || 0}</p>
              <button
                onClick={() => onView(c.id_caja)}
                style={{ ...buttonBase, ...buttonColors.ver, width: '100%' }}
              >
                Ver
              </button>
              {c.estado_caja === 1 && (
                <button
                  onClick={() => {
                    if (window.confirm('¿Cerrar esta caja?')) onClose(c.id_caja);
                  }}
                  style={{
                    ...buttonBase,
                    ...buttonColors.cerrar,
                    width: '100%',
                    marginTop: 8,
                  }}
                >
                  Cerrar
                </button>
              )}
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#777', padding: 10 }}>
            No hay registros de caja.
          </p>
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
