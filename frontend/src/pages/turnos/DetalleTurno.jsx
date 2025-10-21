import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import TurnoDetalle from '../../components/turnos/TurnoDetalle';
import { obtenerTurno, eliminarTurno, cambiarEstadoTurno } from '../../api/turnosApi';

export default function DetalleTurno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [turno, setTurno] = useState(null);
  const [loading, setLoading] = useState(true);

  const viewOnly = Boolean(location?.state?.viewOnly);

  useEffect(() => {
    const fetchTurno = async () => {
      setLoading(true);
      try {
        const r = await obtenerTurno(id);
        if (r && r.success) {
          setTurno(r.data);
        } else {
          alert(r?.error || 'Error al obtener turno');
          navigate('/turnos');
        }
      } catch (e) {
        alert(e.message || String(e));
        navigate('/turnos');
      } finally {
        setLoading(false);
      }
    };

    fetchTurno();
  }, [id, navigate]);

  async function handleEliminar(id_turno) {
    const r = await eliminarTurno(id_turno);
    if (r && r.success) {
      alert('Turno cancelado');
      navigate('/turnos');
    } else {
      alert(r?.error || 'Error al cancelar turno');
    }
  }

  function handleEditar(id_turno) {
    navigate(`/turnos/${id_turno}/editar`);
  }

  async function handleCambiarEstado(id_turno, id_estado) {
    if (!id_estado) return;
    try {
      const r = await cambiarEstadoTurno(id_turno, parseInt(id_estado, 10));
      if (r && r.success) {
        // recargamos los datos del turno actualizado
        const r2 = await obtenerTurno(id);
        if (r2 && r2.success) setTurno(r2.data);
      } else {
        alert(r?.error || 'Error al cambiar estado');
      }
    } catch (e) {
      alert(e.message || String(e));
    }
  }

  if (loading)
    return (
      <div className="app-container">
        <div className="card">
          <p className="muted">Cargando...</p>
        </div>
      </div>
    );

  return (
    <div className="app-container page-padding">
      <TurnoDetalle
        turno={turno}
        readOnly={viewOnly}
        onClose={() => navigate('/turnos')}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onCambiarEstado={handleCambiarEstado}
      />
    </div>
  );
}
