import React, { useState } from 'react';

export default function MovimientoForm({ type = 'ingreso', onSubmit = () => {} }) {
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('0');

  function handleSubmit(e) {
    e.preventDefault();
    if (!monto || isNaN(parseFloat(monto))) return;
    const payload =
      type === 'ingreso'
        ? { descripcion_ingreso: descripcion, monto_ingreso: monto }
        : { descripcion_egreso: descripcion, monto_egreso: monto };
    onSubmit(payload);
    setDescripcion('');
    setMonto('0');
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input placeholder="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      <input placeholder="monto" value={monto} onChange={(e) => setMonto(e.target.value)} />
      <button type="submit">Agregar {type}</button>
    </form>
  );
}
