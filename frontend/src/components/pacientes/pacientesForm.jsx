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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        dni_paciente: initialData.dni_paciente || '',
        nombre_paciente: initialData.nombre_paciente || '',
        apellido_paciente: initialData.apellido_paciente || '',
        fecha_nacimiento: initialData.fecha_nacimiento || '',
        domicilio: initialData.domicilio || '',
        localidad: initialData.localidad || '',
        telefono: initialData.telefono || '',
        correo: initialData.correo || ''
      });
    }
  }, [initialData]);

  // Validación de un campo específico
  function validateField(name, value) {
    switch (name) {
      case 'dni_paciente':
        if (!value.trim()) return 'DNI es obligatorio';
        if (!/^\d{7,8}$/.test(value)) return 'DNI debe tener 7 u 8 números';
        return null;
      case 'nombre_paciente':
        if (!value.trim()) return 'Nombre es obligatorio';
        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(value)) return 'Nombre solo puede contener letras';
        return null;
      case 'apellido_paciente':
        if (!value.trim()) return 'Apellido es obligatorio';
        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(value)) return 'Apellido solo puede contener letras';
        return null;
      case 'fecha_nacimiento':
        if (!value.trim()) return 'Fecha de nacimiento es obligatoria';
        const fecha = new Date(value);
        const hoy = new Date();
        if (isNaN(fecha.getTime())) return 'Fecha inválida';
        if (fecha > hoy) return 'La fecha no puede ser futura';
        return null;
      case 'telefono':
        if (!value.trim()) return 'Teléfono es obligatorio';
        if (!/^\d{6,15}$/.test(value)) return 'Teléfono debe tener al menos 6 números';
        return null;
      case 'correo':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo no válido';
        return null;
      case 'domicilio':
        if (!value.trim()) return 'Domicilio es obligatorio';
        if (value.length < 2) return 'Domicilio demasiado corto';
        return null;
      case 'localidad':
        if (!value.trim()) return 'Localidad es obligatoria';
        if (value.length < 2) return 'Localidad demasiado corta';
        return null;
      default:
        return null;
    }
  }

  // Validación en tiempo real al escribir
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  }

  // Validación general antes de enviar
  function validateForm() {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (initialData?.id_paciente) {
        const resp = await updatePaciente(initialData.id_paciente, form);
        if (resp?.success) onUpdated && onUpdated(resp.data);
      } else {
        const resp = await createPaciente(form);
        if (resp?.success) onCreated && onCreated(resp.data);
      }
      onClose && onClose();
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #ccc',
    outline: 'none',
    fontSize: 14,
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
  };

  const buttonStyle = (bg, hover) => ({
    flex: 1,
    padding: '12px',
    borderRadius: 12,
    border: 'none',
    background: bg,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 5px 12px rgba(0,0,0,0.15)',
    transition: '0.3s'
  });

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(3px)",
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{
        background: "linear-gradient(145deg, #f5f7fa, #e3f2fd)",
        padding: 30, borderRadius: 20, boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
        width: "90%", maxWidth: 500, position: "relative"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, border: "none",
          backgroundColor: "#d63532", color: "#fff", padding: "8px 14px",
          borderRadius: 10, cursor: "pointer", fontWeight: "bold"
        }}>✕ Cerrar</button>

        <h2 style={{ textAlign: 'center', marginBottom: 20, color: '#0b47a0' }}>
          {initialData ? 'Editar paciente' : 'Nuevo paciente'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'DNI', name: 'dni_paciente' },
            { label: 'Nombre', name: 'nombre_paciente' },
            { label: 'Apellido', name: 'apellido_paciente' },
            { label: 'Fecha de nacimiento', name: 'fecha_nacimiento', type: 'date' },
            { label: 'Teléfono', name: 'telefono' },
            { label: 'Correo', name: 'correo' },
            { label: 'Domicilio', name: 'domicilio' },
            { label: 'Localidad', name: 'localidad' }
          ].map(({ label, name, type = 'text' }) => (
            <div key={name}>
              <label style={{ marginBottom: 6, display: 'block', fontWeight: 500, color: '#333' }}>{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                style={inputStyle}
              />
              {errors[name] && <span style={{ color: 'red', fontSize: 12 }}>{errors[name]}</span>}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button type="submit" disabled={loading} style={buttonStyle('#1162e5', '#0c74db')}>
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={onClose} style={buttonStyle('#777', '#555')}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
