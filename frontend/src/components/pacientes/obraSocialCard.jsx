import React from 'react';

export default function ObraSocialCard({ obra, onClose }) {
  if (!obra) return null;

  return (
    <div style={{ border: '1px solid #ccc', padding: 12, marginTop: 12 }}>
      <button style={{ float: 'right' }} onClick={onClose}>Cerrar</button>
      <h4>{obra.nombre_os}</h4>
      <p>ID: {obra.id_obra_social}</p>
    </div>
  );
}
