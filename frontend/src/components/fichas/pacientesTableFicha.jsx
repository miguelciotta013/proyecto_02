import React, { useState } from 'react';
import styles from './pacientesTableFicha.module.css';

function PacientesTable({ pacientes, onVerTratamientos }) {

  // -----------------------
  // PAGINACIÓN
  // -----------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(pacientes.length / itemsPerPage);
  const indexStart = (currentPage - 1) * itemsPerPage;
  const indexEnd = indexStart + itemsPerPage;

  const pacientesPagina = pacientes.slice(indexStart, indexEnd);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // -----------------------

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
          {pacientesPagina.map((paciente) => (
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

      {/* Controles de Paginación */}
      <div className={styles.pagination}>
        <button className={styles.pageBtn} onClick={prevPage} disabled={currentPage === 1}>
          «
        </button>

        <span className={styles.pageNumber}>{currentPage} de {totalPages}</span>

        <button className={styles.pageBtn} onClick={nextPage} disabled={currentPage === totalPages}>
          »
        </button>
      </div>


    </div>
  );
}

export default PacientesTable;
