import React from 'react';
import styles from './pacientesTableFicha.module.css';

function PacientesTable({ pacientes, onVerTratamientos }) {
  if (pacientes.length === 0) {
    return (
      <div className={styles.noResults}>
        <p>No se encontraron pacientes</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha de Nacimiento</th>
            <th>Tratamientos</th>
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
                  className={styles.btnInfo}
                  onClick={() => onVerTratamientos(paciente.id_paciente)}
                  title="Ver tratamientos"
                >
                  <span className={styles.btnIcon}>ℹ</span>
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