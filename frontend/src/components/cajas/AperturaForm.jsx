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
  }, [empleados, selectedEmpleado]);

  function handleSubmit(e) {
    e.preventDefault();

    const montoNum = parseFloat(monto);

    // ⛔ VALIDACIÓN DE NEGATIVOS
    if (isNaN(montoNum) || montoNum < 0) {
      alert("El monto de apertura no puede ser negativo.");
      return;
    }

    const payload = { 
      monto_apertura: montoNum,
      id_empleado: selectedEmpleado
    };

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
          min="0"
          step="0.01"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '2px solid #ccc',
            fontSize: '15px',
            marginTop: 5,
            transition: '0.3s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#2e7d9d')}
          onBlur={(e) => (e.target.style.borderColor = '#ccc')}
        />
      </label>

      {/* Select de empleado */}
      <label
        style={{
          display: 'flex',
          flexDirection: 'column',
          fontWeight: 500,
          color: '#333',
        }}
      >
        Empleado:
        <select
          value={selectedEmpleado}
          onChange={(e) => setSelectedEmpleado(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '2px solid #ccc',
            fontSize: '15px',
            marginTop: 5,
            cursor: 'pointer',
            transition: '0.3s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#2e7d9d')}
          onBlur={(e) => (e.target.style.borderColor = '#ccc')}
        >
          {empleados.map((emp) => (
            <option key={emp.id_empleado} value={emp.id_empleado}>
              {emp.nombre} {emp.apellido}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        style={{
          backgroundColor: '#2e7d9d',
          color: 'white',
          padding: '12px',
          border: 'none',
          borderRadius: 8,
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: 10,
        }}
      >
        Abrir Caja
      </button>
    </form>
  );
}
