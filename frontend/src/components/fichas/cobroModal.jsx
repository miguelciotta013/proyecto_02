import React, { useState, useEffect } from 'react';
import { updateCobro, getMetodosCobro } from '../../api/fichasApi';
import styles from './cobroModal.module.css';

function CobroModal({ cobro, onClose, onUpdate }) {
  const [metodosCobro, setMetodosCobro] = useState([]);
  const [formData, setFormData] = useState({
    id_metodo_cobro: cobro.metodo_cobro || cobro.id_metodo_cobro || '',
    monto_pagado: cobro.monto_pagado || cobro.monto_paciente || '',
    id_estado_pago: cobro.id_estado_pago || (cobro.estado_pago?.toLowerCase() === 'pagado' ? 2 : 1)
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    console.log('Cobro recibido:', cobro);
    fetchMetodosCobro();
  }, []);

  const fetchMetodosCobro = async () => {
    try {
      const response = await getMetodosCobro();
      console.log('Respuesta métodos de cobro:', response.data);
      
      if (response.data.success) {
        setMetodosCobro(response.data.data);
        
        // Si el cobro ya tiene un método pero viene como string, buscar su ID
        if (cobro.metodo_cobro && typeof cobro.metodo_cobro === 'string') {
          const metodo = response.data.data.find(m => 
            m.tipo_cobro.toLowerCase() === cobro.metodo_cobro.toLowerCase()
          );
          if (metodo) {
            setFormData(prev => ({
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
    console.log('Cambio en campo:', name, 'Valor:', value);
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

    console.log('Datos a enviar:', formData);

    try {
      setLoading(true);

      const response = await updateCobro(cobro.id_cobro_consulta, formData);

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
    // Restaurar valores originales
    setFormData({
      id_metodo_cobro: cobro.id_metodo_cobro || '',
      monto_pagado: cobro.monto_pagado || cobro.monto_paciente || '',
      id_estado_pago: cobro.id_estado_pago || (cobro.estado_pago?.toLowerCase() === 'pagado' ? 2 : 1)
    });
    setEditMode(false);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Detalle del Cobro</h3>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {/* Información del cobro */}
          <div className={styles.resumenCobro}>
            <h4 className={styles.resumenTitle}>Resumen del Cobro</h4>
            <div className={styles.resumenItem}>
              <span>Monto Total:</span>
              <span>${parseFloat(cobro.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.resumenItem}>
              <span>Cobertura Obra Social:</span>
              <span className={styles.cobertura}>-${parseFloat(cobro.monto_obra_social).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.resumenItem}>
              <span>Monto Paciente:</span>
              <span>${parseFloat(cobro.monto_paciente).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.resumenItem}>
              <span>Monto Pagado:</span>
              <span className={styles.montoPagado}>${parseFloat(cobro.monto_pagado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={styles.resumenItem}>
              <span>Estado:</span>
              <span className={`${styles.badge} ${
                cobro.estado_pago === 'pagado' ? styles.badgeSuccess :
                cobro.estado_pago === 'pendiente' ? styles.badgeWarning :
                styles.badgeInfo
              }`}>
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
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setEditMode(true)}
              >
                {cobro.estado_pago === 'pendiente' ? '💰 Registrar Pago' : '✏️ Modificar Cobro'}
              </button>
            ) : (
              <form onSubmit={handleSubmit}>
                <h4 className={styles.formTitle}>Actualizar Cobro</h4>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Estado de Pago *</label>
                  <select
                    className={styles.formSelect}
                    name="id_estado_pago"
                    value={formData.id_estado_pago}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="1">Pendiente</option>
                    <option value="2">Pagado</option>
                    <option value="3">Parcial</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Método de Cobro *</label>
                  <select
                    className={styles.formSelect}
                    name="id_metodo_cobro"
                    value={formData.id_metodo_cobro}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {metodosCobro.length === 0 ? (
                      <option value="" disabled>Cargando métodos...</option>
                    ) : (
                      metodosCobro.map(metodo => (
                        <option key={metodo.id_metodo_cobro} value={metodo.id_metodo_cobro}>
                          {metodo.tipo_cobro}
                        </option>
                      ))
                    )}
                  </select>
                  {metodosCobro.length === 0 && (
                    <small className={styles.hint}>
                      ⚠️ No se pudieron cargar los métodos de cobro
                    </small>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Monto Pagado *</label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.formInput}
                    name="monto_pagado"
                    value={formData.monto_pagado}
                    onChange={handleInputChange}
                    required
                  />
                  <small className={styles.hint}>
                    Monto que debe pagar el paciente: ${parseFloat(cobro.monto_paciente).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
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
                    {loading ? 'Guardando...' : '✓ Confirmar Cambios'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`} 
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Debug info - remover en producción */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'black',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          maxWidth: '300px',
          zIndex: 10000
        }}>
          <strong>Debug:</strong><br/>
          Métodos cargados: {metodosCobro.length}<br/>
          ID seleccionado: {formData.id_metodo_cobro}<br/>
          {metodosCobro.length > 0 && (
            <>Métodos: {metodosCobro.map(m => m.tipo_cobro).join(', ')}</>
          )}
        </div>
      )}
      
    </div>
  );
}

export default CobroModal;