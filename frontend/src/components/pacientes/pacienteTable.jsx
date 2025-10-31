import React from 'react';
import { Eye } from 'lucide-react'; // 🔹 Usa ícono moderno (si usás lucide-react)

export default function PacienteTable({ pacientes = [], onView }) {
  if (!pacientes.length) {
    return (
      <p style={{
        textAlign: 'center',
        marginTop: '30px',
        fontFamily: 'Poppins, sans-serif',
        color: '#666',
        fontSize: '18px'
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
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: '0.3s'
      }}>
        <h2 style={{
          textAlign: 'center',
          padding: '18px',
          background: 'linear-gradient(90deg, #1976d2, #1565c0)',
          color: '#fff',
          margin: 0,
          fontWeight: 700,
          letterSpacing: '0.5px'
        }}>
          🧾 Lista de Pacientes
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#e3f2fd', textAlign: 'left' }}>
              {['DNI', 'Nombre', 'Apellido', 'Nacimiento', 'Teléfono', 'Acciones'].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pacientes.map((p, index) => (
              <tr
                key={p.id_paciente}
                style={{
                  backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e3f2fd';
                  e.currentTarget.style.transform = 'scale(1.01)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafafa' : '#fff';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
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
                    onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #0049c7, #1565c0)'}
                    onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #1976d2, #2196f3)'}
                  >
                    <Eye size={16} style={{ marginRight: '6px' }} />
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
  padding: '14px 12px',
  fontWeight: '600',
  color: '#333',
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
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease'
};
