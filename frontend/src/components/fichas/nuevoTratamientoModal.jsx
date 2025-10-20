import React, { useState, useEffect } from 'react';
import { createFichaMedica } from '../../api/fichasApi';

function NuevoTratamientoModal({ paciente, catalogos, onClose, onSuccess }) {
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

  // Usuario logueado (ajustar según tu contexto)
  const idEmpleado = localStorage.getItem('id_empleado') || 1;
  const idCaja = localStorage.getItem('id_caja_abierta') || 1;

  // DEBUG: Ver qué contiene catalogos
  useEffect(() => {
    console.log('Catálogos recibidos:', catalogos);
    if (catalogos) {
      console.log('Tratamientos:', catalogos.tratamientos);
      console.log('Dientes:', catalogos.dientes);
      console.log('Caras:', catalogos.caras);
    }
  }, [catalogos]);

  useEffect(() => {
    calcularResumen();
  }, [tratamientos]);

  const calcularResumen = () => {
    if (!catalogos?.tratamientos) return;

    let total = 0;
    tratamientos.forEach(t => {
      if (t.id_tratamiento) {
        const tratamiento = catalogos.tratamientos.find(
          tr => tr.id_tratamiento === parseInt(t.id_tratamiento)
        );
        if (tratamiento) {
          total += parseFloat(tratamiento.importe);
        }
      }
    });

    const cobertura = 0;
    const pacientePaga = total - cobertura;

    setResumen({ total, cobertura, pacientePaga });
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

      const idPacienteOS = paciente.obras_sociales?.[0]?.id_paciente_os;
      
      if (!idPacienteOS) {
        alert('El paciente no tiene obra social asignada');
        return;
      }

      const idFichaPatologica = 1;

      const data = {
        id_paciente_os: idPacienteOS,
        id_empleado: parseInt(idEmpleado),
        id_ficha_patologica: idFichaPatologica,
        id_caja: parseInt(idCaja),
        observaciones: formData.observaciones,
        nro_autorizacion: formData.nro_autorizacion || null,
        nro_coseguro: formData.nro_coseguro || null,
        detalles_consulta: tratamientos.map(t => ({
          id_tratamiento: parseInt(t.id_tratamiento),
          id_diente: parseInt(t.id_diente),
          id_cara: parseInt(t.id_cara)
        }))
      };

      const response = await createFichaMedica(data);

      if (response.data.success) {
        alert('Tratamiento registrado correctamente');
        onSuccess();
      } else {
        alert('Error al registrar el tratamiento');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al registrar el tratamiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Nuevo Tratamiento</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Paciente */}
            <div className="info-card" style={{ marginBottom: '1.5rem' }}>
              <div className="info-row">
                <span className="info-label">Paciente:</span>
                <span className="info-value">{paciente.nombre_completo}</span>
              </div>
              <div className="info-row">
                <span className="info-label">DNI:</span>
                <span className="info-value">{paciente.dni}</span>
              </div>
              {paciente.obras_sociales && paciente.obras_sociales.length > 0 && (
                <div className="info-row">
                  <span className="info-label">Obra Social:</span>
                  <span className="info-value">{paciente.obras_sociales[0].nombre_os}</span>
                </div>
              )}
            </div>

            {/* Datos de la ficha */}
            <div className="form-group">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-textarea"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleInputChange}
                placeholder="Detalles de la consulta..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nro. Autorización</label>
                <input
                  type="text"
                  className="form-input"
                  name="nro_autorizacion"
                  value={formData.nro_autorizacion}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nro. Coseguro</label>
                <input
                  type="text"
                  className="form-input"
                  name="nro_coseguro"
                  value={formData.nro_coseguro}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Tratamientos dinámicos */}
            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#2E7D9D' }}>
              Tratamientos
            </h4>

            {tratamientos.map((tratamiento, index) => (
              <div key={index} className="tratamiento-item">
                <div className="tratamiento-header">
                  <span style={{ fontWeight: '600' }}>Tratamiento {index + 1}</span>
                  {tratamientos.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => eliminarTratamiento(index)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tratamiento *</label>
                    <select
                      className="form-select"
                      value={tratamiento.id_tratamiento}
                      onChange={(e) => handleTratamientoChange(index, 'id_tratamiento', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {catalogos?.tratamientos?.map(t => (
                        <option key={t.id_tratamiento} value={t.id_tratamiento}>
                          {t.nombre_tratamiento} - ${parseFloat(t.importe).toLocaleString('es-AR')}
                        </option>
                      ))}
                    </select>
                    {errors[`tratamiento_${index}`] && (
                      <span className="form-error">{errors[`tratamiento_${index}`]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Diente * (Total: {catalogos?.dientes?.length || 0})</label>
                    <select
                      className="form-select"
                      value={tratamiento.id_diente}
                      onChange={(e) => handleTratamientoChange(index, 'id_diente', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {catalogos?.dientes && catalogos.dientes.length > 0 ? (
                        catalogos.dientes.map(d => (
                          <option key={d.id_diente} value={d.id_diente}>
                            {d.id_diente} - {d.nombre_diente}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No hay dientes disponibles</option>
                      )}
                    </select>
                    {errors[`diente_${index}`] && (
                      <span className="form-error">{errors[`diente_${index}`]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cara *</label>
                    <select
                      className="form-select"
                      value={tratamiento.id_cara}
                      onChange={(e) => handleTratamientoChange(index, 'id_cara', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {catalogos?.caras?.map(c => (
                        <option key={c.id_cara} value={c.id_cara}>
                          {c.nombre_cara}
                        </option>
                      ))}
                    </select>
                    {errors[`cara_${index}`] && (
                      <span className="form-error">{errors[`cara_${index}`]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-add-tratamiento"
              onClick={agregarTratamiento}
            >
              + Agregar Otro Tratamiento
            </button>

            {/* Resumen */}
            <div className="resumen-cobro">
              <div className="resumen-item">
                <span>Subtotal:</span>
                <span>${resumen.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="resumen-item">
                <span>Cobertura Obra Social:</span>
                <span>${resumen.cobertura.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="resumen-item total">
                <span>Paciente Paga:</span>
                <span>${resumen.pacientePaga.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NuevoTratamientoModal;