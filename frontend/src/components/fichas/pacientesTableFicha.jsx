import React from 'react';

function PacientesTable({ pacientes, onVerTratamientos }) {
  if (pacientes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
        <p>No se encontraron pacientes</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha de Nacimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((paciente) => (
            <tr key={paciente.id_paciente}>
              <td>{paciente.dni_paciente}</td>
              <td>{paciente.nombre_paciente}</td>
              <td>{paciente.apellido_paciente}</td>
              <td>{paciente.fecha_nacimiento}</td>
              <td>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => onVerTratamientos(paciente.id_paciente)}
                  title="Ver tratamientos"
                >
                  ⓘ Ver Tratamientos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PacientesTable;