import React, { useState, useEffect } from 'react';
import empleadosApi from '../../api/empleadosApi';

export default function AperturaForm({ onSubmit }) {
  const [monto, setMonto] = useState('0.00');
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState('');

  useEffect(() => {
    let mounted = true;
    empleadosApi
      .listEmpleados()
      .then((resp) => {
        if (!mounted) return;
        if (resp && resp.success) setEmpleados(resp.data || []);
      })
      .catch(console.error);
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (empleados.length > 0 && !selectedEmpleado) {
      setSelectedEmpleado(String(empleados[0].id_empleado));
    }
  }, [empleados]);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { monto_apertura: monto };
    if (selectedEmpleado) payload.id_empleado = selectedEmpleado;
    if (onSubmit) onSubmit(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        padding: 30,
        backgroundColor: '#ffffff',
        borderRadius: 15,
        boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
        maxWidth: 450,
        margin: '30px auto',
        fontFamily: "'Poppins', sans-serif",
        borderTop: '5px solid #2e7d9d',
      }}
    >
      <h2
        style={{
          color: '#2e7d9d',
          textAlign: 'center',
          marginBottom: 10,
          fontWeight: '600',
        }}
      >
        Apertura de Caja
      </h2>

      {/* Campo monto */}
      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontWeight: 500,
          color: '#333',
        }}
      >
        Monto apertura:
        <input
          type="number"
          step="0.01"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          style={{
            marginTop: 6,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #9e9e9e',
            outline: 'none',
            fontSize: 15,
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#2e7d9d')}
          onBlur={(e) => (e.target.style.borderColor = '#9e9e9e')}
        />
      </label>

      {/* Selector de empleado */}
      {empleados.length > 0 && (
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontWeight: 500,
            color: '#333',
          }}
        >
          Empleado (opcional):
          <select
            value={selectedEmpleado}
            onChange={(e) => setSelectedEmpleado(e.target.value)}
            style={{
              marginTop: 6,
              padding: 10,
              borderRadius: 8,
              border: '1px solid #9e9e9e',
              backgroundColor: '#fff',
              fontSize: 15,
              transition: 'border 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#2e7d9d')}
            onBlur={(e) => (e.target.style.borderColor = '#9e9e9e')}
          >
            <option value="">-- Usar usuario autenticado --</option>
            {empleados.map((emp) => (
              <option key={emp.id_empleado} value={emp.id_empleado}>
                {emp.nombre}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Botón enviar */}
      <button
        type="submit"
        style={{
          padding: 12,
          borderRadius: 10,
          border: 'none',
          backgroundColor: '#4caf50',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: 16,
          transition: 'background-color 0.25s ease',
          boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = '#388e3c')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = '#4caf50')}
      >
        💰 Abrir caja
      </button>
    </form>
  );
}
