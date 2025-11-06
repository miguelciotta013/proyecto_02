import React, { useState, useEffect } from "react";
import { getUsuarios, getEmpleados, createEmpleado, updateEmpleado } from "../../api/panelControlApi";

function FormEmpleado({ empleado, onClose, refresh }) {
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [userId, setUserId] = useState(empleado?.user_info?.id || "");
  const [rol, setRol] = useState(empleado?.rol || "");
  const [error, setError] = useState("");

  useEffect(() => {
    // Cargamos usuarios y empleados existentes
    Promise.all([getUsuarios(), getEmpleados()]).then(([usuariosData, empleadosData]) => {
      setUsuarios(usuariosData || []);
      setEmpleados(empleadosData || []);
    });
  }, []);

  // IDs de usuarios que ya tienen un empleado asignado
  const usuariosConRol = new Set(empleados.map((e) => e.user_info.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!rol.trim()) {
      setError("Por favor, selecciona un rol válido.");
      return;
    }

    if (!empleado && !userId) {
      setError("Debes seleccionar un usuario para el nuevo empleado.");
      return;
    }

    try {
      const payload = { rol };
      if (!empleado) payload.user = userId;

      if (empleado) await updateEmpleado(empleado.id_empleado, payload);
      else await createEmpleado(payload);

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Error al guardar el empleado. Intenta nuevamente.");
    }
  };

  return (
    <div className="fe-overlay">
      <div className="fe-form">
        <div className="fe-header">
          <h3>{empleado ? "Editar Empleado" : "Agregar Empleado"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="fe-inner">
          {!empleado && (
            <div className="fe-select-container">
              <select
                className="fe-select"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              >
                <option value="">Selecciona usuario</option>
                {usuarios.map((u) => {
                  const ocupado = usuariosConRol.has(u.id);
                  return (
                    <option key={u.id} value={u.id} disabled={ocupado}>
                      {u.first_name} {u.last_name} ({u.username})
                      {ocupado ? " - Ya tiene rol" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {empleado && (
            <input
              type="text"
              value={`${empleado.user_info.first_name} ${empleado.user_info.last_name}`}
              disabled
              className="fe-input"
            />
          )}

          <div className="fe-select-container">
            <select
              className="fe-select"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
            >
              <option value="">Selecciona rol</option>
              <option value="admin">Administrador</option>
              <option value="odontologo">Odontólogo</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="cajero">Cajero</option>
            </select>
          </div>

          {error && <p className="fe-error">{error}</p>}

          <div className="fe-buttons">
            <button type="submit" className="fe-save">
              Guardar
            </button>
            <button type="button" className="fe-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .fe-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
        }

        .fe-form {
          width: 360px;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        }

        .fe-header {
          background: #2e7d9d;
          padding: 12px;
          text-align: center;
        }

        .fe-header h3 {
          color: white;
          font-size: 18px;
          margin: 0;
        }

        .fe-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 18px;
        }

        .fe-input, .fe-select {
          width: 100%;
          font-size: 14px;
          border-radius: 8px;
          border: 1px solid #ccc;
          padding: 10px 12px;
          outline: none;
          transition: all 0.25s ease;
          background-color: #f9fafb;
        }

        .fe-input:focus,
        .fe-select:focus {
          border-color: #2e7d9d;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(46, 125, 157, 0.2);
        }

        .fe-select-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .fe-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background: #f9fafb;
          cursor: pointer;
        }

        .fe-select-container::after {
          content: "▼";
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          color: #555;
          pointer-events: none;
        }

        option[disabled] {
          color: #aaa;
        }

        .fe-error {
          color: #dc2626;
          font-size: 13px;
          text-align: center;
          margin-top: 4px;
        }

        .fe-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }

        .fe-save {
          background: #4caf50;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .fe-save:hover {
          background: #246377;
        }

        .fe-cancel {
          background: #9ca3af;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .fe-cancel:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}

export default FormEmpleado;
