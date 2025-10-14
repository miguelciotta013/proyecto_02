import React from 'react';

export default function PacienteTable({ pacientes = [], onView }) {
  if (!pacientes.length) return <p>No hay pacientes para mostrar.</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>DNI</th>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>Nombre</th>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>Apellido</th>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>Nacimiento</th>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>Teléfono</th>
          <th style={{ border: '1px solid #ddd', padding: 8 }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {pacientes.map((p) => (
          <tr key={p.id_paciente}>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{p.dni_paciente}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{p.nombre_paciente}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{p.apellido_paciente}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{p.fecha_nacimiento}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>{p.telefono}</td>
            <td style={{ border: '1px solid #ddd', padding: 8 }}>
              <button onClick={() => onView && onView(p.id_paciente)}>Ver</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
