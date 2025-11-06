import React, { useEffect, useState } from "react";
import { getObrasSociales, eliminarObraSocial } from "../../api/panelControlApi";
import FormObra from "./FormObra";
import ListaCoberturas from "../panel_control/ListaCoberturas";

function ListaObras() {
  const [obras, setObras] = useState([]);
  const [obraEditando, setObraEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [search, setSearch] = useState("");
  const [vista, setVista] = useState("obras");
  const [obraSeleccionada, setObraSeleccionada] = useState(null);

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const cargarObras = async () => {
    const data = await getObrasSociales();
    // Se muestran las más nuevas primero
    setObras(Array.isArray(data) ? data.filter(o => !o.eliminado).reverse() : []);
  };

  useEffect(() => { cargarObras(); }, []);

  const handleEliminar = async (obra) => {
    if (window.confirm(`¿Eliminar la obra social "${obra.nombre_os}"?`)) {
      await eliminarObraSocial(obra.id_obra_social);
      cargarObras();
    }
  };

  const handleVerCoberturas = (obra) => {
    setObraSeleccionada(obra);
    setVista("coberturas");
  };

  const obrasFiltradas = obras.filter(o =>
    o.nombre_os.toLowerCase().includes(search.toLowerCase())
  );

  
  const totalPages = Math.ceil(obrasFiltradas.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = obrasFiltradas.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page) => setCurrentPage(page);
  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, obras]);

  
  if (vista === "coberturas" && obraSeleccionada) {
    return (
      <ListaCoberturas
        obra={obraSeleccionada}
        onVolver={() => {
          setVista("obras");
          setObraSeleccionada(null);
          cargarObras();
        }}
      />
    );
  }

  return (
    <div className="lo-container">
      
      <div className="lo-header-panel">
        <h2 className="lo-titulo">Obras Sociales</h2>
        <div className="lo-actions-panel">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="lo-search"
          />
          <button
            className="lo-agregar"
            onClick={() => { setObraEditando(null); setModalAbierto(true); }}
          >
            + Agregar
          </button>
        </div>
      </div>

      {modalAbierto && (
        <FormObra
          obra={obraEditando}
          onClose={() => setModalAbierto(false)}
          fetchObras={cargarObras}
        />
      )}

      
      <div className="lo-list">
        {currentItems.length > 0 ? (
          currentItems.map((obra) => (
            <div key={obra.id_obra_social} className="lo-card">
              <div className="lo-nombre">{obra.nombre_os}</div>
              <div>
                <button
                  className="lo-edit"
                  onClick={() => { setObraEditando(obra); setModalAbierto(true); }}
                >
                  Editar
                </button>
                <button
                  className="lo-cobertura"
                  onClick={() => handleVerCoberturas(obra)}
                >
                  Ver Coberturas
                </button>
                <button
                  className="lo-delete"
                  onClick={() => handleEliminar(obra)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No hay obras sociales registradas.</p>
        )}
      </div>

      
      <div className="lo-pagination">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="lo-page-btn"
        >
          ←
        </button>

        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`lo-page-number ${currentPage === page ? "active" : ""}`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
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
        }

        .lo-search {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
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
          color: #000;
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

        .lo-cobertura {
          background: #22c55e;
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

export default ListaObras;
