import React, { useEffect, useState } from "react";
import { getMetodos, eliminarMetodo } from "../../api/panelControlApi";
import FormMetodo from "./FormMetodo";

function ListaMetodo() {
  const [metodos, setMetodos] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [metodoEdit, setMetodoEdit] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchMetodos = async () => {
    try {
      const data = await getMetodos();
      
      setMetodos(Array.isArray(data) ? [...data].reverse() : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMetodos();
  }, []);

  const abrirEdicion = (metodo) => {
    setMetodoEdit(metodo);
    setFormVisible(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Eliminar este método de pago?")) {
      try {
        await eliminarMetodo(id);
        fetchMetodos();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const metodosFiltrados = metodos.filter((m) =>
    m.tipo_cobro?.toLowerCase().includes(search.toLowerCase())
  );

  
  const totalPages = Math.ceil(metodosFiltrados.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = metodosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page) => setCurrentPage(page);
  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () =>
    setCurrentPage((p) => Math.min(p + 1, totalPages));

  
  useEffect(() => {
    setCurrentPage(1);
  }, [search, metodos]);

  return (
    <div className="lo-container">
      
      <div className="lo-header-panel">
        <h2 className="lo-titulo">Métodos de Pago</h2>
        <div className="lo-actions-panel">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lo-search"
          />
          <button
            className="lo-agregar"
            onClick={() => {
              setMetodoEdit(null);
              setFormVisible(true);
            }}
          >
            + Agregar
          </button>
        </div>
      </div>

      {formVisible && (
        <FormMetodo
          metodo={metodoEdit}
          onClose={() => setFormVisible(false)}
          refreshList={fetchMetodos}
          metodosExistentes={metodos}
        />
      )}

      
      <div className="lo-list">
        {currentItems.length > 0 ? (
          currentItems.map((m) => (
            <div key={m.id_metodo_cobro} className="lo-card">
              <div className="lo-nombre">{m.tipo_cobro}</div>
              <div>
                <button className="lo-edit" onClick={() => abrirEdicion(m)}>
                  Editar
                </button>
                <button
                  className="lo-delete"
                  onClick={() => handleEliminar(m.id_metodo_cobro)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No hay métodos registrados.</p>
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
              className={`lo-page-number ${
                currentPage === page ? "active" : ""
              }`}
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
          flex-wrap: wrap;
          gap: 10px;
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
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
        }

        .lo-nombre {
          font-size: 16px;
          font-weight: 500;
          color: #000;
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

export default ListaMetodo;
