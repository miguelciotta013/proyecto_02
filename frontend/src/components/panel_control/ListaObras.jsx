import React, { useEffect, useState } from "react";
import { getObrasSociales, eliminarObraSocial } from "../../api/panelControlApi";
import FormObra from "./FormObra";

function ListaObras() {
  const [obras, setObras] = useState([]);
  const [obraEditando, setObraEditando] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [search, setSearch] = useState("");

  const cargarObras = async () => {
    const data = await getObrasSociales();
    setObras(Array.isArray(data) ? data.filter(o => !o.eliminado) : []);
  };

  useEffect(() => { cargarObras(); }, []);

  const handleEliminar = async (obra) => {
    if (window.confirm(`¿Eliminar la obra social "${obra.nombre_os}"?`)) {
      await eliminarObraSocial(obra.id_obra_social);
      cargarObras();
    }
  };

  const obrasFiltradas = obras.filter(o => o.nombre_os.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="lo-container">
      <div className="lo-header-panel">
        <h2 className="lo-titulo">Obras Sociales</h2>
        <div className="lo-actions-panel">
          <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="lo-search" />
          <button className="lo-agregar" onClick={() => { setObraEditando(null); setModalAbierto(true); }}>+ Agregar</button>
        </div>
      </div>

      {modalAbierto && <FormObra obra={obraEditando} onClose={() => setModalAbierto(false)} fetchObras={cargarObras} />}

      <div className="lo-list">
        {obrasFiltradas.length > 0 ? obrasFiltradas.map((obra) => (
          <div key={obra.id_obra_social} className="lo-card">
            <div className="lo-nombre">{obra.nombre_os}</div>
            <div>
              <button className="lo-edit" onClick={() => { setObraEditando(obra); setModalAbierto(true); }}>Editar</button>
              <button className="lo-delete" onClick={() => handleEliminar(obra)}>Eliminar</button>
            </div>
          </div>
        )) : <p>No hay obras sociales registradas.</p>}
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

export default ListaObras;
