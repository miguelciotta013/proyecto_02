import React, { useState, useEffect } from 'react';
import empleadosApi from '../../api/empleadosApi';

export default function AperturaForm({ onSubmit }) {
  const [monto, setMonto] = useState('0.00');
  const [empleados, setEmpleados] = useState([]);
  const [selectedEmpleado, setSelectedEmpleado] = useState('');

  useEffect(() => {
    let mounted = true;
    empleadosApi.listEmpleados().then((resp) => {
      if (!mounted) return;
      if (resp && resp.success) setEmpleados(resp.data || []);
    }).catch(console.error);
    return () => { mounted = false; };
  }, []);

  // Si hay empleados cargados y no hay seleccionado, seleccionar el primero por defecto
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
        gap: 16,
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
        maxWidth: 400,
        margin: '20px auto',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#333' }}>
        Monto apertura:
        <input 
          type="number" 
          value={monto} 
          onChange={(e) => setMonto(e.target.value)} 
          style={{
            marginTop: 6,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #ccc',
            outline: 'none',
            transition: 'border 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = "#1976d2"}
          onBlur={e => e.target.style.borderColor = "#ccc"}
        />
      </label>

      {empleados.length > 0 && (
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500, color: '#333' }}>
          Empleado (opcional):
          <select value={selectedEmpleado} onChange={e => setSelectedEmpleado(e.target.value)} style={{ marginTop: 6, padding: 10, borderRadius: 8 }}>
            <option value="">-- Usar usuario autenticado --</option>
            {empleados.map(emp => (
              <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre}</option>
            ))}
          </select>
        </label>
      )}

      <button
        type="submit"
        style={{
          padding: 12,
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#1976d2',
          color: '#fff',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={e => e.target.style.backgroundColor = '#1565c0'}
        onMouseLeave={e => e.target.style.backgroundColor = '#1976d2'}
      >
        Abrir caja
      </button>
    </form>
  );
}
