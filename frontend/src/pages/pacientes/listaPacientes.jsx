import React, { useEffect, useState } from 'react';
import { listPacientes, getPaciente } from '../../api/pacientesApi';
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
  const [showObraFor, setShowObraFor] = useState(null);
  const [showPatologiaFor, setShowPatologiaFor] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchPacientes();
  }, []);

  async function fetchPacientes() {
    setLoading(true);
    setError(null);
    try {
      const resp = await listPacientes();
      if (resp && resp.success) {
        setPacientes(resp.data || []);
      } else {
        setError(resp?.error || 'Error al obtener pacientes');
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleView(id) {
    try {
      const resp = await getPaciente(id);
      if (resp && resp.success) setSelected(resp.data);
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
      const { deletePaciente } = await import('../../api/pacientesApi');
      const resp = await deletePaciente(id_paciente);
      if (resp && resp.success) {
        await fetchPacientes();
        setSelected(null);
      } else {
        setError(resp?.error || 'Error al eliminar');
      }
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
        if (resp && resp.success) {
          setEditing(resp.data);
        } else {
          setError(resp?.error || 'No se pudo obtener paciente');
        }
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
        <button
          onClick={() => setSelected('__create__')}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "#fff",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={e => e.target.style.backgroundColor = "#45a049"}
          onMouseLeave={e => e.target.style.backgroundColor = "#4caf50"}
        >
          Nuevo paciente
        </button>
      </div>

      {loading && <p style={{ color: "#555" }}>Cargando pacientes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          overflowX: "auto"
        }}>
          <PacienteTable pacientes={pacientes} onView={handleView} />
        </div>
      )}

      {selected && selected !== '__create__' && (
        <div style={{ marginTop: 20 }}>
          <PacienteCard 
            paciente={selected} 
            onClose={() => setSelected(null)} 
            onEliminar={handleEliminar}
            onAsignarObra={handleAsignarObra}
            onAgregarFicha={handleAgregarFicha}
            onEditar={handleEditar}
          />
        </div>
      )}

      {selected === '__create__' && (
        <div style={{ marginTop: 20, backgroundColor: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <PacientesForm onClose={() => setSelected(null)} onCreated={() => fetchPacientes()} />
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 20, backgroundColor: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <PacientesForm 
            initialData={editing} 
            onClose={() => setEditing(null)} 
            onUpdated={() => { setEditing(null); fetchPacientes(); }}
          />
        </div>
      )}

      {showObraFor && (
        <div style={{ marginTop: 20, backgroundColor: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <ObraSocialForm id_paciente={showObraFor} onClose={() => setShowObraFor(null)} onAssigned={() => { setShowObraFor(null); fetchPacientes(); }} />
        </div>
      )}

      {showPatologiaFor && (
        <div style={{ marginTop: 20, backgroundColor: "#fff", padding: 16, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <PatologiaForm id_paciente={showPatologiaFor} onClose={() => setShowPatologiaFor(null)} onSaved={() => { setShowPatologiaFor(null); fetchPacientes(); }} />
        </div>
      )}
    </div>
  );
}

