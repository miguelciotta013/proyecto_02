import React, { useEffect, useState } from "react";
import { getTratamientos, eliminarTratamiento } from "../../api/panelControlApi";
import FormTratamiento from "./FormTratamiento";

function ListaTratamientos() {
  const [tratamientos, setTratamientos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTratamientos = async () => {
      const data = await getTratamientos();
      setTratamientos(Array.isArray(data) ? data : []);
    };
    fetchTratamientos();
  }, []);

  const abrirForm = (tratamiento = null) => {
    setTratamientoSeleccionado(tratamiento);
    setShowForm(true);
  };

  const cerrarForm = () => {
    setShowForm(false);
    setTratamientoSeleccionado(null);
  };

  const guardarTratamiento = () => {
    getTratamientos().then(data => setTratamientos(Array.isArray(data) ? data : []));
    cerrarForm();
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Deseas eliminar este tratamiento?")) {
      await eliminarTratamiento(id);
      const data = await getTratamientos();
      setTratamientos(Array.isArray(data) ? data : []);
    }
  };

  const tratamientosFiltrados = tratamientos.filter(
    t => t.nombre_tratamiento.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lo-container">
      <div className="lo-header-panel">
        <h2 className="lo-titulo">Tratamientos</h2>
        <div className="lo-actions-panel">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="lo-search"
          />
          <button className="lo-agregar" onClick={() => abrirForm()}>+ Agregar</button>
        </div>
      </div>

      {showForm && (
        <FormTratamiento
          tratamiento={tratamientoSeleccionado}
          onGuardar={guardarTratamiento}
          onCerrar={cerrarForm}
        />
      )}

      <div className="lo-list">
        {tratamientosFiltrados.length > 0 ? tratamientosFiltrados.map(t => (
          <div key={t.id_tratamiento} className="lo-card">
            <div className="lo-nombre">{t.nombre_tratamiento}</div>
            <div>
              <button className="lo-edit" onClick={() => abrirForm(t)}>Editar</button>
              <button className="lo-delete" onClick={() => handleEliminar(t.id_tratamiento)}>Eliminar</button>
            </div>
          </div>
        )) : <p>No hay tratamientos registrados.</p>}
      </div>

      <style>{`
        .lo-container {
          width: 100%;
          padding: 20px;
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        }

        .lo-header-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #1E56A8;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lo-titulo {
          flex-grow: 1;
          text-align: center;
          margin: 0;
          font-size: 22px;
        }

        .lo-actions-panel {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }

        .lo-search {
          padding: 6px 10px;
          border-radius: 6px;
          border: none;
        }

        .lo-agregar {
          background: #16a34a;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }

        .lo-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lo-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: white;
          border-radius: 10px;
          border: 1px solid #e0e0e0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .lo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0,0,0,0.12);
        }

        .lo-nombre {
          font-size: 16px;
          color: #000000ff;
          font-weight: 500;
        }

        .lo-edit {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 5px;
        }

        .lo-delete {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

export default ListaTratamientos;
