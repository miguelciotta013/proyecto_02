import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Heart, 
  FileText, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard,
  X,
  User,
  Mail
} from 'lucide-react';

export default function PacienteCard({ 
  paciente, 
  onClose,
  onEditar, 
  onEliminar, 
  onAsignarObra, 
  onAgregarFicha 
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Calcular edad a partir de fecha de nacimiento
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

  const handleEliminar = () => {
    if (showConfirmDelete) {
      onEliminar(paciente.id_paciente);
      setShowConfirmDelete(false);
      if (onClose) onClose();
    } else {
      setShowConfirmDelete(true);
    }
  };

  return (
    <div style={cardContainerStyle}>
      {/* Header con botón cerrar */}
      <div style={headerStyle}>
        <div style={headerTitleStyle}>
          <User size={28} style={{ color: '#2e7d9d' }} />
          <h2 style={titleStyle}>Información del Paciente</h2>
        </div>
        {onClose && (
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={24} />
          </button>
        )}
      </div>

      {/* Información principal con avatar */}
      <div style={mainInfoStyle}>
        <div style={avatarStyle}>
          {(paciente.nombre_paciente?.[0] || 'P').toUpperCase()}
          {(paciente.apellido_paciente?.[0] || '').toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={nameStyle}>
            {paciente.nombre_paciente || 'Sin nombre'} {paciente.apellido_paciente || 'Sin apellido'}
          </h3>
          <div style={dniBadgeStyle}>
            <CreditCard size={16} style={{ marginRight: 6 }} />
            DNI: {paciente.dni_paciente || 'N/A'}
          </div>
        </div>
      </div>

      {/* Información detallada */}
      <div style={detailsContainerStyle}>
        <div style={detailRowStyle}>
          <div style={iconWrapperStyle}>
            <Calendar size={18} style={{ color: '#2e7d9d' }} />
          </div>
          <div style={detailContentStyle}>
            <span style={detailLabelStyle}>Fecha de Nacimiento</span>
            <span style={detailValueStyle}>{formatearFecha(paciente.fecha_nacimiento)}</span>
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={iconWrapperStyle}>
            <User size={18} style={{ color: '#2e7d9d' }} />
          </div>
          <div style={detailContentStyle}>
            <span style={detailLabelStyle}>Edad</span>
            <span style={detailValueStyle}>{calcularEdad(paciente.fecha_nacimiento)} años</span>
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={iconWrapperStyle}>
            <Phone size={18} style={{ color: '#2e7d9d' }} />
          </div>
          <div style={detailContentStyle}>
            <span style={detailLabelStyle}>Teléfono</span>
            <a href={`tel:${paciente.telefono}`} style={phoneValueStyle}>
              {paciente.telefono || 'No registrado'}
            </a>
          </div>
        </div>

        {paciente.email && (
          <div style={detailRowStyle}>
            <div style={iconWrapperStyle}>
              <Mail size={18} style={{ color: '#2e7d9d' }} />
            </div>
            <div style={detailContentStyle}>
              <span style={detailLabelStyle}>Email</span>
              <a href={`mailto:${paciente.email}`} style={phoneValueStyle}>
                {paciente.email}
              </a>
            </div>
          </div>
        )}

        <div style={detailRowStyle}>
          <div style={iconWrapperStyle}>
            <MapPin size={18} style={{ color: '#2e7d9d' }} />
          </div>
          <div style={detailContentStyle}>
            <span style={detailLabelStyle}>Dirección</span>
            <span style={detailValueStyle}>{paciente.direccion || 'No registrada'}</span>
          </div>
        </div>

        <div style={detailRowStyle}>
          <div style={iconWrapperStyle}>
            <Heart size={18} style={{ color: '#2e7d9d' }} />
          </div>
          <div style={detailContentStyle}>
            <span style={detailLabelStyle}>Obra Social</span>
            <span style={detailValueStyle}>
              {paciente.obra_social?.nombre_obra_social || paciente.obraSocial || 'No asignada'}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div style={actionsContainerStyle}>
        <button
          onClick={() => onEditar(paciente.id_paciente)}
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
          Editar
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
          {showConfirmDelete ? '¿Confirmar eliminación?' : 'Dar de baja'}
        </button>

        <button
          onClick={() => onAsignarObra(paciente.id_paciente)}
          style={obraSocialButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1976d2';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 15px rgba(33, 150, 243, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#2196f3';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 10px rgba(33, 150, 243, 0.2)';
          }}
        >
          <Heart size={18} style={{ marginRight: 8 }} />
          Asignar Obra Social
        </button>

        <button
          onClick={() => onAgregarFicha(paciente.id_paciente)}
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

      {/* Mensaje de confirmación de eliminación */}
      {showConfirmDelete && (
        <div style={warningBoxStyle}>
          ⚠️ <strong>Atención:</strong> Esta acción dará de baja al paciente del sistema.
          <button 
            onClick={() => setShowConfirmDelete(false)}
            style={cancelDeleteStyle}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

// --- ESTILOS ---

const cardContainerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  padding: '0',
  maxWidth: '600px',
  width: '100%',
  margin: '0 auto',
  fontFamily: "'Poppins', sans-serif",
  overflow: 'hidden'
};

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
  background: 'rgba(255,255,255,0.2)',
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

const detailsContainerStyle = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const detailRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
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
  fontSize: '12px',
  color: '#888',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '2px'
};

const detailValueStyle = {
  fontSize: '15px',
  color: '#333',
  fontWeight: '500'
};

const phoneValueStyle = {
  fontSize: '15px',
  color: '#2e7d9d',
  fontWeight: '500',
  textDecoration: 'none',
  transition: 'all 0.2s'
};

const actionsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px',
  padding: '24px',
  backgroundColor: '#fafafa',
  borderTop: '2px solid #f0f0f0'
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

const obraSocialButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#2196f3',
  boxShadow: '0 4px 10px rgba(33, 150, 243, 0.2)'
};

const fichaButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#ff9800',
  boxShadow: '0 4px 10px rgba(255, 152, 0, 0.2)'
};

const warningBoxStyle = {
  margin: '0 24px 24px',
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

const cancelDeleteStyle = {
  marginLeft: 'auto',
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