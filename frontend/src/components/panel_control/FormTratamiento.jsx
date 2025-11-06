import React, { useState, useEffect } from "react";
import {
  getTratamientos,
  createTratamiento,
  updateTratamiento,
} from "../../api/panelControlApi";

const FormTratamiento = ({ tratamiento, onGuardar, onCerrar }) => {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [importe, setImporte] = useState("");
  const [tratamientos, setTratamientos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [errorNombre, setErrorNombre] = useState("");
  const [errorCodigo, setErrorCodigo] = useState("");
  const [errorImporte, setErrorImporte] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    getTratamientos().then((data) => {
      if (Array.isArray(data)) setTratamientos(data);
    });
  }, []);

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

  // --- Validaciones individuales ---
  const validarNombre = (valor) => {
    const v = valor.trim();
    if (!v) return "El nombre no puede estar vacío.";
    if (v.length > 50) return "El nombre no puede superar los 50 caracteres.";
    if (/\d/.test(v)) return "El nombre no puede contener números.";
    const existe = tratamientos.some(
      (t) =>
        t.nombre_tratamiento.toLowerCase() === v.toLowerCase() &&
        t.id_tratamiento !== tratamiento?.id_tratamiento
    );
    if (existe) return "Ya existe un tratamiento con ese nombre.";
    return "";
  };

  const validarCodigo = (valor) => {
    const v = valor.trim();
    if (!v) return "El código es obligatorio.";
    if (v.length > 20) return "El código no puede superar los 20 caracteres.";
    if (/\s/.test(v)) return "El código no debe contener espacios.";
    return "";
  };

  const validarImporte = (valor) => {
    if (valor === "" || valor === null) return "El importe es obligatorio.";
    const num = parseFloat(valor);
    if (isNaN(num)) return "El importe debe ser un número válido.";
    if (num <= 0) return "El importe debe ser mayor que 0.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    // Validar todos los campos
    const errNom = validarNombre(nombre);
    const errCod = validarCodigo(codigo);
    const errImp = validarImporte(importe);

    setErrorNombre(errNom);
    setErrorCodigo(errCod);
    setErrorImporte(errImp);

    if (errNom || errCod || errImp) return;

    setLoading(true);
    try {
      const data = {
        nombre_tratamiento: nombre.trim(),
        codigo: codigo.trim(),
        importe: parseFloat(importe),
      };

      if (tratamiento) {
        await updateTratamiento(tratamiento.id_tratamiento, data);
      } else {
        await createTratamiento(data);
      }

      if (onGuardar) onGuardar();
      onCerrar();
    } catch (err) {
      console.error("Error al guardar tratamiento:", err);
      setApiError("Ocurrió un error al guardar el tratamiento. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fo-overlay">
      <div className="fo-form">
        <div className="fo-header">
          <h3 className="fo-title">
            {tratamiento ? "Editar Tratamiento" : "Agregar Tratamiento"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="fo-inner">
          {/* Nombre */}
          <label className="fo-label">Nombre del tratamiento</label>
          <input
            type="text"
            placeholder="Ej: Limpieza dental, Radiografía, etc."
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrorNombre("");
              setApiError("");
            }}
            className="fo-input"
          />
          {errorNombre && <p className="fo-error">{errorNombre}</p>}

          {/* Código */}
          <label className="fo-label">Código</label>
          <input
            type="text"
            placeholder="Ej: TR001"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              setErrorCodigo("");
              setApiError("");
            }}
            className="fo-input"
          />
          {errorCodigo && <p className="fo-error">{errorCodigo}</p>}

          {/* Importe */}
          <label className="fo-label">Importe</label>
          <input
            type="number"
            placeholder="Ej: 1500"
            value={importe}
            onChange={(e) => {
              setImporte(e.target.value);
              setErrorImporte("");
              setApiError("");
            }}
            className="fo-input"
          />
          {errorImporte && <p className="fo-error">{errorImporte}</p>}

          {/* Error general */}
          {!errorNombre && !errorCodigo && !errorImporte && apiError && (
            <p className="fo-error">{apiError}</p>
          )}

          <div className="fo-buttons">
            <button type="submit" className="fo-guardar" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className="fo-cancel" onClick={onCerrar} disabled={loading}>
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
          width: 380px;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          font-family: 'Segoe UI', sans-serif;
          animation: fadeIn 0.18s ease-in-out;
        }

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
          gap: 8px;
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
          margin-top: 8px;
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
};

export default FormTratamiento;
