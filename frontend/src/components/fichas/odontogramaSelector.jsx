import React, { useState } from 'react';

// Selector simple de dientes (1..32). Retorna array de ids seleccionados.
export default function OdontogramaSelector({ value = [], onChange }) {
  const [selected, setSelected] = useState(new Set(value));

  function toggle(diente) {
    const next = new Set(selected);
    if (next.has(diente)) next.delete(diente);
    else next.add(diente);
    setSelected(next);
    onChange && onChange(Array.from(next));
  }

  const dientes = Array.from({ length: 32 }, (_, i) => i + 1);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 40px)', gap: 6 }}>
        {dientes.map(d => (
          <button
            key={d}
            onClick={() => toggle(d)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              border: selected.has(d) ? '2px solid #1976d2' : '1px solid #ccc',
              background: selected.has(d) ? '#e3f2fd' : '#fff',
              cursor: 'pointer'
            }}
            title={`Diente ${d}`}
          >
            {d}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <small>Seleccionados: {Array.from(selected).join(', ') || '—'}</small>
      </div>
    </div>
  );
}
