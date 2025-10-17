import React from 'react';
import styles from './TurnoList.module.css';

export default function TurnoList({ turnos = [], onVer }) {
  if (!turnos.length) return <p className={styles.empty}>No hay turnos para mostrar. 😔</p>;

  return (
    <div className={styles.tableWrapper}>
      <h2 className={styles.title}>Lista de Turnos</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Hora</th>
            <th scope="col">Nombre</th>
            <th scope="col">Apellido</th>
            <th scope="col">Asunto</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map(t => (
            <tr key={t.id_turno}>
              <td data-label="Fecha">{t.fecha_turno}</td>
              <td data-label="Hora">{t.hora_turno?.slice(0, 5)}</td>
              <td data-label="Nombre">{t.paciente_nombre || '-'}</td>
              <td data-label="Apellido">{t.paciente_apellido || '-'}</td>
              <td data-label="Asunto">{t.asunto || '-'}</td>
              <td data-label="Estado">
                <span className={`${styles.estado} ${styles[t.estado?.toLowerCase() || 'sin']}`}>
                  {t.estado || 'Sin estado'}
                </span>
              </td>
              <td data-label="Acciones">
                <button className={styles.button} onClick={() => onVer(t.id_turno)}>
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
