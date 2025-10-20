import React from 'react';

function FichaMedicaModal({ ficha, onClose }) {
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Detalle de Ficha Médica</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Información general */}
          <div className="info-card">
            <h4 style={{ marginBottom: '1rem', color: '#2E7D9D' }}>Información General</h4>
            
            <div className="info-row">
              <span className="info-label">Paciente:</span>
              <span className="info-value">
                {ficha.paciente_nombre} {ficha.paciente_apellido}
              </span>
            </div>

            <div className="info-row">
              <span className="info-label">Fecha de Atención:</span>
              <span className="info-value">{ficha.fecha_creacion}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Odontólogo:</span>
              <span className="info-value">{ficha.empleado_nombre}</span>
            </div>

            {ficha.observaciones && (
              <div className="info-row">
                <span className="info-label">Observaciones:</span>
                <span className="info-value">{ficha.observaciones}</span>
              </div>
            )}

            {ficha.nro_autorizacion && (
              <div className="info-row">
                <span className="info-label">Nro. Autorización:</span>
                <span className="info-value">{ficha.nro_autorizacion}</span>
              </div>
            )}

            {ficha.nro_coseguro && (
              <div className="info-row">
                <span className="info-label">Nro. Coseguro:</span>
                <span className="info-value">{ficha.nro_coseguro}</span>
              </div>
            )}
          </div>

          {/* Tratamientos realizados */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#2E7D9D' }}>Tratamientos Realizados</h4>
            
            {ficha.detalles && ficha.detalles.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Tratamiento</th>
                      <th>Código</th>
                      <th>Diente</th>
                      <th>Cara</th>
                      <th>Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ficha.detalles.map((detalle, index) => (
                      <tr key={index}>
                        <td>{detalle.tratamiento}</td>
                        <td>{detalle.codigo}</td>
                        <td>{detalle.diente}</td>
                        <td>{detalle.cara}</td>
                        <td>${parseFloat(detalle.importe).toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6c757d' }}>
                No hay tratamientos registrados
              </p>
            )}
          </div>

          {/* Información del cobro */}
          {ficha.cobro && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', color: '#2E7D9D' }}>Estado del Cobro</h4>
              
              <div className="resumen-cobro">
                <div className="resumen-item">
                  <span>Monto Total:</span>
                  <span>${parseFloat(ficha.cobro.monto_total).toLocaleString('es-AR')}</span>
                </div>
                <div className="resumen-item">
                  <span>Cobertura Obra Social:</span>
                  <span>${parseFloat(ficha.cobro.monto_obra_social).toLocaleString('es-AR')}</span>
                </div>
                <div className="resumen-item">
                  <span>Monto Paciente:</span>
                  <span>${parseFloat(ficha.cobro.monto_paciente).toLocaleString('es-AR')}</span>
                </div>
                <div className="resumen-item">
                  <span>Estado:</span>
                  <span className={`badge ${
                    ficha.cobro.estado_pago === 'pagado' ? 'badge-success' :
                    ficha.cobro.estado_pago === 'pendiente' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {ficha.cobro.estado_pago}
                  </span>
                </div>
              </div>
            </div>
          )}
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

export default FichaMedicaModal;