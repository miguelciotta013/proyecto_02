import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCajaDetail, addIngreso, addEgreso, cierreCaja } from '../../api/cajasApi';
import MovimientoForm from '../../components/cajas/MovimientoForm';
import CierreForm from '../../components/cajas/CierreForm';
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
        try { window.dispatchEvent(new Event('cajasUpdated')); } catch (e) {}
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
        try { window.dispatchEvent(new Event('cajasUpdated')); } catch (e) {}
      } else alert(resp.error || 'Error registrando egreso');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error registrando egreso');
    }
  }

  async function handleCierre(payload) {
    try {
      const resp = await cierreCaja(id, payload);
      if (resp && resp.success) {
        alert('Caja cerrada');
        await fetchDetalle();
        try { window.dispatchEvent(new Event('cajasUpdated')); } catch (e) {}
      } else alert(resp.error || 'Error cerrando caja');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error cerrando caja');
    }
  }

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (!caja) return <div className={styles.error}>No se encontró la caja</div>;

  // --- Cálculo seguro del monto de cierre ---
  const apertura = Number(caja.resumen?.monto_apertura ?? 0);
  const totalIngresos = Number(caja.resumen?.total_ingresos ?? 0);
  const totalEgresos = Number(caja.resumen?.total_egresos ?? 0);
  const totalCobros = Number(caja.resumen?.total_cobros ?? 0);

  const montoCierre = caja.resumen?.monto_cierre != null
    ? Number(caja.resumen.monto_cierre)
    : apertura + totalIngresos + totalCobros - totalEgresos;

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate('/cajas')}>
        ← Volver a Cajas
      </button>

      <h2 className={styles.title}>Detalle Caja #{caja.id_caja}</h2>

      {/* Dashboard: Información + Resumen */}
      <div className={styles.dashboard}>
        {/* Información principal */}
        <div className={styles.card}>
          <div><strong>Cajero</strong> {caja.empleado_nombre || caja.empleado || 'cajero'}</div>
          <div><strong>Apertura:</strong> {caja.fecha_hora_apertura}</div>
          <div><strong>Cierre:</strong> {caja.fecha_hora_cierre || '—'}</div>
          <div>
            <strong>Estado:</strong>{' '}
            <span className={caja.estado_caja === 1 ? styles.abierta : styles.cerrada}>
              {caja.estado_caja === 1 ? 'Abierta' : 'Cerrada'}
            </span>
          </div>
        </div>

        {/* Resumen */}
        <div className={styles.resumen}>
          <h3>Resumen</h3>
          <p>Total apertura: <strong>${apertura}</strong></p>
          <p>Total ingresos: <strong>${totalIngresos}</strong></p>
          <p>Total egresos: <strong>${totalEgresos}</strong></p>
          <p>Total cobros: <strong>${caja.resumen?.total_cobros ?? 0}</strong></p>
          <p>Total esperado: <strong>${caja.resumen?.total_esperado ?? 0}</strong></p>
          <p>Monto cierre: <strong>${montoCierre}</strong></p>
          {caja.resumen?.diferencia != null && (
            <p>Diferencia: <strong>${caja.resumen.diferencia}</strong></p>
          )}
        </div>
      </div>

      {/* Movimientos */}
      <div className={styles.section}>
        <h3>Movimientos</h3>
        <div className={styles.movimientos}>
          <div>
            <h4>Ingresos</h4>
            <ul>
              {(caja.ingresos || []).map(i => (
                <li key={i.id_ingreso}>
                  {(i.descripcion || i.descripcion_ingreso || '')} — <strong>${(i.monto || i.monto_ingreso || 0)}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Egresos</h4>
            <ul>
              {(caja.egresos || []).map(e => (
                <li key={e.id_egreso}>
                  {(e.descripcion || e.descripcion_egreso || '')} — <strong>${(e.monto || e.monto_egreso || 0)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Formularios solo si la caja está abierta */}
      {caja.estado_caja === 1 && (
        <div className={styles.formSection}>
          <h4>Registrar Ingreso</h4>
          <MovimientoForm type="ingreso" onSubmit={handleIngreso} />

          <h4>Registrar Egreso</h4>
          <MovimientoForm type="egreso" onSubmit={handleEgreso} />

          <h4>Cierre de Caja</h4>
          <CierreForm onSubmit={handleCierre} montoCalculado={montoCierre} />
        </div>
      )}
    </div>
  );
}
