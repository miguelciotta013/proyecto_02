import React, { useEffect, useState } from 'react';
import { listObrasSociales, addObraSocial } from '../../api/pacientesApi';

export default function ObraSocialForm({ id_paciente, onClose, onAssigned }) {
  const [obras, setObras] = useState([]);
  const [selected, setSelected] = useState('');
  const [credencial, setCredencial] = useState('');
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
      const payload = { id_obra_social: selected, credencial_paciente: credencial, id_parentesco: 1 };
      const resp = await addObraSocial(id_paciente, payload);
      if (resp && resp.success) {
        onAssigned && onAssigned(resp.data);
        onClose && onClose();
      } else setError(resp?.error || 'Error al asignar');
    } catch (e) { setError(e.message || String(e)); }
    finally { setLoading(false); }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '30px 40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
        fontFamily: 'Poppins, sans-serif',
        animation: 'fadeIn 0.3s ease-in-out'
      }}>
        <h3 style={{ marginBottom: 20, textAlign: 'center', color: '#1976d2' }}>
          Asignar obra social
        </h3>

        {error && (
          <div style={{
            color: 'red',
            marginBottom: 10,
            background: '#ffe6e6',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '0.9em'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ fontWeight: '600', color: '#333' }}>Obra Social</label><br />
            <select
              onChange={e => setSelected(e.target.value)}
              value={selected || ''}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginTop: '5px',
                fontSize: '1em'
              }}
            >
              <option value="">-- Seleccionar --</option>
              {obras.map(o => (
                <option key={o.id_obra_social} value={o.id_obra_social}>{o.nombre_os}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ fontWeight: '600', color: '#333' }}>Credencial</label><br />
            <input
              value={credencial}
              onChange={e => setCredencial(e.target.value)}
              placeholder="Número de credencial"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginTop: '5px',
                fontSize: '1em'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 20 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#9e9e9e',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#1976d2',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}