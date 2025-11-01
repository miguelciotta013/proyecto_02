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
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        fontFamily: 'Poppins, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '6px solid #2e7d9d', // franja azul superior
        padding: '30px 35px',
      }}>
        {/* Encabezado */}
        <h3 style={{
          textAlign: 'center',
          color: '#2e7d9d',
          fontSize: '1.7rem',
          fontWeight: 700,
          marginBottom: 25,
        }}>
          <FaUsers style={{ marginRight: 8 }} /> Asignar Obra Social
        </h3>

        {/* Error */}
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#d32f2f',
            padding: '10px 12px',
            borderRadius: '10px',
            fontSize: '0.95em',
            textAlign: 'center',
            fontWeight: 600,
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Obra Social */}
          <div>
            <label style={{ fontWeight: 600, color: '#2e7d9d', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FaUsers /> Obra Social
            </label>
            <select
              value={selected || ''}
              onChange={e => setSelected(e.target.value)}
              required
              style={{ ...inputStyle }}
            >
              <option value="">-- Seleccionar --</option>
              {obras.map(o => (
                <option key={o.id_obra_social} value={o.id_obra_social}>{o.nombre_os}</option>
              ))}
            </select>
          </div>

          {/* Credencial */}
          <div>
            <label style={{ fontWeight: 600, color: '#2e7d9d', display: 'flex', alignItems: 'center', gap: 6 }}>
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
            <label style={{ fontWeight: 600, color: '#2e7d9d', display: 'flex', alignItems: 'center', gap: 6 }}>
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#9e9e9e', // gris: cancelar / cerrar
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                transition: '0.3s',
                boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#757575'}
              onMouseLeave={e => e.target.style.backgroundColor = '#9e9e9e'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#4caf50', // verde: agregar / guardar / confirmar
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                transition: '0.3s',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#388e3c'}
              onMouseLeave={e => e.target.style.backgroundColor = '#4caf50'}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
