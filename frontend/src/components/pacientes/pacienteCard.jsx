import React, { useState } from 'react';
import { removeObraSocial } from '../../api/pacientesApi';

export default function PacienteCard({
  paciente,
  onClose,
  onEditar,
  onEliminar,
  onAsignarObra,
  onObraRemoved
}) {
  const [closing, setClosing] = useState(false);
  const [obras, setObras] = useState(paciente?.obras_sociales || []);

  if (!paciente) return null;

  const handleEliminar = () => {
    if (window.confirm(`¿Seguro que querés dar de baja a ${paciente.nombre_paciente}?`)) {
      onEliminar(paciente.id_paciente);
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose && onClose(), 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
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
          background: "linear-gradient(145deg, #f5f7fa, #e3f2fd)",
          padding: 30,
          borderRadius: 20,
          boxShadow: "0 15px 35px rgba(0,0,0,0.25)",
          maxWidth: 550,
          width: "90%",
          fontFamily: "'Poppins', sans-serif",
          position: "relative",
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
            backgroundColor: "#d63532",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            transition: "0.3s",
          }}
          onMouseEnter={e => (e.target.style.backgroundColor = "#d32f2f")}
          onMouseLeave={e => (e.target.style.backgroundColor = "#ef5350")}
        >
          ✕ Cerrar
        </button>

        {/* Nombre del paciente */}
        <h2
          style={{
            marginBottom: 10,
            color: "#0b47a0",
            borderBottom: "2px solid #03506e",
            paddingBottom: 8,
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
          padding: "10px 15px",
          backgroundColor: "#fff",
          borderRadius: 12,
          boxShadow: "inset 0 0 8px rgba(0,0,0,0.03)"
        }}>
          <p><strong>DNI:</strong> {paciente.dni_paciente}</p>
          <p><strong>Fecha Nac.:</strong> {paciente.fecha_nacimiento}</p>
          <p><strong>Teléfono:</strong> {paciente.telefono}</p>
          <p><strong>Correo:</strong> {paciente.correo}</p>
        </div>

        {/* Obras Sociales */}
        <h4 style={{ marginBottom: 8, color: "#0d47a1" }}>Obras Sociales</h4>
        <div
          style={{
            backgroundColor: "#e3f2fd",
            padding: 12,
            borderRadius: 12,
            maxHeight: 150,
            overflowY: "auto",
            marginBottom: 20,
            border: "1px solid #00000033"
          }}
        >
          {obras && obras.length ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {obras.map(os => (
                <li key={os.id_paciente_os} style={{
                  marginBottom: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    {os.obra_social_nombre} — <span style={{ color: '#555' }}>{os.credencial_paciente || 'sin credencial'}</span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm('¿Seguro que querés eliminar esta obra social del paciente?')) return;
                      try {
                        const resp = await removeObraSocial(paciente.id_paciente, os.id_paciente_os);
                        if (resp && resp.success) {
                          const updated = obras.filter(o => o.id_paciente_os !== os.id_paciente_os);
                          setObras(updated);
                          if (typeof onObraRemoved === 'function') onObraRemoved({ ...paciente, obras_sociales: updated });
                        } else alert(resp?.error || 'Error al eliminar obra social');
                      } catch (e) {
                        alert(e.message || String(e));
                      }
                    }}
                    style={{
                      background: "linear-gradient(90deg, #ef5350, #d32f2f)",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "0.3s"
                    }}
                    onMouseEnter={e => e.target.style.background = "linear-gradient(90deg, #ff0000, #860303)"}
                    onMouseLeave={e => e.target.style.background = "linear-gradient(90deg, #ef5350, #d32f2f)"}
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
          {[
            { text: "Editar", color: "#0b8cf6", hover: "#00529a", action: () => onEditar(paciente.id_paciente) },
            { text: "Dar de baja", color: "#c30c09", hover: "#d32f2f", action: handleEliminar },
            { text: "Asignar Obra Social", color: "#020f75", hover: "#032987", action: () => onAsignarObra(paciente.id_paciente) }
          ].map(btn => (
            <button
              key={btn.text}
              onClick={btn.action}
              style={{
                flex: "1",
                minWidth: "45%",
                padding: "12px",
                borderRadius: 12,
                border: "none",
                background: btn.color,
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 5px 12px rgba(0,0,0,0.15)",
                transition: "0.3s"
              }}
              onMouseEnter={e => e.target.style.background = btn.hover}
              onMouseLeave={e => e.target.style.background = btn.color}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
