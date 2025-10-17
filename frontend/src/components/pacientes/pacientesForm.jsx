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
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div
        style={{
          backgroundColor: "#fff",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          width: "90%",
          maxWidth: 500,
          animation: "fadeIn 0.3s ease"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: "none",
            backgroundColor: "#f44336",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: 8,
            cursor: "pointer",
            transition: "background-color 0.2s",
            fontWeight: "bold"
          }}
          onMouseEnter={e => e.target.style.backgroundColor = "#d32f2f"}
          onMouseLeave={e => e.target.style.backgroundColor = "#f44336"}
        >
          Cerrar
        </button>

        <h2 style={{ marginBottom: 16, color: "#333", textAlign: "center" }}>
          {initialData ? 'Editar paciente' : 'Nuevo paciente'}
        </h2>

        {error && (
          <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>
            {JSON.stringify(error)}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
              <label style={{ display: "block", marginBottom: 4, color: "#333" }}>{label}</label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid #ccc',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontSize: 14
                }}
                onFocus={e => e.target.style.borderColor = "#1976d2"}
                onBlur={e => e.target.style.borderColor = "#ccc"}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#1976d2',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#1565c0'}
              onMouseLeave={e => e.target.style.backgroundColor = '#1976d2'}
            >
              {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#777',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#555'}
              onMouseLeave={e => e.target.style.backgroundColor = '#777'}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
