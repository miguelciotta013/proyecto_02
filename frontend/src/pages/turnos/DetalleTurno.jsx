// src/pages/turnos/DetalleTurno.jsx
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

  // viene desde la lista de turnos de UN paciente
  const fromPatient = Boolean(location?.state?.fromPatient);
  const patientId = location?.state?.patientId;
  const patientName = location?.state?.nombre;
  const patientLast = location?.state?.apellido;

  useEffect(() => {
    const fetchTurno = async () => {
      setLoading(true);
      try {
        const r = await obtenerTurno(id);
        if (r && r.success) setTurno(r.data);
        else {
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
    if (!window.confirm('¿Seguro que querés cancelar este turno?')) return;
    const r = await eliminarTurno(id_turno);
    if (r && r.success) {
      alert('Turno cancelado');
      if (fromPatient && patientId) {
        navigate(`/turnos/paciente/${patientId}`, {
          state: {
            nombre: patientName,
            apellido: patientLast,
          },
        });
      } else {
        navigate('/turnos');
      }
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
        const up = await obtenerTurno(id);
        if (up && up.success) setTurno(up.data);
      } else alert(r?.error || 'Error al cambiar estado');
    } catch (e) {
      alert(e.message || String(e));
    }
  }

  if (loading) return <p>Cargando...</p>;
  if (!turno) return <p>No se encontró el turno</p>;

  return (
    <div style={{ padding: 16 }}>
      <TurnoDetalle
        turno={turno}
        readOnly={false}
        onClose={() => {
          if (fromPatient && patientId) {
            navigate(`/turnos/paciente/${patientId}`, {
              state: {
                nombre: patientName,
                apellido: patientLast,
              },
            });
          } else {
            navigate('/turnos');
          }
        }}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onCambiarEstado={handleCambiarEstado}
      />
    </div>
  );
}
