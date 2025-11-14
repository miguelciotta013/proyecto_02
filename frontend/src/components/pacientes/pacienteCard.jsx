import React, { useEffect, useState } from 'react';
import { removeObraSocial } from '../../api/pacientesApi';
import { 
  X, 
  Edit, 
  Trash2, 
  Heart, 
  FileText, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard,
  User,
  Plus
} from 'lucide-react';

export default function PacienteCard({
  paciente,
  onClose,
  onEditar,
  onEliminar,
  onAsignarObra,
  onAgregarFicha,
  onObraRemoved,
  onObraAssigned,
  onUpdated
}) {
  const [pacienteData, setPacienteData] = useState(paciente);
  const [closing, setClosing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setPacienteData(paciente);
  }, [paciente]);

  if (!pacienteData) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose?.(), 300);
  };

  const handleEliminar = () => {
    if (showConfirmDelete) {
      onEliminar?.(pacienteData.id_paciente);
      handleClose();
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleObraRemoved = async (id_paciente_os) => {
    if (!window.confirm('¿Seguro que querés eliminar esta obra social del paciente?')) return;
    
    try {
      const resp = await removeObraSocial(pacienteData.id_paciente, id_paciente_os);
      
      if (resp?.success) {
        const updated = {
          ...pacienteData,
          obras_sociales: pacienteData.obras_sociales.filter(o => o.id_paciente_os !== id_paciente_os)
        };
        setPacienteData(updated);
        onObraRemoved?.(updated);
        onUpdated?.(updated);
      } else {
        alert(resp?.error || 'Error al eliminar obra social');
      }
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  const handleObraAssigned = (obra) => {
    const updated = { 
      ...pacienteData, 
      obras_sociales: [...(pacienteData.obras_sociales || []), obra] 
    };
    setPacienteData(updated);
    onObraAssigned?.(updated);
    onUpdated?.(updated);
  };

  // Calcular edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div style={overlayStyle(closing)} onClick={handleClose}>
      <div style={cardStyle(closing)} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={headerStyle}>
          <div style={headerTitleStyle}>
            <User size={28} style={{ color: '#fff' }} />
            <h2 style={titleStyle}>Información del Paciente</h2>
          </div>
          <button onClick={handleClose} style={closeButtonStyle}>
            <X size={24} />
          </button>
        </div>

        {/* Avatar y nombre */}
        <div style={mainInfoStyle}>
          <div style={avatarStyle}>
            {(pacienteData.nombre_paciente?.[0] || 'P').toUpperCase()}
            {(pacienteData.apellido_paciente?.[0] || '').toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={nameStyle}>
              {pacienteData.nombre_paciente || 'Sin nombre'} {pacienteData.apellido_paciente || ''}
            </h3>
            <div style={dniBadgeStyle}>
              <CreditCard size={16} style={{ marginRight: 6 }} />
              DNI: {pacienteData.dni_paciente || 'N/A'}
            </div>
          </div>
        </div>

        {/* Información personal */}
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>Datos Personales</h4>
          <div style={detailsGridStyle}>
            
            <div style={detailRowStyle}>
              <div style={iconWrapperStyle}>
                <Calendar size={18} style={{ color: '#2e7d9d' }} />
              </div>
              <div style={detailContentStyle}>
                <span style={detailLabelStyle}>Fecha de Nacimiento</span>
                <span style={detailValueStyle}>{formatearFecha(pacienteData.fecha_nacimiento)}</span>
              </div>
            </div>

            <div style={detailRowStyle}>
              <div style={iconWrapperStyle}>
                <User size={18} style={{ color: '#2e7d9d' }} />
              </div>
              <div style={detailContentStyle}>
                <span style={detailLabelStyle}>Edad</span>
                <span style={detailValueStyle}>{calcularEdad(pacienteData.fecha_nacimiento)} años</span>
              </div>
            </div>

            <div style={detailRowStyle}>
              <div style={iconWrapperStyle}>
                <Phone size={18} style={{ color: '#2e7d9d' }} />
              </div>
              <div style={detailContentStyle}>
                <span style={detailLabelStyle}>Teléfono</span>
                <a href={`tel:${pacienteData.telefono}`} style={linkStyle}>
                  {pacienteData.telefono || 'No registrado'}
                </a>
              </div>
            </div>

            {pacienteData.correo && (
              <div style={detailRowStyle}>
                <div style={iconWrapperStyle}>
                  <Mail size={18} style={{ color: '#2e7d9d' }} />
                </div>
                <div style={detailContentStyle}>
                  <span style={detailLabelStyle}>Email</span>
                  <a href={`mailto:${pacienteData.correo}`} style={linkStyle}>
                    {pacienteData.correo}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Obras Sociales */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h4 style={sectionTitleStyle}>
              <Heart size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Obras Sociales
            </h4>
            <button 
              onClick={() => onAsignarObra?.(pacienteData.id_paciente, handleObraAssigned)}
              style={addObraButtonStyle}
            >
              <Plus size={16} style={{ marginRight: 4 }} />
              Agregar
            </button>
          </div>

          <div style={obraContainerStyle}>
            {pacienteData.obras_sociales?.length ? (
              <div style={obraListStyle}>
                {pacienteData.obras_sociales.map(os => (
                  <div key={os.id_paciente_os} style={obraItemStyle}>
                    <div style={obraInfoStyle}>
                      <div style={obraNameStyle}>
                        {os.obra_social_nombre || 'Sin nombre'}
                      </div>
                      <div style={obraCredentialStyle}>
                        Nº Credencial: {os.credencial_paciente || 'No registrada'}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleObraRemoved(os.id_paciente_os)}
                      style={deleteObraButtonStyle}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#c62828'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#f44336'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={emptyObraStyle}>
                <Heart size={32} style={{ color: '#ccc', marginBottom: 8 }} />
                <p style={{ margin: 0, color: '#999' }}>Sin obras sociales registradas</p>
              </div>
            )}
          </div>
        </div>

        {/* Mensaje de confirmación */}
        {showConfirmDelete && (
          <div style={warningBoxStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              ⚠️ <strong>¿Confirmar dar de baja a este paciente?</strong>
            </div>
            <button 
              onClick={() => setShowConfirmDelete(false)}
              style={cancelButtonStyle}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Botones de acción */}
        <div style={actionsContainerStyle}>
          <button
            onClick={() => onEditar?.(pacienteData.id_paciente)}
            style={editButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 15px rgba(76, 175, 80, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4caf50';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 10px rgba(76, 175, 80, 0.2)';
            }}
          >
            <Edit size={18} style={{ marginRight: 8 }} />
            Editar Paciente
          </button>

          <button
            onClick={handleEliminar}
            style={{
              ...deleteButtonStyle,
              backgroundColor: showConfirmDelete ? '#c62828' : '#f44336'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#d32f2f';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 15px rgba(244, 67, 54, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = showConfirmDelete ? '#c62828' : '#f44336';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 10px rgba(244, 67, 54, 0.2)';
            }}
          >
            <Trash2 size={18} style={{ marginRight: 8 }} />
            {showConfirmDelete ? 'Confirmar Eliminación' : 'Dar de Baja'}
          </button>

          <button
            onClick={() => onAgregarFicha?.(pacienteData.id_paciente)}
            style={fichaButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fb8c00';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 15px rgba(255, 152, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ff9800';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 10px rgba(255, 152, 0, 0.2)';
            }}
          >
            <FileText size={18} style={{ marginRight: 8 }} />
            Agregar Ficha Médica
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ESTILOS ---

const overlayStyle = (closing) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  opacity: closing ? 0 : 1,
  transition: 'opacity 0.3s ease',
  backdropFilter: 'blur(4px)',
  padding: '20px',
  overflowY: 'auto'
});

const cardStyle = (closing) => ({
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  maxWidth: '700px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  fontFamily: "'Poppins', sans-serif",
  transform: closing ? 'scale(0.95)' : 'scale(1)',
  transition: 'transform 0.3s ease',
  margin: 'auto'
});

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  background: 'linear-gradient(135deg, #2e7d9d 0%, #1565c0 100%)',
  borderBottom: '3px solid #1565c0'
};

const headerTitleStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const titleStyle = {
  margin: 0,
  color: '#fff',
  fontSize: '20px',
  fontWeight: '700'
};

const closeButtonStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  border: 'none',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#fff',
  transition: 'all 0.2s',
  padding: 0
};

const mainInfoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  padding: '24px',
  borderBottom: '2px solid #f0f0f0'
};

const avatarStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #2e7d9d 0%, #1565c0 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '32px',
  fontWeight: '700',
  flexShrink: 0,
  boxShadow: '0 4px 15px rgba(46, 125, 157, 0.3)'
};

const nameStyle = {
  margin: '0 0 8px 0',
  color: '#333',
  fontSize: '24px',
  fontWeight: '700'
};

const dniBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: '#e3f2fd',
  color: '#1976d2',
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  fontFamily: 'monospace'
};

const sectionStyle = {
  padding: '20px 24px',
  borderBottom: '1px solid #f0f0f0'
};

const sectionTitleStyle = {
  margin: '0 0 16px 0',
  color: '#2e7d9d',
  fontSize: '16px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center'
};

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px'
};

const addObraButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const detailsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px'
};

const detailRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const iconWrapperStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  backgroundColor: '#f0f7ff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const detailContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1
};

const detailLabelStyle = {
  fontSize: '11px',
  color: '#888',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '2px'
};

const detailValueStyle = {
  fontSize: '14px',
  color: '#333',
  fontWeight: '500'
};

const linkStyle = {
  fontSize: '14px',
  color: '#2e7d9d',
  fontWeight: '500',
  textDecoration: 'none',
  transition: 'all 0.2s'
};

const obraContainerStyle = {
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  padding: '16px',
  minHeight: '100px'
};

const obraListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const obraItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#fff',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '2px solid #e0e0e0',
  transition: 'all 0.2s'
};

const obraInfoStyle = {
  flex: 1
};

const obraNameStyle = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '4px'
};

const obraCredentialStyle = {
  fontSize: '13px',
  color: '#666',
  fontFamily: 'monospace'
};

const deleteObraButtonStyle = {
  padding: '8px',
  backgroundColor: '#f44336',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
};

const emptyObraStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  textAlign: 'center'
};

const warningBoxStyle = {
  margin: '0 24px 16px',
  padding: '16px',
  backgroundColor: '#fff3cd',
  border: '2px solid #ffc107',
  borderRadius: '10px',
  color: '#856404',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap'
};

const cancelButtonStyle = {
  padding: '6px 16px',
  backgroundColor: '#666',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  transition: 'all 0.2s'
};

const actionsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px',
  padding: '24px',
  backgroundColor: '#fafafa'
};

const baseButtonStyle = {
  padding: '12px 16px',
  borderRadius: '10px',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontWeight: '600',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Poppins', sans-serif"
};

const editButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#4caf50',
  boxShadow: '0 4px 10px rgba(76, 175, 80, 0.2)'
};

const deleteButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#f44336',
  boxShadow: '0 4px 10px rgba(244, 67, 54, 0.2)'
};

const fichaButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#ff9800',
  boxShadow: '0 4px 10px rgba(255, 152, 0, 0.2)'
};