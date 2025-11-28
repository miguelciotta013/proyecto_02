import React, { useState, useEffect } from 'react';
import { createPaciente, updatePaciente, getPaciente } from '../../api/pacientesApi';
import { 
  X, 
  User, 
  CreditCard, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Home,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function PacientesForm({ onClose, onCreated, initialData, onUpdated }) {
  const [form, setForm] = useState({
    dni_paciente: '',
    nombre_paciente: '',
    apellido_paciente: '',
    fecha_nacimiento: '',
    domicilio: '',
    localidad: '',
    telefono: '',
    correo: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [countryCode, setCountryCode] = useState("+54");
  const [localPhone, setLocalPhone] = useState('');

  const countryCodes = [
    { code: "+54", name: "Argentina", flag: "🇦🇷" },
    { code: "+591", name: "Bolivia", flag: "🇧🇴" },
    { code: "+55", name: "Brasil", flag: "🇧🇷" },
    { code: "+56", name: "Chile", flag: "🇨🇱" },
    { code: "+57", name: "Colombia", flag: "🇨🇴" },
    { code: "+506", name: "Costa Rica", flag: "🇨🇷" },
    { code: "+53", name: "Cuba", flag: "🇨🇺" },
    { code: "+593", name: "Ecuador", flag: "🇪🇨" },
    { code: "+503", name: "El Salvador", flag: "🇸🇻" },
    { code: "+34", name: "España", flag: "🇪🇸" },
    { code: "+1", name: "Estados Unidos", flag: "🇺🇸" },
    { code: "+33", name: "Francia", flag: "🇫🇷" },
    { code: "+502", name: "Guatemala", flag: "🇬🇹" },
    { code: "+504", name: "Honduras", flag: "🇭🇳" },
    { code: "+39", name: "Italia", flag: "🇮🇹" },
    { code: "+52", name: "México", flag: "🇲🇽" },
    { code: "+505", name: "Nicaragua", flag: "🇳🇮" },
    { code: "+507", name: "Panamá", flag: "🇵🇦" },
    { code: "+595", name: "Paraguay", flag: "🇵🇾" },
    { code: "+51", name: "Perú", flag: "🇵🇪" },
    { code: "+351", name: "Portugal", flag: "🇵🇹" },
    { code: "+1", name: "Puerto Rico", flag: "🇵🇷" },
    { code: "+598", name: "Uruguay", flag: "🇺🇾" },
    { code: "+58", name: "Venezuela", flag: "🇻🇪" }
  ];

  useEffect(() => {
    if (initialData) {
      // Extraer código de país del teléfono si existe
      const tel = initialData.telefono || '';
      const matchedCountry = countryCodes.find(c => tel.startsWith(c.code));
      
      if (matchedCountry) {
        setCountryCode(matchedCountry.code);
        setLocalPhone(tel.replace(matchedCountry.code, '').trim());
      } else {
        setLocalPhone(tel);
      }
      
      setForm({
        dni_paciente: initialData.dni_paciente || '',
        nombre_paciente: initialData.nombre_paciente || '',
        apellido_paciente: initialData.apellido_paciente || '',
        fecha_nacimiento: initialData.fecha_nacimiento || '',
        domicilio: initialData.domicilio || '',
        localidad: initialData.localidad || '',
        telefono: tel,
        correo: initialData.correo || ''
      });
    }
  }, [initialData]);

  function validateField(name, value) {
    // Asegurar que value sea string
    if (typeof value !== 'string') value = value ? String(value) : '';
    
    switch (name) {
      case 'dni_paciente':
        if (!value.trim()) return 'DNI es obligatorio';
        if (!/^\d{7,8}$/.test(value.trim())) return 'DNI debe tener 7 u 8 dígitos';
        if (/^0/.test(value.trim())) return 'DNI no puede comenzar con cero';
        const dniNum = Number(value.trim());
        if (dniNum < 1000000) return 'DNI inválido';
        if (dniNum > 99000000) return 'DNI fuera de rango real';
        return null;
        
      case 'nombre_paciente':
        if (!value.trim()) return 'Nombre es obligatorio';
        if (value.trim().length < 2) return 'Nombre debe tener al menos 2 caracteres';
        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(value)) return 'Nombre solo puede contener letras';
        return null;
        
      case 'apellido_paciente':
        if (!value.trim()) return 'Apellido es obligatorio';
        if (value.trim().length < 2) return 'Apellido debe tener al menos 2 caracteres';
        if (!/^[A-Za-zÀ-ÿ\s]+$/.test(value)) return 'Apellido solo puede contener letras';
        return null;
        
      case 'fecha_nacimiento':
        if (!value.trim()) return 'Fecha de nacimiento es obligatoria';
        const fecha = new Date(value);
        const hoy = new Date();
        const hace150Anios = new Date();
        hace150Anios.setFullYear(hoy.getFullYear() - 150);
        
        if (isNaN(fecha.getTime())) return 'Fecha inválida';
        if (fecha > hoy) return 'La fecha no puede ser futura';
        if (fecha < hace150Anios) return 'La fecha no puede ser tan antigua';
        return null;
        
      case 'telefono':
        if (!value.trim()) return 'Teléfono es obligatorio';
        const telLimpio = value.replace(/[\s\-()]/g, '');
        if (!telLimpio.startsWith('+')) {
          return 'El teléfono debe comenzar con + y el código de país';
        }
        if (!/^\+\d{7,15}$/.test(telLimpio)) {
          return 'Teléfono debe tener entre 7 y 15 dígitos después del código';
        }
        return null;
        
      case 'correo':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Correo electrónico no válido';
        }
        return null;

      default:
        return null;
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  }

  function validateForm() {
    const newErrors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const allTouched = {};
    Object.keys(form).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError('Por favor, corrige los errores antes de continuar');
      return;
    }

    setLoading(true);
    setSubmitError(null);
    
    try {
      let resp;
      
      if (initialData?.id_paciente) {
        console.log('✏️ Actualizando paciente:', initialData.id_paciente);
        resp = await updatePaciente(initialData.id_paciente, form);
      } else {
        console.log('➕ Creando nuevo paciente');
        resp = await createPaciente(form);
      }
      
      if (resp?.success) {
        console.log('✅ Operación exitosa:', resp.data);
        setSubmitSuccess(true);

        if (initialData?.id_paciente) {
          if (resp.data) {
            onUpdated?.(resp.data);
          } else {
            try {
              const full = await getPaciente(initialData.id_paciente);
              if (full?.success) onUpdated?.(full.data);
              else onUpdated?.(initialData);
            } catch (e) {
              console.error('Error fetching updated paciente:', e);
              onUpdated?.(initialData);
            }
          }
        } else {
          onCreated?.(resp.data);
        }

        setTimeout(() => {
          onClose?.();
        }, 500);
      } else {
        setSubmitError(resp?.error || 'Error al guardar el paciente');
      }
    } catch (e) {
      console.error('❌ Error:', e);
      const remoteErrors = e?.response?.data?.errors;
      if (remoteErrors && typeof remoteErrors === 'object') {
        const newErrors = { ...errors };
        Object.keys(remoteErrors).forEach(k => {
          const v = remoteErrors[k];
          newErrors[k] = Array.isArray(v) ? v.join(' ') : String(v);
        });
        setErrors(newErrors);
        setSubmitError('Por favor, corrige los errores en el formulario');
      } else {
        setSubmitError(e.message || 'Error de conexión con el servidor');
      }
    } finally {
      setLoading(false);
    }
  }

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const edad = calcularEdad(form.fecha_nacimiento);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={headerStyle}>
          <div style={headerTitleStyle}>
            <User size={28} style={{ color: '#fff' }} />
            <h2 style={titleStyle}>
              {initialData ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h2>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={34} />
          </button>
        </div>

        {/* Mensajes de error/éxito */}
        {submitError && (
          <div style={errorBoxStyle}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <span>{submitError}</span>
            <button onClick={() => setSubmitError(null)} style={closeAlertStyle}>
              <X size={16} />
            </button>
          </div>
        )}

        {submitSuccess && (
          <div style={successBoxStyle}>
            <CheckCircle size={20} style={{ flexShrink: 0 }} />
            <span>Paciente guardado correctamente</span>
          </div>
        )}

        {/* Formulario */}
        <div style={formContainerStyle}>
          <div style={formGridStyle}>
            
            {/* DNI */}
            <FormField
              icon={<CreditCard size={18} />}
              label="DNI"
              name="dni_paciente"
              type="text"
              placeholder="12345678"
              value={form.dni_paciente}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.dni_paciente && errors.dni_paciente}
              maxLength={8}
            />

            {/* Nombre */}
            <FormField
              icon={<User size={18} />}
              label="Nombre"
              name="nombre_paciente"
              type="text"
              placeholder="Nombre del paciente"
              value={form.nombre_paciente}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.nombre_paciente && errors.nombre_paciente}
            />

            {/* Apellido */}
            <FormField
              icon={<User size={18} />}
              label="Apellido"
              name="apellido_paciente"
              type="text"
              placeholder="Apellido del paciente"
              value={form.apellido_paciente}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.apellido_paciente && errors.apellido_paciente}
            />

            {/* Fecha de Nacimiento */}
            <div style={fieldContainerStyle}>
              <FormField
                icon={<Calendar size={18} />}
                label="Fecha de Nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.fecha_nacimiento && errors.fecha_nacimiento}
              />
              {edad !== null && !errors.fecha_nacimiento && (
                <div style={hintStyle}>
                  Edad: {edad} años
                </div>
              )}
            </div>

            {/* Teléfono con selector de país */}
            <div style={fieldContainerStyle}>
              <label style={labelStyle}>
                <span style={iconLabelStyle}><Phone size={18} /></span>
                Teléfono
              </label>
              <div style={phoneContainerStyle}>
                <select 
                  value={countryCode}
                  onChange={(e) => {
                    const newCode = e.target.value;
                    setCountryCode(newCode);
                    // Actualizar el teléfono completo
                    const fullPhone = localPhone ? `${newCode}${localPhone}` : '';
                    setForm(prev => ({ ...prev, telefono: fullPhone }));
                  }}
                  style={countrySelectStyle}
                >
                  {countryCodes.map(country => (
                    <option key={country.code + country.name} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                
                <input
                  type="tel"
                  name="telefono_local"
                  placeholder="3874123456"
                  value={localPhone}
                  onChange={(e) => {
                    const numberOnly = e.target.value.replace(/\D/g, '');
                    setLocalPhone(numberOnly);
                    const fullPhone = numberOnly ? `${countryCode}${numberOnly}` : '';
                    setForm(prev => ({ ...prev, telefono: fullPhone }));
                    
                    // Validar en tiempo real si ya fue tocado
                    if (touched.telefono) {
                      const errorMsg = validateField('telefono', fullPhone);
                      setErrors(prev => ({ ...prev, telefono: errorMsg }));
                    }
                  }}
                  onBlur={() => {
                    setTouched(prev => ({ ...prev, telefono: true }));
                    const errorMsg = validateField('telefono', form.telefono);
                    setErrors(prev => ({ ...prev, telefono: errorMsg }));
                  }}
                  style={{
                    ...phoneInputStyle,
                    borderColor: (touched.telefono && errors.telefono) ? '#f44336' : '#ddd'
                  }}
                />
              </div>
              {touched.telefono && errors.telefono && (
                <div style={errorTextStyle}>
                  <AlertCircle size={14} style={{ marginRight: 4 }} />
                  {errors.telefono}
                </div>
              )}
              <div style={hintStyle}>
                Formato: {countryCode} + número local
              </div>
            </div>

            {/* Correo */}
            <FormField
              icon={<Mail size={18} />}
              label="Correo (opcional)"
              name="correo"
              type="email"
              placeholder="nombre@gmail.com"
              value={form.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.correo && errors.correo}
              fullWidth
            />

            {/* Domicilio */}
            <FormField
              icon={<Home size={18} />}
              label="Domicilio"
              name="domicilio"
              type="text"
              placeholder="Calle 123"
              value={form.domicilio}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.domicilio && errors.domicilio}
              fullWidth
            />

            {/* Localidad */}
            <FormField
              icon={<MapPin size={18} />}
              label="Localidad"
              name="localidad"
              type="text"
              placeholder="Salta"
              value={form.localidad}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.localidad && errors.localidad}
            />
          </div>

          {/* Botones */}
          <div style={actionsStyle}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={saveButtonStyle}
            >
              {loading ? (
                <>Guardando...</>
              ) : (
                <>
                  <Save size={18} style={{ marginRight: 8 }} />
                  {initialData ? 'Actualizar Paciente' : 'Crear Paciente'}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={cancelButtonStyle}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente reutilizable para campos
function FormField({ 
  icon, 
  label, 
  name, 
  type, 
  placeholder, 
  value, 
  onChange, 
  onBlur, 
  error, 
  fullWidth,
  maxLength 
}) {
  return (
    <div style={{ ...fieldContainerStyle, gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
      <label style={labelStyle}>
        {icon && <span style={iconLabelStyle}>{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        style={{
          ...inputStyle,
          borderColor: error ? '#f44336' : '#ddd'
        }}
      />
      {error && (
        <div style={errorTextStyle}>
          <AlertCircle size={14} style={{ marginRight: 4 }} />
          {error}
        </div>
      )}
    </div>
  );
}

// --- ESTILOS ---

const overlayStyle = {
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
  backdropFilter: 'blur(4px)',
  padding: '20px',
  overflowY: 'auto',
  fontFamily: "'Poppins', sans-serif"
};

const containerStyle = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  width: '100%',
  maxWidth: '800px',
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
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

const errorBoxStyle = {
  margin: '20px 24px 0',
  padding: '12px 16px',
  backgroundColor: '#ffebee',
  border: '2px solid #f44336',
  borderRadius: '10px',
  color: '#c62828',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '14px',
  fontWeight: '500'
};

const successBoxStyle = {
  margin: '20px 24px 0',
  padding: '12px 16px',
  backgroundColor: '#e8f5e9',
  border: '2px solid #4caf50',
  borderRadius: '10px',
  color: '#2e7d32',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: '14px',
  fontWeight: '500'
};

const closeAlertStyle = {
  marginLeft: 'auto',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  color: 'inherit'
};

const formContainerStyle = {
  padding: '24px',
  overflowY: 'auto'
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '24px'
};

const fieldContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const iconLabelStyle = {
  color: '#2e7d9d',
  display: 'flex',
  alignItems: 'center'
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '80px',
  border: '2px solid #ddd',
  fontSize: '14px',
  transition: 'all 0.2s',
  fontFamily: "'Poppins', sans-serif",
  boxSizing: 'border-box'
};

const errorTextStyle = {
  fontSize: '12px',
  color: '#f44336',
  display: 'flex',
  alignItems: 'center',
  fontWeight: '500'
};

const hintStyle = {
  fontSize: '12px',
  color: '#4caf50',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center'
};

const actionsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '12px',
  paddingTop: '20px',
  borderTop: '2px solid #f0f0f0'
};

const saveButtonStyle = {
  padding: '14px 20px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#4caf50',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)',
  fontFamily: "'Poppins', sans-serif"
};

const cancelButtonStyle = {
  padding: '14px 20px',
  borderRadius: '10px',
  border: '2px solid #999',
  backgroundColor: 'transparent',
  color: '#666',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: "'Poppins', sans-serif"
};

const phoneContainerStyle = {
  display: 'flex',
  gap: '8px',
  alignItems: 'stretch'
};

const countrySelectStyle = {
  padding: '12px 12px',
  borderRadius: '8px',
  border: '2px solid #ddd',
  fontSize: '14px',
  minWidth: '120px',     // 👈 ANCHO FIJO
  fontFamily: "'Poppins', sans-serif",
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontWeight: '500'
};


const phoneInputStyle = {
  flex: 1,
  minWidth: '200px',   // 👈 LE DA ESPACIO REAL
  padding: '12px 12px',
  borderRadius: '8px',
  border: '2px solid #ddd',
  fontSize: '14px',
  transition: 'all 0.2s',
  fontFamily: "'Poppins', sans-serif",
  boxSizing: 'border-box'
};
