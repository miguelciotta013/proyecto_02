import React, { useState } from 'react';

export default function IngresoForm({ onSubmit, initial = {} }) {
  const [descripcion, setDescripcion] = useState(initial.descripcion || '');
  const [monto, setMonto] = useState(initial.monto || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!monto || isNaN(parseFloat(monto))) return;
    setLoading(true);
    try {
      await onSubmit({ descripcion_ingreso: descripcion, monto_ingreso: parseFloat(monto) });
      setDescripcion('');
      setMonto('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
        background: '#fff',
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        maxWidth: 600,
        margin: '20px auto',
        fontFamily: "'Poppins', sans-serif'",
      }}
    >
      <input
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Monto"
        type="number"
        step="0.01"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        style={inputStyle}
      />
      <button
        type="submit"
        disabled={loading}
        style={greenButtonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#388e3c')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4caf50')}
      >
        {loading ? 'Guardando...' : 'Agregar ingreso'}
      </button>
    </form>
  );
}

// Estilos reutilizables
const inputStyle = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #ccc',
  outline: 'none',
  minWidth: 120,
  fontSize: 14,
  transition: 'border 0.2s',
};

const greenButtonStyle = {
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  padding: '10px 18px',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
  transition: 'all 0.2s',
};
