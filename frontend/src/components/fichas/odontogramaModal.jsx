import React, { useState, useEffect } from 'react';
import { getFichaPatologica } from '../../api/fichasApi';

function OdontogramaModal({ ficha, paciente, onClose }) {
  const [fichaPatologica, setFichaPatologica] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFichaPatologica();
  }, []);

  const fetchFichaPatologica = async () => {
    try {
      if (paciente.obras_sociales?.[0]?.id_paciente_os) {
        const response = await getFichaPatologica(paciente.obras_sociales[0].id_paciente_os);
        
        if (response.data.success && response.data.exists) {
          setFichaPatologica(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error al cargar ficha patológica:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener dientes tratados de esta ficha
  const dientesTratados = ficha.detalles?.map(d => parseInt(d.diente?.match(/\d+/)?.[0])) || [];

  // Generar odontograma (32 dientes)
  const dientes = Array.from({ length: 32 }, (_, i) => i + 1);

  // Dividir en cuadrantes
  const cuadrante1 = dientes.slice(0, 8).reverse(); // 18-11
  const cuadrante2 = dientes.slice(8, 16); // 21-28
  const cuadrante3 = dientes.slice(16, 24).reverse(); // 48-41
  const cuadrante4 = dientes.slice(24, 32); // 31-38

  const getDienteClass = (numero) => {
    return dientesTratados.includes(numero) ? 'diente tratado' : 'diente';
  };

  // TODAS las patologías del modelo
  const patologiasGenerales = fichaPatologica ? [
    { label: 'Alergias', value: fichaPatologica.alergias, categoria: 'general' },
    { label: 'Anemia', value: fichaPatologica.anemia, categoria: 'general' },
    { label: 'Artritis', value: fichaPatologica.artritis, categoria: 'general' },
    { label: 'Asma', value: fichaPatologica.asma, categoria: 'respiratorio' },
    { label: 'Desnutrición', value: fichaPatologica.desnutricion, categoria: 'general' },
    { label: 'Diabetes', value: fichaPatologica.diabetes, categoria: 'endocrino' },
    { label: 'Epilepsia', value: fichaPatologica.epilepsia, categoria: 'neurologico' },
    { label: 'Embarazo/Sospecha', value: fichaPatologica.embarazo_sospecha, categoria: 'general' },
    { label: 'Fiebre Reumática', value: fichaPatologica.fiebre_reumatica, categoria: 'general' },
    { label: 'Glaucoma', value: fichaPatologica.glaucoma, categoria: 'general' },
    { label: 'Hemorragias', value: fichaPatologica.hemorragias, categoria: 'general' },
    { label: 'Hepatitis', value: fichaPatologica.hepatitis, categoria: 'infeccioso' },
    { label: 'Herpes', value: fichaPatologica.herpes, categoria: 'infeccioso' },
    { label: 'Hipertensión', value: fichaPatologica.hipertension, categoria: 'cardiovascular' },
    { label: 'Hipotensión', value: fichaPatologica.hipotension, categoria: 'cardiovascular' },
    { label: 'Jaquecas', value: fichaPatologica.jaquecas, categoria: 'neurologico' },
    { label: 'Lesiones de Cabeza', value: fichaPatologica.lesiones_cabeza, categoria: 'neurologico' },
    { label: 'Problemas Hepáticos', value: fichaPatologica.problemas_hepaticos, categoria: 'digestivo' },
    { label: 'Problemas Mentales', value: fichaPatologica.problemas_mentales, categoria: 'neurologico' },
    { label: 'Problemas Cardíacos', value: fichaPatologica.problemas_cardiacos, categoria: 'cardiovascular' },
    { label: 'Problemas Renales', value: fichaPatologica.problemas_renales, categoria: 'renal' },
    { label: 'Problemas Tiroides', value: fichaPatologica.problemas_tiroides, categoria: 'endocrino' },
    { label: 'Problemas Respiratorios', value: fichaPatologica.problemas_respiratorios, categoria: 'respiratorio' },
    { label: 'Sinusitis', value: fichaPatologica.sinusitis, categoria: 'respiratorio' },
    { label: 'Tuberculosis', value: fichaPatologica.tuberculosis, categoria: 'infeccioso' },
    { label: 'Tumores', value: fichaPatologica.tumores, categoria: 'general' },
    { label: 'Úlceras', value: fichaPatologica.ulceras, categoria: 'digestivo' },
    { label: 'Enfermedades Venéreas', value: fichaPatologica.venereas, categoria: 'infeccioso' },
    { label: 'VIH', value: fichaPatologica.vih, categoria: 'infeccioso' },
  ] : [];

  const patologiasOdontologicas = fichaPatologica ? [
    { label: 'Portador de Prótesis', value: fichaPatologica.portador_protesis },
    { label: 'Problema Periodontal', value: fichaPatologica.problema_periodontal },
    { label: 'Ortodoncia', value: fichaPatologica.ortodoncia },
    { label: 'Mala Oclusión', value: fichaPatologica.mala_oclusion },
    { label: 'Lesión de Mucosa', value: fichaPatologica.lesion_mucosa },
  ] : [];

  const medicacion = fichaPatologica ? [
    { label: 'Toma Medicación', value: fichaPatologica.toma_medicacion },
  ] : [];

  // Filtrar solo las patologías activas para resumen
  const patologiasActivas = patologiasGenerales.filter(p => p.value);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1000px', maxHeight: '90vh', overflow: 'auto' }}
      >
        <div className="modal-header">
          <h3 className="modal-title">Odontograma y Ficha Patológica</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Odontograma */}
          <div>
            <h4 style={{ marginBottom: '1rem', color: '#2E7D9D' }}>Odontograma</h4>
            
            <div className="odontograma">
              {/* Cuadrante Superior */}
              <div className="cuadrante-superior">
                <div className="fila-dientes">
                  {cuadrante1.map(num => (
                    <div key={num} className={getDienteClass(num)}>
                      <div className="diente-numero">{num}</div>
                    </div>
                  ))}
                  {cuadrante2.map(num => (
                    <div key={num} className={getDienteClass(num)}>
                      <div className="diente-numero">{num}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Línea divisoria */}
              <div className="linea-horizontal"></div>

              {/* Cuadrante Inferior */}
              <div className="cuadrante-inferior">
                <div className="fila-dientes">
                  {cuadrante3.map(num => (
                    <div key={num} className={getDienteClass(num)}>
                      <div className="diente-numero">{num}</div>
                    </div>
                  ))}
                  {cuadrante4.map(num => (
                    <div key={num} className={getDienteClass(num)}>
                      <div className="diente-numero">{num}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="leyenda-odontograma">
              <div className="leyenda-item">
                <div className="diente-muestra normal"></div>
                <span>Normal</span>
              </div>
              <div className="leyenda-item">
                <div className="diente-muestra tratado"></div>
                <span>Tratado en esta consulta</span>
              </div>
            </div>
          </div>

          {/* Ficha Patológica */}
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#2E7D9D' }}>Ficha Patológica</h4>
            
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : fichaPatologica ? (
              <div>
                {/* Resumen de condiciones activas */}
                {patologiasActivas.length > 0 && (
                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <strong style={{ color: '#856404' }}>⚠️ Condiciones Médicas Activas:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      {patologiasActivas.map((p, idx) => (
                        <span key={idx} style={{
                          display: 'inline-block',
                          backgroundColor: '#ffc107',
                          color: '#000',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          margin: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Condiciones Generales */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h5 style={{ color: '#2E7D9D', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Condiciones Médicas Generales
                  </h5>
                  <div className="patologia-grid">
                    {patologiasGenerales.map((pat, idx) => (
                      <div key={idx} className="patologia-item">
                        <span className="patologia-label">{pat.label}:</span>
                        <span className={`patologia-value ${pat.value ? 'positivo' : 'negativo'}`}>
                          {pat.value ? 'SÍ' : 'NO'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Condiciones Odontológicas */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h5 style={{ color: '#2E7D9D', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Condiciones Odontológicas
                  </h5>
                  <div className="patologia-grid">
                    {patologiasOdontologicas.map((pat, idx) => (
                      <div key={idx} className="patologia-item">
                        <span className="patologia-label">{pat.label}:</span>
                        <span className={`patologia-value ${pat.value ? 'positivo' : 'negativo'}`}>
                          {pat.value ? 'SÍ' : 'NO'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medicación */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h5 style={{ color: '#2E7D9D', marginBottom: '0.75rem', fontSize: '1rem' }}>
                    Medicación
                  </h5>
                  <div className="patologia-grid">
                    {medicacion.map((pat, idx) => (
                      <div key={idx} className="patologia-item">
                        <span className="patologia-label">{pat.label}:</span>
                        <span className={`patologia-value ${pat.value ? 'positivo' : 'negativo'}`}>
                          {pat.value ? 'SÍ' : 'NO'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observaciones adicionales */}
                {fichaPatologica.otra && (
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <strong style={{ color: '#495057' }}>Observaciones Adicionales:</strong>
                    <p style={{ marginTop: '0.5rem', marginBottom: 0, color: '#212529' }}>
                      {fichaPatologica.otra}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6c757d' }}>
                No hay ficha patológica registrada para este paciente
              </p>
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

export default OdontogramaModal;