import React from 'react';

export default function PacienteCard({ paciente, onClose, onEditar, onEliminar, onAsignarObra, onAgregarFicha }) {
  if (!paciente) return null;

  const handleEliminar = () => {
    if (window.confirm(`¿Seguro que querés dar de baja a ${paciente.nombre_paciente}?`)) {
      onEliminar(paciente.id_paciente);
    }
  };

  return (
    <div style={{
      border: '1px solid #000000ff',
      padding: 20,
      marginTop: 12,
      borderRadius: 10,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
      maxWidth: 500,
      fontFamily: 'Poppins, sans-serif',
      position: 'relative'
    }}>
      <button 
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: 4,
          border: 'none',
          backgroundColor: '#777',
          color: '#fff'
        }} 
        onClick={onClose}
      >
        Cerrar
      </button>

      <h3>{paciente.nombre_paciente} {paciente.apellido_paciente}</h3>
      <p><strong>DNI:</strong> {paciente.dni_paciente}</p>
      <p><strong>Fecha Nac.:</strong> {paciente.fecha_nacimiento}</p>
      <p><strong>Teléfono:</strong> {paciente.telefono}</p>
      <p><strong>Correo:</strong> {paciente.correo}</p>

      <h4>Obras sociales</h4>
      {paciente.obras_sociales && paciente.obras_sociales.length ? (
        <ul>
          {paciente.obras_sociales.map(os => (
            <li key={os.id_paciente_os}>
              {os.obra_social_nombre} — {os.credencial_paciente || 'sin credencial'}
            </li>
          ))}
        </ul>
      ) : (
        <p>Sin obras sociales registradas</p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: 15 }}>
        <button 
          style={{ padding: '8px 12px', borderRadius: 5, cursor: 'pointer', backgroundColor: '#1976d2', color: '#fff', border: 'none' }}
          onClick={() => onEditar(paciente.id_paciente)}
        >
          Editar
        </button>

        <button 
          style={{ padding: '8px 12px', borderRadius: 5, cursor: 'pointer', backgroundColor: '#d32f2f', color: '#fff', border: 'none' }}
          onClick={handleEliminar}
        >
          Dar de baja
        </button>

        <button 
          style={{ padding: '8px 12px', borderRadius: 5, cursor: 'pointer', backgroundColor: '#0288d1', color: '#fff', border: 'none' }}
          onClick={() => onAsignarObra(paciente.id_paciente)}
        >
          Asignar obra social
        </button>

        <button 
          style={{ padding: '8px 12px', borderRadius: 5, cursor: 'pointer', backgroundColor: '#2e7d32', color: '#fff', border: 'none' }}
          onClick={() => onAgregarFicha(paciente.id_paciente)}
        >
          Agregar ficha patológica
        </button>
      </div>
    </div>
  );
}
