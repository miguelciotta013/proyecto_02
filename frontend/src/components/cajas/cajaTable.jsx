import React, { useState } from 'react';

const thStyle = {
  padding: '18px 28px',
  fontSize: '0.9rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  backgroundColor: '#2e7d9d',
  color: 'white',
  borderBottom: 'none',
  textAlign: 'left',
};

const tdStyle = {
  padding: '18px 28px',
  fontSize: '1rem',
  color: '#1e293b',
  borderBottom: '1px solid #f1f5f9',
};

const buttonBase = {
  border: 'none',
  padding: '8px 18px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
};

const buttonColors = {
  ver: { backgroundColor: '#1976d2', color: 'white' },
  cerrar: { backgroundColor: '#d32f2f', color: 'white' },
};

export default function CajaTable({ items = [], onView, onClose }) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const totalPages = Math.ceil(items.length / rowsPerPage);
  const pageData = items.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );

  const goNext = () => page < totalPages && setPage(page + 1);
  const goPrev = () => page > 1 && setPage(page - 1);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(46, 125, 157, 0.15)',
        overflow: 'hidden',
        marginTop: 24,
        border: '1px solid rgba(46, 125, 157, 0.1)',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header decorativo */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2e7d9d 0%, #1565c0 100%)',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3 style={{ 
            margin: 0, 
            color: 'white', 
            fontSize: '1.6rem', 
            fontWeight: 700,
            letterSpacing: '0.3px'
          }}>
            📋 Registro de Cajas
          </h3>
          <p style={{ 
            margin: '6px 0 0 0', 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1rem' 
          }}>
            Total de registros: <strong>{items.length}</strong>
          </p>
        </div>
        
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          padding: '12px 28px',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600 }}>
            Página {page} / {totalPages}
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, borderTopLeftRadius: 0 }}>ID Caja</th>
              <th style={thStyle}>Fecha Apertura</th>
              <th style={thStyle}>Fecha Cierre</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Monto Final</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
              <th style={{ ...thStyle, textAlign: 'center', borderTopRightRadius: 0 }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pageData.length ? (
              pageData.map((it, i) => {
                const idCaja = it.id_caja || it.id;
                const abierta = it.estado_caja === 1 || !it.fecha_hora_cierre;

                return (
                  <tr
                    key={idCaja}
                    style={{ 
                      background: i % 2 === 0 ? '#ffffff' : '#f8fafc',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e8f3f7';
                      e.currentTarget.style.transform = 'scale(1.01)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = i % 2 === 0 ? '#ffffff' : '#f8fafc';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#2e7d9d' }}>
                      #{idCaja}
                    </td>

                    <td style={tdStyle}>
                      {it.fecha_hora_apertura ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {new Date(it.fecha_hora_apertura).toLocaleDateString('es-AR')}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>
                            {new Date(it.fecha_hora_apertura).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td style={tdStyle}>
                      {it.fecha_hora_cierre ? (
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>
                            {new Date(it.fecha_hora_cierre).toLocaleDateString('es-AR')}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 2 }}>
                            {new Date(it.fecha_hora_cierre).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        <span style={{ 
                          color: '#4caf50', 
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <span style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#4caf50',
                            animation: 'pulse 2s infinite'
                          }}></span>
                          En curso
                        </span>
                      )}
                    </td>

                    <td style={{ 
                      ...tdStyle, 
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      color: '#2e7d9d'
                    }}>
                      ${parseFloat(it.monto_cierre || it.monto_apertura || 0).toFixed(2)}
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '6px 16px',
                          borderRadius: '20px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: '#fff',
                          backgroundColor: abierta ? '#4caf50' : '#64748b',
                          boxShadow: abierta 
                            ? '0 4px 12px rgba(76, 175, 80, 0.3)' 
                            : '0 4px 12px rgba(100, 116, 139, 0.2)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {abierta ? '✓ Abierta' : '✕ Cerrada'}
                      </span>
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        style={{ ...buttonBase, ...buttonColors.ver }}
                        onClick={() => onView(idCaja)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#1565c0';
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#1976d2';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      >
                        👁 Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ 
                  textAlign: 'center', 
                  padding: 60, 
                  color: '#94a3b8',
                  fontSize: '1.1rem'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                  <div style={{ fontWeight: 600 }}>No hay registros disponibles</div>
                  <div style={{ fontSize: '0.9rem', marginTop: 8 }}>
                    Los registros de caja aparecerán aquí
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer con paginación mejorada */}
      <div
        style={{
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '2px solid #f1f5f9',
          background: '#f8fafc',
        }}
      >
        {/* Selector de filas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <label style={{ 
            fontSize: '1rem', 
            color: '#64748b',
            fontWeight: 600
          }}>
            Mostrar por página:
          </label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: '2px solid #cbd5e1',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#2e7d9d',
              cursor: 'pointer',
              outline: 'none',
              background: 'white',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2e7d9d'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          >
            <option value={5}>5 filas</option>
            <option value={8}>8 filas</option>
            <option value={10}>10 filas</option>
            <option value={15}>15 filas</option>
            <option value={20}>20 filas</option>
          </select>
        </div>

        {/* Info y botones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ 
            fontSize: '1rem', 
            color: '#64748b',
            fontWeight: 500
          }}>
            Mostrando {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, items.length)} de {items.length}
          </span>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              style={{
                ...buttonBase,
                background: page === 1 ? '#e2e8f0' : '#9e9e9e',
                color: page === 1 ? '#94a3b8' : 'white',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                padding: '10px 20px',
              }}
              disabled={page === 1}
              onClick={goPrev}
              onMouseEnter={(e) => {
                if (page !== 1) {
                  e.target.style.backgroundColor = '#757575';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== 1) {
                  e.target.style.backgroundColor = '#9e9e9e';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              ← Anterior
            </button>

            <button
              style={{
                ...buttonBase,
                background: page === totalPages ? '#e2e8f0' : '#9e9e9e',
                color: page === totalPages ? '#94a3b8' : 'white',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                padding: '10px 20px',
              }}
              disabled={page === totalPages}
              onClick={goNext}
              onMouseEnter={(e) => {
                if (page !== totalPages) {
                  e.target.style.backgroundColor = '#757575';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== totalPages) {
                  e.target.style.backgroundColor = '#9e9e9e';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {/* Animación del pulso */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}