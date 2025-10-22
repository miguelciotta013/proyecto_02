import React, { useState } from "react";
import { createMetodo, updateMetodo } from "../../api/panelControlApi";

function FormMetodo({ metodo, onClose }) {
  const [tipo, setTipo] = useState(metodo?.tipo_cobro || "");

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (metodo?.id_metodo_cobro) {
        await updateMetodo(metodo.id_metodo_cobro, { tipo_cobro: tipo });
      } else {
        await createMetodo({ tipo_cobro: tipo });
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fm-overlay">
      <div className="fm-form">
        <h3 className="fm-title">{metodo?.id_metodo_cobro ? "Editar Método" : "Agregar Método"}</h3>
        <form onSubmit={handleSubmit} className="fm-inner">
          <input
            className="fm-input"
            type="text"
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            placeholder="Nombre del método"
            required
          />
          <div className="fm-buttons">
            <button type="submit" className="fm-btn fm-guardar">Guardar</button>
            <button type="button" className="fm-btn fm-cancel" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>

      <style>{`
        .fm-overlay { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.35); z-index:2000; }
        .fm-form { width:360px; background:#fff; border-radius:10px; padding:20px; box-shadow:0 6px 18px rgba(0,0,0,0.12); }
        .fm-title { color:#1751a3; margin-bottom:12px; text-align:center; }
        .fm-input { width:100%; padding:10px; border-radius:8px; border:1px solid #d1d5db; }
        .fm-buttons { display:flex; justify-content:space-between; margin-top:12px; }
        .fm-btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
        .fm-guardar { background:#16a34a; color:#fff; }
        .fm-cancel { background:#9ca3af; color:#fff; }
      `}</style>
    </div>
  );
}

export default FormMetodo;
