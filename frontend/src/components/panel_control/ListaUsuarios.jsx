import React, { useEffect, useState } from "react";
import { getUsuarios, toggleUsuarioActivo } from "../../api/panelControlApi";
import FormUsuario from "./FormUsuario";

function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editUsuario, setEditUsuario] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsuarios = async () => {
    const data = await getUsuarios();
    const sorted = Array.isArray(data)
      ? [...data].sort((a, b) => b.id - a.id)
      : [];
    setUsuarios(sorted);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleEditar = (usuario) => {
    setEditUsuario(usuario);
    setFormVisible(true);
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = usuariosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, usuarios]);

  return (
    <div className="lo-container">
      
      <div className="lo-header-panel">
        <h2 className="lo-titulo">Usuarios</h2>
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
              setEditUsuario(null);
              setFormVisible(true);
            }}
          >
            + Agregar
          </button>
        </div>
      </div>

      
      {formVisible && (
        <FormUsuario
          usuario={editUsuario}
          onClose={() => setFormVisible(false)}
          fetchUsuarios={fetchUsuarios}
          usuariosExistentes={usuarios}
        />
      )}

      
      {usuariosFiltrados.length > 0 ? (
        <>
          <table className="lo-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((u) => (
                <tr key={u.id} style={{ color: u.is_active ? "inherit" : "#aaa" }}>
                  <td>{u.username}</td>
                  <td>{u.first_name}</td>
                  <td>{u.last_name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.is_active ? (
                      <>
                        <button className="lo-edit" onClick={() => handleEditar(u)}>
                          Editar
                        </button>
                        <button
                          className="lo-disable"
                          onClick={async () => {
                            await toggleUsuarioActivo(u.id, false);
                            fetchUsuarios();
                          }}
                        >
                          Inhabilitar
                        </button>
                      </>
                    ) : (
                      <button
                        className="lo-restore"
                        onClick={async () => {
                          await toggleUsuarioActivo(u.id, true);
                          fetchUsuarios();
                        }}
                      >
                        Restaurar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          
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
        </>
      ) : (
        <p>No hay usuarios registrados.</p>
      )}

      
      <style>{`
        /* ===========================
           CONTENEDOR Y PANEL SUPERIOR
        ============================ */
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
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .lo-table th,
        .lo-table td {
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
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
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
          margin-left: 5px;
        }

        .lo-disable:hover {
          background: #ef4444;
        }

        .lo-restore {
          background: #34d399;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .lo-restore:hover {
          background: #10b981;
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

export default ListaUsuarios;
