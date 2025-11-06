import React, { useEffect, useState } from "react";
import { getTratamientos, eliminarTratamiento } from "../../api/panelControlApi";
import FormTratamiento from "./FormTratamiento";

function ListaTratamientos() {
  const [tratamientos, setTratamientos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [search, setSearch] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 5;

  const fetchTratamientos = async () => {
    const data = await getTratamientos();
    setTratamientos(
      Array.isArray(data)
        ? data.sort((a, b) => b.id_tratamiento - a.id_tratamiento)
        : []
    );
  };

  useEffect(() => {
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
    fetchTratamientos();
    cerrarForm();
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Deseas eliminar este tratamiento?")) {
      await eliminarTratamiento(id);
      fetchTratamientos();
    }
  };

  const tratamientosFiltrados = tratamientos.filter((t) =>
    t.nombre_tratamiento.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaginas = Math.ceil(tratamientosFiltrados.length / porPagina) || 1;
  const indexInicio = (paginaActual - 1) * porPagina;
  const tratamientosPagina = tratamientosFiltrados.slice(
    indexInicio,
    indexInicio + porPagina
  );

  const irPagina = (num) => setPaginaActual(num);
  const irSiguiente = () =>
    setPaginaActual((prev) => Math.min(prev + 1, totalPaginas));
  const irAnterior = () => setPaginaActual((prev) => Math.max(prev - 1, 1));

  return (
    <div className="lo-container">
      <div className="lo-header-panel">
        <h2 className="lo-titulo">Tratamientos</h2>
        <div className="lo-actions-panel">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lo-search"
          />
          <button className="lo-agregar" onClick={() => abrirForm()}>
            + Agregar
          </button>
        </div>
      </div>

      {showForm && (
        <FormTratamiento
          tratamiento={tratamientoSeleccionado}
          onGuardar={guardarTratamiento}
          onCerrar={cerrarForm}
        />
      )}

      <table className="lo-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Tratamiento</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tratamientosPagina.length > 0 ? (
            tratamientosPagina.map((t) => (
              <tr key={t.id_tratamiento}>
                <td>{t.codigo}</td>
                <td>{t.nombre_tratamiento}</td>
                <td>${t.importe}</td>
                <td>
                  <button className="lo-edit" onClick={() => abrirForm(t)}>
                    Editar
                  </button>
                  <button
                    className="lo-disable"
                    onClick={() => handleEliminar(t.id_tratamiento)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No hay tratamientos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

     
      <div className="lo-pagination">
        <button
          onClick={irAnterior}
          disabled={paginaActual === 1}
          className="lo-page-btn"
        >
          ←
        </button>

        {[...Array(totalPaginas)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => irPagina(i + 1)}
            className={`lo-page-number ${
              paginaActual === i + 1 ? "active" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={irSiguiente}
          disabled={paginaActual === totalPaginas}
          className="lo-page-btn"
        >
          →
        </button>
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
          background-color: #1976d2;
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
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 14px;
        }

        .lo-agregar {
          background: #16a34a;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .lo-agregar:hover {
          background: #13803c;
        }

        
        .lo-table {
          width: 100%;
          border-collapse: collapse;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .lo-table th, .lo-table td {
          border: 1px solid #e0e0e0;
          padding: 10px 12px;
          text-align: left;
        }

        .lo-table th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #1E56A8;
        }

        .lo-table tbody tr {
          background: white;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .lo-table tbody tr:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0,0,0,0.08);
        }

      
        .lo-edit {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-right: 5px;
        }

        .lo-edit:hover {
          background: #2563eb;
        }

        .lo-disable {
          background: #f87171;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .lo-disable:hover {
          background: #ef4444;
        }

       
        .lo-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 15px;
          font-weight: 500;
          flex-wrap: wrap;
        }

        .lo-page-btn,
        .lo-page-number {
          background: #1976d2;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .lo-page-number.active {
          background: #145ca4;
          font-weight: 700;
        }

        .lo-page-btn:hover:not(:disabled),
        .lo-page-number:hover:not(.active) {
          background: #145ca4;
        }

        .lo-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default ListaTratamientos;
