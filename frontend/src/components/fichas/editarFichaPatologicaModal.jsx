import React, { useState } from 'react';
import styles from './fichaPatologicaModal.module.css';

function EditarFichaPatologicaModal({ fichaPatologica, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    alergias: fichaPatologica.alergias || false,
    anemia: fichaPatologica.anemia || false,
    artritis: fichaPatologica.artritis || false,
    asma: fichaPatologica.asma || false,
    desnutricion: fichaPatologica.desnutricion || false,
    diabetes: fichaPatologica.diabetes || false,
    epilepsia: fichaPatologica.epilepsia || false,
    embarazo_sospecha: fichaPatologica.embarazo_sospecha || false,
    fiebre_reumatica: fichaPatologica.fiebre_reumatica || false,
    glaucoma: fichaPatologica.glaucoma || false,
    hemorragias: fichaPatologica.hemorragias || false,
    hepatitis: fichaPatologica.hepatitis || false,
    herpes: fichaPatologica.herpes || false,
    hipertension: fichaPatologica.hipertension || false,
    hipotension: fichaPatologica.hipotension || false,
    jaquecas: fichaPatologica.jaquecas || false,
    lesiones_cabeza: fichaPatologica.lesiones_cabeza || false,
    problemas_hepaticos: fichaPatologica.problemas_hepaticos || false,
    problemas_mentales: fichaPatologica.problemas_mentales || false,
    problemas_cardiacos: fichaPatologica.problemas_cardiacos || false,
    problemas_renales: fichaPatologica.problemas_renales || false,
    problemas_tiroides: fichaPatologica.problemas_tiroides || false,
    problemas_respiratorios: fichaPatologica.problemas_respiratorios || false,
    sinusitis: fichaPatologica.sinusitis || false,
    tuberculosis: fichaPatologica.tuberculosis || false,
    tumores: fichaPatologica.tumores || false,
    ulceras: fichaPatologica.ulceras || false,
    venereas: fichaPatologica.venereas || false,
    vih: fichaPatologica.vih || false,
    portador_protesis: fichaPatologica.portador_protesis || false,
    problema_periodontal: fichaPatologica.problema_periodontal || false,
    ortodoncia: fichaPatologica.ortodoncia || false,
    mala_oclusion: fichaPatologica.mala_oclusion || false,
    lesion_mucosa: fichaPatologica.lesion_mucosa || false,
    toma_medicacion: fichaPatologica.toma_medicacion || false,
    otra: fichaPatologica.otra || ''
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
        id_ficha_patologica: fichaPatologica.id_ficha_patologica,
        ...Object.fromEntries(
          Object.entries(formData).map(([key, value]) => 
            key === 'otra' ? [key, value] : [key, value ? 1 : 0]
          )
        )
      };
      
      const response = await fetch('/api/ficha_medica/patologia/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Ficha patológica actualizada correctamente');
        onSuccess();
      } else {
        alert(data.error || 'Error al actualizar la ficha patológica');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la ficha patológica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Editar Ficha Patológica</h3>
          <button onClick={onClose} className={styles.modalClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Body con scroll */}
          <div className={styles.modalBody}>
            
            {/* Condiciones Médicas Generales */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Condiciones Médicas Generales</h4>
              <div className={styles.checkboxGrid}>
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
                  <label key={field} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData[field]}
                      onChange={() => handleCheckboxChange(field)}
                      className={styles.checkbox}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Condiciones Odontológicas */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Condiciones Odontológicas</h4>
              <div className={styles.checkboxGrid}>
                {[
                  { field: 'portador_protesis', label: 'Portador de Prótesis' },
                  { field: 'problema_periodontal', label: 'Problema Periodontal' },
                  { field: 'ortodoncia', label: 'Ortodoncia' },
                  { field: 'mala_oclusion', label: 'Mala Oclusión' },
                  { field: 'lesion_mucosa', label: 'Lesión de Mucosa' }
                ].map(({ field, label }) => (
                  <label key={field} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData[field]}
                      onChange={() => handleCheckboxChange(field)}
                      className={styles.checkbox}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Medicación */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Medicación</h4>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.toma_medicacion}
                  onChange={() => handleCheckboxChange('toma_medicacion')}
                  className={styles.checkbox}
                />
                <span>¿Toma medicación actualmente?</span>
              </label>
            </div>

            {/* Observaciones */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Observaciones Adicionales</h4>
              <textarea
                placeholder="Detalle cualquier otra condición médica relevante..."
                value={formData.otra}
                onChange={handleTextChange}
                rows={4}
                className={styles.textarea}
              />
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`${styles.btn} ${styles.btnSecondary}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarFichaPatologicaModal;