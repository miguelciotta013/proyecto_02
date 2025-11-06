import React, { useState, useEffect } from "react";
import { getObrasSociales, createObraSocial, updateObraSocial } from "../../api/panelControlApi";

function FormObra({ obra, onClose, fetchObras }) {
  const [nombre, setNombre] = useState(obra?.nombre_os || "");
  const [obrasExistentes, setObrasExistentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");         // error relacionado al campo
  const [apiError, setApiError] = useState("");   // error de red/servidor

  useEffect(() => {
    getObrasSociales().then((data) => {
      if (Array.isArray(data)) setObrasExistentes(data);
    });
  }, []);

  const validarNombre = (raw) => {
    const nombreLimpio = raw.trim();
    if (!nombreLimpio) return "El nombre no puede estar vacío.";
    if (nombreLimpio.length > 50) return "El nombre no puede superar los 50 caracteres.";
    if (/\d/.test(nombreLimpio)) return "El nombre no puede contener números.";
    const existe = obrasExistentes.some(
      (o) =>
        o.nombre_os.toLowerCase() === nombreLimpio.toLowerCase() &&
        o.id_obra_social !== obra?.id_obra_social
    );
    if (existe) return "Ya existe una obra social con ese nombre.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const v = validarNombre(nombre);
    if (v) {
      setError(v);
      return;
    }
    setError("");
    setLoading(true);

    try {
      const payload = { nombre_os: nombre.trim() };

      if (obra?.id_obra_social) {
        await updateObraSocial(obra.id_obra_social, payload);
      } else {
        await createObraSocial(payload);
      }

      if (fetchObras) await fetchObras();
      onClose();
    } catch (err) {
      console.error("Error al guardar:", err);
      setApiError("Ocurrió un error al guardar la obra social. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fo-overlay">
      <div className="fo-form" role="dialog" aria-modal="true" aria-labelledby="fo-title">
        <div className="fo-header">
          <h3 id="fo-title" className="fo-title">
            {obra?.id_obra_social ? "Editar Obra Social" : "Agregar Obra Social"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="fo-inner" noValidate>
          <label className="fo-label" htmlFor="obra-nombre">Nombre de la obra social</label>
          <input
            id="obra-nombre"
            type="text"
            placeholder="Ej: OSDE, Swiss Medical, etc."
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (error) setError("");    // limpiar error cuando el usuario escribe
              if (apiError) setApiError("");
            }}
            className="fo-input"
            aria-invalid={error ? "true" : "false"}
            required
            autoFocus
          />

          {error && <p className="fo-error" role="alert">{error}</p>}
          {!error && apiError && <p className="fo-error" role="alert">{apiError}</p>}

          <div className="fo-buttons">
            <button type="submit" className="fo-guardar" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className="fo-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .fo-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
        }

        .fo-form {
          width: 360px;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          font-family: 'Segoe UI', sans-serif;
          animation: fadeIn 0.18s ease-in-out;
        }

        /* Franja superior */
        .fo-header {
          background: #2e7d9d;
          padding: 10px;
          text-align: center;
        }

        .fo-title {
          color: #fff;
          font-size: 17px;
          font-weight: 600;
          margin: 0;
        }

        .fo-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 18px;
        }

        .fo-label {
          font-weight: 600;
          font-size: 14px;
          color: #374151;
        }

        .fo-input {
          padding: 9px 11px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          transition: border 0.18s, box-shadow 0.18s;
        }

        .fo-input:focus {
          border-color: #2e7d9d;
          box-shadow: 0 0 0 2px rgba(46,125,157,0.12);
          outline: none;
        }

        .fo-error {
          color: #dc2626;
          font-size: 13px;
          margin: 0;
          padding-left: 2px;
        }

        .fo-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
        }

        .fo-guardar {
          background: #4caf50;
          color: #fff;
          border: none;
          padding: 9px 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
        }

        .fo-guardar[disabled] {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .fo-guardar:hover:not([disabled]) {
          background: #246377;
        }

        .fo-cancel {
          background: #9ca3af;
          color: #fff;
          border: none;
          padding: 9px 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s;
        }

        .fo-cancel[disabled] {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .fo-cancel:hover:not([disabled]) {
          background: #6b7280;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default FormObra;
