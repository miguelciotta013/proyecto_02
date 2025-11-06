// src/components/turnos/TurnoDetalle.jsx
import React, { useEffect, useState } from 'react';
import { obtenerEstados } from '../../api/turnosApi';
import styles from './TurnoDetalle.module.css';

export default function TurnoDetalle({
  turno,
  readOnly = false,
  onClose,
  onEditar,
  onEliminar,
  onCambiarEstado
}) {
  const [estados, setEstados] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState(turno?.id_turno_estado || '');

  useEffect(() => setSelectedEstado(turno?.id_turno_estado || ''), [turno]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const r = await obtenerEstados();
        if (r && r.success && mounted) setEstados(r.data || []);
      } catch (e) {
        // noop
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const handleEliminar = () => {
    // la vista ya controla cuándo volver
    if (window.confirm('¿Seguro que querés cancelar este turno?')) {
      onEliminar(turno.id_turno);
    }
  };

  const handleCambioEstado = async (e) => {
    const nuevoId = e.target.value === '' ? '' : parseInt(e.target.value, 10);
    setSelectedEstado(nuevoId);
    await onCambiarEstado(turno.id_turno, nuevoId);
  };

  if (!turno) return <div className={styles.empty}>No se encontró el turno.</div>;

  const estadoActual =
    estados.find(s => s.id_estado_turno === turno.id_turno_estado)?.estado_turno ||
    '-- sin estado --';

  // 👇 texto plano del estado que viene del backend, para decidir si dejo cancelar
  const estadoTexto = (turno.estado || estadoActual || '').toLowerCase();
  const sePuedeCancelar =
    estadoTexto !== 'confirmado' && estadoTexto !== 'atendido';

  return (
    <div className={`${styles.detailPanel} card`}>
      <div className={styles.spaceBetween}>
        <h3 className={styles.h1}>
          {turno.paciente_nombre} {turno.paciente_apellido}
        </h3>
        <div className={styles.row}>
          <button
            className={`${styles.btn} ${styles.secondary}`}
            onClick={onClose}
          >
            {readOnly ? 'Volver' : 'Cerrar'}
          </button>
        </div>
      </div>

      <div className={styles.detailMeta}>
        <div className={styles.avatar}>
          {(turno.paciente_nombre || '?').charAt(0)}
          {(turno.paciente_apellido || '?').charAt(0)}
        </div>
        <div className={styles.info}>
          <div className={styles.smallMuted}>Fecha / Hora</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong>{turno.fecha_turno}</strong>
            <span className={styles.chip}>{turno.hora_turno?.slice(0, 5)}</span>
          </div>
        </div>
      </div>

      <p className={styles.smallMuted}>
        <strong>Asunto:</strong> {turno.asunto || '-'}
      </p>
      <p
        className={styles.smallMuted}
        style={{ marginBottom: 15 }}
      >
        <strong>Comentario:</strong> {turno.comentario_turno || '-'}
      </p>

      {readOnly ? (
        <p className={styles.smallMuted} style={{ marginTop: 8 }}>
          <strong>Estado:</strong> {estadoActual}
        </p>
      ) : (
        <div className={styles.estadoContainer}>
          <label className={styles.estadoLabel}>Estado</label>
          <select
            value={selectedEstado || ''}
            onChange={handleCambioEstado}
            className={styles.estadoSelect}
          >
            <option value="">-- sin estado --</option>
            {estados.map(s => (
              <option key={s.id_estado_turno} value={s.id_estado_turno}>
                {s.estado_turno}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ACCIONES: editar siempre, cancelar solo si no está confirmado/atendido */}
      <div className={styles.actions}>
        {readOnly ? null : (
          <>
            <button
              className={styles.btn}
              onClick={() => onEditar(turno.id_turno)}
            >
              Editar
            </button>

            {sePuedeCancelar && (
              <button
                className={`${styles.btn} ${styles.danger}`}
                onClick={handleEliminar}
              >
                Cancelar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
