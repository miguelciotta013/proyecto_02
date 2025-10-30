import React, { useState, useEffect } from 'react';
import { createFichaMedica,getTratamientos} from '../../api/fichasApi';
import styles from './nuevoTratamientoModal.module.css';

function NuevoTratamientoModal({ paciente, catalogos, idCaja, idFichaPatologica, onClose, onSuccess }) {
  const [obraSocialSeleccionada, setObraSocialSeleccionada] = useState('');
  const [tratamientosConCobertura, setTratamientosConCobertura] = useState([]);
  const [loadingTratamientos, setLoadingTratamientos] = useState(false);
  
  const [formData, setFormData] = useState({
    observaciones: '',
    nro_autorizacion: '',
    nro_coseguro: ''
  });

  const [tratamientos, setTratamientos] = useState([
    { id_tratamiento: '', id_diente: '', id_cara: '' }
  ]);

  const [resumen, setResumen] = useState({
    total: 0,
    cobertura: 0,
    pacientePaga: 0
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const idEmpleado = localStorage.getItem('id_empleado') || 1;

  useEffect(() => {
    if (obraSocialSeleccionada) {
      fetchTratamientosConCobertura(obraSocialSeleccionada);
    } else {
      setTratamientosConCobertura([]);
    }
  }, [obraSocialSeleccionada]);

  useEffect(() => {
    calcularResumen();
  }, [tratamientos, tratamientosConCobertura]);

  const fetchTratamientosConCobertura = async (idObraSocial) => {
    try {
      setLoadingTratamientos(true);
      const response = await getTratamientos(idObraSocial);
      
      if (response.data.success) {
        setTratamientosConCobertura(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar tratamientos:', error);
      alert('Error al cargar los tratamientos con cobertura');
    } finally {
      setLoadingTratamientos(false);
    }
  };

  const calcularResumen = () => {
    let total = 0;
    let cobertura = 0;
    
    tratamientos.forEach(t => {
      if (t.id_tratamiento && tratamientosConCobertura.length > 0) {
        const tratamiento = tratamientosConCobertura.find(
          tr => tr.id_tratamiento === parseInt(t.id_tratamiento)
        );
        
        if (tratamiento) {
          const importeBase = parseFloat(tratamiento.importe_base);
          const importeObraSocial = parseFloat(tratamiento.importe_obra_social);
          
          total += importeBase;
          cobertura += importeObraSocial;
        }
      }
    });

    const pacientePaga = total - cobertura;

    setResumen({ total, cobertura, pacientePaga });
  };

  const handleObraSocialChange = (e) => {
    const idObraSocial = e.target.value;
    setObraSocialSeleccionada(idObraSocial);
    setTratamientos([{ id_tratamiento: '', id_diente: '', id_cara: '' }]);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTratamientoChange = (index, field, value) => {
    const newTratamientos = [...tratamientos];
    newTratamientos[index][field] = value;
    setTratamientos(newTratamientos);
  };

  const agregarTratamiento = () => {
    setTratamientos([
      ...tratamientos,
      { id_tratamiento: '', id_diente: '', id_cara: '' }
    ]);
  };

  const eliminarTratamiento = (index) => {
    if (tratamientos.length > 1) {
      const newTratamientos = tratamientos.filter((_, i) => i !== index);
      setTratamientos(newTratamientos);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!obraSocialSeleccionada) {
      newErrors.obra_social = 'Debe seleccionar una obra social';
      alert('Por favor seleccione una obra social');
      return false;
    }

    if (tratamientos.length === 0) {
      newErrors.tratamientos = 'Debe agregar al menos un tratamiento';
    }

    tratamientos.forEach((t, idx) => {
      if (!t.id_tratamiento) {
        newErrors[`tratamiento_${idx}`] = 'Seleccione un tratamiento';
      }
      if (!t.id_diente) {
        newErrors[`diente_${idx}`] = 'Seleccione un diente';
      }
      if (!t.id_cara) {
        newErrors[`cara_${idx}`] = 'Seleccione una cara';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      const pacienteOS = paciente.obras_sociales.find(
        os => os.id_obra_social === parseInt(obraSocialSeleccionada)
      );

      if (!pacienteOS) {
        alert('Error: No se encontró la relación paciente-obra social');
        return;
      }

      const data = {
        id_paciente_os: pacienteOS.id_paciente_os,
        id_empleado: parseInt(idEmpleado),
        id_ficha_patologica: parseInt(idFichaPatologica),
        id_caja: parseInt(idCaja),
        observaciones: formData.observaciones || '',
        nro_autorizacion: formData.nro_autorizacion ? parseInt(formData.nro_autorizacion) : null,
        nro_coseguro: formData.nro_coseguro ? parseInt(formData.nro_coseguro) : null,
        detalles_consulta: tratamientos.map(t => ({
          id_tratamiento: parseInt(t.id_tratamiento),
          id_diente: parseInt(t.id_diente),
          id_cara: parseInt(t.id_cara)
        }))
      };

      console.log('Datos a enviar:', data);

      const response = await createFichaMedica(data);

      if (response.data.success) {
        alert('✅ Tratamiento registrado correctamente');
        onSuccess();
      } else {
        alert('❌ Error al registrar el tratamiento');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al registrar el tratamiento');
    } finally {
      setLoading(false);
    }
  };

  const getTratamientoInfo = (idTratamiento) => {
    if (!idTratamiento || !tratamientosConCobertura.length) return null;
    return tratamientosConCobertura.find(t => t.id_tratamiento === parseInt(idTratamiento));
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Nuevo Tratamiento</h3>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            {/* Info del Paciente - Compacta */}
            <div className={styles.infoCard}>
              <span className={styles.infoLabel}>Paciente:</span>
              <span className={styles.infoValue}>{paciente.nombre_completo}</span>
              <span className={styles.infoDivider}>|</span>
              <span className={styles.infoLabel}>DNI:</span>
              <span className={styles.infoValue}>{paciente.dni}</span>
            </div>

            {/* Layout de dos columnas */}
            <div className={styles.twoColumnLayout}>
              {/* COLUMNA IZQUIERDA */}
              <div className={styles.leftColumn}>
                {/* Obra Social */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Obra Social *</label>
                  <select
                    className={styles.formSelect}
                    value={obraSocialSeleccionada}
                    onChange={handleObraSocialChange}
                    required
                  >
                    <option value="">-- Seleccionar --</option>
                    {paciente.obras_sociales?.map(os => (
                      <option key={os.id_obra_social} value={os.id_obra_social}>
                        {os.nombre_os} - {os.credencial || 'S/C'}
                      </option>
                    ))}
                  </select>
                  {errors.obra_social && (
                    <span className={styles.formError}>{errors.obra_social}</span>
                  )}
                </div>

                {/* Observaciones */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Observaciones</label>
                  <textarea
                    className={styles.formTextarea}
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    placeholder="Detalles de la consulta..."
                    rows={3}
                  />
                </div>

                {/* Nro Autorización */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nro. Autorización</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    name="nro_autorizacion"
                    value={formData.nro_autorizacion}
                    onChange={handleInputChange}
                    placeholder="Opcional"
                  />
                </div>

                {/* Nro Coseguro */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nro. Coseguro</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    name="nro_coseguro"
                    value={formData.nro_coseguro}
                    onChange={handleInputChange}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className={styles.rightColumn}>
                {!obraSocialSeleccionada ? (
                  <div className={styles.warningBox}>
                    ⚠️ Seleccione una obra social
                  </div>
                ) : (
                  <>
                    <h4 className={styles.sectionTitle}>Tratamientos</h4>
                    
                    {/* Tratamientos con scroll */}
                    <div className={styles.tratamientosSection}>
                      {loadingTratamientos ? (
                        <p className={styles.loadingText}>Cargando...</p>
                      ) : (
                        <>
                          {tratamientos.map((tratamiento, index) => {
                            const tratamientoInfo = getTratamientoInfo(tratamiento.id_tratamiento);
                            
                            return (
                              <div key={index} className={styles.tratamientoItem}>
                                <div className={styles.tratamientoHeader}>
                                  {tratamientos.length > 1 && (
                                    <button
                                      type="button"
                                      className={styles.btnRemove}
                                      onClick={() => eliminarTratamiento(index)}
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>

                                <div className={styles.formGroup}>
                                  
                                  <label className={styles.formLabel}>#{index + 1} Tratamiento *</label>
                                  <select
                                    className={styles.formSelect}
                                    value={tratamiento.id_tratamiento}
                                    onChange={(e) => handleTratamientoChange(index, 'id_tratamiento', e.target.value)}
                                  >
                                    <option value="">Seleccionar...</option>
                                    {tratamientosConCobertura.map(t => (
                                      <option key={t.id_tratamiento} value={t.id_tratamiento}>
                                        {t.nombre_tratamiento} (${parseFloat(t.importe_paciente).toLocaleString('es-AR')})
                                      </option>
                                    ))}
                                  </select>
                                  {errors[`tratamiento_${index}`] && (
                                    <span className={styles.formError}>{errors[`tratamiento_${index}`]}</span>
                                  )}
                                </div>

                                <div className={styles.formRow}>
                                  <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Diente *</label>
                                    <select
                                      className={styles.formSelect}
                                      value={tratamiento.id_diente}
                                      onChange={(e) => handleTratamientoChange(index, 'id_diente', e.target.value)}
                                    >
                                      <option value="">Sel...</option>
                                      {catalogos?.dientes?.map(d => (
                                        <option key={d.id_diente} value={d.id_diente}>
                                          {d.id_diente}
                                        </option>
                                      ))}
                                    </select>
                                    {errors[`diente_${index}`] && (
                                      <span className={styles.formError}>{errors[`diente_${index}`]}</span>
                                    )}
                                  </div>

                                  <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Cara *</label>
                                    <select
                                      className={styles.formSelect}
                                      value={tratamiento.id_cara}
                                      onChange={(e) => handleTratamientoChange(index, 'id_cara', e.target.value)}
                                    >
                                      <option value="">Sel...</option>
                                      {catalogos?.caras?.map(c => (
                                        <option key={c.id_cara} value={c.id_cara}>
                                          {c.abreviatura}
                                        </option>
                                      ))}
                                    </select>
                                    {errors[`cara_${index}`] && (
                                      <span className={styles.formError}>{errors[`cara_${index}`]}</span>
                                    )}
                                  </div>
                                </div>

                                {tratamientoInfo && (
                                  <div className={styles.tratamientoInfo}>
                                    <div>Base: ${parseFloat(tratamientoInfo.importe_base).toLocaleString('es-AR')}</div>
                                    <div>Cob: ${parseFloat(tratamientoInfo.importe_obra_social).toLocaleString('es-AR')}</div>
                                    <div className={styles.importePaciente}>
                                      Paga: ${parseFloat(tratamientoInfo.importe_paciente).toLocaleString('es-AR')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            className={styles.btnAddTratamiento}
                            onClick={agregarTratamiento}
                          >
                            + Agregar
                          </button>
                        </>
                      )}
                    </div>

                    {/* Resumen */}
                    <div className={styles.resumenCobro}>
                      <h4 className={styles.resumenTitle}>Resumen</h4>
                      <div className={styles.resumenItem}>
                        <span>Subtotal:</span>
                        <span>${resumen.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className={styles.resumenItem}>
                        <span>Cobertura:</span>
                        <span className={styles.cobertura}>- ${resumen.cobertura.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className={`${styles.resumenItem} ${styles.total}`}>
                        <span>A Pagar:</span>
                        <span>${resumen.pacientePaga.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={loading || !obraSocialSeleccionada}
            >
              {loading ? 'Guardando...' : ' Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NuevoTratamientoModal;