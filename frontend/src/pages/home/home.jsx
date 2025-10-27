import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { obtenerTurnos } from '../../api/turnosApi';

// Función para formatear fecha YYYY-MM-DD
function todayString(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function Home() {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayString);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  async function fetchData(fechaFiltro) {
    setLoading(true);
    setError(null);
    try {
      const fecha = fechaFiltro || selectedDate;
      const rTurnos = await obtenerTurnos(`?fecha=${fecha}`);
      if (rTurnos && rTurnos.success) setTurnos(rTurnos.data || []);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  function changeDate(days) {
    const [yyyy, mm, dd] = selectedDate.split('-');
    const cur = new Date(yyyy, mm - 1, dd);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(todayString(cur));
  }

  function goToday() {
    setSelectedDate(todayString());
  }

  function openListadoTurnos() {
    navigate(`/turnos?fecha=${selectedDate}`);
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>¡Bienvenida de vuelta!</h1>
        <p style={styles.subtitle}>Agenda para: <strong>{selectedDate}</strong></p>

        {/* Selector de fecha */}
        <div style={styles.dateControls}>
          <DateButton onClick={() => changeDate(-1)}>Anterior</DateButton>
          <DateButton onClick={goToday} type="primary">Hoy</DateButton>
          <DateButton onClick={() => changeDate(1)}>Siguiente</DateButton>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
          <DateButton onClick={openListadoTurnos} type="primary">Ver listado</DateButton>
        </div>

        {loading ? (
          <p style={styles.info}>Cargando información...</p>
        ) : error ? (
          <p style={styles.error}>{error}</p>
        ) : (
          <Section title="Turnos">
            {turnos.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Fecha", "Hora", "Nombre", "Apellido", "Asunto", "Estado"].map(col => (
                        <th key={col} style={styles.th}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {turnos.map((t, i) => (
                      <tr key={t.id_turno || i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={styles.td}>{t.fecha_turno || '-'}</td>
                        <td style={styles.td}>{t.hora_turno ? String(t.hora_turno).slice(0,5) : (t.hora || '-')}</td>
                        <td style={styles.td}>{t.paciente_nombre || t.nombre || '-'}</td>
                        <td style={styles.td}>{t.paciente_apellido || t.apellido || '-'}</td>
                        <td style={styles.td}>{t.asunto || '-'}</td>
                        <td style={{...styles.td, fontWeight: 600, color: getEstadoColor(t.estado_nombre || t.estado)}}>{t.estado_nombre || t.estado || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.info}>No hay turnos para esta fecha</p>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

// Función para colorear el estado
function getEstadoColor(estado) {
  switch ((estado || '').toLowerCase()) {
    case 'confirmado': return '#2e7d32'; // verde
    case 'cancelado': return '#d32f2f'; // rojo
    case 'pendiente': return '#f9a825'; // amarillo
    default: return '#1565c0'; // azul original
  }
}

// Componentes auxiliares
const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32, textAlign: 'left' }}>
    <h3 style={{ color: "#0d47a1", marginBottom: 16 }}>{title}</h3>
    {children}
  </div>
);

const DateButton = ({ children, onClick, type }) => {
  const colors = {
    default: { bg: '#f0f0f0', hover: '#e0e0e0', color: '#333' },
    primary: { bg: '#1976d2', hover: '#0d47a1', color: 'white' }
  };
  const style = colors[type] || colors.default;

  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 18px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 600,
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = style.hover}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = style.bg}
    >
      {children}
    </button>
  );
};

// Estilos mejorados manteniendo azul
const styles = {
  page: {
    fontFamily: "Poppins, sans-serif",
    background: "linear-gradient(135deg, #cce7ff, #bbdefb)",
    minHeight: "100vh",
    padding: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    background: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 1200,
    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
  },
  title: { color: '#1565c0', marginBottom: 8, fontSize: 32 },
  subtitle: { color: '#444', fontSize: 18, marginBottom: 24 },
  dateControls: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32, alignItems: 'center' },
  dateInput: { padding: 10, borderRadius: 8, border: '1px solid #ccc', minWidth: 140 },
  info: { color: '#777', fontSize: 16 },
  error: { color: 'red', fontSize: 16 },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 6px',
    fontSize: 15,
  },
  th: {
    padding: '12px',
    background: '#1976d2',
    color: 'white',
    textAlign: 'center',
    borderRadius: 6,
  },
  td: {
    padding: '12px',
    textAlign: 'center',
    background: 'white',
    borderRadius: 6,
    transition: 'all 0.2s',
  },
  trEven: { background: '#e3f2fd' },
  trOdd: { background: '#bbdefb' },
};
