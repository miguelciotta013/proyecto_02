import React, { useEffect, useState } from "react";
import {
  getTratamientos,
  createCobertura,
  updateCobertura,
} from "../../api/panelControlApi";

function FormCobertura({ obra, onClose, onSaved, cobertura }) {
  const [tratamientos, setTratamientos] = useState([]);
  const [idTratamiento, setIdTratamiento] = useState(cobertura?.id_tratamiento || "");
  const [porcentaje, setPorcentaje] = useState(cobertura?.porcentaje || "");
  const [errors, setErrors] = useState({});
  const modoEdicion = !!cobertura;

  useEffect(() => {
    const cargarTratamientos = async () => {
      try {
        const data = await getTratamientos();
        if (Array.isArray(data)) {
          // Filtra tratamientos no eliminados y que no tengan cobertura ya asignada a esta obra social
          const disponibles = data.filter(
            (t) => !t.eliminado && !obra.coberturas?.some(c => c.id_tratamiento === t.id_tratamiento)
          );
          setTratamientos(disponibles);
        } else {
          setTratamientos([]);
        }
      } catch (error) {
        console.error("Error cargando tratamientos:", error);
      }
    };
    if (!modoEdicion) cargarTratamientos();
  }, [modoEdicion, obra]);

  const validar = () => {
    const newErrors = {};

    if (!modoEdicion && !idTratamiento) {
      newErrors.tratamiento = "Selecciona un tratamiento.";
    }

    if (porcentaje === "") {
      newErrors.porcentaje = "Completa el porcentaje.";
    } else {
      const pct = parseInt(porcentaje, 10);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        newErrors.porcentaje = "El porcentaje debe estar entre 0 y 100.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    try {
      const pct = parseInt(porcentaje, 10);

      if (modoEdicion) {
        await updateCobertura(cobertura.id_cobertura, { porcentaje: pct });
      } else {
        // Validación adicional: tratamiento no repetido
        const yaExiste = obra.coberturas?.some(
          (c) => c.id_tratamiento === parseInt(idTratamiento)
        );
        if (yaExiste) {
          setErrors({ tratamiento: "Este tratamiento ya tiene una cobertura asociada." });
          return;
        }

        await createCobertura({
          id_obra_social: obra.id_obra_social,
          id_tratamiento: idTratamiento,
          porcentaje: pct,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      setErrors({ general: "Ocurrió un error al guardar la cobertura." });
    }
  };

  return (
    <div className="fo-overlay">
      <form className="fo-form" onSubmit={handleSubmit}>
        <div className="fo-header">
          <h3>{modoEdicion ? "Editar Cobertura" : "Agregar Cobertura"}</h3>
        </div>

        {/* Tratamiento */}
        <label>Tratamiento:</label>
        {modoEdicion ? (
          <input type="text" value={cobertura.tratamiento_nombre} disabled />
        ) : (
          <select
            value={idTratamiento}
            onChange={(e) => setIdTratamiento(e.target.value)}
          >
            <option value="">Selecciona un tratamiento</option>
            {tratamientos.map((t) => (
              <option key={t.id_tratamiento} value={t.id_tratamiento}>
                {t.nombre_tratamiento}
              </option>
            ))}
          </select>
        )}
        {errors.tratamiento && <p className="fo-error">{errors.tratamiento}</p>}

        {/* Porcentaje */}
        <label>Porcentaje:</label>
        <input
          type="number"
          min="0"
          max="100"
          value={porcentaje}
          onChange={(e) => setPorcentaje(e.target.value)}
          placeholder="Ej: 80"
        />
        {errors.porcentaje && <p className="fo-error">{errors.porcentaje}</p>}

        {errors.general && <p className="fo-error">{errors.general}</p>}

        <div className="fo-buttons">
          <button type="submit" className="fo-guardar">
            {modoEdicion ? "Guardar Cambios" : "Guardar"}
          </button>
          <button type="button" className="fo-cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>

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
          width: 380px;
          background: white;
          border-radius: 10px;
          padding: 20px 22px;
          box-shadow: 0 8px 24px rgba(17,24,39,0.15);
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
          animation: fadeIn 0.25s ease;
        }

        .fo-header {
          background-color: #2e7d9d;
          color: white;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 14px;
        }

        label {
          font-weight: 600;
          margin-top: 8px;
          display: block;
        }

        select, input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          margin-top: 4px;
          margin-bottom: 8px;
          transition: border 0.2s, box-shadow 0.2s;
        }

        select:hover, input:hover, select:focus, input:focus {
          border-color: #2e7d9d;
          box-shadow: 0 0 3px #2e7d9d55;
          outline: none;
        }

        select {
          background-color: white;
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #2e7d9d 50%), 
                            linear-gradient(135deg, #2e7d9d 50%, transparent 50%);
          background-position: calc(100% - 15px) calc(1em + 2px), calc(100% - 10px) calc(1em + 2px);
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
        }

        .fo-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }

        .fo-guardar, .fo-cancel {
          flex: 1;
          margin: 0 4px;
          border: none;
          border-radius: 8px;
          padding: 9px 14px;
          cursor: pointer;
          font-weight: 600;
          transition: background 0.2s;
        }

        .fo-guardar {
          background: #4caf50;
          color: white;
        }

        .fo-guardar:hover {
          background: #246377;
        }

        .fo-cancel {
          background: #9ca3af;
          color: white;
        }

        .fo-cancel:hover {
          background: #6b7280;
        }

        .fo-error {
          color: #dc2626;
          font-size: 13px;
          margin-top: -6px;
          margin-bottom: 6px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default FormCobertura;
