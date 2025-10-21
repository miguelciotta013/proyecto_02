import React, { useState, useEffect } from "react";
import { createTratamiento, updateTratamiento } from "../../api/panelControlApi";

const FormTratamiento = ({ tratamiento, onGuardar, onCerrar }) => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [importe, setImporte] = useState("");

  useEffect(() => {
    if (tratamiento) {
      setNombre(tratamiento.nombre_tratamiento || "");
      setCodigo(tratamiento.codigo || "");
      setImporte(tratamiento.importe || "");
    } else {
      setNombre("");
      setCodigo("");
      setImporte("");
    }
  }, [tratamiento]);

  const handleGuardar = async () => {
    const data = { nombre_tratamiento: nombre, codigo, importe };

    if (tratamiento) {
      await updateTratamiento(tratamiento.id_tratamiento, data);
    } else {
      await createTratamiento(data);
    }

    if (onGuardar) onGuardar();
  };

  return (
    <div className="fo-overlay">
      <div className="fo-form">
        <h2 className="fo-title">{tratamiento ? "Editar Tratamiento" : "Agregar Tratamiento"}</h2>

        <input
          type="text"
          placeholder="Nombre del tratamiento"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <input
          type="number"
          placeholder="Importe"
          value={importe}
          onChange={(e) => setImporte(e.target.value)}
        />

        <div className="fo-buttons">
          <button className="fo-guardar" onClick={handleGuardar}>Guardar</button>
          <button className="fo-cancel" onClick={onCerrar}>Cancelar</button>
        </div>
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
};

export default FormTratamiento;
