import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Search, RefreshCw } from 'lucide-react';

export default function PacienteTable({ pacientes = [], onView, loading = false }) {
  const [search, setSearch] = useState('');
  const [localPacientes, setLocalPacientes] = useState([]);

  // Actualizar pacientes locales cuando cambie la prop
  useEffect(() => {
    console.log('📦 Pacientes recibidos:', pacientes.length);
    setLocalPacientes(pacientes);
  }, [pacientes]);

  // Filtrado optimizado con useMemo
  const filteredPacientes = useMemo(() => {
    if (!search.trim()) return localPacientes;

    const searchLower = search.toLowerCase().trim();
    
    return localPacientes.filter(p => {
      const dni = (p.dni_paciente?.toString() || '').toLowerCase();
      const nombre = (p.nombre_paciente || '').toLowerCase();
      const apellido = (p.apellido_paciente || '').toLowerCase();
      
      return dni.includes(searchLower) || 
             nombre.includes(searchLower) || 
             apellido.includes(searchLower);
    });
  }, [localPacientes, search]);

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerWrapperStyle}>
          <h2 style={headerStyle}>
            🧾 Lista de Pacientes
          </h2>
          <div style={badgeStyle}>
            {loading ? (
              <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginRight: 6 }} />
            ) : null}
            {filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Buscador */}
        <div style={searchWrapperStyle}>
          <div style={searchBoxStyle}>
            <Search size={18} style={searchIconStyle} />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre o apellido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={searchInputStyle}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={clearBtnStyle}
                onMouseEnter={e => e.target.style.backgroundColor = '#f44336'}
                onMouseLeave={e => e.target.style.backgroundColor = '#ff5252'}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={loadingStyle}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: '#2e7d9d' }} />
            <p style={{ marginTop: 12, color: '#666' }}>Cargando pacientes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !filteredPacientes.length && (
          <div style={emptyStateStyle}>
            <div style={emptyIconStyle}>📋</div>
            <p style={emptyTextStyle}>
              {search 
                ? `No se encontraron pacientes con "${search}"`
                : 'No hay pacientes registrados'
              }
            </p>
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={emptyButtonStyle}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {/* Tabla */}
        {!loading && filteredPacientes.length > 0 && (
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={headerRowStyle}>
                  {['DNI', 'Nombre', 'Apellido', 'Nacimiento', 'Teléfono', 'Acciones'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.map((p, index) => (
                  <TableRow 
                    key={`${p.id_paciente}-${index}`}
                    paciente={p}
                    index={index}
                    onView={onView}
                    formatearFecha={formatearFecha}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info */}
        {!loading && filteredPacientes.length > 0 && (
          <div style={footerStyle}>
            Mostrando {filteredPacientes.length} de {localPacientes.length} paciente{localPacientes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

// Componente de fila optimizado (evita re-renders innecesarios)
const TableRow = React.memo(({ paciente: p, index, onView, formatearFecha }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      style={{
        ...rowStyle(index),
        ...(isHovered ? hoverRowStyle : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={tdStyle}>
        <span style={dniBadgeStyle}>{p.dni_paciente || '-'}</span>
      </td>
      <td style={tdStyle}>
        <strong style={{ color: '#333' }}>{p.nombre_paciente || '-'}</strong>
      </td>
      <td style={tdStyle}>
        <strong style={{ color: '#333' }}>{p.apellido_paciente || '-'}</strong>
      </td>
      <td style={tdStyle}>{formatearFecha(p.fecha_nacimiento)}</td>
      <td style={tdStyle}>
        {p.telefono ? (
          <a href={`tel:${p.telefono}`} style={phoneStyle}>
            📞 {p.telefono}
          </a>
        ) : '-'}
      </td>
      <td style={{ ...tdStyle, textAlign: 'center' }}>
        <button
          onClick={() => onView?.(p.id_paciente)}
          style={btnVerStyle}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(90deg, #1565c0, #0288d1)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 15px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(90deg, #1976d2, #2196f3)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
          }}
        >
          <Eye size={16} style={{ marginRight: 6 }} />
          Ver
        </button>
      </td>
    </tr>
  );
});

// --- Estilos ---
const containerStyle = {
  fontFamily: 'Poppins, sans-serif',
  backgroundColor: '#f4f6f8',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'start',
  padding: '40px 20px'
};

const cardStyle = {
  width: '100%',
  maxWidth: '1200px',
  backgroundColor: '#fff',
  borderRadius: '20px',
  boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
  overflow: 'hidden',
  transition: '0.3s'
};

const headerWrapperStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 30px',
  background: 'linear-gradient(90deg, #2e7d9d, #1565c0)',
  borderBottom: '3px solid #1565c0'
};

const headerStyle = {
  color: '#fff',
  margin: 0,
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '0.5px'
};

const badgeStyle = {
  backgroundColor: 'rgba(255,255,255,0.2)',
  color: '#fff',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center'
};

const searchWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  padding: '20px',
  backgroundColor: '#fafafa',
  borderBottom: '1px solid #e0e0e0'
};

const searchBoxStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '500px'
};

const searchIconStyle = {
  position: 'absolute',
  top: '50%',
  left: '14px',
  transform: 'translateY(-50%)',
  color: '#888'
};

const searchInputStyle = {
  width: '100%',
  padding: '12px 45px 12px 45px',
  borderRadius: 12,
  border: '2px solid #e0e0e0',
  fontSize: 15,
  outline: 'none',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'all 0.2s ease',
  fontFamily: 'Poppins, sans-serif'
};

const clearBtnStyle = {
  position: 'absolute',
  top: '50%',
  right: '10px',
  transform: 'translateY(-50%)',
  backgroundColor: '#ff5252',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  cursor: 'pointer',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  minHeight: '300px'
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  minHeight: '300px'
};

const emptyIconStyle = {
  fontSize: '64px',
  marginBottom: '20px',
  opacity: 0.5
};

const emptyTextStyle = {
  fontSize: '16px',
  color: '#666',
  marginBottom: '20px'
};

const emptyButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#2e7d9d',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s'
};

const tableWrapperStyle = {
  overflowX: 'auto',
  padding: '0 20px 20px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '10px'
};

const headerRowStyle = {
  backgroundColor: '#e3f2fd',
  borderBottom: '3px solid #2e7d9d'
};

const thStyle = {
  padding: '16px 12px',
  fontWeight: '600',
  color: '#2e7d9d',
  fontSize: '14px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  textAlign: 'left',
  whiteSpace: 'nowrap'
};

const tdStyle = {
  padding: '14px 12px',
  color: '#555',
  borderBottom: '1px solid #eee',
  fontSize: '14px',
  verticalAlign: 'middle'
};

const rowStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
  transition: 'all 0.2s ease',
  cursor: 'pointer'
});

const hoverRowStyle = {
  backgroundColor: '#e0f2f1',
  transform: 'scale(1.005)',
  boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
};

const dniBadgeStyle = {
  display: 'inline-block',
  backgroundColor: '#e3f2fd',
  color: '#1976d2',
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: '600',
  fontFamily: 'monospace'
};

const phoneStyle = {
  color: '#4caf50',
  textDecoration: 'none',
  fontWeight: '500',
  transition: 'all 0.2s'
};

const btnVerStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 16px',
  background: 'linear-gradient(90deg, #1976d2, #2196f3)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '13px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap'
};

const footerStyle = {
  padding: '15px 30px',
  backgroundColor: '#fafafa',
  borderTop: '1px solid #e0e0e0',
  textAlign: 'center',
  fontSize: '13px',
  color: '#666',
  fontWeight: '500'
};