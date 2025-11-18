import React, { useEffect, useState, useCallback } from 'react';
import { listPacientes, getPaciente, deletePaciente } from '../../api/pacientesApi';
import PacienteTable from '../../components/pacientes/pacienteTable';
import PacienteCard from '../../components/pacientes/pacienteCard';
import PacientesForm from '../../components/pacientes/pacientesForm';
import ObraSocialForm from '../../components/pacientes/obraSocialForm';
import PatologiaForm from '../../components/pacientes/patologiaForm';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showObraFor, setShowObraFor] = useState(null);
  const [showPatologiaFor, setShowPatologiaFor] = useState(null);

  // Cargar pacientes al montar el componente
  useEffect(() => {
    fetchPacientes();
  }, []);

  // Función para cargar pacientes con useCallback para evitar re-creaciones
  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando pacientes...');
      const resp = await listPacientes();
      
      if (resp?.success) {
        console.log('✅ Pacientes cargados:', resp.data?.length || 0);
        setPacientes(resp.data || []);
      } else {
        const errorMsg = resp?.error || 'Error al obtener pacientes';
        console.error('❌ Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (e) {
      const errorMsg = e.message || String(e);
      console.error('❌ Error de red:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ver detalles de un paciente
  const handleView = useCallback(async (id) => {
    try {
      console.log('👁️ Obteniendo paciente:', id);
      const resp = await getPaciente(id);
      
      if (resp?.success) {
        console.log('✅ Paciente obtenido:', resp.data);
        setSelected(resp.data);
        setError(null);
      } else {
        const errorMsg = resp?.error || 'No se pudo obtener el paciente';
        console.error('❌ Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (e) {
      const errorMsg = e.message || String(e);
      console.error('❌ Error:', errorMsg);
      setError(errorMsg);
    }
  }, []);

  // Eliminar paciente
  const handleEliminar = useCallback(async (id_paciente) => {
    if (!window.confirm('¿Estás seguro de que querés dar de baja a este paciente?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🗑️ Eliminando paciente:', id_paciente);
      const resp = await deletePaciente(id_paciente);
      
      if (resp?.success) {
        console.log('✅ Paciente eliminado correctamente');
        
        // Actualizar lista de pacientes
        setPacientes(prev => prev.filter(p => p.id_paciente !== id_paciente));
        
        // Cerrar tarjeta si está viendo el paciente eliminado
        if (selected?.id_paciente === id_paciente) {
          setSelected(null);
        }
      } else {
        const errorMsg = resp?.error || 'Error al eliminar el paciente';
        console.error('❌ Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (e) {
      const errorMsg = e.message || String(e);
      console.error('❌ Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  // Editar paciente
  const handleEditar = useCallback(async (id_paciente) => {
    try {
      setError(null);
      console.log('✏️ Cargando datos para editar:', id_paciente);
      
      const resp = await getPaciente(id_paciente);
      
      if (resp?.success) {
        console.log('✅ Datos cargados para edición');
        setEditing(resp.data);
        setSelected(null); // Cerrar tarjeta de vista
      } else {
        const errorMsg = resp?.error || 'No se pudo obtener el paciente';
        console.error('❌ Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (e) {
      const errorMsg = e.message || String(e);
      console.error('❌ Error:', errorMsg);
      setError(errorMsg);
    }
  }, []);

  // Asignar obra social
  const handleAsignarObra = useCallback((id_paciente) => {
    console.log('🏥 Abriendo formulario de obra social para:', id_paciente);
    setShowObraFor(id_paciente);
    setSelected(null); // Cerrar tarjeta
  }, []);

  // Agregar patología
  const handleAgregarFicha = useCallback((id_paciente) => {
    console.log('📋 Abriendo formulario de patología para:', id_paciente);
    setShowPatologiaFor(id_paciente);
    setSelected(null); // Cerrar tarjeta
  }, []);

  // Actualizar paciente en la lista
  const updatePacienteInList = useCallback((updatedPaciente) => {
    if (!updatedPaciente?.id_paciente) return;
    
    console.log('🔄 Actualizando paciente en lista:', updatedPaciente.id_paciente);
    
    setPacientes(prev => 
      prev.map(p => 
        p.id_paciente === updatedPaciente.id_paciente ? updatedPaciente : p
      )
    );
  }, []);

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          👥 Gestión de Pacientes
        </h2>
        <div style={headerActionsStyle}>
          <button 
            onClick={fetchPacientes} 
            style={refreshButtonStyle}
            disabled={loading}
            title="Recargar lista"
          >
            <RefreshCw 
              size={18} 
              style={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none' 
              }} 
            />
          </button>
          <button 
            onClick={() => setSelected('__create__')} 
            style={addButtonStyle}
            disabled={loading}
          >
            <Plus size={18} style={{ marginRight: 6 }} />
            Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div style={errorBoxStyle}>
          <AlertCircle size={20} style={{ marginRight: 8, flexShrink: 0 }} />
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button 
            onClick={() => setError(null)} 
            style={closeErrorStyle}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabla de pacientes */}
      <div style={tableContainerStyle}>
        <PacienteTable 
          pacientes={pacientes} 
          onView={handleView}
          loading={loading}
        />
      </div>

{selected === '__create__' && (
  <div style={modalOverlayStyle} onClick={() => setSelected(null)}>
    <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>

      <PacientesForm
        onClose={() => setSelected(null)}

        onCreated={async (newPaciente) => {
          console.log('✅ Paciente creado:', newPaciente);

          // 1. Agregar rápido a la tabla
          setPacientes(prev => [newPaciente, ...prev]);

          // 2. Traer la versión COMPLETA desde la API
          const resp = await getPaciente(newPaciente.id_paciente);

          if (resp?.success) {
            console.log("📥 Paciente completo cargado:", resp.data);

            // 3. Actualizar en la tabla
            updatePacienteInList(resp.data);

            // 4. Cerrar el modal de creación
            setSelected(null);

            // 5. Abrir la tarjeta del nuevo paciente
            setSelected(resp.data);
          } else {
            console.error("❌ No se pudo obtener el paciente completo al crearlo");
          }
        }}
      />

    </div>
  </div>
)}


onCreated={async (newPaciente) => {
  console.log('✅ Paciente creado:', newPaciente);

  // 1. Agregar a la lista rápido
  setPacientes(prev => [newPaciente, ...prev]);

  // 2. Traer paciente COMPLETO desde la API
  const resp = await getPaciente(newPaciente.id_paciente);

  if (resp?.success) {
    console.log("📥 Paciente completo cargado:", resp.data);

    // 3. Actualizar lista con datos reales
    updatePacienteInList(resp.data);

    // 4. Cerrar formulario recién ahora
    setSelected(null);

    // 5. Abrir la tarjeta del paciente
    setSelected(resp.data);
  } else {
    console.error("❌ No se pudo obtener el paciente completo al crearlo");
  }
}}


      {/* Modal: Editar paciente */}
      {editing && (
        <div style={modalOverlayStyle} onClick={() => setEditing(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <PacientesForm
              initialData={editing}
              onClose={() => setEditing(null)}
              onUpdated={(updatedPaciente) => {
                console.log('✅ Paciente actualizado:', updatedPaciente);
                
                if (!updatedPaciente?.id_paciente) return;
                
                // Actualizar en la lista
                updatePacienteInList(updatedPaciente);
                
                // Actualizar tarjeta si está abierta
                if (selected?.id_paciente === updatedPaciente.id_paciente) {
                  setSelected(updatedPaciente);
                }
                
                // Cerrar formulario de edición
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal: Asignar obra social */}
      {showObraFor && (
        <div style={modalOverlayStyle} onClick={() => setShowObraFor(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <ObraSocialForm
              id_paciente={showObraFor}
              onClose={() => setShowObraFor(null)}
              onAssigned={async () => {
                console.log('✅ Obra social asignada');
                
                // Recargar datos del paciente
                const resp = await getPaciente(showObraFor);
                
                if (resp?.success) {
                  updatePacienteInList(resp.data);
                  setSelected(resp.data);
                }
                
                setShowObraFor(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal: Agregar patología */}
      {showPatologiaFor && (
        <div style={modalOverlayStyle} onClick={() => setShowPatologiaFor(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <PatologiaForm
              id_paciente={showPatologiaFor}
              onClose={() => setShowPatologiaFor(null)}
              onSaved={async () => {
                console.log('✅ Patología guardada');
                
                // Recargar datos del paciente
                const resp = await getPaciente(showPatologiaFor);
                
                if (resp?.success) {
                  updatePacienteInList(resp.data);
                  setSelected(resp.data);
                }
                
                setShowPatologiaFor(null);
              }}
            />
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

// --- ESTILOS ---

const containerStyle = {
  padding: '24px',
  fontFamily: "'Poppins', sans-serif",
  backgroundColor: '#f0f2f5',
  minHeight: '100vh'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '16px'
};

const titleStyle = {
  color: '#333',
  margin: 0,
  fontSize: '28px',
  fontWeight: '700'
};

const headerActionsStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const refreshButtonStyle = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '2px solid #2e7d9d',
  backgroundColor: '#fff',
  color: '#2e7d9d',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const addButtonStyle = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#4caf50',
  color: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)'
};

const errorBoxStyle = {
  backgroundColor: '#ffebee',
  border: '2px solid #f44336',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '20px',
  display: 'flex',
  alignItems: 'center',
  color: '#c62828',
  animation: 'slideUp 0.3s ease-out',
  position: 'relative'
};

const closeErrorStyle = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  background: 'transparent',
  border: 'none',
  color: '#c62828',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '4px 8px',
  borderRadius: '4px'
};

const tableContainerStyle = {
  animation: 'fadeIn 0.5s ease-out'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: '20px',
  animation: 'fadeIn 0.2s ease-out'
};

const modalContentStyle = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  maxWidth: '900px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  animation: 'slideUp 0.3s ease-out'
};