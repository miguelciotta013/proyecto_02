// src/pages/turnos/PacienteTurnos.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { obtenerTurnos } from '../../api/turnosApi';
import styles from './PacienteTurnos.module.css';

export default function PacienteTurnos() {
  const { id } = useParams();          // id del paciente
  const navigate = useNavigate();
  const location = useLocation();
  const pacienteInfo = location.state || {}; // nombre, apellido, dni
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTurnos() {
    setLoading(true);
    try {
      const r = await obtenerTurnos(`?id_paciente=${id}`);
      if (r && r.success) {
        setTurnos(r.data || []);
      } else {
        alert(r?.error || 'No se pudieron obtener los turnos de este paciente');
      }
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTurnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleDetalle(id_turno) {
    navigate(`/turnos/${id_turno}`, {
      state: {
        fromPatient: true,
        patientId: Number(id),
        nombre: pacienteInfo.nombre,
        apellido: pacienteInfo.apellido,
      },
    });
  }

  function handleAgregar() {
    navigate('/turnos/nuevo', {
      state: {
        fromPatient: true,
        id_paciente: Number(id),
        paciente_nombre: pacienteInfo.nombre,
        paciente_apellido: pacienteInfo.apellido,
      },
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerBar}>
        <button className={styles.backBtn} onClick={() => navigate('/turnos')}>
          &lt;
        </button>
        <h2 className={styles.title}>
          Turnos {pacienteInfo.nombre} {pacienteInfo.apellido}
        </h2>
        <button className={styles.addBtn} onClick={handleAgregar}>
          + Agregar
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Cargando turnos...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Asunto</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {turnos.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.empty}>
                  No hay turnos para este paciente.
                </td>
              </tr>
            ) : (
              turnos.map((t) => (
                <tr key={t.id_turno}>
                  <td>{t.estado || 'Confirmado'}</td>
                  <td>{(t.fecha_turno || '').slice(0, 10)}</td>
                  <td>{(t.hora_turno || '').slice(0, 5)}</td>
                  <td>{t.asunto || '-'}</td>
                  <td>
                    <button
                      className={styles.detailBtn}
                      onClick={() => handleDetalle(t.id_turno)}
                      title="Ver"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
