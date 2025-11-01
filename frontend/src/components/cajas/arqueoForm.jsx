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
        backgroundColor: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
        maxWidth: 400,
        margin: '40px auto',
        fontFamily: "'Poppins', sans-serif",
        borderTop: '10px solid #2e7d9d', // Franja azul superior

      }}
    >
      <h3 style={{ color: '#2e7d9d', textAlign: 'center', marginBottom: 10 }}>
        Apertura de Caja
      </h3>

      <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#2e7d9d' }}>
        Empleado ID:
        <input
          value={idEmpleado}
          onChange={(e) => setIdEmpleado(e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#2e7d9d"}
          onBlur={e => e.target.style.borderColor = "#ccc"}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#2e7d9d' }}>
        Monto apertura:
        <input
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#2e7d9d"}
          onBlur={e => e.target.style.borderColor = "#ccc"}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <button
          type="button"
          style={grayButton}
          onMouseEnter={e => e.target.style.backgroundColor = '#7e7e7e'}
          onMouseLeave={e => e.target.style.backgroundColor = '#9e9e9e'}
        >
          Cancelar
        </button>

        <button
          type="submit"
          style={greenButton}
          onMouseEnter={e => e.target.style.backgroundColor = '#43a047'}
          onMouseLeave={e => e.target.style.backgroundColor = '#4caf50'}
        >
          Abrir caja
        </button>
      </div>
    </form>
  );
}

// === Estilos reutilizables ===
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

const grayButton = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: '#9e9e9e',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

const greenButton = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: '#4caf50',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};
