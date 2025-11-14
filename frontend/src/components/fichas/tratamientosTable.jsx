import React, { useState } from 'react';
import styles from './tratamientosTable.module.css';
import { useNavigate } from 'react-router-dom';

function TratamientosTable({ tratamientos, onVerFicha, onVerOdontograma, onVerCobro, onFilterChange, idPaciente }) {
  const navigate = useNavigate();
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');

  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    setEstadoSeleccionado(estado);
    
    if (onFilterChange) {
      onFilterChange({ estado_pago: estado });
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'pendiente': styles.badgeWarning,
      'pagado': styles.badgeSuccess,
      'parcial': styles.badgeInfo
    };
    return estados[estado?.toLowerCase()] || styles.badgeSecondary;
  };

  return (
    <div className={styles.tableWrapper}>
      {/* Filtro Simple */}
      <div className={styles.filtroSimple}>
        <label className={styles.filtroLabel}>Filtrar por Estado de Pago:</label>
        <select
          className={styles.filtroSelect}
          value={estadoSeleccionado}
          onChange={handleEstadoChange}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="parcial">Parcial</option>
        </select>
      </div>

      {/* Tabla de Resultados */}
      {tratamientos.length === 0 ? (
        <div className={styles.noResults}>
          <p>No se encontraron tratamientos{estadoSeleccionado && ` con estado "${estadoSeleccionado}"`}</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tratamiento(s)</th>
                <th>Diente/Cara</th>
                <th>Monto Total</th>
                <th>Estado Cobro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tratamientos.map((ficha) => (
                <tr key={ficha.id_ficha_medica}>
                  <td>{ficha.fecha_creacion}</td>
                  <td>
                    {ficha.detalles && ficha.detalles.length > 0 ? (
                      <div className={styles.detallesList}>
                        {ficha.detalles.map((det, idx) => (
                          <div key={idx} className={styles.detalleItem}>
                            • {det.tratamiento || 'Sin nombre'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className={styles.noData}>Sin tratamientos</span>
                    )}
                  </td>
                  <td>
                    {ficha.detalles && ficha.detalles.length > 0 ? (
                      <div className={styles.detallesList}>
                        {ficha.detalles.map((det, idx) => (
                          <div key={idx} className={styles.detalleItem}>
                            {det.diente || det.id_diente || '-'} - {det.cara || '-'}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className={styles.noData}>-</span>
                    )}
                  </td>
                  <td className={styles.montoCell}>
                    {ficha.cobro ? `${parseFloat(ficha.cobro.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td>
                    {ficha.cobro ? (
                      <span className={`${styles.badge} ${getEstadoBadge(ficha.cobro.estado_pago)}`}>
                        {ficha.cobro.estado_pago}
                      </span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeSecondary}`}>Sin cobro</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.accionesContainer}>
                      <button
                        className={styles.btnAccion}
                        onClick={() => onVerFicha(ficha)}
                        title="Ver ficha médica"
                      >
                        Ficha
                      </button>
                      <button 
                        className={`${styles.btnAccion} ${styles.btnOdonto}`}
                        onClick={() => navigate(`/odontograma/${idPaciente}/${ficha.id_ficha_medica}`)}
                        title="Ver odontograma"
                      >
                        Odontograma
                      </button>
                      {ficha.cobro && (
                        <button
                          className={`${styles.btnAccion} ${styles.btnCobro}`}
                          onClick={() => onVerCobro(ficha.cobro)}
                          title="Ver cobro"
                        >
                          Cobro
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TratamientosTable;