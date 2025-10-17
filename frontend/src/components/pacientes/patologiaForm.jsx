import React, { useEffect, useState, useCallback } from 'react';
import { getFichaPatologica, createFichaPatologica, updateFichaPatologica } from '../../api/pacientesApi';

export default function PatologiaForm({ id_paciente, onClose, onSaved }) {
  const [exists, setExists] = useState(false);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ useCallback evita el warning de dependencia
  const fetchFicha = useCallback(async () => {
    try {
      const resp = await getFichaPatologica(id_paciente);
      if (resp && resp.success) {
        if (resp.exists) {
          setExists(true);
          setData(resp.data || {});
        } else {
          setExists(false);
          setData({ id_paciente_os: resp.id_paciente_os });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [id_paciente]);

  useEffect(() => {
    fetchFicha();
  }, [fetchFicha]);

  function handleChange(e) {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let resp;
      if (exists) resp = await updateFichaPatologica(id_paciente, data);
      else resp = await createFichaPatologica(id_paciente, data);

      if (resp && resp.success) {
        onSaved && onSaved(resp.data);
        onClose && onClose();
      } else setError(resp?.errors || resp?.error || 'Error');
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 24,
          width: '420px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <h3 style={{ marginBottom: 16, textAlign: 'center', color: '#1976d2' }}>
          {exists ? 'Editar Ficha Patológica' : 'Crear Ficha Patológica'}
        </h3>

        {error && (
          <div
            style={{
              backgroundColor: '#fdecea',
              color: '#b71c1c',
              padding: 10,
              borderRadius: 8,
              marginBottom: 10,
              fontSize: 14,
            }}
          >
            {JSON.stringify(error)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={data.observaciones || ''}
              onChange={handleChange}
              rows={5}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: '1px solid #ccc',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ccc',
                color: '#333',
                padding: '8px 16px',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
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
                padding: '8px 16px',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
