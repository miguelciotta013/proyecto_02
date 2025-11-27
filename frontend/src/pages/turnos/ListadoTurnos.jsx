// src/pages/turnos/ListadoTurnos.jsx
import React, { useEffect, useState } from 'react';
import { obtenerTurnos } from '../../api/turnosApi';
import { listPacientes } from '../../api/pacientesApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { showError } from '../../utils/alertas';
import styles from './ListadoTurnos.module.css';

export default function ListadoTurnos() {
  const [rows, setRows] = useState([]); // [{paciente, turnosActivos}]
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // DataTable state
  const [orderBy, setOrderBy] = useState('apellido');
  const [orderDir, setOrderDir] = useState('asc'); // 'asc' | 'desc'
  const [page, setPage] = useState(0); // 0-based
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.key]);

  useEffect(() => {
    setPage(0);
  }, [query]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [rp, rt] = await Promise.all([listPacientes(), obtenerTurnos()]);

      const pacientes = (rp && rp.success) ? (rp.data || []) : [];
      const turnos = (rt && rt.success) ? (rt.data || []) : [];

      const mapTurnos = {};
      turnos.forEach(t => {
        const pid = t.id_paciente || t.paciente || t.paciente_id;
        if (!pid) return;
        if (!mapTurnos[pid]) mapTurnos[pid] = [];
        mapTurnos[pid].push(t);
      });

      const combined = pacientes.map(p => {
        const pid = p.id_paciente ?? p.id ?? p.pk;
        const lista = mapTurnos[pid] || [];
        const activos = lista.filter(tt => {
          const estadoTxt = (tt.estado || tt.estado_turno || '').toLowerCase();
          return estadoTxt.includes('confirm');
        }).length;

        return {
          paciente: p,
          turnosActivos: activos,
        };
      });

      setRows(combined);
    } catch (e) {
      const msg = e.message || String(e);
      await showError('Error al cargar listado de turnos', msg);
    } finally {
      setLoading(false);
    }
  }

  const filtered = rows.filter(it => {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    const p = it.paciente;
    const nombre = (p.nombre_paciente || p.nombre || '').toLowerCase();
    const apellido = (p.apellido_paciente || p.apellido || '').toLowerCase();
    const dni = String(p.dni_paciente || p.dni || '').toLowerCase();
    return (
      nombre.includes(q) ||
      apellido.includes(q) ||
      `${nombre} ${apellido}`.includes(q) ||
      dni.includes(q)
    );
  });

  function sortRows(data) {
    const sorted = [...data];
    sorted.sort((a, b) => {
      const pa = a.paciente;
      const pb = b.paciente;

      const dniA = String(pa.dni_paciente ?? pa.dni ?? '').toLowerCase();
      const dniB = String(pb.dni_paciente ?? pb.dni ?? '').toLowerCase();

      const nombreA = (pa.nombre_paciente ?? pa.nombre ?? '').toLowerCase();
      const nombreB = (pb.nombre_paciente ?? pb.nombre ?? '').toLowerCase();

      const apellidoA = (pa.apellido_paciente ?? pa.apellido ?? '').toLowerCase();
      const apellidoB = (pb.apellido_paciente ?? pb.apellido ?? '').toLowerCase();

      let vA;
      let vB;

      switch (orderBy) {
        case 'dni':
          vA = dniA; vB = dniB;
          break;
        case 'nombre':
          vA = nombreA; vB = nombreB;
          break;
        case 'apellido':
          vA = apellidoA; vB = apellidoB;
          break;
        case 'activos':
          vA = a.turnosActivos;
          vB = b.turnosActivos;
          break;
        default:
          vA = apellidoA; vB = apellidoB;
      }

      if (vA < vB) return orderDir === 'asc' ? -1 : 1;
      if (vA > vB) return orderDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  const sorted = sortRows(filtered);
  const total = sorted.length;
  const start = page * rowsPerPage;
  const end = Math.min(start + rowsPerPage, total);
  const pageRows = sorted.slice(start, end);

  function handleVerTurnos(paciente) {
    const idp = paciente.id_paciente ?? paciente.id ?? paciente.pk;
    navigate(`/turnos/paciente/${idp}`, {
      state: {
        nombre: paciente.nombre_paciente ?? paciente.nombre,
        apellido: paciente.apellido_paciente ?? paciente.apellido,
        dni: paciente.dni_paciente ?? paciente.dni,
      },
    });
  }

  function handleSort(column) {
    if (orderBy === column) {
      setOrderDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(column);
      setOrderDir('asc');
    }
  }

  function handleChangeRowsPerPage(e) {
    const value = parseInt(e.target.value, 10);
    setRowsPerPage(value);
    setPage(0);
  }

  function goToPage(newPage) {
    if (newPage < 0) return;
    const maxPage = Math.max(Math.ceil(total / rowsPerPage) - 1, 0);
    if (newPage > maxPage) return;
    setPage(newPage);
  }

  const sortIcon = (col) => {
    if (orderBy !== col) return '⇅';
    return orderDir === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          &lt;
        </button>

        <div className={styles.headerCenter}>
          {/* Título simple: "Turnos" */}
          <h2 className={styles.title}>Turnos</h2>
        </div>

        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por DNI, nombre o apellido..."
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Cargando...</p>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort('dni')}>
                    DNI <span className={styles.sortIcon}>{sortIcon('dni')}</span>
                  </th>
                  <th onClick={() => handleSort('nombre')}>
                    Nombre <span className={styles.sortIcon}>{sortIcon('nombre')}</span>
                  </th>
                  <th onClick={() => handleSort('apellido')}>
                    Apellido <span className={styles.sortIcon}>{sortIcon('apellido')}</span>
                  </th>
                  <th onClick={() => handleSort('activos')}>
                    Turnos activos <span className={styles.sortIcon}>{sortIcon('activos')}</span>
                  </th>
                  <th>Ver turnos</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(({ paciente, turnosActivos }) => {
                  const dni = paciente.dni_paciente ?? paciente.dni ?? '';
                  const nombre = paciente.nombre_paciente ?? paciente.nombre ?? '-';
                  const apellido = paciente.apellido_paciente ?? paciente.apellido ?? '-';
                  return (
                    <tr key={paciente.id_paciente ?? paciente.id}>
                      <td>{dni}</td>
                      <td>{nombre}</td>
                      <td>{apellido}</td>
                      <td>
                        <span className={styles.badge}>
                          {turnosActivos}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.verBtn}
                          onClick={() => handleVerTurnos(paciente)}
                        >
                          Ver turnos
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!pageRows.length && (
                  <tr>
                    <td colSpan="5" className={styles.empty}>
                      No hay pacientes para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className={styles.paginationBar}>
              <div className={styles.rowsPerPage}>
                Filas por página:
                <select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
              <div className={styles.pageInfo}>
                {total === 0 ? '0–0' : `${start + 1}–${end}`} de {total}
              </div>
              <div className={styles.pageButtons}>
                <button onClick={() => goToPage(0)} disabled={page === 0}>
                  «
                </button>
                <button onClick={() => goToPage(page - 1)} disabled={page === 0}>
                  ‹
                </button>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={end >= total}
                >
                  ›
                </button>
                <button
                  onClick={() => goToPage(Math.max(Math.ceil(total / rowsPerPage) - 1, 0))}
                  disabled={end >= total}
                >
                  »
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
