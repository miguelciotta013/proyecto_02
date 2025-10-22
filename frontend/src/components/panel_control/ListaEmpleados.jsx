import React, { useEffect, useState } from "react";
import { getEmpleados, eliminarEmpleado } from "../../api/panelControlApi";
import FormEmpleado from "./FormEmpleado";

function ListaEmpleados({ onVolver }) {
  const [empleados, setEmpleados] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [empleadoEdit, setEmpleadoEdit] = useState(null);
  const [search, setSearch] = useState("");

  const fetchEmpleados = async () => {
    const data = await getEmpleados();
    setEmpleados(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchEmpleados(); }, []);

  const abrirEdicion = (emp) => {
    setEmpleadoEdit(emp);
    setFormVisible(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Eliminar al empleado "${nombre}"?`)) {
      try {
        await eliminarEmpleado(id);
        fetchEmpleados();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const empleadosFiltrados = empleados.filter(emp =>
    emp.user_info?.username.toLowerCase().includes(search.toLowerCase()) ||
    emp.user_info?.first_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.user_info?.last_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.rol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lo-container">
      
      <div className="lo-header-panel">
        
        <h2 className="lo-titulo">Empleados</h2>
        <div className="lo-actions-panel">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="lo-search"
          />
          <button className="lo-agregar" onClick={() => { setEmpleadoEdit(null); setFormVisible(true); }}>
            + Agregar
          </button>
        </div>
      </div>

      {formVisible && (
        <FormEmpleado
          empleado={empleadoEdit}
          onClose={() => setFormVisible(false)}
          refresh={fetchEmpleados}
        />
      )}

      {empleadosFiltrados.length > 0 ? (
        <table className="lo-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosFiltrados.map(emp => (
              <tr key={emp.id_empleado}>
                <td>{emp.user_info?.username}</td>
                <td>{emp.user_info?.first_name}</td>
                <td>{emp.user_info?.last_name}</td>
                <td>{emp.rol}</td>
                <td>
                  <button className="lo-edit" onClick={() => abrirEdicion(emp)}>Editar</button>
                  <button className="lo-delete" onClick={() => handleEliminar(emp.id_empleado, emp.user_info?.username)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay empleados registrados.</p>
      )}

      <style>{`
        .lo-container {
          width: 100%;
          padding: 20px;
          font-family: 'Segoe UI', Roboto, Arial, sans-serif;
        }

        /* Header azul y título centrado */
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
        .volver-btn {
          background: white;
          color: #1E56A8;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          flex-shrink: 0;
        }
        .volver-btn:hover {
          background: #e0e0e0;
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

        /* Tabla estilo panel */
        .lo-table {
          width: 100%;
          border-collapse: collapse;
        }
        .lo-table th, .lo-table td {
          border: 1px solid #e0e0e0;
          padding: 10px;
          text-align: left;
        }
        .lo-table th { background: #f3f4f6; }
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

export default ListaEmpleados;
