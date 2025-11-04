import React, { useState } from 'react';
import { removeObraSocial } from '../../api/pacientesApi';

export default function PacienteCard({
  paciente,
  onClose,
  onEditar,
  onEliminar,
  onAsignarObra,
}) {
  const [closing, setClosing] = useState(false);
  const [obras, setObras] = useState(paciente?.obras_sociales || []);

  if (!paciente) return null;

  const handleEliminar = () => {
    if (window.confirm(`¿Seguro que querés dar de baja a ${paciente.nombre_paciente}?`)) {
      onEliminar && onEliminar(paciente.id_paciente);
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose && onClose(), 300);
  };

  const handleObraAssigned = (obra) => {
    setObras((prev) => [...prev, obra]);
  };

  const handleObraRemoved = async (id_paciente_os) => {
    if (!window.confirm('¿Seguro que querés eliminar esta obra social del paciente?')) return;
    try {
      const resp = await removeObraSocial(paciente.id_paciente, id_paciente_os);
      if (resp && resp.success) {
        setObras((prev) => prev.filter(o => o.id_paciente_os !== id_paciente_os));
      } else alert(resp?.error || 'Error al eliminar obra social');
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        opacity: closing ? 0 : 1,
        transition: "opacity 0.3s ease",
        backdropFilter: "blur(3px)"
      }}
    >
      <div
        style={{
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
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: "none",
            backgroundColor: "#9e9e9e",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
            transition: "0.3s",
          }}
          onMouseEnter={e => e.target.style.backgroundColor = "#757575"}
          onMouseLeave={e => e.target.style.backgroundColor = "#9e9e9e"}
        >
          ✕ Cerrar
        </button>

        <h2
          style={{
            marginBottom: 12,
            color: "#2e7d9d",
            borderBottom: "2px solid #90caf9",
            paddingBottom: 6,
            textAlign: "center",
            fontWeight: 700
          }}
        >
          {paciente.nombre_paciente} {paciente.apellido_paciente}
        </h2>

        {/* Información básica */}
        <div style={{
          marginBottom: 16,
          color: "#000",
          lineHeight: "1.6",
          padding: "12px 16px",
          backgroundColor: "#f5f7fa",
          borderRadius: 12,
          boxShadow: "inset 0 0 8px rgba(0,0,0,0.03)"
        }}>
          <p><strong>DNI:</strong> {paciente.dni_paciente}</p>
          <p><strong>Fecha Nac.:</strong> {paciente.fecha_nacimiento}</p>
          <p><strong>Teléfono:</strong> {paciente.telefono}</p>
          <p><strong>Correo:</strong> {paciente.correo}</p>
        </div>

        {/* Obras Sociales */}
        <h4 style={{ marginBottom: 8, color: "#2e7d9d" }}>Obras Sociales</h4>
        <div
          style={{
            backgroundColor: "#e3f2fd",
            padding: 12,
            borderRadius: 12,
            maxHeight: 150,
            overflowY: "auto",
            marginBottom: 20,
            border: "1px solid #90caf9"
          }}
        >
          {obras.length ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {obras.map(os => (
                <li key={os.id_paciente_os} style={{
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    {os.obra_social_nombre} — <span style={{ color: '#555' }}>{os.credencial_paciente || 'sin credencial'}</span>
                  </div>
                  <button
                    onClick={() => handleObraRemoved(os.id_paciente_os)}
                    style={{
                      backgroundColor: "#d32f2f",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "0.3s",
                    }}
                    onMouseEnter={e => e.target.style.backgroundColor = "#b71c1c"}
                    onMouseLeave={e => e.target.style.backgroundColor = "#d32f2f"}
                  >Eliminar</button>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: "#555" }}>Sin obras sociales registradas</p>
          )}
        </div>

        {/* Botones de acción */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center"
        }}>
          <button
            onClick={() => onEditar && onEditar(paciente.id_paciente)}
            style={buttonStyle("#1976d2", "#004aad")}
          >
            Editar
          </button>
          <button
            onClick={handleEliminar}
            style={buttonStyle("#d32f2f", "#b71c1c")}
          >
            Dar de baja
          </button>
          <button
            onClick={() => onAsignarObra && onAsignarObra(paciente.id_paciente, handleObraAssigned)}
            style={buttonStyle("#4caf50", "#388e3c")}
          >
            Asignar Obra Social
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper para estilos de botón
function buttonStyle(color, hover) {
  return {
    flex: "1",
    minWidth: "45%",
    padding: "12px",
    borderRadius: 10,
    border: "none",
    backgroundColor: color,
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
    transition: "0.3s",
    marginBottom: 8,
    onMouseEnter: e => e.target.style.backgroundColor = hover,
    onMouseLeave: e => e.target.style.backgroundColor = color,
  };
}
