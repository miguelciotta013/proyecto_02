import React, { useState, useMemo } from 'react';

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
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [busquedaId, setBusquedaId] = useState('');

  // Filtrar datos
  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Filtro por ID
    if (busquedaId.trim()) {
      filtered = filtered.filter(item => {
        const id = (item.id_caja || item.id || '').toString();
        return id.includes(busquedaId.trim());
      });
    }

    // Filtro por rango de fechas
    if (fechaDesde || fechaHasta) {
      filtered = filtered.filter(item => {
        if (!item.fecha_hora_apertura) return false;
        
        const fechaItem = new Date(item.fecha_hora_apertura);
        fechaItem.setHours(0, 0, 0, 0);

        if (fechaDesde) {
          const desde = new Date(fechaDesde);
          desde.setHours(0, 0, 0, 0);
          if (fechaItem < desde) return false;
        }

        if (fechaHasta) {
          const hasta = new Date(fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          if (fechaItem > hasta) return false;
        }

        return true;
      });
    }

    return filtered;
  }, [items, fechaDesde, fechaHasta, busquedaId]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const pageData = filteredItems.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );

  const goNext = () => page < totalPages && setPage(page + 1);
  const goPrev = () => page > 1 && setPage(page - 1);

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setBusquedaId('');
    setPage(1);
  };

  const tienesFiltrosActivos = fechaDesde || fechaHasta || busquedaId;

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
            {tienesFiltrosActivos && (
              <span> • Filtrados: <strong>{filteredItems.length}</strong></span>
            )}
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
            Página {page} / {totalPages || 1}
          </span>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div style={{
        padding: '20px 32px',
        background: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: '1 1 180px', minWidth: '180px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '6px'
          }}>
            🔍 Buscar por ID
          </label>
          <input
            type="text"
            value={busquedaId}
            onChange={(e) => {
              setBusquedaId(e.target.value);
              setPage(1);
            }}
            placeholder="Ej: 123"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '2px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2e7d9d'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
        </div>

        <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '6px'
          }}>
            📅 Desde
          </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => {
              setFechaDesde(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '2px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2e7d9d'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
        </div>

        <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '6px'
          }}>
            📅 Hasta
          </label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => {
              setFechaHasta(e.target.value);
              setPage(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '2px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2e7d9d'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
        </div>

        {tienesFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            style={{
              padding: '10px 20px',
              background: '#9e9e9e',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              flex: '0 0 auto'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#757575';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#9e9e9e';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ✕ Limpiar Filtros
          </button>
        )}
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
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>
                    {tienesFiltrosActivos ? '🔍' : '📭'}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {tienesFiltrosActivos 
                      ? 'No se encontraron resultados' 
                      : 'No hay registros disponibles'}
                  </div>
                  <div style={{ fontSize: '0.9rem', marginTop: 8 }}>
                    {tienesFiltrosActivos 
                      ? 'Intenta ajustar los filtros de búsqueda' 
                      : 'Los registros de caja aparecerán aquí'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer con paginación */}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ 
            fontSize: '1rem', 
            color: '#64748b',
            fontWeight: 500
          }}>
            Mostrando {filteredItems.length ? (page - 1) * rowsPerPage + 1 : 0} - {Math.min(page * rowsPerPage, filteredItems.length)} de {filteredItems.length}
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
              disabled={page === totalPages || totalPages === 0}
              onClick={goNext}
              onMouseEnter={(e) => {
                if (page !== totalPages && totalPages !== 0) {
                  e.target.style.backgroundColor = '#757575';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (page !== totalPages && totalPages !== 0) {
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