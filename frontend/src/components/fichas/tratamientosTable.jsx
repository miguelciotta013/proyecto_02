import React from 'react';

function TratamientosTable({ tratamientos, onVerFicha, onVerOdontograma, onVerCobro }) {
  if (tratamientos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
        <p>Este paciente no tiene tratamientos registrados</p>
      </div>
    );
  }

  const getEstadoBadge = (estado) => {
    const estados = {
      'pendiente': 'badge-warning',
      'pagado': 'badge-success',
      'parcial': 'badge-info'
    };
    return estados[estado?.toLowerCase()] || 'badge-secondary';
  };

  return (
    <div className="table-container">
      <table>
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
          {tratamientos.map((ficha) => (
            <tr key={ficha.id_ficha_medica}>
              <td>{ficha.fecha_creacion}</td>
              <td>
                {ficha.detalles && ficha.detalles.length > 0 ? (
                  <div>
                    {ficha.detalles.map((det, idx) => (
                      <div key={idx} style={{ marginBottom: '0.25rem' }}>
                        • {det.tratamiento}
                      </div>
                    ))}
                  </div>
                ) : (
                  'Sin tratamientos'
                )}
              </td>
              <td>
                {ficha.detalles && ficha.detalles.length > 0 ? (
                  <div>
                    {ficha.detalles.map((det, idx) => (
                      <div key={idx} style={{ marginBottom: '0.25rem' }}>
                        {det.diente} - {det.cara}
                      </div>
                    ))}
                  </div>
                ) : (
                  '-'
                )}
              </td>
              <td>
                {ficha.cobro ? `$${parseFloat(ficha.cobro.monto_total).toLocaleString('es-AR')}` : '-'}
              </td>
              <td>
                {ficha.cobro ? (
                  <span className={`badge ${getEstadoBadge(ficha.cobro.estado_pago)}`}>
                    {ficha.cobro.estado_pago}
                  </span>
                ) : (
                  <span className="badge badge-secondary">Sin cobro</span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => onVerFicha(ficha)}
                    title="Ver ficha médica"
                  >
                    Ver Ficha
                  </button>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => onVerOdontograma(ficha)}
                    title="Ver odontograma"
                  >
                    Odontograma
                  </button>
                  {ficha.cobro && (
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => onVerCobro(ficha.cobro)}
                      title="Ver cobro"
                    >
                      Ver Cobro
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TratamientosTable;