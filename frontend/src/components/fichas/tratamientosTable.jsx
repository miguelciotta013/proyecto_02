import React, { useState, useEffect } from 'react';
import styles from './tratamientosTable.module.css';
import { useNavigate } from 'react-router-dom';
import {getCajaAbierta } from '../../api/fichasApi';


function TratamientosTable({ tratamientos, onVerFicha, onVerOdontograma, onVerCobro, onFilterChange, idPaciente }) {
  const navigate = useNavigate();
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');

  // -----------------------
  // ESTADO DE CAJA ABIERTA
  // -----------------------
  const [hayCajaAbierta, setHayCajaAbierta] = useState(false);

  useEffect(() => {
    verificarCaja();
  }, []);

  async function verificarCaja() {
    try {
      const resp = await getCajaAbierta();

      if (resp.data.success && resp.data.data.length > 0) {
        setHayCajaAbierta(true);
      } else {
        setHayCajaAbierta(false);
      }
    } catch {
      setHayCajaAbierta(false);
    }
  }

  // -----------------------
  // PAGINACIÓN
  // -----------------------
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(tratamientos.length / itemsPerPage);
  const indexStart = (currentPage - 1) * itemsPerPage;
  const indexEnd = indexStart + itemsPerPage;

  const tratamientosPagina = tratamientos.slice(indexStart, indexEnd);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  // -----------------------

  const handleEstadoChange = (e) => {
    const estado = e.target.value;
    setEstadoSeleccionado(estado);

    if (onFilterChange) {
      onFilterChange({ estado_pago: estado });
    }

    setCurrentPage(1); // reset paginación
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
          <option>Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="parcial">Parcial</option>
        </select>
      </div>

      {/* Tabla */}
      {tratamientos.length === 0 ? (
        <div className={styles.noResults}>
          <p>No se encontraron tratamientos{estadoSeleccionado && ` con estado "${estadoSeleccionado}"`}</p>
        </div>
      ) : (
        <>
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
                {tratamientosPagina.map((ficha) => (
                  <tr key={ficha.id_ficha_medica}>
                    <td>{ficha.fecha_creacion}</td>

                    {/* Tratamientos */}
                    <td>
                      {ficha.detalles?.length ? (
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

                    {/* Diente/cara */}
                    <td>
                      {ficha.detalles?.length ? (
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

                    {/* Monto */}
                    <td className={styles.montoCell}>
                      {ficha.cobro
                        ? parseFloat(ficha.cobro.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>

                    {/* Estado */}
                    <td>
                      {ficha.cobro ? (
                        <span className={`${styles.badge} ${getEstadoBadge(ficha.cobro.estado_pago)}`}>
                          {ficha.cobro.estado_pago}
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeSecondary}`}>Sin cobro</span>
                      )}
                    </td>

                    {/* Acciones */}
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

                        {/* ⬇ BOTÓN DE COBRO MODIFICADO ⬇ */}
                        {ficha.cobro &&
                          hayCajaAbierta &&
                          ficha.cobro.estado_pago !== 'pagado' && (
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

          {/* Paginación */}
          <div className={styles.pagination}>
            <button className={styles.pageBtn} onClick={prevPage} disabled={currentPage === 1}>
              «
            </button>

            <span className={styles.pageNumber}>{currentPage} de {totalPages}</span>

            <button className={styles.pageBtn} onClick={nextPage} disabled={currentPage === totalPages}>
              »
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TratamientosTable;
