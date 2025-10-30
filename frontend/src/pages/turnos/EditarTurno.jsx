// src/pages/turnos/EditarTurno.jsx
import React, { useEffect, useState } from 'react';
import TurnoForm from '../../components/turnos/TurnoForm';
import { obtenerTurno, actualizarTurno } from '../../api/turnosApi';
import { useParams, useNavigate } from 'react-router-dom';

export default function EditarTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerTurno(id).then(r => {
      if (r && r.success) setInitial(r.data);
      else { alert(r?.error || 'No se pudo cargar turno'); navigate('/turnos'); }
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  async function handleSaved(form) {
    const resp = await actualizarTurno(id, form);
    if (resp && resp.success) { alert('Turno actualizado'); navigate('/turnos'); }
    else throw new Error(resp?.errors || resp?.error || 'Error al actualizar');
  }

  if (loading) return <p>Cargando...</p>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Editar turno</h2>
      <TurnoForm
        initialData={initial}
        onSaved={handleSaved}
        onCancel={() => navigate('/turnos')}
        mode="edit"
        hidePatientFields={true}  // en editar NO se puede cambiar nombre/apellido del paciente
      />
    </div>
  );
}
