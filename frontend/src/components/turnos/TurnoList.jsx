// src/components/turnos/TurnoList.jsx
import React from 'react';
import styles from './TurnoList.module.css';

export default function TurnoList({ pacientesConTurno = [], onAgregarTurno, onVerTurno }) {
  if (!pacientesConTurno.length) return <p className={styles.empty}>No hay pacientes para mostrar. 😔</p>;

  function formatFecha(t) {
    if (!t) return '-';
    const f = t.fecha_turno ?? t.raw?.fecha_turno ?? t.raw?.fecha ?? t.raw?.date ?? null;
    return f ? String(f).slice(0,10) : '-';
  }
  function formatHora(t) {
    if (!t) return '-';
    const h = t.hora_turno ?? t.raw?.hora_turno ?? t.raw?.hora ?? t.raw?.time ?? null;
    return h ? String(h).slice(0,5) : '-';
  }
  function displayEstado(t) {
    if (!t) return 'Sin estado';
    return t.estado ?? t.raw?.estado ?? t.raw?.estado_turno ?? (t.id_turno_estado ? 'Confirmado' : 'Sin estado');
  }
  function displayAsunto(t) {
    if (!t) return '-';
    return t.asunto ?? t.raw?.asunto ?? t.raw?.subject ?? '-';
  }

  return (
    <div className={styles.tableWrapper}>
      <h2 className={styles.title}>Pacientes y Turnos</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha turno</th>
            <th>Hora</th>
            <th>Asunto</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientesConTurno.map(({ paciente, turno }) => {
            const dni = paciente.dni_paciente ?? paciente.dni ?? '';
            const nombre = paciente.nombre_paciente ?? paciente.nombre ?? '-';
            const apellido = paciente.apellido_paciente ?? paciente.apellido ?? '-';
            const fecha = formatFecha(turno);
            const hora = formatHora(turno);
            const asunto = displayAsunto(turno);
            const estado = displayEstado(turno);

            return (
              <tr key={paciente.id_paciente ?? paciente.id}>
                <td>{dni}</td>
                <td>{nombre}</td>
                <td>{apellido}</td>
                <td>{fecha}</td>
                <td>{hora}</td>
                <td>{asunto}</td>
                <td>
                  <span className={`${styles.estado} ${styles[(estado || '').toLowerCase()] || styles.sin}`}>
                    {estado}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  {!turno ? (
                    <button className={styles.button} onClick={() => onAgregarTurno(paciente)}>Agregar turno</button>
                  ) : (
                    <button className={styles.button} onClick={() => onVerTurno(turno.id_turno)}>Ver</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
