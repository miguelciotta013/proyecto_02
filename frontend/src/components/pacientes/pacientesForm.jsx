import React, { useState, useEffect } from 'react';
import { createPaciente, updatePaciente } from '../../api/pacientesApi';

export default function PacientesForm({ onClose, onCreated, initialData, onUpdated }) {
  const [form, setForm] = useState({
    dni_paciente: '',
    nombre_paciente: '',
    apellido_paciente: '',
    fecha_nacimiento: '',
    domicilio: '',
    localidad: '',
    telefono: '',
    correo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (initialData) {
      // Map fields from initialData to form state if present
      setForm(prev => ({
        ...prev,
        dni_paciente: initialData.dni_paciente || '',
        nombre_paciente: initialData.nombre_paciente || '',
        apellido_paciente: initialData.apellido_paciente || '',
        fecha_nacimiento: initialData.fecha_nacimiento || '',
        domicilio: initialData.domicilio || '',
        localidad: initialData.localidad || '',
        telefono: initialData.telefono || initialData.telefono || '',
        correo: initialData.correo || ''
      }));
    }
  }, [initialData]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (initialData && initialData.id_paciente) {
        const resp = await updatePaciente(initialData.id_paciente, form);
        if (resp && resp.success) {
          onUpdated && onUpdated(resp.data);
          onClose && onClose();
        } else {
          setError(resp?.errors || resp?.error || 'Error al actualizar paciente');
        }
      } else {
        const resp = await createPaciente(form);
        if (resp && resp.success) {
          onCreated && onCreated(resp.data);
          onClose && onClose();
        } else {
          setError(resp?.errors || resp?.error || 'Error al crear paciente');
        }
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 12, border: '1px solid #ccc', marginTop: 12 }}>
      <h3>Nuevo paciente</h3>
      {error && <div style={{ color: 'red' }}>{JSON.stringify(error)}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>DNI</label><br />
          <input name="dni_paciente" value={form.dni_paciente} onChange={handleChange} />
        </div>
        <div>
          <label>Nombre</label><br />
          <input name="nombre_paciente" value={form.nombre_paciente} onChange={handleChange} />
        </div>
        <div>
          <label>Apellido</label><br />
          <input name="apellido_paciente" value={form.apellido_paciente} onChange={handleChange} />
        </div>
        <div>
          <label>Fecha Nac.</label><br />
          <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
        </div>
        <div>
          <label>Teléfono</label><br />
          <input name="telefono" value={form.telefono} onChange={handleChange} />
        </div>
        <div>
          <label>Correo</label><br />
          <input name="correo" value={form.correo} onChange={handleChange} />
        </div>

        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear'}</button>
          <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
