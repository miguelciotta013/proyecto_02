import React, { useEffect, useState } from 'react';
import TurnoList from '../../components/turnos/TurnoList';
import { obtenerTurnos } from '../../api/turnosApi';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ListadoTurnos.module.css';

export default function ListadoTurnos() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch(location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  async function fetch(params = '') {
    setLoading(true);
    try {
      const r = await obtenerTurnos(params);
      if (r && r.success) setTurnos(r.data || []);
      else alert(r?.error || 'Error al obtener turnos');
    } catch (e) {
      alert(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  // Filtrado local por nombre/apellido
  const filteredTurnos = turnos.filter(t => {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    const nombre = (t.paciente_nombre || '').toLowerCase();
    const apellido = (t.paciente_apellido || '').toLowerCase();
    return nombre.includes(q) || apellido.includes(q) || (`${nombre} ${apellido}`).includes(q);
  });

  return (
    <div className={styles['listado-turnos-container']}>
      <h2 className={styles['titulo-turnos']}>Turnos</h2>

      <div className={styles['controls-row']}>
        <div className={styles['search-wrapper']}>
          <input
            placeholder="Buscar por nombre o apellido..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles['search-input']}
          />
        </div>

        <div className={styles['nuevo-turno-container']}>
          <button
            className={styles['nuevo-turno-btn']}
            onClick={() => navigate('/turnos/nuevo')}
          >
            <span className={styles.icono}>＋</span> Nuevo turno
          </button>
        </div>
      </div>

      {loading ? <p className={styles['loading-text']}>Cargando...</p> :
        <TurnoList
          turnos={filteredTurnos}
          onVer={(id) => navigate(`/turnos/${id}`)}
        />
      }
    </div>
  );
}
