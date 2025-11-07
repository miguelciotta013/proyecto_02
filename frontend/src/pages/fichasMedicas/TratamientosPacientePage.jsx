import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getPacienteDetalle, 
  getFichasMedicas,
  getCatalogos,
  getCajaEstado,      
  getFichaPatologica 
} from '../../api/fichasApi';
import TratamientosTable from '../../components/fichas/tratamientosTable';
import NuevoTratamientoModal from '../../components/fichas/nuevoTratamientoModal';
import FichaPatologicaModal from '../../components/fichas/fichaPatologicaModal';
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
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [fichaPatologicaId, setFichaPatologicaId] = useState(null);
  
  // Modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalFichaPatologica, setModalFichaPatologica] = useState(false);
  const [modalOdontograma, setModalOdontograma] = useState(false);
  const [modalCobro, setModalCobro] = useState(false);
  
  // Datos seleccionados
  const [fichaSeleccionada, setFichaSeleccionada] = useState(null);
  const [cobroSeleccionado, setCobroSeleccionado] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  // ✅ FUNCIÓN MODIFICADA - Acepta filtros
  const fetchData = async (filtros = {}) => {
    console.log('🔍 Buscando con filtros:', filtros);  // ← Agregar esto
    try {
      setLoading(true);
      
      const params = {
        id_paciente: id,
        ...filtros
      };
    
    console.log('📤 Parámetros enviados al backend:', params);  // ← Y esto
    
    // ... resto del código      
      const [pacienteRes, fichasRes, catalogosRes] = await Promise.all([
        getPacienteDetalle(id),
        getFichasMedicas(params),  // ← CAMBIADO: Ahora acepta filtros
        getCatalogos()
      ]);

      if (pacienteRes.data.success) {
        setPaciente(pacienteRes.data.data);
      }

      if (fichasRes.data.success) {
        setTratamientos(fichasRes.data.data);
      }

      if (catalogosRes.data.success) {
        setCatalogos(catalogosRes.data.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos del paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarTratamiento = async () => {
    try {
      // PASO 1: Verificar que hay caja abierta
      const cajaRes = await getCajaEstado();
      
      if (!cajaRes.data.caja_abierta) {
        alert('❌ No se puede crear una ficha médica.\n\nNo hay una caja abierta en este momento.\nPor favor, abra una caja antes de continuar.');
        return;
      }
      
      setCajaAbierta(cajaRes.data.data);
      
      // PASO 2: Verificar que el paciente tiene obra social
      if (!paciente.obras_sociales || paciente.obras_sociales.length === 0) {
        alert('❌ Este paciente no tiene obras sociales asociadas.\n\nPor favor, asocie una obra social al paciente antes de crear un tratamiento.');
        return;
      }
      
      // PASO 3: Verificar si tiene ficha patológica
      const idPacienteOS = paciente.obras_sociales[0].id_paciente_os;
      const fichaPatRes = await getFichaPatologica(idPacienteOS);
      
      if (!fichaPatRes.data.exists) {
        // No tiene ficha patológica → Abrir modal para crearla
        setModalFichaPatologica(true);
      } else {
        // Tiene ficha patológica → Abrir modal de tratamiento directamente
        setFichaPatologicaId(fichaPatRes.data.data.id_ficha_patologica);
        setModalNuevo(true);
      }
      
    } catch (error) {
      console.error('Error al verificar requisitos:', error);
      alert('Error al verificar los requisitos para crear la ficha');
    }
  };

  const handleFichaPatologicaCreada = (idFichaPatologica) => {
    setFichaPatologicaId(idFichaPatologica);
    setModalFichaPatologica(false);
    setModalNuevo(true);
  };

  const handleVerFicha = (ficha) => {
    // Navegar a la página de detalle
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
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`} 
              onClick={handleAgregarTratamiento}
            >
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
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Teléfono:</span>
            <span className={styles.infoValue}>{paciente.telefono || 'No registrado'}</span>
          </div>
          {paciente.obras_sociales && paciente.obras_sociales.length > 0 && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Obras Sociales:</span>
              <span className={styles.infoValue}>
                {paciente.obras_sociales.map(os => os.nombre_os).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* ✅ AGREGADA PROP onFilterChange */}
        <TratamientosTable
          tratamientos={tratamientos}
          onVerFicha={handleVerFicha}
          onVerOdontograma={handleVerOdontograma}
          onVerCobro={handleVerCobro}
          onFilterChange={fetchData}  // ← NUEVA LÍNEA
        />
      </div>

      {/* Modal Ficha Patológica */}
      {modalFichaPatologica && paciente.obras_sociales?.[0] && (
        <FichaPatologicaModal
          paciente={paciente}
          idPacienteOS={paciente.obras_sociales[0].id_paciente_os}
          onClose={() => setModalFichaPatologica(false)}
          onSuccess={handleFichaPatologicaCreada}
        />
      )}

      {/* Modal Nuevo Tratamiento */}
      {modalNuevo && (
        <NuevoTratamientoModal
          paciente={paciente}
          catalogos={catalogos}
          idCaja={cajaAbierta?.id_caja}
          idFichaPatologica={fichaPatologicaId}
          onClose={() => setModalNuevo(false)}
          onSuccess={handleTratamientoCreado}
        />
      )}

      {/* Modal Odontograma */}
      {modalOdontograma && fichaSeleccionada && (
        <OdontogramaModal
          ficha={fichaSeleccionada}
          paciente={paciente}
          onClose={() => setModalOdontograma(false)}
        />
      )}

      {/* Modal Cobro */}
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