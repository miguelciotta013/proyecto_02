import React, { useEffect, useState } from "react";
import { getCoberturas, eliminarCobertura } from "../../api/panelControlApi";
import FormCobertura from "./FormCobertura";

function ListaCoberturas({ obra, onVolver }) {
  const [coberturas, setCoberturas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editCobertura, setEditCobertura] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [search, setSearch] = useState("");
  const porPagina = 5;

  const cargarCoberturas = async () => {
    const data = await getCoberturas(obra.id_obra_social);
    setCoberturas(
      Array.isArray(data)
        ? data.sort((a, b) => b.id_cobertura - a.id_cobertura)
        : []
    );
  };

  useEffect(() => {
    cargarCoberturas();
  }, []);

  const handleEliminar = async (cobertura) => {
    if (
      window.confirm(
        `¿Eliminar la cobertura del tratamiento "${cobertura.tratamiento_nombre}"?`
      )
    ) {
      await eliminarCobertura(cobertura.id_cobertura);
      cargarCoberturas();
    }
  };

  const abrirEditar = (cobertura) => {
    setEditCobertura(cobertura);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEditCobertura(null);
  };

  // Filtro de búsqueda
  const coberturasFiltradas = coberturas.filter((c) =>
    c.tratamiento_nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const totalPaginas = Math.ceil(coberturasFiltradas.length / porPagina) || 1;
  const indexInicio = (paginaActual - 1) * porPagina;
  const coberturasPagina = coberturasFiltradas.slice(
    indexInicio,
    indexInicio + porPagina
  );

  const irPagina = (num) => setPaginaActual(num);
  const irSiguiente = () => setPaginaActual((p) => Math.min(p + 1, totalPaginas));
  const irAnterior = () => setPaginaActual((p) => Math.max(p - 1, 1));

  return (
    <div className="lc-container">
      <div className="lc-header-panel">
        <h2 className="lc-titulo">Coberturas de {obra.nombre_os}</h2>
        <div className="lc-actions-panel">
          <input
            type="text"
            placeholder="Buscar tratamiento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lc-search"
          />
          <button className="lc-volver" onClick={onVolver}>
            ← Volver
          </button>
          <button className="lc-agregar" onClick={() => setModalAbierto(true)}>
            + Agregar Cobertura
          </button>
        </div>
      </div>

      {modalAbierto && (
        <FormCobertura
          obra={obra}
          onClose={cerrarModal}
          onSaved={cargarCoberturas}
          cobertura={editCobertura}
        />
      )}

      <div className="lc-list">
        {coberturasPagina.length > 0 ? (
          coberturasPagina.map((c) => (
            <div key={c.id_cobertura} className="lc-card">
              <div className="lc-info">
                <span className="lc-linea">
                  <strong>Tratamiento:</strong> {c.tratamiento_nombre}
                </span>
                <span className="lc-linea">
                  <strong>Cubre:</strong> {c.porcentaje}%
                </span>
              </div>
              <div className="lc-buttons">
                <button className="lc-edit" onClick={() => abrirEditar(c)}>
                  Editar
                </button>
                <button className="lc-delete" onClick={() => handleEliminar(c)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="lc-empty">
            No hay coberturas registradas para esta obra social.
          </p>
        )}
      </div>

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
            className={`lo-page-number ${paginaActual === i + 1 ? "active" : ""}`}
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
        .lc-container {
          width: 100%;
          padding: 20px;
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        }

        .lc-header-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #1976d2;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .lc-titulo {
          flex-grow: 1;
          text-align: center;
          margin: 0;
          font-size: 22px;
        }

        .lc-actions-panel {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .lc-search {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 14px;
        }

        .lc-volver, .lc-agregar {
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .lc-volver {
          background: #3b82f6;
          color: white;
        }

        .lc-volver:hover {
          background: #2563eb;
          transform: scale(1.03);
        }

        .lc-agregar {
          background: #16a34a;
          color: white;
        }

        .lc-agregar:hover {
          background: #13803c;
          transform: scale(1.03);
        }

        .lc-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .lc-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 14px 18px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .lc-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0,0,0,0.1);
        }

        .lc-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 16px;
          color: #1f2937;
        }

        .lc-linea strong {
          color: #1E56A8;
        }

        .lc-buttons {
          display: flex;
          gap: 8px;
        }

        .lc-edit {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .lc-edit:hover {
          background: #2563eb;
        }

        .lc-delete {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .lc-delete:hover {
          background: #dc2626;
        }

        .lc-empty {
          text-align: center;
          color: #6b7280;
          font-size: 15px;
          margin-top: 15px;
        }

        .lo-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 20px;
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

export default ListaCoberturas;
