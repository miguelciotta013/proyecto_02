import React, { useEffect, useState } from 'react';
import { listObrasSociales, addObraSocial } from '../../api/pacientesApi';
import { FaUser, FaIdCard, FaUsers } from 'react-icons/fa';

export default function ObraSocialForm({ id_paciente, onClose, onAssigned }) {
  const [obras, setObras] = useState([]);
  const [selected, setSelected] = useState('');
  const [credencial, setCredencial] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchObras(); }, []);

  async function fetchObras() {
    try {
      const resp = await listObrasSociales();
      if (resp && resp.success) setObras(resp.data || []);
    } catch (e) { console.error(e); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        id_obra_social: selected,
        credencial_paciente: credencial,
        id_parentesco: Number(parentesco),
      };
      const resp = await addObraSocial(id_paciente, payload);
      if (resp && resp.success) {
        onAssigned && onAssigned(resp.data);
        onClose && onClose();
      } else setError(resp?.error || 'Error al asignar');
    } catch (e) { setError(e.message || String(e)); }
    finally { setLoading(false); }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #ccc',
    fontSize: '1em',
    outline: 'none',
    transition: '0.3s',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)',
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #ffffff, #e0f7fa)',
        padding: '35px 40px',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
        fontFamily: 'Poppins, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Encabezado */}
        <h3 style={{
          marginBottom: 30,
          textAlign: 'center',
          color: '#0876beff',
          fontSize: '1.7rem',
          fontWeight: 700,
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          <FaUsers style={{ marginRight: 8 }} />
          Asignar Obra Social
        </h3>

        {/* Error */}
        {error && (
          <div style={{
            color: '#c62828',
            marginBottom: 15,
            background: '#ffebee',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '0.95em',
            textAlign: 'center',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Obra Social */}
          <div>
            <label style={{ fontWeight: 600, color: '#0845a8ff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaUsers /> Obra Social
            </label>
            <select
              value={selected || ''}
              onChange={e => setSelected(e.target.value)}
              required
              style={{ ...inputStyle, paddingLeft: '40px', backgroundImage: 'url("data:image/svg+xml,%3Csvg fill=\'%23004940\' height=\'16\' viewBox=\'0 0 24 24\' width=\'16\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M7 10l5 5 5-5z\'/%3E%3Cpath d=\'M0 0h24v24H0z\' fill=\'none\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="">-- Seleccionar --</option>
              {obras.map(o => (
                <option key={o.id_obra_social} value={o.id_obra_social}>{o.nombre_os}</option>
              ))}
            </select>
          </div>

          {/* Credencial */}
          <div>
            <label style={{ fontWeight: 600, color: '#073488ff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaIdCard /> Credencial
            </label>
            <input
              value={credencial}
              onChange={e => setCredencial(e.target.value)}
              placeholder="Número de credencial"
              style={inputStyle}
            />
          </div>

          {/* Parentesco */}
          <div>
            <label style={{ fontWeight: 600, color: 'hsla(215, 91%, 27%, 1.00)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaUser /> Parentesco
            </label>
            <select
              value={parentesco}
              onChange={(e) => setParentesco(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">-- Seleccionar --</option>
              <option value="1">Titular</option>
              <option value="2">Hijo</option>
              <option value="3">Cónyuge</option>
              <option value="4">Otro</option>
            </select>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#78909c',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                transition: '0.3s',
                boxShadow: '0 5px 10px rgba(0,0,0,0.15)'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#607d8b'}
              onMouseLeave={e => e.target.style.backgroundColor = '#78909c'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(90deg, #053bfdff, #0270edff)',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                transition: '0.3s',
                boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={e => e.target.style.background = 'linear-gradient(90deg, #0990f7ff, #00b7ffff)'}
              onMouseLeave={e => e.target.style.background = 'linear-gradient(90deg, #0566acff, #05c0ebff)'}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
