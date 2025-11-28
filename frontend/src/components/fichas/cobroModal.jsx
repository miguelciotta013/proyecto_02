import React, { useState, useEffect } from 'react';
import { updateCobro, getMetodosCobro, getCajaAbierta } from '../../api/fichasApi';
import styles from './cobroModal.module.css';

function CobroModal({ cobro, onClose, onUpdate }) {
  const [metodosCobro, setMetodosCobro] = useState([]);
  const [formData, setFormData] = useState({
    id_metodo_cobro: cobro.metodo_cobro || cobro.id_metodo_cobro || '',
    monto_pagado_paciente: 0,
    monto_pagado_obra_social: 0
  });
  const [hayCajaAbierta, setHayCajaAbierta] = useState(false);

  useEffect(() => {
    verificarCaja();
    fetchMetodosCobro();
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

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchMetodosCobro();
  }, []);

  const fetchMetodosCobro = async () => {
    try {
      const response = await getMetodosCobro();
      if (response.data.success) {
        setMetodosCobro(response.data.data);

        if (cobro.metodo_cobro && typeof cobro.metodo_cobro === 'string') {
          const metodo = response.data.data.find(
            (m) => m.tipo_cobro.toLowerCase() === cobro.metodo_cobro.toLowerCase()
          );
          if (metodo) {
            setFormData((prev) => ({
              ...prev,
              id_metodo_cobro: metodo.id_metodo_cobro
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar métodos de cobro:', error);
      alert('Error al cargar los métodos de cobro');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_metodo_cobro) {
      alert('Seleccione un método de cobro');
      return;
    }

    const montoPaciente = parseFloat(formData.monto_pagado_paciente);
    const montoOS = parseFloat(formData.monto_pagado_obra_social);

    if (isNaN(montoPaciente) || isNaN(montoOS)) {
      alert('Ingrese montos válidos');
      return;
    }

    // Evitar edición si el monto total a pagar es 0
    if (parseFloat(cobro.monto_total) === 0) {
      alert('⚠️ No se puede registrar un pago cuando el monto total es 0');
      return;
    }

    try {
      setLoading(true);
      const response = await updateCobro(cobro.id_cobro_consulta, {
        id_metodo_cobro: formData.id_metodo_cobro,
        monto_pagado_paciente: montoPaciente,
        monto_pagado_obra_social: montoOS
      });

      if (response.data.success) {
        alert('✅ Cobro actualizado correctamente');
        onUpdate();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar el cobro: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarEdicion = () => {
    setFormData({
      id_metodo_cobro: cobro.id_metodo_cobro || '',
      monto_pagado_paciente: 0,
      monto_pagado_obra_social: 0
    });
    setEditMode(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Detalle del Cobro</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Información del cobro */}
          <div className={styles.resumenCobro}>
            <h4 className={styles.resumenTitle}>Resumen del Cobro</h4>
            <div className={styles.resumenItem}>
              <span>Monto Total:</span>
              <span>
                $
                {parseFloat(cobro.monto_total).toLocaleString('es-AR', {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className={styles.resumenItem}>
              <span>Cobertura Obra Social:</span>
              <span className={styles.cobertura}>
                -$
                {parseFloat(cobro.monto_obra_social).toLocaleString('es-AR', {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className={styles.resumenItem}>
              <span>Debe Pagar Paciente:</span>
              <span>
                $
                {parseFloat(cobro.monto_paciente).toLocaleString('es-AR', {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.resumenItem}>
              <span>Pagado por Paciente:</span>
              <span className={styles.montoPagado}>
                $
                {parseFloat(cobro.monto_pagado_paciente || 0).toLocaleString('es-AR', {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className={styles.resumenItem}>
              <span>Pagado por Obra Social:</span>
              <span className={styles.montoPagado}>
                $
                {parseFloat(cobro.monto_pagado_obra_social || 0).toLocaleString('es-AR', {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className={styles.resumenItem}>
              <span>Total Pagado:</span>
              <span className={styles.montoPagado}>
                $
                {parseFloat(cobro.monto_pagado).toLocaleString('es-AR', {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>
            <div className={styles.resumenItem}>
              <span>Estado:</span>
              <span
                className={`${styles.badge} ${
                  cobro.estado_pago === 'pagado'
                    ? styles.badgeSuccess
                    : cobro.estado_pago === 'pendiente'
                    ? styles.badgeWarning
                    : styles.badgeInfo
                }`}
              >
                {cobro.estado_pago}
              </span>
            </div>
            {cobro.metodo_cobro && (
              <div className={styles.resumenItem}>
                <span>Método de Cobro:</span>
                <span>{cobro.metodo_cobro}</span>
              </div>
            )}
            {cobro.fecha_hora_cobro && (
              <div className={styles.resumenItem}>
                <span>Fecha de Cobro:</span>
                <span>{new Date(cobro.fecha_hora_cobro).toLocaleString('es-AR')}</span>
              </div>
            )}
          </div>

          {/* Formulario de actualización */}
            
          <div className={styles.formSection}>
            {!editMode ? (
              <>
                {hayCajaAbierta && cobro.estado_pago !== 'pagado' && (
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => setEditMode(true)}
                    disabled={parseFloat(cobro.monto_total) === 0}
                  >
                    {cobro.estado_pago === 'pendiente' ? '💰 Registrar Pago' : '✏️ Agregar Pago'}
                  </button>
                )}
              </>
            ) : (

              <form onSubmit={handleSubmit}>
                <h4 className={styles.formTitle}>Registrar nuevo pago</h4>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Método de Cobro *</label>
                  <select
                    className={styles.formSelect}
                    name="id_metodo_cobro"
                    value={formData.id_metodo_cobro}
                    onChange={handleInputChange}
                    required
                    disabled={parseFloat(cobro.monto_total) === 0}
                  >
                    <option value="">Seleccionar...</option>
                    {metodosCobro.length === 0 ? (
                      <option value="" disabled>
                        Cargando métodos...
                      </option>
                    ) : (
                      metodosCobro.map((metodo) => (
                        <option key={metodo.id_metodo_cobro} value={metodo.id_metodo_cobro}>
                          {metodo.tipo_cobro}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Monto Pagado por Paciente *</label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.formInput}
                    name="monto_pagado_paciente"
                    value={formData.monto_pagado_paciente}
                    onChange={handleInputChange}
                    max={cobro.monto_paciente}
                    min="0"
                    required
                    disabled={parseFloat(cobro.monto_total) === 0}
                  />
                  <small className={styles.hint}>
                    Debe pagar: $
                    {parseFloat(cobro.monto_paciente).toLocaleString('es-AR', {
                      minimumFractionDigits: 2
                    })}
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Monto Pagado por Obra Social *</label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.formInput}
                    name="monto_pagado_obra_social"
                    value={formData.monto_pagado_obra_social}
                    onChange={handleInputChange}
                    max={cobro.monto_obra_social}
                    min="0"
                    required
                    disabled={parseFloat(cobro.monto_total) === 0}
                  />
                  <small className={styles.hint}>
                    Debe pagar OS: $
                    {parseFloat(cobro.monto_obra_social).toLocaleString('es-AR', {
                      minimumFractionDigits: 2
                    })}
                  </small>
                </div>

                <div className={styles.buttonsRow}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={handleCancelarEdicion}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnSuccess}`}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Confirmar Pago'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CobroModal;
