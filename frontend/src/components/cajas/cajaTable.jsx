import React, { useState } from 'react';

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

export default function CajaTable({ items = [], onView, onClose }) {
  /** PAGINACIÓN **/
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
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        marginTop: 20,
        borderTop: '10px solid #2e7d9d',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Apertura</th>
              <th style={thStyle}>Cierre</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
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
                    style={{ background: i % 2 === 0 ? '#f9f9f9' : '#fff' }}
                  >
                    <td style={tdStyle}>{idCaja}</td>

                    <td style={tdStyle}>
                      {it.fecha_hora_apertura
                        ? new Date(it.fecha_hora_apertura).toLocaleString('es-AR')
                        : '—'}
                    </td>

                    <td style={tdStyle}>
                      {it.fecha_hora_cierre
                        ? new Date(it.fecha_hora_cierre).toLocaleString('es-AR')
                        : <span style={{ color: '#388e3c', fontWeight: 600 }}>Abierta</span>}
                    </td>

                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      ${it.monto_cierre || it.monto_apertura || 0}
                    </td>

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

                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button
                        style={{ ...buttonBase, ...buttonColors.ver }}
                        onClick={() => onView(idCaja)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#777' }}>
                  No hay registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN UI */}
      <div
        style={{
          padding: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #eee',
        }}
      >
        {/* Selector de filas */}
        <div>
          Mostrar:&nbsp;
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            style={{
              padding: '6px',
              borderRadius: 6,
              border: '1px solid #aaa',
              fontSize: '0.9rem',
            }}
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            style={{
              ...buttonBase,
              background: '#ccc',
              color: '#333',
            }}
            disabled={page === 1}
            onClick={goPrev}
          >
            ⬅ Anterior
          </button>

          <span style={{ fontWeight: 600 }}>
            Página {page} de {totalPages}
          </span>

          <button
            style={{
              ...buttonBase,
              background: '#ccc',
              color: '#333',
            }}
            disabled={page === totalPages}
            onClick={goNext}
          >
            Siguiente ➜
          </button>
        </div>
      </div>
    </div>
  );
}
