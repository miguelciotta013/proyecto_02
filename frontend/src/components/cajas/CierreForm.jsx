import React, { useState } from 'react';

export default function CierreForm({ onSubmit }) {
  const [monto, setMonto] = useState('0.00');

  function handleSubmit(e) {
    e.preventDefault();
    if (onSubmit) onSubmit({ monto_cierre: monto });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label>
        Monto cierre:
        <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} />
      </label>
      <button type="submit">Cerrar caja</button>
    </form>
  );
}
