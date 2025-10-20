import React, { useState, useEffect } from 'react';
import { updateCobro, getMetodosCobro } from '../../api/fichasApi';
//algo

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
    fetchMetodosCobro();
  }, []);

  const fetchMetodosCobro = async () => {
    try {
      const response = await getMetodosCobro();
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
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_metodo_cobro) {
      alert('Seleccione un método de cobro');
      return;
    }

    try {
      setLoading(true);

      const response = await updateCobro(cobro.id_cobro_consulta, formData);

      if (response.data.success) {
        alert('Cobro actualizado correctamente');
        onUpdate();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el cobro');
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Detalle del Cobro</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Información del cobro */}
          <div className="resumen-cobro">
            <div className="resumen-item">
              <span>Monto Total:</span>
              <span>${parseFloat(cobro.monto_total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="resumen-item">
              <span>Cobertura Obra Social:</span>
              <span>${parseFloat(cobro.monto_obra_social).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="resumen-item">
              <span>Monto Paciente:</span>
              <span>${parseFloat(cobro.monto_paciente).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="resumen-item">
              <span>Monto Pagado:</span>
              <span>${parseFloat(cobro.monto_pagado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="resumen-item">
              <span>Estado:</span>
              <span className={`badge ${
                cobro.estado_pago === 'pagado' ? 'badge-success' :
                cobro.estado_pago === 'pendiente' ? 'badge-warning' :
                'badge-info'
              }`}>
                {cobro.estado_pago}
              </span>
            </div>
            {cobro.metodo_cobro && (
              <div className="resumen-item">
                <span>Método de Cobro:</span>
                <span>{cobro.metodo_cobro}</span>
              </div>
            )}
            {cobro.fecha_hora_cobro && (
              <div className="resumen-item">
                <span>Fecha de Cobro:</span>
                <span>{new Date(cobro.fecha_hora_cobro).toLocaleString('es-AR')}</span>
              </div>
            )}
          </div>

          {/* Formulario de actualización */}
          <div style={{ marginTop: '2rem' }}>
            {!editMode ? (
              <button
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                {cobro.estado_pago === 'pendiente' ? 'Registrar Pago' : 'Modificar Cobro'}
              </button>
            ) : (
              <form onSubmit={handleSubmit}>
                <h4 style={{ marginBottom: '1rem', color: '#2E7D9D' }}>
                  Actualizar Cobro
                </h4>

                <div className="form-group">
                  <label className="form-label">Estado de Pago *</label>
                  <select
                    className="form-select"
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

                <div className="form-group">
                  <label className="form-label">Método de Cobro *</label>
                  <select
                    className="form-select"
                    name="id_metodo_cobro"
                    value={formData.id_metodo_cobro}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {metodosCobro.map(metodo => (
                      <option key={metodo.id_metodo_cobro} value={metodo.id_metodo_cobro}>
                        {metodo.tipo_cobro}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Monto Pagado *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    name="monto_pagado"
                    value={formData.monto_pagado}
                    onChange={handleInputChange}
                    required
                  />
                  <small style={{ color: '#6c757d', display: 'block', marginTop: '0.25rem' }}>
                    Monto que debe pagar el paciente: ${parseFloat(cobro.monto_paciente).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancelarEdicion}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Confirmar Cambios'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default CobroModal;