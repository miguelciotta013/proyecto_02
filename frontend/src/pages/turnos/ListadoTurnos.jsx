// src/pages/turnos/ListadoTurnos.jsx
import React, { useEffect, useState } from 'react';
import { obtenerTurnos } from '../../api/turnosApi';
import { listPacientes } from '../../api/pacientesApi';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ListadoTurnos.module.css';

export default function ListadoTurnos() {
  const [rows, setRows] = useState([]); // [{paciente, turnosActivos}]
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.key]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [rp, rt] = await Promise.all([listPacientes(), obtenerTurnos()]);

      const pacientes = (rp && rp.success) ? (rp.data || []) : [];
      const turnos = (rt && rt.success) ? (rt.data || []) : [];

      // agrupar turnos por paciente
      const mapTurnos = {};
      turnos.forEach(t => {
        const pid = t.id_paciente || t.paciente || t.paciente_id;
        if (!pid) return;
        if (!mapTurnos[pid]) mapTurnos[pid] = [];
        mapTurnos[pid].push(t);
      });

      // armar filas como en la imagen
      const combined = pacientes.map(p => {
        const pid = p.id_paciente ?? p.id ?? p.pk;
        const lista = mapTurnos[pid] || [];
        // contamos solo confirmados
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
      alert(e.message || String(e));
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

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          &lt;
        </button>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
          />
        </div>
        <h2 className={styles.title}>Turnos</h2>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.loading}>Cargando...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Turnos activos</th>
                <th>Ver turnos</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ paciente, turnosActivos }) => {
                const dni = paciente.dni_paciente ?? paciente.dni ?? '';
                const nombre = paciente.nombre_paciente ?? paciente.nombre ?? '-';
                const apellido = paciente.apellido_paciente ?? paciente.apellido ?? '-';
                return (
                  <tr key={paciente.id_paciente ?? paciente.id}>
                    <td>{dni}</td>
                    <td>{nombre}</td>
                    <td>{apellido}</td>
                    <td>{turnosActivos}</td>
                    <td>
                      <button
                        className={styles.verBtn}
                        onClick={() => handleVerTurnos(paciente)}
                      >
                        👤
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan="5" className={styles.empty}>
                    No hay pacientes para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
