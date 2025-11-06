// src/pages/turnos/NuevoTurno.jsx
import React from 'react';
import TurnoForm from '../../components/turnos/TurnoForm';
import { crearTurno } from '../../api/turnosApi';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NuevoTurno() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilled = location.state || {};

  async function handleSaved(data) {
    const out = { ...data };
    if (out.hora_turno && out.hora_turno.length === 5) out.hora_turno = `${out.hora_turno}:00`;
    if (prefilled.id_paciente) out.id_paciente = prefilled.id_paciente;

    const resp = await crearTurno(out);
    if (resp && resp.success && resp.data) {
      alert('Turno creado correctamente');
      // después de crear, te puedo mandar otra vez a los turnos de ese paciente:
      if (prefilled.id_paciente) {
        navigate(`/turnos/paciente/${prefilled.id_paciente}`, {
          state: {
            nombre: prefilled.paciente_nombre,
            apellido: prefilled.paciente_apellido,
          },
        });
      } else {
        navigate(`/turnos/${resp.data.id_turno}`);
      }
    } else throw new Error(resp?.errors || resp?.error || 'Error al crear turno');
  }

  const initialData = {
    paciente_nombre: prefilled.paciente_nombre || '',
    paciente_apellido: prefilled.paciente_apellido || '',
    id_paciente: prefilled.id_paciente || null,
    fromPatient: Boolean(prefilled.fromPatient || prefilled.id_paciente),
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Nuevo turno</h2>
      <TurnoForm
        initialData={initialData}
        onSaved={handleSaved}
        onCancel={() =>
          prefilled.id_paciente
            ? navigate(-1)
            : navigate('/turnos')
        }
        mode="create"
        hidePatientFields={Boolean(prefilled.id_paciente)}
      />
    </div>
  );
}
