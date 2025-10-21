import React, { useState } from 'react';

export default function AperturaForm({ onSubmit = () => {} }) {
  const [idEmpleado, setIdEmpleado] = useState('1');
  const [monto, setMonto] = useState('0');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ id_empleado: idEmpleado, monto_apertura: monto });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
        maxWidth: 400,
        margin: '40px auto',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#333' }}>
        Empleado ID:
        <input
          value={idEmpleado}
          onChange={(e) => setIdEmpleado(e.target.value)}
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#333' }}>
        Monto apertura:
        <input
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          style={inputStyle}
        />
      </label>

      <button
        type="submit"
        style={buttonStyle}
        onMouseEnter={e => e.target.style.backgroundColor = '#1565c0'}
        onMouseLeave={e => e.target.style.backgroundColor = '#1976d2'}
      >
        Abrir caja
      </button>
    </form>
  );
}

// Reutilizamos estilo de inputs
const inputStyle = {
  marginTop: 6,
  padding: 10,
  borderRadius: 8,
  border: '1px solid #ccc',
  outline: 'none',
  transition: 'border 0.2s',
  width: '100%',
  boxSizing: 'border-box',
  fontSize: 14
};

// Estilo del botón
const buttonStyle = {
  padding: 12,
  borderRadius: 8,
  border: 'none',
  backgroundColor: '#1976d2',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};
