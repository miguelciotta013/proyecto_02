import React, { useEffect, useState } from 'react';
import { removeObraSocial } from '../../api/pacientesApi';

export default function PacienteCard({
  paciente,
  onClose,
  onEditar,
  onEliminar,
  onAsignarObra,
  onAgregarFicha,
  onObraRemoved,
  onObraAssigned,
  onUpdated
}) {
  const [pacienteData, setPacienteData] = useState(paciente);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    setPacienteData(paciente);
  }, [paciente]);

  if (!pacienteData) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose?.(), 300);
  };

  const handleEliminar = () => {
    if (window.confirm(`¿Seguro que querés dar de baja a ${pacienteData.nombre_paciente}?`)) {
      onEliminar?.(pacienteData.id_paciente);
    }
  };

  const handleObraRemoved = async (id_paciente_os) => {
    if (!window.confirm('¿Seguro que querés eliminar esta obra social del paciente?')) return;
    try {
      const resp = await removeObraSocial(pacienteData.id_paciente, id_paciente_os);
      if (resp?.success) {
        const updated = {
          ...pacienteData,
          obras_sociales: pacienteData.obras_sociales.filter(o => o.id_paciente_os !== id_paciente_os)
        };
        setPacienteData(updated);
        onObraRemoved?.(updated);
        onUpdated?.(updated); // ✅ Actualiza en tiempo real en ListaPacientes
      } else alert(resp?.error || 'Error al eliminar obra social');
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  const handleObraAssigned = (obra) => {
    const updated = { ...pacienteData, obras_sociales: [...pacienteData.obras_sociales, obra] };
    setPacienteData(updated);
    onObraAssigned?.(updated);
    onUpdated?.(updated); // ✅ Actualiza en tiempo real en ListaPacientes
  };

  return (
    <div style={overlayStyle(closing)}>
      <div style={cardStyle(closing)}>
        <button onClick={handleClose} style={closeButtonStyle}>✕ Cerrar</button>
        <h2 style={cardTitleStyle}>{pacienteData.nombre_paciente} {pacienteData.apellido_paciente}</h2>

        <div style={infoBoxStyle}>
          <p><strong>DNI:</strong> {pacienteData.dni_paciente}</p>
          <p><strong>Fecha Nac.:</strong> {pacienteData.fecha_nacimiento}</p>
          <p><strong>Teléfono:</strong> {pacienteData.telefono}</p>
          <p><strong>Correo:</strong> {pacienteData.correo}</p>
        </div>

        <h4 style={{ marginBottom: 8, color: "#2e7d9d" }}>Obras Sociales</h4>
        <div style={obraBoxStyle}>
          {pacienteData.obras_sociales?.length ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {pacienteData.obras_sociales.map(os => (
                <li key={os.id_paciente_os} style={obraItemStyle}>
                  <div>
                    {os.obra_social_nombre} — <span style={{ color: '#555' }}>{os.credencial_paciente || 'sin credencial'}</span>
                  </div>
                  <button onClick={() => handleObraRemoved(os.id_paciente_os)} style={smallRedButtonStyle}>Eliminar</button>
                </li>
              ))}
            </ul>
          ) : <p style={{ margin: 0, color: "#555" }}>Sin obras sociales registradas</p>}
        </div>

        <div style={actionsBoxStyle}>
          <button onClick={() => onEditar?.(pacienteData.id_paciente)} style={blueButtonStyle}>Editar</button>
          <button onClick={handleEliminar} style={redButtonStyle}>Dar de baja</button>
          <button onClick={() => onAsignarObra?.(pacienteData.id_paciente, handleObraAssigned)} style={greenButtonStyle}>Asignar Obra Social</button>
        </div>
      </div>
    </div>
  );
}

// --- Estilos ---
const overlayStyle = (closing) => ({
  position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000,
  opacity: closing ? 0 : 1,
  transition: "opacity 0.3s ease",
  backdropFilter: "blur(3px)"
});

const cardStyle = (closing) => ({
  background: "#fff",
  padding: 30,
  borderRadius: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  maxWidth: 550,
  width: "90%",
  fontFamily: "'Poppins', sans-serif",
  position: "relative",
  borderTop: "6px solid #2e7d9d",
  transform: closing ? "scale(0.95)" : "scale(1)",
  transition: "transform 0.3s ease"
});

const closeButtonStyle = {
  position: "absolute", top: 16, right: 16,
  border: "none", backgroundColor: "#9e9e9e", color: "#fff",
  padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 600
};

const cardTitleStyle = { marginBottom: 12, color: "#2e7d9d", borderBottom: "2px solid #90caf9", paddingBottom: 6, textAlign: "center", fontWeight: 700 };
const infoBoxStyle = { marginBottom: 16, color: "#000", lineHeight: "1.6", padding: "12px 16px", backgroundColor: "#f5f7fa", borderRadius: 12, boxShadow: "inset 0 0 8px rgba(0,0,0,0.03)" };
const obraBoxStyle = { backgroundColor: "#e3f2fd", padding: 12, borderRadius: 12, maxHeight: 150, overflowY: "auto", marginBottom: 20, border: "1px solid #90caf9" };
const obraItemStyle = { marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const actionsBoxStyle = { display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" };
const blueButtonStyle = { flex: 1, minWidth: "45%", padding: "12px", borderRadius: 10, border: "none", backgroundColor: "#1976d2", color: "#fff", fontWeight: 600, cursor: "pointer" };
const redButtonStyle = { flex: 1, minWidth: "45%", padding: "10px", borderRadius: 10, border: "none", backgroundColor: "#da0909ff", color: "#fff", fontWeight: 200, cursor: "pointer" };
const greenButtonStyle = { flex: 1, minWidth: "45%", padding: "12px", borderRadius: 10, border: "none", backgroundColor: "#4caf50", color: "#fff", fontWeight: 600, cursor: "pointer" };

// ✅ Botón pequeño para eliminar obra social
const smallRedButtonStyle = {
  padding: "8px 18px",
  borderRadius: 16,
  border: "none",
  backgroundColor: "#da0909",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: 12,
  transition: "0.2s"
};
