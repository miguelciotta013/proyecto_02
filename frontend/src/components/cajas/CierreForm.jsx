import React, { useState } from 'react';

export default function CierreForm({ onSubmit, initial = {} }) {
  const [montoCierre, setMontoCierre] = useState(initial.monto_cierre || '');
  const [comentario, setComentario] = useState(initial.comentario || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!montoCierre || parseFloat(montoCierre) <= 0) {
      alert('Debe ingresar un monto válido para el cierre.');
      return;
    }
    setLoading(true);
    try {
      if (onSubmit)
        await onSubmit({
          monto_cierre: parseFloat(montoCierre),
          comentario: comentario.trim(),
        });
      setMontoCierre('');
      setComentario('');
    } catch (err) {
      console.error('Error al cerrar caja:', err);
      alert('Ocurrió un error al cerrar la caja.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#fff',
        padding: 20,
        borderRadius: 12,
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        maxWidth: 400,
        margin: '20px auto',
      }}
    >
      <h3 style={{ marginBottom: 10, color: '#1976d2' }}>Cierre de Caja</h3>

      <input
        type="number"
        step="0.01"
        placeholder="Monto de cierre"
        value={montoCierre}
        onChange={(e) => setMontoCierre(e.target.value)}
        style={{
          padding: 10,
          borderRadius: 8,
          border: '1px solid #ccc',
          fontSize: '0.95rem',
        }}
      />

      <input
        type="text"
        placeholder="Comentario (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        style={{
          padding: 10,
          borderRadius: 8,
          border: '1px solid #ccc',
          fontSize: '0.95rem',
        }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading ? '#ccc' : '#1976d2',
          color: '#fff',
          border: 'none',
          padding: '10px 16px',
          borderRadius: 8,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.95rem',
          transition: '0.3s',
        }}
      >
        {loading ? 'Cerrando...' : 'Cerrar Caja'}
      </button>
    </form>
  );
}
