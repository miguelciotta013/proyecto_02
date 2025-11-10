import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getFichaDetalle, 
  deleteFichaMedica,
  downloadFichaPDF,
  handleApiError 
} from '../../api/fichasApi';
import styles from './FichaMedicaDetailPage.module.css';


function FichaMedicaDetailPage() {
  const { idPaciente, idFicha } = useParams();
  const navigate = useNavigate();
  
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [conformidades, setConformidades] = useState({});

  useEffect(() => {
    fetchFicha();
  }, [idFicha]);

  const fetchFicha = async () => {
    try {
      setLoading(true);
      const response = await getFichaDetalle(idFicha);
      
      if (response.data.success) {
        const fichaData = response.data.data;
        setFicha(fichaData);
        
        // Inicializar conformidades locales
        const conformidadesIniciales = {};
        fichaData.detalles?.forEach(detalle => {
          conformidadesIniciales[detalle.id_detalle] = detalle.conformidad_paciente || false;
        });
        setConformidades(conformidadesIniciales);
      }
    } catch (error) {
      console.error('Error al cargar ficha:', error);
      alert(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleConformidadChange = (idDetalle) => {
    setConformidades(prev => ({
      ...prev,
      [idDetalle]: !prev[idDetalle]
    }));
  };

  const handleGuardarConformidades = async () => {
    try {
      // Actualizar cada conformidad modificada
      const updates = Object.entries(conformidades).map(async ([idDetalle, valor]) => {
        const detalleOriginal = ficha.detalles.find(d => d.id_detalle === parseInt(idDetalle));
        
        // Solo actualizar si cambió
        if (detalleOriginal.conformidad_paciente !== valor) {
          const response = await fetch(
            `/api/ficha_medica/detalle/${idDetalle}/conformidad/`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ conformidad_paciente: valor })
            }
          );
          return response.json();
        }
      });

      await Promise.all(updates);
      alert('Conformidades actualizadas correctamente');
      setEditMode(false);
      fetchFicha(); // Recargar datos
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al actualizar las conformidades');
    }
  };

  const handleEliminar = async () => {
    const confirmar = window.confirm(
      '¿Está seguro que desea eliminar esta ficha médica?\n\nEsta acción no se puede deshacer.'
    );
    
    if (!confirmar) return;

    try {
      const response = await deleteFichaMedica(idFicha);
      
      if (response.data.success) {
        alert('Ficha médica eliminada correctamente');
        navigate(`/historial/${idPaciente}`);
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(handleApiError(error));
    }
  };

  const handleDescargarPDF = async () => {
    try {
      const response = await downloadFichaPDF(idFicha);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ficha_medica_${idFicha}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const handleCancelarEdicion = () => {
    // Restaurar valores originales
    const conformidadesOriginales = {};
    ficha.detalles?.forEach(detalle => {
      conformidadesOriginales[detalle.id_detalle] = detalle.conformidad_paciente || false;
    });
    setConformidades(conformidadesOriginales);
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.card}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Cargando ficha médica...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ficha) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.card}>
          <p>No se encontró la ficha médica</p>
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

  return (
    <div className={styles.mainContainer}>
      <div className={styles.card}>
        {/* Header con título y botones de acción */}
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Detalle de Ficha Médica #{idFicha}</h2>
          <div className={styles.buttonGroup}>
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => navigate(`/historial/${idPaciente}`)}
            >
              ← Volver
            </button>
            {!editMode ? (
              <>
                <button 
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => setEditMode(true)}
                  title="Editar conformidades"
                >
                  ✏️ Editar
                </button>
                <button 
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  onClick={handleDescargarPDF}
                  title="Descargar PDF"
                >
                  📄 PDF
                </button>
                <button 
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={handleEliminar}
                  title="Eliminar ficha"
                >
                  🗑️ Eliminar
                </button>
              </>
            ) : (
              <>
                <button 
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={handleCancelarEdicion}
                >
                  Cancelar
                </button>
                <button 
                  className={`${styles.btn} ${styles.btnSuccess}`}
                  onClick={handleGuardarConformidades}
                >
                  💾 Guardar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Contenido principal en grid de 2 columnas */}
        <div className={styles.contentGrid}>
          
          {/* COLUMNA IZQUIERDA */}
          <div className={styles.leftColumn}>
            
            {/* Sección 1: Información del Paciente */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>👤 Información del Paciente</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Nombre Completo:</span>
                  <span className={styles.value}>
                    {ficha.paciente_nombre} {ficha.paciente_apellido}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>DNI:</span>
                  <span className={styles.value}>
                    {ficha.paciente_dni || 'No registrado'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Fecha de Nacimiento:</span>
                  <span className={styles.value}>
                    {ficha.paciente_fecha_nacimiento || 'No registrada'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Teléfono:</span>
                  <span className={styles.value}>
                    {ficha.paciente_telefono || 'No registrado'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Domicilio:</span>
                  <span className={styles.value}>
                    {ficha.paciente_domicilio || 'No registrado'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Localidad:</span>
                  <span className={styles.value}>
                    {ficha.paciente_localidad || 'No registrada'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sección 2: Información de la Ficha */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>📋 Información de la Ficha</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Fecha de Atención:</span>
                  <span className={styles.value}>{ficha.fecha_creacion}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Odontólogo:</span>
                  <span className={styles.value}>{ficha.empleado_nombre}</span>
                </div>
                {ficha.observaciones && (
                  <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.label}>Observaciones:</span>
                    <span className={styles.value}>{ficha.observaciones}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 3: Obra Social */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🏥 Obra Social Utilizada</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Obra Social:</span>
                  <span className={styles.value}>{ficha.obra_social}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Credencial:</span>
                  <span className={styles.value}>{ficha.obra_social_credencial}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Titular:</span>
                  <span className={styles.value}>{ficha.obra_social_titular}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Parentesco:</span>
                  <span className={styles.value}>{ficha.obra_social_parentesco}</span>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA */}
          <div className={styles.rightColumn}>
            
            {/* Sección 4: Tratamientos Realizados */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🦷 Tratamientos Realizados</h3>
              {editMode && (
                <p className={styles.editHint}>
                  ℹ️ Marque las casillas para confirmar cada tratamiento
                </p>
              )}
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Importe</th>
                      <th>Diente</th>
                      <th>Cara</th>
                      <th>
                        {editMode ? 'Editar' : 'Conformidad'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ficha.detalles && ficha.detalles.length > 0 ? (
                      ficha.detalles.map((detalle) => (
                        <tr key={detalle.id_detalle}>
                          <td>{detalle.codigo_tratamiento || detalle.codigo}</td>
                          <td>${parseFloat(detalle.importe).toLocaleString('es-AR')}</td>
                          <td>{detalle.id_diente}</td>
                          <td>{detalle.cara_abreviatura || detalle.cara}</td>
                          <td className={styles.conformidadCell}>
                            {editMode ? (
                              <input
                                type="checkbox"
                                checked={conformidades[detalle.id_detalle] || false}
                                onChange={() => handleConformidadChange(detalle.id_detalle)}
                                className={styles.checkbox}
                              />
                            ) : (
                              <span className={
                                detalle.conformidad_paciente || conformidades[detalle.id_detalle]
                                  ? styles.conformidadSi 
                                  : styles.conformidadNo
                              }>
                                {detalle.conformidad_paciente || conformidades[detalle.id_detalle] ? '✓ Sí' : '✗ No'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#6c757d' }}>
                          No hay tratamientos registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección 5: Estado del Cobro */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>💰 Estado del Cobro</h3>
              {ficha.cobro ? (
                <div className={styles.cobroInfo}>
                  <div className={styles.montoTotal}>
                    <span>Monto Total:</span>
                    <span className={styles.montoValue}>
                      ${parseFloat(ficha.cobro.monto_total).toLocaleString('es-AR', {
                        minimumFractionDigits: 2
                      })}
                    </span>
                  </div>
                  <div className={styles.estadoBadge}>
                    <span>Estado:</span>
                    <span className={`${styles.badge} ${
                      ficha.cobro.estado_pago === 'pagado' ? styles.badgeSuccess :
                      ficha.cobro.estado_pago === 'pendiente' ? styles.badgeWarning :
                      styles.badgeInfo
                    }`}>
                      {ficha.cobro.estado_pago}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#6c757d' }}>
                  No hay información de cobro
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default FichaMedicaDetailPage;