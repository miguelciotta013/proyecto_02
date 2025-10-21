import React, { useEffect, useState } from "react";
import { getMetodos, eliminarMetodo } from "../../api/panelControlApi";
import FormMetodo from "./FormMetodo";

function ListaMetodo() {
  const [metodos, setMetodos] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [metodoEdit, setMetodoEdit] = useState(null);
  const [search, setSearch] = useState("");

  const fetchMetodos = async () => {
    try {
      const data = await getMetodos();
      setMetodos(Array.isArray(data) ? data : []);
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
    m.tipo_cobro.toLowerCase().includes(search.toLowerCase())
  );

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

      {formVisible && <FormMetodo metodo={metodoEdit} onClose={() => setFormVisible(false)} />}

      <div className="lo-list">
        {metodosFiltrados.length > 0 ? (
          metodosFiltrados.map((m) => (
            <div key={m.id_metodo_cobro} className="lo-card">
              <div className="lo-nombre">{m.tipo_cobro}</div>
              <div>
                <button className="lo-edit" onClick={() => abrirEdicion(m)}>
                  Editar
                </button>
                <button className="lo-delete" onClick={() => handleEliminar(m.id_metodo_cobro)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No hay métodos registrados.</p>
        )}
      </div>

      <style>{`
        /* Contenedor general */
        .lo-container {
          width: 100%;
          padding: 20px;
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        }

        /* Header panel azul con título centrado */
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

        /* Panel de acciones: búsqueda + botón */
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

        /* Lista de tarjetas */
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

        /* Nombre dentro de la tarjeta */
        .lo-nombre {
          font-size: 16px;
          color: #000000ff;
          font-weight: 500;
        }

        /* Botones editar / eliminar */
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

export default ListaMetodo;
