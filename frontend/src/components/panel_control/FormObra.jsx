import React, { useState } from "react";
import { createObraSocial, updateObraSocial } from "../../api/panelControlApi";

function FormObra({ obra, onClose, fetchObras }) {
  const [nombre, setNombre] = useState(obra?.nombre_os || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return;
    try {
      if (obra?.id_obra_social) {
        await updateObraSocial(obra.id_obra_social, { nombre_os: nombre });
      } else {
        await createObraSocial({ nombre_os: nombre });
      }
      fetchObras();
      onClose();
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  return (
    <div className="fo-overlay">
      <div className="fo-form">
        <h3 className="fo-title">
          {obra?.id_obra_social ? "Editar Obra Social" : "Agregar Obra Social"}
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de la obra social"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <div className="fo-buttons">
            <button type="submit" className="fo-guardar">
              Guardar
            </button>
            <button type="button" className="fo-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .fo-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.34);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .fo-form {
          width: 400px;
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 8px 24px rgba(17,24,39,0.15);
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        }
        .fo-title {
          text-align: center;
          color: #1751a3;
          margin-bottom: 14px;
        }
        input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          margin-bottom: 10px;
        }
        .fo-buttons {
          display: flex;
          justify-content: space-between;
        }
        .fo-guardar {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .fo-cancel {
          background: #9ca3af;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default FormObra;
