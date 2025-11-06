import React, { useState } from "react";
import { createMetodo, updateMetodo } from "../../api/panelControlApi";

function FormMetodo({ metodo, onClose, refreshList, metodosExistentes = [] }) {
  const [tipoCobro, setTipoCobro] = useState(metodo?.tipo_cobro || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validar = () => {
    if (!tipoCobro.trim()) return "El campo no puede estar vacío.";
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(tipoCobro))
      return "Solo se permiten letras y espacios.";
    if (tipoCobro.length > 50)
      return "El nombre no puede tener más de 50 caracteres.";

    const existe = metodosExistentes.some(
      (m) =>
        m.tipo_cobro.toLowerCase() === tipoCobro.trim().toLowerCase() &&
        m.id_metodo_cobro !== metodo?.id_metodo_cobro
    );
    if (existe) return "Ya existe un método de pago con ese nombre.";

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validacion = validar();
    if (validacion) {
      setError(validacion);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        tipo_cobro: tipoCobro.trim(),
        eliminado: 0,
      };

      if (metodo?.id_metodo_cobro) {
        await updateMetodo(metodo.id_metodo_cobro, payload);
      } else {
        await createMetodo(payload);
      }

      if (refreshList) await refreshList();
      onClose();
    } catch (err) {
      console.error("Error al guardar método:", err);
      setError("Ocurrió un error al guardar el método.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fm-overlay">
      <div className="fm-form">
        <div className="fm-header">
          <h3 className="fm-title">
            {metodo?.id_metodo_cobro
              ? "Editar Método de Cobro"
              : "Agregar Método de Cobro"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="fm-inner">
          <label className="fm-label">Tipo de Cobro</label>
          <input
            className="fm-input"
            type="text"
            value={tipoCobro}
            onChange={(e) => setTipoCobro(e.target.value)}
            placeholder="Ej: Efectivo, Tarjeta, Transferencia..."
            required
          />

          {error && <p className="fm-error">{error}</p>}

          <div className="fm-buttons">
            <button type="submit" className="fm-btn fm-guardar" disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className="fm-btn fm-cancel" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .fm-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.35);
          z-index: 2000;
        }
        .fm-form {
          width: 360px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          font-family: 'Segoe UI', Roboto, sans-serif;
          animation: fadeIn 0.25s ease-in-out;
          overflow: hidden;
        }
        .fm-header {
          background: #2e7d9d;
          padding: 12px;
          text-align: center;
        }
        .fm-title {
          color: #fff;
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        .fm-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 20px;
        }
        .fm-label {
          font-weight: 600;
          font-size: 14px;
          color: #333;
        }
        .fm-input {
          padding: 9px 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 14px;
        }
        .fm-input:focus {
          outline: none;
          border-color: #2e7d9d;
          box-shadow: 0 0 0 2px rgba(46, 125, 157, 0.2);
        }
        .fm-error {
          color: #dc2626;
          font-size: 13px;
          text-align: center;
          margin: 4px 0;
        }
        .fm-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
        }
        .fm-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.25s ease;
        }
        .fm-guardar {
          background: #4caf50;
          color: #fff;
        }
        .fm-guardar:hover {
          background: #246377;
        }
        .fm-cancel {
          background: #9ca3af;
          color: #fff;
        }
        .fm-cancel:hover {
          background: #6b7280;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default FormMetodo;
