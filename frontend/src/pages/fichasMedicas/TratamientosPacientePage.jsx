import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getPacienteDetalle, 
  getFichasPorPaciente,
  getCatalogos 
} from '../../api/fichasApi';
import TratamientosTable from '../../components/fichas/tratamientosTable';
import NuevoTratamientoModal from '../../components/fichas/nuevoTratamientoModal';
import OdontogramaModal from '../../components/fichas/odontogramaModal';
import CobroModal from '../../components/fichas/cobroModal';
import styles from '../../pages/fichasMedicas/Tratamientos.module.css';

function TratamientosPacientePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [paciente, setPaciente] = useState(null);
  const [tratamientos, setTratamientos] = useState([]);
  const [catalogos, setCatalogos] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalFicha, setModalFicha] = useState(false);
  const [modalOdontograma, setModalOdontograma] = useState(false);
  const [modalCobro, setModalCobro] = useState(false);
  
  // Datos seleccionados
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [cobroSeleccionado, setCobroSeleccionado] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pacienteRes, fichasRes, catalogosRes] = await Promise.all([
        getPacienteDetalle(id),
        getFichasPorPaciente(id),
        getCatalogos()
      ]);

      console.log('=== RESPUESTAS DEL BACKEND ===');
      console.log('Paciente:', pacienteRes);
      console.log('Fichas:', fichasRes);
      console.log('Catálogos completos:', catalogosRes);

      if (pacienteRes.data.success) {
        setPaciente(pacienteRes.data.data);
      }

      if (fichasRes.data.success) {
        setTratamientos(fichasRes.data.data);
      }

      if (catalogosRes.data.success) {
        // CORRECCIÓN: Acceder a catalogosRes.data.data
        console.log('Datos de catálogos:', catalogosRes.data.data);
        console.log('Dientes encontrados:', catalogosRes.data.data.dientes);
        setCatalogos(catalogosRes.data.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos del paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleVerFicha = (ficha) => {
    navigate(`/historial/${id}/ficha/${ficha.id_ficha_medica}`);
  };

  const handleVerOdontograma = (ficha) => {
    setFichaSeleccionada(ficha);
    setModalOdontograma(true);
  };

  const handleVerCobro = (cobro) => {
    setCobroSeleccionado(cobro);
    setModalCobro(true);
  };

  const handleTratamientoCreado = () => {
    setModalNuevo(false);
    fetchData();
  };

  const handleCobroActualizado = () => {
    setModalCobro(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.card}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className={styles.mainContainer}>
        <div className={styles.card}>
          <p>No se encontró el paciente</p>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => navigate('/historial')}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Tratamientos de {paciente.nombre_completo}</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate('/historial')}>
              ← Volver
            </button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setModalNuevo(true)}>
              + Agregar Tratamiento
            </button>
          </div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>DNI:</span>
            <span className={styles.infoValue}>{paciente.dni}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Fecha de Nacimiento:</span>
            <span className={styles.infoValue}>{paciente.fecha_nacimiento}</span>
          </div>
          {/* resto igual */}
        </div>

        <TratamientosTable
          tratamientos={tratamientos}
          onVerFicha={handleVerFicha}
          onVerOdontograma={handleVerOdontograma}
          onVerCobro={handleVerCobro}
        />
      </div>

      {/* Modales */}
      {modalNuevo && (
        <NuevoTratamientoModal
          paciente={paciente}
          catalogos={catalogos}
          onClose={() => setModalNuevo(false)}
          onSuccess={handleTratamientoCreado}
        />
      )}

      {modalOdontograma && fichaSeleccionada && (
        <OdontogramaModal
          ficha={fichaSeleccionada}
          paciente={paciente}
          onClose={() => setModalOdontograma(false)}
        />
      )}

      {modalCobro && cobroSeleccionado && (
        <CobroModal
          cobro={cobroSeleccionado}
          onClose={() => setModalCobro(false)}
          onUpdate={handleCobroActualizado}
        />
      )}
    </div>
  );
}

export default TratamientosPacientePage;