// src/components/turnos/TurnoForm.jsx
import React, { useState, useEffect } from 'react';
import { obtenerHorariosDisponibles, obtenerEstados } from '../../api/turnosApi';
import styles from './TurnoForm.module.css';

/**
 * Props:
 * - initialData: datos iniciales (puede traer id_paciente, nombres, etc.)
 * - onCancel: fn
 * - onSaved: fn(payload)
 * - mode: "create" | "edit"  (por defecto "create")
 * - hidePatientFields: boolean (ocultar campos de nombre/apellido)
 */
export default function TurnoForm({
  initialData = {},
  onCancel,
  onSaved,
  mode = 'create',
  hidePatientFields = false
}) {
  const [form, setForm] = useState({
    id_paciente: null,
    paciente_nombre: '',
    paciente_apellido: '',
    fecha_turno: '',
    hora_turno: '',
    asunto: '',
    comentario_turno: '',
    id_turno_estado: ''
  });
  const [horarios, setHorarios] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [error, setError] = useState(null);

  // cargar initialData y estados
  useEffect(() => {
    if (initialData) {
      setForm(prev => ({
        ...prev,
        id_paciente: initialData.id_paciente ?? prev.id_paciente,
        paciente_nombre: initialData.paciente_nombre ?? prev.paciente_nombre,
        paciente_apellido: initialData.paciente_apellido ?? prev.paciente_apellido,
        fecha_turno: initialData.fecha_turno ?? prev.fecha_turno,
        hora_turno: initialData.hora_turno ?? prev.hora_turno,
        asunto: initialData.asunto ?? prev.asunto,
        comentario_turno: initialData.comentario_turno ?? prev.comentario_turno,
        id_turno_estado: initialData.id_turno_estado ?? prev.id_turno_estado,
      }));
    }

    (async () => {
      try {
        const r = await obtenerEstados();
        if (r && r.success) {
          const list = r.data || [];
          setEstados(list);

          // Si no hay estado seteado aún, por defecto "Confirmado"
          if (!initialData?.id_turno_estado) {
            const confirmado = list.find(s =>
              (s.estado_turno || '').toLowerCase().includes('confirm')
            );
            const defaultId = confirmado
              ? confirmado.id_estado_turno
              : (list[0] ? list[0].id_estado_turno : '');
            setForm(prev => ({ ...prev, id_turno_estado: prev.id_turno_estado || defaultId }));
          }
        }
      } catch {
        // noop
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // cuando cambia la fecha, recargar horarios disponibles
  useEffect(() => {
    setForm(prev => ({ ...prev, hora_turno: '' }));
    if (form.fecha_turno) fetchHorarios(form.fecha_turno);
    else setHorarios([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fecha_turno]);

  async function fetchHorarios(fecha) {
    try {
      setLoadingHorario(true);
      setError(null);
      const resp = await obtenerHorariosDisponibles(fecha);
      if (resp && resp.success) setHorarios(resp.horarios_disponibles || []);
      else { setHorarios([]); setError(resp?.error || 'No se pudieron obtener horarios'); }
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

    const payload = { ...form };
    if (payload.hora_turno && payload.hora_turno.length === 5) payload.hora_turno = `${payload.hora_turno}:00`;
    if (payload.id_turno_estado === '') payload.id_turno_estado = null;

    try {
      await onSaved && await onSaved(payload);
    } catch (err) {
      setError(err?.message || String(err));
    }
  }

  // Filtrar estados según modo:
  // - create: solo "Confirmado"
  // - edit: todos (lo que mande backend)
  const estadosFiltrados = mode === 'create'
    ? estados.filter(s => (s.estado_turno || '').toLowerCase().includes('confirm'))
    : estados;

  // En "edit" NO se puede editar nombre/apellido del paciente
  // En "create": solo pedir nombre/apellido si NO viene desde Pacientes (id_paciente null)
  const fromPatient = Boolean(initialData.fromPatient || initialData.id_paciente);
  const shouldShowPatientFields = !hidePatientFields && !fromPatient && mode === 'create';

  return (
    <form onSubmit={handleSubmit} className={styles['turno-form-container']}>
      {error && <div className={styles['error-message']}>{JSON.stringify(error)}</div>}

      <input type="hidden" name="id_paciente" value={form.id_paciente ?? ''} />

      {shouldShowPatientFields && (
        <>
          <div>
            <label htmlFor="paciente_nombre">Nombre del paciente</label>
            <input
              id="paciente_nombre"
              name="paciente_nombre"
              value={form.paciente_nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="paciente_apellido">Apellido del paciente</label>
            <input
              id="paciente_apellido"
              name="paciente_apellido"
              value={form.paciente_apellido}
              onChange={handleChange}
              required
            />
          </div>
        </>
      )}

      <div>
        <label htmlFor="fecha_turno">Fecha</label>
        <input
          id="fecha_turno"
          type="date"
          name="fecha_turno"
          value={form.fecha_turno}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="hora_turno">Hora</label>
        {loadingHorario ? (
          <p>Cargando horarios...</p>
        ) : (
          <select
            id="hora_turno"
            name="hora_turno"
            value={form.hora_turno}
            onChange={handleChange}
            required
          >
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
        <select
          id="id_turno_estado"
          name="id_turno_estado"
          value={form.id_turno_estado || ''}
          onChange={handleChange}
          required
        >
          {mode === 'create' && <option value="">-- seleccionar estado --</option>}
          {estadosFiltrados.map(s => (
            <option key={s.id_estado_turno} value={s.id_estado_turno}>
              {s.estado_turno}
            </option>
          ))}
        </select>
      </div>

      <div className={styles['form-actions']}>
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Atrás</button>
      </div>
    </form>
  );
}
