import React, { useState } from 'react';
import { Eye, Search } from 'lucide-react';

export default function PacienteTable({ pacientes = [], onView }) {
  const [search, setSearch] = useState('');

  const filteredPacientes = pacientes.filter(p =>
    (p.dni_paciente?.toString() || '').includes(search) ||
    (p.nombre_paciente?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.apellido_paciente?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={headerStyle}>🧾 Lista de Pacientes</h2>

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
          </div>
        </div>

        {!filteredPacientes.length ? (
          <p style={{ textAlign: 'center', marginTop: 30, color: '#666' }}>
            No hay pacientes para mostrar.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#e3f2fd', textAlign: 'left' }}>
                {['DNI', 'Nombre', 'Apellido', 'Nacimiento', 'Teléfono', 'Acciones'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.map((p, index) => (
                <tr
                  key={p.id_paciente}
                  style={rowStyle(index)}
                  onMouseEnter={e => hoverRow(e)}
                  onMouseLeave={e => unhoverRow(e, index)}
                >
                  <td style={tdStyle}>{p.dni_paciente || ''}</td>
                  <td style={tdStyle}>{p.nombre_paciente || ''}</td>
                  <td style={tdStyle}>{p.apellido_paciente || ''}</td>
                  <td style={tdStyle}>{p.fecha_nacimiento || ''}</td>
                  <td style={tdStyle}>{p.telefono || ''}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button
                      onClick={() => onView?.(p.id_paciente)}
                      style={btnVerStyle}
                      onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #1565c0, #0288d1)'}
                      onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #1976d2, #2196f3)'}
                    >
                      <Eye size={16} style={{ marginRight: 6 }} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

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
  maxWidth: '1000px',
  backgroundColor: '#fff',
  borderRadius: '20px',
  boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
  overflow: 'hidden',
  transition: '0.3s',
  padding: '20px'
};

const headerStyle = {
  textAlign: 'center',
  padding: '10px',
  background: 'linear-gradient(90deg, #2e7d9d, #1565c0)',
  color: '#fff',
  margin: 0,
  fontWeight: 700,
  letterSpacing: '0.5px',
  borderBottom: '2px solid #1565c0'
};

const searchWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  margin: '20px 0'
};

const searchBoxStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '400px'
};

const searchIconStyle = {
  position: 'absolute',
  top: '50%',
  left: '12px',
  transform: 'translateY(-50%)',
  color: '#888'
};

const searchInputStyle = {
  width: '100%',
  padding: '10px 12px 10px 36px',
  borderRadius: 12,
  border: '1px solid #ccc',
  fontSize: 14,
  outline: 'none',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  transition: 'all 0.2s ease'
};

const thStyle = {
  padding: '14px 12px',
  fontWeight: '600',
  color: '#2e7d9d',
  borderBottom: '2px solid #ddd',
  fontSize: '15px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tdStyle = {
  padding: '12px',
  color: '#555',
  borderBottom: '1px solid #eee',
  fontSize: '14px'
};

const rowStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
  transition: 'all 0.3s ease',
  cursor: 'pointer'
});

const hoverRow = (e) => {
  e.currentTarget.style.backgroundColor = '#e0f2f1';
  e.currentTarget.style.transform = 'scale(1.01)';
  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
};

const unhoverRow = (e, index) => {
  e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafafa' : '#fff';
  e.currentTarget.style.transform = 'scale(1)';
  e.currentTarget.style.boxShadow = 'none';
};

const btnVerStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 14px',
  background: 'linear-gradient(90deg, #1976d2, #2196f3)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease'
};
