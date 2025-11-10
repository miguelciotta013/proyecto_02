import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCajaDetail, addIngreso, addEgreso, cierreCaja } from '../../api/cajasApi';
import MovimientoForm from '../../components/cajas/MovimientoForm';
import styles from './detalleCaja.module.css';

export default function DetalleCaja() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchDetalle() {
    setLoading(true);
    try {
      const resp = await getCajaDetail(id);
      if (resp && resp.success) setCaja(resp.data);
      else alert(resp.error || 'Error al obtener detalle');
    } catch (e) {
      console.error(e);
      alert('Error al obtener detalle');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDetalle();
  }, [id]);

  async function handleIngreso(payload) {
    try {
      const resp = await addIngreso(id, payload);
      if (resp && resp.success) {
        await fetchDetalle();
        window.dispatchEvent(new Event('cajasUpdated'));
      } else alert(resp.error || 'Error registrando ingreso');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error registrando ingreso');
    }
  }

  async function handleEgreso(payload) {
    try {
      const resp = await addEgreso(id, payload);
      if (resp && resp.success) {
        await fetchDetalle();
        window.dispatchEvent(new Event('cajasUpdated'));
      } else alert(resp.error || 'Error registrando egreso');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error registrando egreso');
    }
  }

  async function handleCierre() {
    try {
      const payload = { monto_cierre: montoCierre };
      const resp = await cierreCaja(id, payload);
      if (resp && resp.success) {
        alert('Caja cerrada correctamente');
        await fetchDetalle();
        window.dispatchEvent(new Event('cajasUpdated'));
      } else alert(resp.error || 'Error cerrando caja');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error cerrando caja');
    }
  }

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (!caja) return <div className={styles.error}>No se encontró la caja</div>;

  const apertura = Number(caja.resumen?.monto_apertura ?? 0);
  const totalIngresos = Number(caja.resumen?.total_ingresos ?? 0);
  const totalEgresos = Number(caja.resumen?.total_egresos ?? 0);
  const totalCobros = Number(caja.resumen?.total_cobros ?? 0);
  const totalEsperado = apertura + totalIngresos + totalCobros - totalEgresos;
  const montoCierre = totalEsperado;

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <button className={`${styles.btn} ${styles.btnGray}`} onClick={() => navigate('/cajas')}>
          ← Volver
        </button>
        <h2 className={styles.title}>Detalle de Caja #{caja.id_caja}</h2>
      </div>

      <div className={styles.dashboard}>
        <div className={styles.card}>
          <h3>Información</h3>
          {/*<p><strong>Cajero:</strong> {caja.empleado_nombre || '—'}</p> */}
          <p><strong>Apertura:</strong> {caja.fecha_hora_apertura}</p>
          <p><strong>Cierre:</strong> {caja.fecha_hora_cierre || '—'}</p>
          <p>
            <strong>Estado:</strong>{' '}
            <span className={caja.estado_caja === 1 ? styles.abierta : styles.cerrada}>
              {caja.estado_caja === 1 ? 'Abierta' : 'Cerrada'}
            </span>
          </p>
        </div>

        <div className={styles.card}>
          <h3>Resumen</h3>
          <p>Total apertura: <strong>${apertura}</strong></p>
          <p>Total ingresos: <strong>${totalIngresos}</strong></p>
          <p>Total egresos: <strong>${totalEgresos}</strong></p>
          <p>Total cobros: <strong>${totalCobros}</strong></p>
          <hr />
          {/* <p>Total esperado: <strong>${totalEsperado}</strong></p> */}

          <p>Monto cierre : <strong>${montoCierre}</strong></p>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Movimientos</h3>
        <div className={styles.movimientos}>
          <div>
            <h4>Ingresos</h4>
            <ul>
              {(caja.ingresos || []).map(i => (
                <li key={i.id_ingreso}>
                  {i.descripcion || '—'} — <strong>${i.monto || 0}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Egresos</h4>
            <ul>
              {(caja.egresos || []).map(e => (
                <li key={e.id_egreso}>
                  {e.descripcion || '—'} — <strong>${e.monto || 0}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {caja.estado_caja === 1 && (
        <div className={styles.formSection}>
          <h4>Registrar Ingreso</h4>
          <MovimientoForm type="ingreso" onSubmit={handleIngreso} />

          <h4>Registrar Egreso</h4>
          <MovimientoForm type="egreso" onSubmit={handleEgreso} />

          <button className={`${styles.btn} ${styles.btnRed}`} onClick={handleCierre}>
            Cerrar caja automáticamente (${montoCierre})
          </button>
        </div>
      )}
    </div>
  );
}
