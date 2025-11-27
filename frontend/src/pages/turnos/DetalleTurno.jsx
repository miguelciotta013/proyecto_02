// src/pages/turnos/DetalleTurno.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import TurnoDetalle from '../../components/turnos/TurnoDetalle';
import { obtenerTurno, eliminarTurno, cambiarEstadoTurno } from '../../api/turnosApi';
import { showError, showSuccess, confirmAction } from '../../utils/alertas';
import styles from './DetalleTurno.module.css';

export default function DetalleTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);

  const fromPatient = Boolean(location?.state?.fromPatient);
  const patientId = location?.state?.patientId;
  const patientName = location?.state?.nombre;
  const patientLast = location?.state?.apellido;

  useEffect(() => {
    const fetchTurno = async () => {
      setLoading(true);
      try {
        const r = await obtenerTurno(id);
        if (r && r.success) {
          setTurno(r.data);
        } else {
          const msg = r?.error || 'Error al obtener turno';
          await showError('No se pudo cargar el turno', msg);
          navigate('/turnos');
        }
      } catch (e) {
        const msg = e.message || String(e);
        await showError('Error al obtener turno', msg);
        navigate('/turnos');
      } finally {
        setLoading(false);
      }
    };
    fetchTurno();
  }, [id, navigate]);

  async function handleEliminar(id_turno) {
    const confirmed = await confirmAction(
      'Cancelar turno',
      '¿Seguro que querés cancelar este turno?',
      'Sí, cancelar',
      'No'
    );
    if (!confirmed) return;

    const r = await eliminarTurno(id_turno);
    if (r && r.success) {
      await showSuccess('Turno cancelado', 'El turno se canceló correctamente.');
      if (fromPatient && patientId) {
        navigate(`/turnos/paciente/${patientId}`, {
          state: {
            nombre: patientName,
            apellido: patientLast,
          },
        });
      } else {
        navigate('/turnos');
      }
    } else {
      const msg = r?.error || 'Error al cancelar turno';
      await showError('No se pudo cancelar el turno', msg);
    }
  }

  function handleEditar(id_turno) {
    navigate(`/turnos/${id_turno}/editar`);
  }

  async function handleCambiarEstado(id_turno, id_estado) {
    if (!id_estado) {
      throw new Error('Debe seleccionar un estado válido.');
    }
    try {
      const r = await cambiarEstadoTurno(id_turno, parseInt(id_estado, 10));
      if (r && r.success) {
        const up = await obtenerTurno(id);
        if (up && up.success) setTurno(up.data);
        await showSuccess('Estado actualizado', 'El estado del turno se actualizó correctamente.');
      } else {
        throw new Error(r?.error || 'Error al cambiar estado');
      }
    } catch (e) {
      // Se maneja en TurnoDetalle (catch) como error visual,
      // y acá propagamos para que el select vuelva al valor original.
      throw e;
    }
  }

  if (loading) return <p className={styles.loading}>Cargando...</p>;
  if (!turno) return <p className={styles.loading}>No se encontró el turno</p>;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <TurnoDetalle
          turno={turno}
          readOnly={false}
          onClose={() => {
            if (fromPatient && patientId) {
              navigate(`/turnos/paciente/${patientId}`, {
                state: {
                  nombre: patientName,
                  apellido: patientLast,
                },
              });
            } else {
              navigate('/turnos');
            }
          }}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          onCambiarEstado={handleCambiarEstado}
        />
      </div>
    </div>
  );
}
