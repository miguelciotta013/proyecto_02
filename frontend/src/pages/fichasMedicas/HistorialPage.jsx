import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPacientes } from '../../api/fichasApi';
import PacientesTable from '../../components/fichas/pacientesTableFicha';
//import '../../styles/fichasMedicas.css';

function HistorialPage() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
//algo
  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const response = await getPacientes();
      if (response.data.success) {
        setPacientes(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      alert('Error al cargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handleVerTratamientos = (idPaciente) => {
    navigate(`/historial/paciente/${idPaciente}`);
  };

  const filteredPacientes = pacientes.filter(p =>
    p.dni_paciente.toString().includes(searchTerm) ||
    p.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellido_paciente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="main-container">
        <div className="card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Fichas Medicas</h2>
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por DNI, nombre o apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <PacientesTable
          pacientes={filteredPacientes}
          onVerTratamientos={handleVerTratamientos}
        />
      </div>
    </div>
  );
}

export default HistorialPage;