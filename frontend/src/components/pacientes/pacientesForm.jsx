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

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (initialData?.id_paciente) {
        const resp = await updatePaciente(initialData.id_paciente, form);
        if (resp?.success) {
          onUpdated && onUpdated(resp.data);
          onClose && onClose();
        } else setError(resp?.errors || resp?.error || 'Error al actualizar paciente');
      } else {
        const resp = await createPaciente(form);
        if (resp?.success) {
          onCreated && onCreated(resp.data);
          onClose && onClose();
        } else setError(resp?.errors || resp?.error || 'Error al crear paciente');
      }
    } catch (e) {
      setError(e.message || String(e));
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
    transition: '0.3s',
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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(3px)",
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #f5f7fa, #e3f2fd)",
          padding: 30,
          borderRadius: 20,
          boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
          width: "90%",
          maxWidth: 500,
          position: "relative",
          transform: "scale(1)",
          transition: "transform 0.3s ease"
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: "none",
            backgroundColor: "#d63532",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            transition: "0.3s"
          }}
          onMouseEnter={e => e.target.style.backgroundColor = "#d32f2f"}
          onMouseLeave={e => e.target.style.backgroundColor = "#ef5350"}
        >
          ✕ Cerrar
        </button>

        <h2 style={{ textAlign: 'center', marginBottom: 20, color: '#0b47a0' }}>
          {initialData ? 'Editar paciente' : 'Nuevo paciente'}
        </h2>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: 12 }}>{JSON.stringify(error)}</div>}

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
                onFocus={e => e.target.style.borderColor = "#1976d2"}
                onBlur={e => e.target.style.borderColor = "#ccc"}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button
              type="submit"
              disabled={loading}
              style={buttonStyle('linear-gradient(90deg, #1162e5ff, #1139caff)', 'linear-gradient(90deg, #0c74dbff, #0560a6ff)')}
              onMouseEnter={e => e.target.style.background = 'linear-gradient(90deg, #1809e1ff, #0b32a6ff)'}
              onMouseLeave={e => e.target.style.background = 'linear-gradient(90deg, #0849a4ff, #0768adff)'}
            >
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={buttonStyle('#777', '#555')}
              onMouseEnter={e => e.target.style.background = '#555'}
              onMouseLeave={e => e.target.style.background = '#777'}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
