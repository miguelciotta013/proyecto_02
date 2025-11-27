// src/pages/turnos/PacienteTurnos.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { obtenerTurnos } from '../../api/turnosApi';
import { showError } from '../../utils/alertas';
import styles from './PacienteTurnos.module.css';

export default function PacienteTurnos() {
  const { id } = useParams();          // id del paciente
  const navigate = useNavigate();
  const location = useLocation();
  const pacienteInfo = location.state || {}; // nombre, apellido, dni

  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // DataTable: orden + paginación
  const [orderBy, setOrderBy] = useState('fecha_turno'); // 'fecha_turno' | 'hora_turno' | 'estado'
  const [orderDir, setOrderDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  async function fetchTurnos() {
    setLoading(true);
    try {
      const r = await obtenerTurnos(`?id_paciente=${id}`);
      if (r && r.success) {
        setTurnos(r.data || []);
      } else {
        const msg = r?.error || 'No se pudieron obtener los turnos de este paciente';
        await showError('Error al cargar turnos', msg);
      }
    } catch (e) {
      const msg = e.message || String(e);
      await showError('Error al cargar turnos', msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTurnos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    setPage(0);
  }, [id]);

  function handleDetalle(id_turno) {
    navigate(`/turnos/${id_turno}`, {
      state: {
        fromPatient: true,
        patientId: Number(id),
        nombre: pacienteInfo.nombre,
        apellido: pacienteInfo.apellido,
      },
    });
  }

  function handleAgregar() {
    navigate('/turnos/nuevo', {
      state: {
        fromPatient: true,
        id_paciente: Number(id),
        paciente_nombre: pacienteInfo.nombre,
        paciente_apellido: pacienteInfo.apellido,
      },
    });
  }

  function sortTurnos(data) {
    const sorted = [...data];
    sorted.sort((a, b) => {
      const fechaA = (a.fecha_turno || '').toString();
      const fechaB = (b.fecha_turno || '').toString();
      const horaA = (a.hora_turno || '').toString();
      const horaB = (b.hora_turno || '').toString();
      const estadoA = (a.estado || '').toLowerCase();
      const estadoB = (b.estado || '').toLowerCase();

      let vA;
      let vB;

      switch (orderBy) {
        case 'hora_turno':
          vA = `${fechaA} ${horaA}`;
          vB = `${fechaB} ${horaB}`;
          break;
        case 'estado':
          vA = estadoA;
          vB = estadoB;
          break;
        case 'fecha_turno':
        default:
          vA = `${fechaA} ${horaA}`;
          vB = `${fechaB} ${horaB}`;
          break;
      }

      if (vA < vB) return orderDir === 'asc' ? -1 : 1;
      if (vA > vB) return orderDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  const sorted = sortTurnos(turnos);
  const total = sorted.length;
  const start = page * rowsPerPage;
  const end = Math.min(start + rowsPerPage, total);
  const pageRows = sorted.slice(start, end);

  function handleSort(col) {
    if (orderBy === col) {
      setOrderDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(col);
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

  // Helper para clases de estado (colores)
  function getEstadoClass(estadoRaw) {
    const txt = (estadoRaw || 'Confirmado').toLowerCase();
    if (txt.includes('confirm')) return styles.estadoConfirmado;
    if (txt.includes('cancel')) return styles.estadoCancelado;
    if (txt.includes('atend')) return styles.estadoAtendido;
    return styles.estadoDefault;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerBar}>
        <button className={styles.backBtn} onClick={() => navigate('/turnos')}>
          &lt;
        </button>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>
            Turnos de {pacienteInfo.nombre} {pacienteInfo.apellido}
          </h2>
          {pacienteInfo.dni && (
            <p className={styles.subtitle}>DNI: {pacienteInfo.dni}</p>
          )}
        </div>
        <button className={styles.addBtn} onClick={handleAgregar}>
          + Agregar
        </button>
      </div>

      {loading ? (
        <p className={styles.loading}>Cargando turnos...</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('estado')}>
                  Estado <span className={styles.sortIcon}>{sortIcon('estado')}</span>
                </th>
                <th onClick={() => handleSort('fecha_turno')}>
                  Fecha <span className={styles.sortIcon}>{sortIcon('fecha_turno')}</span>
                </th>
                <th onClick={() => handleSort('hora_turno')}>
                  Hora <span className={styles.sortIcon}>{sortIcon('hora_turno')}</span>
                </th>
                <th>Asunto</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.empty}>
                    No hay turnos para este paciente.
                  </td>
                </tr>
              ) : (
                pageRows.map((t) => {
                  const estadoTexto = t.estado || 'Confirmado';
                  const estadoClass = getEstadoClass(estadoTexto);

                  return (
                    <tr key={t.id_turno}>
                      <td>
                        <span className={`${styles.estadoBadge} ${estadoClass}`}>
                          {estadoTexto}
                        </span>
                      </td>
                      <td>{(t.fecha_turno || '').slice(0, 10)}</td>
                      <td>{(t.hora_turno || '').slice(0, 5)}</td>
                      <td>{t.asunto || '-'}</td>
                      <td>
                        <button
                          className={styles.detailBtn}
                          onClick={() => handleDetalle(t.id_turno)}
                          title="Ver detalle del turno"
                          type="button"
                        >
                          <span className={styles.detailIcon} aria-hidden="true" />
                          <span className={styles.detailText}>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
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
                onClick={() =>
                  goToPage(Math.max(Math.ceil(total / rowsPerPage) - 1, 0))
                }
                disabled={end >= total}
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

