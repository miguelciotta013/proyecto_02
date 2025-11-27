// src/pages/turnos/EditarTurno.jsx
import React, { useEffect, useState } from 'react';
import TurnoForm from '../../components/turnos/TurnoForm';
import { obtenerTurno, actualizarTurno } from '../../api/turnosApi';
import { useParams, useNavigate } from 'react-router-dom';
import { showError, showSuccess } from '../../utils/alertas'; 
import styles from './EditarTurno.module.css';

export default function EditarTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerTurno(id)
      .then(async (r) => {
        if (r && r.success) {
          setInitial(r.data);
        } else {
          const msg = r?.error || 'No se pudo cargar turno';
          await showError('Error al cargar turno', msg);
          navigate('/turnos');
        }
      })
      .catch(async (e) => {
        const msg = e.message || String(e);
        await showError('Error al cargar turno', msg);
        navigate('/turnos');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleSaved(form) {
    const resp = await actualizarTurno(id, form);
    if (resp && resp.success) {
      await showSuccess('Turno actualizado', 'Los datos del turno se actualizaron correctamente.');
      navigate('/turnos');
    } else {
      const msg = resp?.errors || resp?.error || 'Error al actualizar';
      throw new Error(msg);
    }
  }

  if (loading) return <p className={styles.loading}>Cargando...</p>;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <button
            className={styles.backBtn}
            type="button"
            onClick={() => navigate(-1)}
          >
            &lt;
          </button>
          <h2 className={styles.title}>Editar turno</h2>
        </div>
        <TurnoForm
          initialData={initial}
          onSaved={handleSaved}
          onCancel={() => navigate('/turnos')}
          mode="edit"
          hidePatientFields={true}
        />
      </div>
    </div>
  );
}
