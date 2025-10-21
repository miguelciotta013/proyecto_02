import React, { useState, useEffect } from 'react';
import { obtenerHorariosDisponibles, obtenerEstados } from '../../api/turnosApi';
import styles from './TurnoForm.module.css'; 

export default function TurnoForm({ initialData, onCancel, onSaved }) {
  const [form, setForm] = useState({
    paciente_nombre: '',
    paciente_apellido: '',
    fecha_turno: '',
    hora_turno: '',
    asunto: '',
    comentario_turno: '',
    id_turno_estado: null
  });
  const [horarios, setHorarios] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        paciente_nombre: initialData.paciente_nombre || '',
        paciente_apellido: initialData.paciente_apellido || '',
        fecha_turno: initialData.fecha_turno || '',
        hora_turno: initialData.hora_turno || '',
        asunto: initialData.asunto || '',
        comentario_turno: initialData.comentario_turno || '',
        id_turno_estado: initialData.id_turno_estado || null
      });
    }
    
    obtenerEstados().then(r => {
      if (r && r.success) setEstados(r.data || []);
    }).catch(() => {});
  }, [initialData]);

  useEffect(() => {
    setForm(prev => ({ ...prev, hora_turno: '' }));
    
    if (form.fecha_turno) {
      fetchHorarios(form.fecha_turno);
    } else {
      setHorarios([]);
    }
  }, [form.fecha_turno]);

  async function fetchHorarios(fecha) {
    try {
      setLoadingHorario(true);
      setError(null);
      const resp = await obtenerHorariosDisponibles(fecha);
      if (resp && resp.success) {
        setHorarios(resp.horarios_disponibles || []);
      } else {
        setHorarios([]);
        setError(resp?.error || 'No se pudieron obtener horarios');
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoadingHorario(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      onSaved && await onSaved(form);
    } catch (err) {
      setError(err?.message || String(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles['turno-form-container']}> 
      {error && <div className={styles['error-message']}>{JSON.stringify(error)}</div>} 

      <div>
        <label htmlFor="paciente_nombre">Nombre del paciente</label>
        <input id="paciente_nombre" name="paciente_nombre" value={form.paciente_nombre} onChange={handleChange} required />
      </div>

      <div>
        <label htmlFor="paciente_apellido">Apellido del paciente</label>
        <input id="paciente_apellido" name="paciente_apellido" value={form.paciente_apellido} onChange={handleChange} required />
      </div>

      <div>
        <label htmlFor="fecha_turno">Fecha</label>
        <input id="fecha_turno" type="date" name="fecha_turno" value={form.fecha_turno} onChange={handleChange} required />
      </div>

      <div>
        <label htmlFor="hora_turno">Hora</label>
        {loadingHorario ? (
          <p>Cargando horarios...</p>
        ) : (
          <select id="hora_turno" name="hora_turno" value={form.hora_turno} onChange={handleChange} required>
            <option value="">-- elegir hora --</option>
            {horarios.map(h => <option key={h} value={h}>{h.slice(0,5)}</option>)}
            {initialData && initialData.hora_turno && !horarios.includes(initialData.hora_turno) && (
                  <option key={initialData.hora_turno} value={initialData.hora_turno}>
                     {initialData.hora_turno.slice(0,5)} (Actual)
                  </option>
            )}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="asunto">Asunto</label>
        <input id="asunto" name="asunto" value={form.asunto} onChange={handleChange} />
      </div>

      <div>
        <label htmlFor="comentario_turno">Comentario</label>
        <input id="comentario_turno" name="comentario_turno" value={form.comentario_turno} onChange={handleChange} />
      </div>

      <div>
        <label htmlFor="id_turno_estado">Estado</label>
        <select id="id_turno_estado" name="id_turno_estado" value={form.id_turno_estado || ''} onChange={handleChange} required>
          <option value="">-- seleccionar estado --</option>
          {estados.map(s => (
            <option key={s.id_estado_turno} value={s.id_estado_turno}>{s.estado_turno}</option>
          ))}
        </select>
      </div>

      <div className={styles['form-actions']}> 
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Atras</button>
      </div>
    </form>
  );
}