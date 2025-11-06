import React, { useEffect, useState } from "react";
import { getEmpleados, eliminarEmpleado } from "../../api/panelControlApi";
import FormEmpleado from "./FormEmpleado";

function ListaEmpleados({ onVolver }) {
  const [empleados, setEmpleados] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [empleadoEdit, setEmpleadoEdit] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEmpleados = async () => {
    const data = await getEmpleados();
    
    setEmpleados(Array.isArray(data) ? [...data].reverse() : []);
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const abrirEdicion = (emp) => {
    setEmpleadoEdit(emp);
    setFormVisible(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Eliminar al empleado "${nombre}"?`)) {
      try {
        setEmpleados((prev) => prev.filter((emp) => emp.id_empleado !== id));
        await eliminarEmpleado(id);
      } catch {
        
      }
    }
  };

  const empleadosFiltrados = empleados.filter(
    (emp) =>
      emp.user_info?.username.toLowerCase().includes(search.toLowerCase()) ||
      emp.user_info?.first_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.user_info?.last_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.rol.toLowerCase().includes(search.toLowerCase())
  );

 
  const totalPages = Math.ceil(empleadosFiltrados.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = empleadosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page) => setCurrentPage(page);
  const goToPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="lo-container">
      <div className="lo-header-panel">
        <h2 className="lo-titulo">Empleados</h2>
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
              setEmpleadoEdit(null);
              setFormVisible(true);
            }}
          >
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

      {currentItems.length > 0 ? (
        <>
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
              {currentItems.map((emp) => (
                <tr key={emp.id_empleado}>
                  <td>{emp.user_info?.username}</td>
                  <td>{emp.user_info?.first_name}</td>
                  <td>{emp.user_info?.last_name}</td>
                  <td>{emp.rol}</td>
                  <td>
                    <button className="lo-edit" onClick={() => abrirEdicion(emp)}>
                      Editar
                    </button>
                    <button
                      className="lo-delete"
                      onClick={() =>
                        handleEliminar(emp.id_empleado, emp.user_info?.username)
                      }
                    >
                      Eliminar
                    </button>
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
        <p>No hay empleados registrados.</p>
      )}

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
          padding: 6px 10px;
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

        .lo-edit:hover { background: #2563eb; }

        .lo-delete {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .lo-delete:hover { background: #dc2626; }

        
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

export default ListaEmpleados;
