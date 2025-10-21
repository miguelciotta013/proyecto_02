import React, { useEffect, useState } from "react";
import { getUsuarios } from "../../api/panelControlApi";
import FormUsuario from "./FormUsuario";

function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editUsuario, setEditUsuario] = useState(null);
  const [search, setSearch] = useState("");

  const fetchUsuarios = async () => {
    const data = await getUsuarios();
    setUsuarios(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleEditar = (usuario) => {
    setEditUsuario(usuario);
    setFormVisible(true);
  };

  const usuariosFiltrados = usuarios.filter(
    u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lo-container">
      <div className="lo-header-panel">
        <h2 className="lo-titulo">Usuarios</h2>
        <div className="lo-actions-panel">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="lo-search"
          />
          <button className="lo-agregar" onClick={() => { setEditUsuario(null); setFormVisible(true); }}>
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
            {usuariosFiltrados.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.first_name}</td>
                <td>{u.last_name}</td>
                <td>{u.email}</td>
                <td>
                  <button className="lo-edit" onClick={() => handleEditar(u)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay usuarios registrados.</p>
      )}

      <style>{`
        /* Contenedor general */
        .lo-container {
          width: 100%;
          padding: 20px;
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        }

        /* Panel superior */
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

        /* Tabla */
        .lo-table {
          width: 100%;
          border-collapse: collapse;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          border-radius: 8px;
          overflow: hidden;
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
          box-shadow: 0 6px 14px rgba(0,0,0,0.08);
        }

        /* Botón editar */
        .lo-edit {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .lo-edit:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}

export default ListaUsuarios;
