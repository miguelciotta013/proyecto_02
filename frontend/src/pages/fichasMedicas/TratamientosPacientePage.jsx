import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getPacienteDetalle, 
  getFichasPorPaciente,
  getCatalogos 
} from '../../api/fichasApi';
import TratamientosTable from '../../components/fichas/tratamientosTable';
import NuevoTratamientoModal from '../../components/fichas/nuevoTratamientoModal';
import FichaMedicaModal from '../../components/fichas/fichaMedicaModal';
import OdontogramaModal from '../../components/fichas/odontogramaModal';
import CobroModal from '../../components/fichas/cobroModal';

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
    setFichaSeleccionada(ficha);
    setModalFicha(true);
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
      <div className="main-container">
        <div className="card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="main-container">
        <div className="card">
          <p>No se encontró el paciente</p>
          <button className="btn btn-primary" onClick={() => navigate('/historial')}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            Tratamientos de {paciente.nombre_completo}
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/historial')}>
              ← Volver
            </button>
            <button className="btn btn-primary" onClick={() => setModalNuevo(true)}>
              + Agregar Tratamiento
            </button>
          </div>
        </div>

        <div className="info-card">
          <div className="info-row">
            <span className="info-label">DNI:</span>
            <span className="info-value">{paciente.dni}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Fecha de Nacimiento:</span>
            <span className="info-value">{paciente.fecha_nacimiento}</span>
          </div>
          {paciente.telefono && (
            <div className="info-row">
              <span className="info-label">Teléfono:</span>
              <span className="info-value">{paciente.telefono}</span>
            </div>
          )}
          {paciente.obras_sociales && paciente.obras_sociales.length > 0 && (
            <div className="info-row">
              <span className="info-label">Obra Social:</span>
              <span className="info-value">
                {paciente.obras_sociales.map(os => os.nombre_os).join(', ')}
              </span>
            </div>
          )}
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

      {modalFicha && fichaSeleccionada && (
        <FichaMedicaModal
          ficha={fichaSeleccionada}
          onClose={() => setModalFicha(false)}
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