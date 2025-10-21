import React, { useEffect, useState } from 'react';
import { listCajas, aperturaCaja, cierreCaja } from '../../api/cajasApi';
import CajaTable from '../../components/cajas/cajaTable';
import AperturaForm from '../../components/cajas/AperturaForm';
import CierreForm from '../../components/cajas/CierreForm';
import { useNavigate } from 'react-router-dom';
import styles from './listaCajas.module.css';

export default function ListaCajas() {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [closingCajaId, setClosingCajaId] = useState(null);
  const [showCerrarModal, setShowCerrarModal] = useState(false);

  async function fetchCajas() {
    setLoading(true);
    try {
      const resp = await listCajas();
      if (resp && resp.success) {
        setCajas(resp.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCajas();
  }, []);

  async function handleApertura(payload) {
    try {
      const resp = await aperturaCaja(payload);
      if (resp && resp.success) {
        navigate(`/caja/${resp.data.id_caja}`);
      } else {
        const msg = resp && (resp.error || resp.message) ? (resp.error || resp.message) : 'Error al abrir caja';
        alert(msg);
      }
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error al abrir caja');
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Cajas</h2>

      <div className={styles.aperturaForm}>
        <AperturaForm onSubmit={handleApertura} />
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : (
        <CajaTable
          items={cajas}
          onView={(id) => navigate(`/caja/${id}`)}
          onClose={(idCaja) => {
            setClosingCajaId(idCaja);
            setShowCerrarModal(true);
          }}
        />
      )}

      {showCerrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Cerrar caja #{closingCajaId}</h3>
            <CierreForm
              onSubmit={async (data) => {
                try {
                  const resp = await cierreCaja(closingCajaId, data);
                  if (resp && resp.success) {
                    alert('Caja cerrada correctamente');
                    setShowCerrarModal(false);
                    setClosingCajaId(null);
                    fetchCajas();
                  } else {
                    const msg = resp && (resp.error || resp.message) ? (resp.error || resp.message) : 'Error cerrando caja';
                    alert(msg);
                  }
                } catch (e) {
                  console.error(e);
                  alert(e.message || 'Error cerrando caja');
                }
              }}
            />
            <div className={styles.modalActions}>
              <button onClick={() => { setShowCerrarModal(false); setClosingCajaId(null); }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
