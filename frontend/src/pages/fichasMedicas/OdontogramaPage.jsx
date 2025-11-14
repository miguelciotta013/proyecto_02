import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './OdontogramaPage.module.css';
import DienteComponent from '../../components/fichas/dienteComponent';
import EditarFichaPatologicaModal from '../../components/fichas/editarFichaPatologicaModal'


function OdontogramaPage() {
  const { idPaciente, idFicha } = useParams();
  const navigate = useNavigate();
  
  const [odontogramaData, setOdontogramaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchOdontograma();
  }, [idFicha]);

  const fetchOdontograma = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ficha_medica/ficha/${idFicha}/odontograma/`);
      const data = await response.json();
      
      if (data.success) {
        console.log('📊 Datos del odontograma:', data.data); // Debug
        console.log('🦷 Estructura odontograma:', data.data.odontograma); // Debug
        setOdontogramaData(data.data);
      } else {
        alert('Error al cargar el odontograma');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar el odontograma');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const response = await fetch(`/api/ficha_medica/ficha/${idFicha}/odontograma/pdf/`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `odontograma_${idFicha}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Error al generar el PDF');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al descargar el PDF');
    }
  };

  const renderDientesRow = (dientes, numerosArriba = true) => {
    return (
      <div className={styles.dientesRow}>
        {dientes.map(numDiente => {
          const dienteData = odontogramaData.odontograma[numDiente] || {
            extraido: false,
            caras_tratadas: [],
            tratamientos: []
          };

          // Debug para cada diente
          if (dienteData.caras_tratadas.length > 0 || dienteData.extraido) {
            console.log(` Diente ${numDiente}:`, {
              caras: dienteData.caras_tratadas,
              extraido: dienteData.extraido,
              tratamientos: dienteData.tratamientos
            });
          }

          // Determinar si es superior según AMBOS juegos de dientes
          // Superiores: 11-18, 21-28 (adultos) y 51-55, 61-65 (niños)
          const esSuperior = (numDiente >= 11 && numDiente <= 28) || (numDiente >= 51 && numDiente <= 65);

          return (
            <div key={numDiente} className={styles.dienteContainer}>
              {numerosArriba && (
                <span className={styles.dienteNumero}>{numDiente}</span>
              )}
              <DienteComponent
                carasTratadas={dienteData.caras_tratadas}
                extraido={dienteData.extraido}
                esSuperior={esSuperior}
              />
              {!numerosArriba && (
                <span className={styles.dienteNumero}>{numDiente}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.card}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Cargando odontograma...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!odontogramaData) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.card}>
          <p>No se encontró el odontograma</p>
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => navigate(`/historial/${idPaciente}`)}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const { paciente, odontograma, estructura_dientes, ficha_patologica } = odontogramaData;

  // Definir todas las patologías
  const patologiasMedicas = [
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
  ];

  const patologiasOdontologicas = [
    { field: 'portador_protesis', label: 'Portador de Prótesis' },
    { field: 'problema_periodontal', label: 'Problema Periodontal' },
    { field: 'ortodoncia', label: 'Ortodoncia' },
    { field: 'mala_oclusion', label: 'Mala Oclusión' },
    { field: 'lesion_mucosa', label: 'Lesión de Mucosa' }
  ];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Odontograma - Ficha #{idFicha}</h2>
          <div className={styles.buttonGroup}>
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => navigate(`/historial/${idPaciente}`)}
            >
              ← Volver
            </button>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setShowEditModal(true)}
              title="Editar ficha patológica"
            >
              Editar Ficha Patológica
            </button>
            <button 
              className={`${styles.btn} ${styles.btnSuccess}`}
              onClick={handleDescargarPDF}
              title="Descargar PDF"
            >
              Descargar
            </button>
          </div>
        </div>

        {/* Información del paciente */}
        <div className={styles.pacienteInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>Paciente:</span>
            <span className={styles.value}>{paciente.apellido}, {paciente.nombre}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>DNI:</span>
            <span className={styles.value}>{paciente.dni}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>Fecha de Nacimiento:</span>
            <span className={styles.value}>{paciente.fecha_nacimiento}</span>
          </div>
        </div>

        {/* Referencias */}
        <div className={styles.referencias}>
          <h3 className={styles.referenciasTitle}>REFERENCIAS:</h3>
          <div className={styles.referenciasList}>
            <div className={styles.referenciaItem}>
              <div className={styles.cuadradoAzul}></div>
              <span>Prestaciones requeridas (caras tratadas)</span>
            </div>
            <div className={styles.referenciaItem}>
              <div className={styles.xRoja}>
                <span className={styles.xRojaLine1}></span>
                <span className={styles.xRojaLine2}></span>
              </div>
              <span>Diente ausente o a extraer</span>
            </div>
          </div>
        </div>

        {/* Odontograma */}
        <div className={styles.odontogramaContainer}>
          {/* Dientes permanentes superiores */}
          <div className={styles.arcadaSuperior}>
            <div className={styles.arcadaLabel}>
              <span className={styles.labelLeft}>Derecha</span>
              <span className={styles.labelRight}>Izquierda</span>
            </div>
            
            {/* Fila 1: 18-11, 21-28 */}
            <div className={styles.filaCompleta}>
              {renderDientesRow([18, 17, 16, 15, 14, 13, 12, 11], true)}
              <div className={styles.separadorCentral}></div>
              {renderDientesRow([21, 22, 23, 24, 25, 26, 27, 28], true)}
            </div>

            {/* Fila 4: 48-41, 31-38 */}
            <div className={styles.filaCompleta}>
              {renderDientesRow([48, 47, 46, 45, 44, 43, 42, 41], false)}
              <div className={styles.separadorCentral}></div>
              {renderDientesRow([31, 32, 33, 34, 35, 36, 37, 38], false)}
            </div>

            {/* Línea divisoria horizontal */}
          <div className={styles.lineaDivisoria}></div>

            {/* Fila 2: 55-51, 61-65 (temporales superiores) */}
            <div className={styles.filaCompleta}>
              <div className={styles.espacioVacio}></div>
              <div className={styles.espacioVacio}></div>
              <div className={styles.espacioVacio}></div>
              {renderDientesRow([55, 54, 53, 52, 51], true)}
              <div className={styles.separadorCentral}></div>
              {renderDientesRow([61, 62, 63, 64, 65], true)}
              <div className={styles.espacioVacio}></div>
              <div className={styles.espacioVacio}></div>
              <div className={styles.espacioVacio}></div>
            </div>
          </div>


          {/* Dientes inferiores */}
          <div className={styles.arcadaInferior}>
            {/* Fila 3: 85-81, 71-75 (temporales inferiores) */}
            <div className={styles.filaCompleta}>
              <div className={styles.espacioVacio}></div>
              <div className={styles.espacioVacio}></div>
              <div className={styles.espacioVacio}></div>
              {renderDientesRow([85, 84, 83, 82, 81], false)}
              <div className={styles.separadorCentral}></div>
              {renderDientesRow([71, 72, 73, 74, 75], false)}
              <div className={styles.espacioVacio}></div>
              <div className={styles.espacioVacio}></div>
              <div className={styles.espacioVacio}></div>
            </div>

            
          </div>
        </div>

        {/* Observaciones de la ficha */}
        {odontogramaData.observaciones && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}> Observaciones</h3>
            <p className={styles.observacionesText}>{odontogramaData.observaciones}</p>
          </div>
        )}

        {/* Ficha Patológica */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}> Ficha Patológica</h3>
          {ficha_patologica ? (
            <div className={styles.fichaPatologicaContent}>
              {/* Condiciones Médicas Generales */}
              <div className={styles.patologiaSeccion}>
                <h4 className={styles.patologiaSubtitle}>Condiciones Médicas Generales</h4>
                <div className={styles.checkboxGrid}>
                  {patologiasMedicas.map(({ field, label }) => (
                    <label key={field} className={styles.checkboxItemReadonly}>
                      <input
                        type="checkbox"
                        checked={!!ficha_patologica[field]}
                        readOnly
                        disabled
                        className={styles.checkboxReadonly}
                      />
                      <span className={ficha_patologica[field] ? styles.labelActivo : styles.labelInactivo}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condiciones Odontológicas */}
              <div className={styles.patologiaSeccion}>
                <h4 className={styles.patologiaSubtitle}>Condiciones Odontológicas</h4>
                <div className={styles.checkboxGrid}>
                  {patologiasOdontologicas.map(({ field, label }) => (
                    <label key={field} className={styles.checkboxItemReadonly}>
                      <input
                        type="checkbox"
                        checked={!!ficha_patologica[field]}
                        readOnly
                        disabled
                        className={styles.checkboxReadonly}
                      />
                      <span className={ficha_patologica[field] ? styles.labelActivo : styles.labelInactivo}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Medicación */}
              <div className={styles.patologiaSeccion}>
                <h4 className={styles.patologiaSubtitle}>Medicación</h4>
                <label className={styles.checkboxItemReadonly}>
                  <input
                    type="checkbox"
                    checked={!!ficha_patologica.toma_medicacion}
                    readOnly
                    disabled
                    className={styles.checkboxReadonly}
                  />
                  <span className={ficha_patologica.toma_medicacion ? styles.labelActivo : styles.labelInactivo}>
                    ¿Toma medicación actualmente?
                  </span>
                </label>
              </div>
              
              {/* Observaciones adicionales */}
              {ficha_patologica.otra && (
                <div className={styles.otrasPatologias}>
                  <span className={styles.label}>Otras condiciones:</span>
                  <span className={styles.value}>{ficha_patologica.otra}</span>
                </div>
              )}
            </div>
          ) : (
            <p className={styles.noData}>No hay ficha patológica registrada</p>
          )}
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && ficha_patologica && (
        <EditarFichaPatologicaModal
          fichaPatologica={ficha_patologica}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchOdontograma();
          }}
        />
      )}
    </div>
  );
}

export default OdontogramaPage;