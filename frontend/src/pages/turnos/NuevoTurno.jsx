import React from 'react';
import TurnoForm from '../../components/turnos/TurnoForm';
import { crearTurno } from '../../api/turnosApi';
import { useNavigate } from 'react-router-dom';

export default function NuevoTurno() {
  const navigate = useNavigate();

  async function handleSaved(data) {
    const resp = await crearTurno(data);
    if (resp && resp.success) {
      alert('Turno creado');

      
      navigate('/turnos');
    } else {
      throw new Error(resp?.errors || resp?.error || 'Error al crear turno');
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Nuevo turno</h2>
      <TurnoForm onSaved={handleSaved} onCancel={() => navigate('/turnos')} />
    </div>
  );
}
