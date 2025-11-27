// src/components/turnos/TurnoForm.jsx
import React, { useState, useEffect } from 'react';
import { obtenerHorariosDisponibles, obtenerEstados } from '../../api/turnosApi';
import { showWarning, showError } from '../../utils/alertas';
import styles from './TurnoForm.module.css';

/**
 * Intenta transformar cualquier error (string o JSON) en un mensaje legible.
 */
function getFriendlyErrorMessage(err) {
  if (!err) return 'Ocurrió un error desconocido.';

  // Si viene un objeto Error
  let raw = typeof err === 'string' ? err : err.message || String(err);

  // Si NO parece JSON, devolvemos el texto como está.
  const trimmed = raw.trim();
  if (!(trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    return raw;
  }

  // Intentamos parsear JSON
  try {
    const data = JSON.parse(trimmed);

    // 1) Mensaje simple en "error"
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }

    // 2) Errores en "errors"
    if (data.errors) {
      const e = data.errors;

      // 2.1 non_field_errors
      if (Array.isArray(e.non_field_errors)) {
        return e.non_field_errors.join(' ');
      }

      // 2.2 si "errors" es string
      if (typeof e === 'string') {
        return e;
      }

      // 2.3 si "errors" es objeto de campos
      if (typeof e === 'object') {
        const mensajes = [];
        Object.values(e).forEach((val) => {
          if (Array.isArray(val)) {
            mensajes.push(val.join(' '));
          } else if (typeof val === 'string') {
            mensajes.push(val);
          }
        });
        if (mensajes.length) return mensajes.join(' ');
      }
    }

    // Si no encontramos algo mejor, devolvemos el JSON "bonito".
    return JSON.stringify(data);
  } catch {
    // Si falla el parseo, devolvemos el texto original.
    return raw;
  }
}

/**
 * Props:
 * - initialData
 * - onCancel
 * - onSaved
 * - mode: "create" | "edit"
 * - hidePatientFields
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

      if (resp && resp.success) {
        setHorarios(resp.horarios_disponibles || []);
      } else {
        setHorarios([]);
        const msg = getFriendlyErrorMessage(
          resp?.error || resp?.errors || 'No se pudieron obtener horarios para esa fecha.'
        );
        setError(msg);
        await showWarning('Horarios no disponibles', msg);
      }
    } catch (e) {
      const msg = getFriendlyErrorMessage(e);
      setError(msg);
      await showError('Error al cargar horarios', msg);
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

    // Validaciones del FRONT antes de enviar al backend
    try {
      // Validación de fecha pasada
      if (form.fecha_turno) {
        const hoy = new Date();
        const inicioHoy = new Date(
          hoy.getFullYear(),
          hoy.getMonth(),
          hoy.getDate(),
          0, 0, 0, 0
        );
        const fechaSeleccionada = new Date(form.fecha_turno + 'T00:00:00');

        if (fechaSeleccionada < inicioHoy) {
          const msg = 'No podés agendar un turno en una fecha pasada.';
          setError(msg);
          await showWarning('Fecha inválida', msg);
          return;
        }

        // Validación de horario pasado el mismo día
        if (form.hora_turno) {
          const [hhStr, mmStr] = form.hora_turno.slice(0, 5).split(':');
          const hh = parseInt(hhStr, 10);
          const mm = parseInt(mmStr, 10);
          if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
            const dtTurno = new Date(fechaSeleccionada);
            dtTurno.setHours(hh, mm, 0, 0);
            const ahora = new Date();
            if (dtTurno < ahora) {
              const msg = 'No podés agendar un turno en un horario que ya pasó.';
              setError(msg);
              await showWarning('Horario inválido', msg);
              return;
            }
          }
        }
      }

      // Validación de longitud de asunto/comentario
      if (form.asunto && form.asunto.length > 150) {
        const msg = 'El asunto no puede superar los 150 caracteres.';
        setError(msg);
        await showWarning('Validación de asunto', msg);
        return;
      }
      if (form.comentario_turno && form.comentario_turno.length > 500) {
        const msg = 'El comentario no puede superar los 500 caracteres.';
        setError(msg);
        await showWarning('Validación de comentario', msg);
        return;
      }
    } catch (err) {
      console.error('Error en validaciones de front de TurnoForm:', err);
    }

    const payload = { ...form };
    if (payload.hora_turno && payload.hora_turno.length === 5) {
      payload.hora_turno = `${payload.hora_turno}:00`;
    }
    if (payload.id_turno_estado === '') payload.id_turno_estado = null;

    try {
      await onSaved && await onSaved(payload);
    } catch (err) {
      const msg = getFriendlyErrorMessage(err);
      setError(msg);
      await showError('Error al guardar turno', msg);
    }
  }

  const estadosFiltrados = mode === 'create'
    ? estados.filter(s => (s.estado_turno || '').toLowerCase().includes('confirm'))
    : estados;

  const fromPatient = Boolean(initialData.fromPatient || initialData.id_paciente);
  const shouldShowPatientFields = !hidePatientFields && !fromPatient && mode === 'create';

  // Regex compartida para asunto/comentario: solo letras, espacios y . , -
  const TEXT_REGEX = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s.,-]*$/;

  return (
    <form onSubmit={handleSubmit} className={styles['turno-form-container']}>
      {error && <div className={styles['error-message']}>{String(error)}</div>}

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
            {horarios.map(h => (
              <option key={h} value={h}>
                {h.slice(0, 5)}
              </option>
            ))}
            {initialData && initialData.hora_turno && !horarios.includes(initialData.hora_turno) && (
              <option key={initialData.hora_turno} value={initialData.hora_turno}>
                {initialData.hora_turno.slice(0, 5)} (Actual)
              </option>
            )}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="asunto">Asunto</label>
        <input
          id="asunto"
          name="asunto"
          value={form.asunto}
          maxLength={150}
          onChange={(e) => {
            if (TEXT_REGEX.test(e.target.value)) {
              handleChange(e);
            }
          }}
        />
      </div>

      <div>
        <label htmlFor="comentario_turno">Comentario</label>
        <input
          id="comentario_turno"
          name="comentario_turno"
          value={form.comentario_turno}
          maxLength={500}
          onChange={(e) => {
            if (TEXT_REGEX.test(e.target.value)) {
              handleChange(e);
            }
          }}
        />
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

