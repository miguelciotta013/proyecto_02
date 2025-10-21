import React, { useState, useEffect } from "react";
import { getUsuarios, createEmpleado, updateEmpleado } from "../../api/panelControlApi";

function FormEmpleado({ empleado, onClose, refresh }) {
  const [usuarios, setUsuarios] = useState([]);
  const [userId, setUserId] = useState(empleado?.user_info?.id || "");
  const [rol, setRol] = useState(empleado?.rol || "");

  useEffect(() => {
    getUsuarios().then(data => setUsuarios(data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rol || (!empleado && !userId)) return alert("Completa todos los campos");
    try {
      const payload = { rol };
      if (!empleado) payload.user = userId;

      if (empleado) await updateEmpleado(empleado.id_empleado, payload);
      else await createEmpleado(payload);

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fe-overlay">
      <div className="fe-form">
        <h3 className="fe-title">{empleado ? "Editar Empleado" : "Agregar Empleado"}</h3>
        <form onSubmit={handleSubmit} className="fe-inner">

          {!empleado && (
            <select
              className="fe-input"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
            >
              <option value="">Selecciona usuario</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name} ({u.username})
                </option>
              ))}
            </select>
          )}

          {empleado && (
            <input
              type="text"
              value={`${empleado.user_info.first_name} ${empleado.user_info.last_name}`}
              disabled
              className="fe-input"
            />
          )}

          <select
            className="fe-input"
            value={rol}
            onChange={e => setRol(e.target.value)}
            required
          >
            <option value="">Selecciona rol</option>
            <option value="admin">Administrador</option>
            <option value="odontologo">Odontólogo</option>
            <option value="recepcionista">Recepcionista</option>
            <option value="cajero">Cajero</option>
          </select>

          <div className="fe-buttons">
            <button type="submit" className="fe-save">Guardar</button>
            <button type="button" className="fe-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>

      <style>{`
        .fe-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
        }
        .fe-form {
          width: 400px;
          background: #fff;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          font-family: 'Segoe UI', sans-serif;
        }
        .fe-title {
          text-align: center;
          color: #1751a3;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 18px;
        }
        .fe-inner {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .fe-input {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          width: 100%;
        }
        .fe-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
        }
        .fe-save {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .fe-save:hover { background: #2563eb; }
        .fe-cancel {
          background: #9ca3af;
          color: #fff;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .fe-cancel:hover { background: #6b7280; }
      `}</style>
    </div>
  );
}

export default FormEmpleado;
