import React, { useState } from 'react';


export default function CierreForm({ onSubmit, montoEsperado = 10, initial = {} }) {
  const [comentario, setComentario] = useState(initial.comentario || '');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const confirmarCierre = async () => {
    setLoading(true);
    try {
      if (onSubmit)
        await onSubmit({
          monto_cierre: Number(montoEsperado),
          comentario: comentario.trim() || 'Cierre automático con monto esperado',
        });
      setComentario('');
      alert('✅ Caja cerrada correctamente.');
    } catch (err) {
      console.error('Error al cerrar caja:', err);
      alert('❌ Ocurrió un error al cerrar la caja.');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
          maxWidth: 420,
          margin: '20px auto',
          textAlign: 'center',
        }}
      >
        <h3 style={{ marginBottom: 10, color: '#2e7d9d' }}>💼 Cierre de Caja</h3>

        <div
          style={{
            background: '#f7f9fc',
            borderRadius: 10,
            padding: 15,
            border: '1px solid #e0e0e0',
          }}
        >
          <p>
            <strong style={{ color: '#2e7d9d' }}>💰 Total esperado:</strong>{' '}
            <span style={{ fontWeight: 'bold', color: '#2e7d9d' }}>${montoEsperado}</span>
          </p>
          <p>
            <strong style={{ color: '#2e7d9d' }}>📅 Fecha:</strong>{' '}
            {new Date().toLocaleDateString()}
          </p>
        </div>

        <input
          type="text"
          placeholder="Comentario (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ccc',
            fontSize: '0.95rem',
            width: '100%',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#d32f2f',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 8,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            transition: '0.3s',
          }}
        >
          {loading ? 'Cerrando...' : `Cerrar Caja Automáticamente ($${montoEsperado})`}
        </button>
      </form>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 0,
              borderRadius: 12,
              width: '90%',
              maxWidth: 400,
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: '#2e7d9d',
                color: 'white',
                padding: '10px 0',
                fontWeight: 'bold',
                fontSize: '1.1rem',
              }}
            >
              Confirmar Cierre de Caja
            </div>

            <div style={{ padding: 20 }}>
              <p style={{ color: '#2e7d9d', fontWeight: 'bold' }}>
                ¿Deseas cerrar la caja con el monto esperado?
              </p>
              <p>
                <strong>Total esperado:</strong>{' '}
                <span style={{ color: '#2e7d9d', fontWeight: 'bold' }}>
                  ${montoEsperado}
                </span>
              </p>
              <p>Una vez cerrada, no se podrán registrar más movimientos.</p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 15,
                  marginTop: 20,
                }}
              >
                <button
                  onClick={confirmarCierre}
                  disabled={loading}
                  style={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  ✅ Confirmar
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    backgroundColor: '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
