import React, { useEffect, useState } from 'react';
import { getFichaPatologica, createFichaPatologica, updateFichaPatologica } from '../../api/pacientesApi';

export default function PatologiaForm({ id_paciente, onClose, onSaved }) {
  const [exists, setExists] = useState(false);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { fetchFicha(); }, []);

  async function fetchFicha() {
    try {
      const resp = await getFichaPatologica(id_paciente);
      if (resp && resp.success) {
        if (resp.exists) { setExists(true); setData(resp.data || {}); }
        else { setExists(false); setData({ id_paciente_os: resp.id_paciente_os }); }
      }
    } catch (e) { console.error(e); }
  }

  function handleChange(e) { const { name, value } = e.target; setData(prev => ({ ...prev, [name]: value })); }

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      let resp;
      if (exists) resp = await updateFichaPatologica(id_paciente, data);
      else resp = await createFichaPatologica(id_paciente, data);

      if (resp && resp.success) { onSaved && onSaved(resp.data); onClose && onClose(); }
      else setError(resp?.errors || resp?.error || 'Error');
    } catch (e) { setError(e.message || String(e)); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: 12, marginTop: 12 }}>
      <h4>{exists ? 'Editar ficha patológica' : 'Crear ficha patológica'}</h4>
      {error && <div style={{ color: 'red' }}>{JSON.stringify(error)}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Observaciones</label><br />
          <textarea name="observaciones" value={data.observaciones || ''} onChange={handleChange} rows={4} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
          <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}
