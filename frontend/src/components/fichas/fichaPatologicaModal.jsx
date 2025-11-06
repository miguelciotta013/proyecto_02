import React, { useState } from 'react';
import { createFichaPatologica } from '../../api/fichasApi';
import styles from './fichaPatologicaModal.module.css';

function FichaPatologicaModal({ paciente, idPacienteOS, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    alergias: false,
    anemia: false,
    artritis: false,
    asma: false,
    desnutricion: false,
    diabetes: false,
    epilepsia: false,
    embarazo_sospecha: false,
    fiebre_reumatica: false,
    glaucoma: false,
    hemorragias: false,
    hepatitis: false,
    herpes: false,
    hipertension: false,
    hipotension: false,
    jaquecas: false,
    lesiones_cabeza: false,
    problemas_hepaticos: false,
    problemas_mentales: false,
    problemas_cardiacos: false,
    problemas_renales: false,
    problemas_tiroides: false,
    problemas_respiratorios: false,
    sinusitis: false,
    tuberculosis: false,
    tumores: false,
    ulceras: false,
    venereas: false,
    vih: false,
    portador_protesis: false,
    problema_periodontal: false,
    ortodoncia: false,
    mala_oclusion: false,
    lesion_mucosa: false,
    toma_medicacion: false,
    otra: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleTextChange = (e) => {
    setFormData(prev => ({
      ...prev,
      otra: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const dataToSend = {
        id_paciente_os: idPacienteOS,
        ...Object.fromEntries(
          Object.entries(formData).map(([key, value]) => 
            key === 'otra' ? [key, value] : [key, value ? 1 : 0]
          )
        )
      };
      
      const response = await createFichaPatologica(dataToSend);
      
      if (response.data.success) {
        alert('Ficha patológica creada correctamente');
        onSuccess(response.data.data.id_ficha_patologica);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al crear la ficha patológica');
    } finally {
      setLoading(false);
    }
  };

  // Estilos inline como fallback
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  };

  const contentStyle = {
    background: '#fff',
    borderRadius: '12px',
    width: '95%',
    maxWidth: '1100px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  };

  const bodyStyle = {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1
  };

  const checkboxGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem 1.5rem'
  };

  return (
    <div style={overlayStyle}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1976d2',
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '12px 12px 0 0'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>
            Crear Ficha Patológica
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.8rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Body con scroll */}
          <div style={bodyStyle}>
            {/* Info del paciente */}
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{ fontWeight: 600, color: '#856404' }}>Paciente:</span>
                <span style={{ color: '#856404' }}>{paciente.nombre_completo}</span>
              </div>
              <p style={{ color: '#856404', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                ⚠️ Este paciente no tiene una ficha patológica registrada. 
                Por favor, complete la siguiente información médica antes de continuar.
              </p>
            </div>

            {/* Condiciones Médicas Generales */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1976d2',
                margin: '0 0 1rem 0',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #e3f2fd'
              }}>
                Condiciones Médicas Generales
              </h4>
              <div style={checkboxGridStyle}>
                {[
                  { field: 'alergias', label: 'Alergias' },
                  { field: 'anemia', label: 'Anemia' },
                  { field: 'artritis', label: 'Artritis' },
                  { field: 'asma', label: 'Asma' },
                  { field: 'desnutricion', label: 'Desnutrición' },
                  { field: 'diabetes', label: 'Diabetes' },
                  { field: 'epilepsia', label: 'Epilepsia' },
                  { field: 'embarazo_sospecha', label: 'Embarazo/Sospecha' },
                  { field: 'fiebre_reumatica', label: 'Fiebre Reumática' },
                  { field: 'glaucoma', label: 'Glaucoma' },
                  { field: 'hemorragias', label: 'Hemorragias' },
                  { field: 'hepatitis', label: 'Hepatitis' },
                  { field: 'herpes', label: 'Herpes' },
                  { field: 'hipertension', label: 'Hipertensión' },
                  { field: 'hipotension', label: 'Hipotensión' },
                  { field: 'jaquecas', label: 'Jaquecas' },
                  { field: 'lesiones_cabeza', label: 'Lesiones de Cabeza' },
                  { field: 'problemas_hepaticos', label: 'Problemas Hepáticos' },
                  { field: 'problemas_mentales', label: 'Problemas Mentales' },
                  { field: 'problemas_cardiacos', label: 'Problemas Cardíacos' },
                  { field: 'problemas_renales', label: 'Problemas Renales' },
                  { field: 'problemas_tiroides', label: 'Problemas de Tiroides' },
                  { field: 'problemas_respiratorios', label: 'Problemas Respiratorios' },
                  { field: 'sinusitis', label: 'Sinusitis' },
                  { field: 'tuberculosis', label: 'Tuberculosis' },
                  { field: 'tumores', label: 'Tumores' },
                  { field: 'ulceras', label: 'Úlceras' },
                  { field: 'venereas', label: 'Enfermedades Venéreas' },
                  { field: 'vih', label: 'VIH' }
                ].map(({ field, label }) => (
                  <label
                    key={field}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f9fb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData[field]}
                      onChange={() => handleCheckboxChange(field)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#1976d2',
                        flexShrink: 0
                      }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condiciones Odontológicas */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1976d2',
                margin: '0 0 1rem 0',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #e3f2fd'
              }}>
                Condiciones Odontológicas
              </h4>
              <div style={checkboxGridStyle}>
                {[
                  { field: 'portador_protesis', label: 'Portador de Prótesis' },
                  { field: 'problema_periodontal', label: 'Problema Periodontal' },
                  { field: 'ortodoncia', label: 'Ortodoncia' },
                  { field: 'mala_oclusion', label: 'Mala Oclusión' },
                  { field: 'lesion_mucosa', label: 'Lesión de Mucosa' }
                ].map(({ field, label }) => (
                  <label
                    key={field}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f9fb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData[field]}
                      onChange={() => handleCheckboxChange(field)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#1976d2'
                      }}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Medicación */}
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e0e0e0' }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1976d2',
                margin: '0 0 1rem 0',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #e3f2fd'
              }}>
                Medicación
              </h4>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}>
                <input
                  type="checkbox"
                  checked={formData.toma_medicacion}
                  onChange={() => handleCheckboxChange('toma_medicacion')}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#1976d2'
                  }}
                />
                <span>¿Toma medicación actualmente?</span>
              </label>
            </div>

            {/* Observaciones */}
            <div>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1976d2',
                margin: '0 0 1rem 0',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid #e3f2fd'
              }}>
                Observaciones Adicionales
              </h4>
              <textarea
                placeholder="Detalle cualquier otra condición médica relevante..."
                value={formData.otra}
                onChange={handleTextChange}
                rows={4}
                style={{
                  width: '850px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>
          </div>

          {/* Footer fijo */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            padding: '1rem 1.5rem',
            borderTop: '2px solid #e0e0e0',
            background: '#f9f9f9',
            borderRadius: '0 0 12px 12px'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                backgroundColor: '#e0e0e0',
                color: '#333'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                backgroundColor: '#1976d2',
                color: 'white'
              }}
            >
              {loading ? 'Guardando...' : 'Guardar y Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FichaPatologicaModal;