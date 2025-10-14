import React, { useEffect, useState } from 'react';
import { listObrasSociales, addObraSocial } from '../../api/pacientesApi';

export default function ObraSocialForm({ id_paciente, onClose, onAssigned }) {
  const [obras, setObras] = useState([]);
  const [selected, setSelected] = useState(null);
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
    setLoading(true); setError(null);
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
    <div style={{ border: '1px solid #ccc', padding: 12, marginTop: 12 }}>
      <h4>Asignar obra social</h4>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Obra social</label><br />
          <select onChange={e => setSelected(e.target.value)} value={selected || ''}>
            <option value="">-- seleccionar --</option>
            {obras.map(o => (
              <option key={o.id_obra_social} value={o.id_obra_social}>{o.nombre_os}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Credencial</label><br />
          <input value={credencial} onChange={e => setCredencial(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Asignando...' : 'Asignar'}</button>
          <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
