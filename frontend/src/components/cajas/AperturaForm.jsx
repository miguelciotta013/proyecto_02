import React, { useState } from 'react';

export default function AperturaForm({ onSubmit }) {
  const [monto, setMonto] = useState('0.00');

  function handleSubmit(e) {
    e.preventDefault();
    if (onSubmit) onSubmit({ id_empleado: 1, monto_apertura: monto });
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
        margin: '20px auto',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#333' }}>
        Monto apertura:
        <input 
          type="number" 
          value={monto} 
          onChange={(e) => setMonto(e.target.value)} 
          style={{
            marginTop: 6,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ccc',
            outline: 'none',
            transition: 'border 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = "#1976d2"}
          onBlur={e => e.target.style.borderColor = "#ccc"}
        />
      </label>

      <button
        type="submit"
        style={{
          padding: 12,
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#1976d2',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={e => e.target.style.backgroundColor = '#1565c0'}
        onMouseLeave={e => e.target.style.backgroundColor = '#1976d2'}
      >
        Abrir caja
      </button>
    </form>
  );
}
