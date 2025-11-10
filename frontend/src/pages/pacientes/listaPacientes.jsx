import React, { useEffect, useState } from 'react';
import { listPacientes, getPaciente, deletePaciente } from '../../api/pacientesApi';
import PacienteTable from '../../components/pacientes/pacienteTable';
import PacienteCard from '../../components/pacientes/pacienteCard';
import PacientesForm from '../../components/pacientes/pacientesForm';
import ObraSocialForm from '../../components/pacientes/obraSocialForm';
import PatologiaForm from '../../components/pacientes/patologiaForm';

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showObraFor, setShowObraFor] = useState(null);
  const [showPatologiaFor, setShowPatologiaFor] = useState(null);

  useEffect(() => {
    fetchPacientes();
  }, []);

  async function fetchPacientes() {
    setLoading(true);
    setError(null);
    try {
      const resp = await listPacientes();
      if (resp?.success) setPacientes(resp.data || []);
      else setError(resp?.error || 'Error al obtener pacientes');
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleView(id) {
    try {
      const resp = await getPaciente(id);
      if (resp?.success) setSelected(resp.data);
      else setError(resp?.error || 'No se pudo obtener paciente');
    } catch (e) {
      setError(e.message || String(e));
    }
  }

  async function handleEliminar(id_paciente) {
    if (!window.confirm('¿Seguro que querés dar de baja a este paciente?')) return;
    try {
      setLoading(true);
      setError(null);
      const resp = await deletePaciente(id_paciente);
      if (resp?.success) {
        setPacientes(prev => prev.filter(p => p.id_paciente !== id_paciente));
        if (selected?.id_paciente === id_paciente) setSelected(null);
      } else setError(resp?.error || 'Error al eliminar');
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleEditar(id_paciente) {
    setError(null);
    getPaciente(id_paciente)
      .then(resp => {
        if (resp?.success) setEditing(resp.data);
        else setError(resp?.error || 'No se pudo obtener paciente');
      })
      .catch(e => setError(e.message || String(e)));
  }

  function handleAsignarObra(id_paciente) {
    setShowObraFor(id_paciente);
  }

  function handleAgregarFicha(id_paciente) {
    setShowPatologiaFor(id_paciente);
  }

  return (
    <div style={{ padding: 24, fontFamily: "'Poppins', sans-serif", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <h2 style={{ color: "#333", marginBottom: 16 }}>Pacientes</h2>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setSelected('__create__')} style={buttonStyle("#4caf50")}>
          Nuevo paciente
        </button>
      </div>

      {loading && <p style={{ color: "#555" }}>Cargando pacientes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={listCardStyle}>
          <PacienteTable pacientes={pacientes} onView={handleView} />
        </div>
      )}

      {/* Tarjeta del paciente */}
      {selected && selected !== '__create__' && (
        <PacienteCard
          paciente={selected}
          onClose={() => setSelected(null)}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          onAsignarObra={handleAsignarObra}
          onAgregarFicha={handleAgregarFicha}
          onObraRemoved={(updatedPaciente) => {
            setSelected(updatedPaciente);
            setPacientes(prev => prev.map(p => p.id_paciente === updatedPaciente.id_paciente ? updatedPaciente : p));
          }}
          onObraAssigned={(updatedPaciente) => {
            setSelected(updatedPaciente);
            setPacientes(prev => prev.map(p => p.id_paciente === updatedPaciente.id_paciente ? updatedPaciente : p));
          }}
          onUpdated={(updatedPaciente) => {
            setSelected(updatedPaciente);
            setPacientes(prev => prev.map(p => p.id_paciente === updatedPaciente.id_paciente ? updatedPaciente : p));
          }}
        />
      )}

      {/* Crear paciente */}
      {selected === '__create__' && (
        <div style={cardWrapperStyle}>
          <PacientesForm
            onClose={() => setSelected(null)}
            onCreated={(newPaciente) => {
              setPacientes(prev => [...prev, newPaciente]);
              setSelected(newPaciente);
            }}
          />
        </div>
      )}

      {/* Editar paciente */}
      {editing && (
        <div style={cardWrapperStyle}>
          <PacientesForm
            initialData={editing}
            onClose={() => setEditing(null)}
            onUpdated={(updated) => {
              if (!updated?.id_paciente) return;
              setPacientes(prev => prev.map(p => p.id_paciente === updated.id_paciente ? updated : p));
              if (selected?.id_paciente === updated.id_paciente) setSelected(updated);
              setEditing(null);
            }}
          />
        </div>
      )}

      {/* Obras sociales */}
      {showObraFor && (
        <div style={cardWrapperStyle}>
          <ObraSocialForm
            id_paciente={showObraFor}
            onClose={() => setShowObraFor(null)}
            onAssigned={async () => {
              const resp = await getPaciente(showObraFor);
              if (resp?.success) {
                setSelected(resp.data);
                setPacientes(prev => prev.map(p => p.id_paciente === resp.data.id_paciente ? resp.data : p));
              }
              setShowObraFor(null);
            }}
          />
        </div>
      )}

      {/* Patologías */}
      {showPatologiaFor && (
        <div style={cardWrapperStyle}>
          <PatologiaForm
            id_paciente={showPatologiaFor}
            onClose={() => setShowPatologiaFor(null)}
            onSaved={() => setShowPatologiaFor(null)}
          />
        </div>
      )}
    </div>
  );
}

const buttonStyle = (bg) => ({
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: bg,
  color: "#fff",
  cursor: "pointer",
  transition: "background-color 0.2s",
  fontWeight: 600,
  marginBottom: 8
});

const listCardStyle = {
  backgroundColor: "#fff",
  padding: 16,
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  overflowX: "auto"
};

const cardWrapperStyle = {
  marginTop: 20,
  backgroundColor: "#fff",
  padding: 16,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};
