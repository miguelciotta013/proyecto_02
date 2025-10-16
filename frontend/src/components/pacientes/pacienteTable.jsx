import React from 'react';

export default function PacienteTable({ pacientes = [], onView }) {
  if (!pacientes.length) {
    return (
      <p style={{
        textAlign: 'center',
        marginTop: '30px',
        fontFamily: 'Poppins, sans-serif',
        color: '#666'
      }}>
        No hay pacientes para mostrar.
      </p>
    );
  }

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      backgroundColor: '#f4f6f8',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'start',
      paddingTop: '40px'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '1000px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <h2 style={{
          textAlign: 'center',
          padding: '16px',
          backgroundColor: '#1976d2',
          color: '#fff',
          margin: 0,
          fontWeight: 600
        }}>
          Lista de Pacientes
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e3f2fd', textAlign: 'left' }}>
              <th style={thStyle}>DNI</th>
              <th style={thStyle}>Nombre</th>
              <th style={thStyle}>Apellido</th>
              <th style={thStyle}>Nacimiento</th>
              <th style={thStyle}>Teléfono</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pacientes.map((p, index) => (
              <tr
                key={p.id_paciente}
                style={{
                  backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
                  transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafafa' : '#fff'}
              >
                <td style={tdStyle}>{p.dni_paciente}</td>
                <td style={tdStyle}>{p.nombre_paciente}</td>
                <td style={tdStyle}>{p.apellido_paciente}</td>
                <td style={tdStyle}>{p.fecha_nacimiento}</td>
                <td style={tdStyle}>{p.telefono}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={() => onView && onView(p.id_paciente)}
                    style={btnVerStyle}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1565c0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#1976d2'}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '12px 10px',
  fontWeight: '600',
  color: '#333',
  borderBottom: '2px solid #ddd'
};

const tdStyle = {
  padding: '10px',
  color: '#555',
  borderBottom: '1px solid #eee'
};

const btnVerStyle = {
  padding: '6px 14px',
  backgroundColor: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '500',
  transition: 'background-color 0.2s'
};
