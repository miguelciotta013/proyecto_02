import React, { useState } from 'react';

export default function CierreForm({ onSubmit, initial = {} }) {
  const [montoCierre, setMontoCierre] = useState(initial.monto_cierre || '');
  const [comentario, setComentario] = useState(initial.comentario || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (onSubmit) await onSubmit({ monto_cierre: parseFloat(montoCierre || 0), comentario });
      setComentario('');
      setMontoCierre('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input placeholder="Monto de cierre" type="number" step="0.01" value={montoCierre} onChange={(e) => setMontoCierre(e.target.value)} />
      <input placeholder="Comentario (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={loading}>{loading ? 'Cerrando...' : 'Cerrar caja'}</button>
      </div>
    </form>
  );
}
