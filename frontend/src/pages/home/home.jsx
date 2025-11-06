import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { obtenerTurnos } from '../../api/turnosApi';

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
        {/* Franja superior */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Agenda del Día 🗓️</h1>
        </div>

        <p style={styles.subtitle}>
          <span style={{ color: '#2e7d9d', fontWeight: 600 }}>
            Seleccioná la fecha para ver los turnos programados
          </span>
        </p>

        {/* Controles de fecha */}
        <div style={styles.dateControls}>
          <DateButton onClick={() => changeDate(-1)} type="gray">⬅️ Anterior</DateButton>
          <DateButton onClick={goToday} type="blue">📅 Hoy</DateButton>
          <DateButton onClick={() => changeDate(1)} type="gray">Siguiente ➡️</DateButton>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
          <DateButton onClick={openListadoTurnos} type="green">📋 Ver listado</DateButton>
        </div>

        {loading ? (
          <p style={styles.info}>🔄 Cargando información...</p>
        ) : error ? (
          <p style={styles.error}>⚠️ {error}</p>
        ) : (
          <Section title={`Turnos del ${selectedDate}`}>
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
                        <td style={styles.td}>{t.hora_turno ? String(t.hora_turno).slice(0,5) : '-'}</td>
                        <td style={styles.td}>{t.paciente_nombre || '-'}</td>
                        <td style={styles.td}>{t.paciente_apellido || '-'}</td>
                        <td style={styles.td}>{t.asunto || '-'}</td>
                        <td style={{...styles.td, fontWeight: 600, color: getEstadoColor(t.estado_nombre || t.estado)}}>
                          {t.estado_nombre || t.estado || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.info}>📭 No hay turnos registrados para esta fecha.</p>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

function getEstadoColor(estado) {
  switch ((estado || '').toLowerCase()) {
    case 'confirmado': return '#4caf50';
    case 'cancelado': return '#d32f2f';
    case 'pendiente': return '#f9a825';
    default: return '#2e7d9d';
  }
}

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h3 style={{ color: "#2e7d9d", marginBottom: 16, fontSize: 20 }}>{title}</h3>
    {children}
  </div>
);

const DateButton = ({ children, onClick, type }) => {
  const colors = {
    blue: { bg: '#1976d2', color: 'white', hover: '#0d47a1' },
    green: { bg: '#4caf50', color: 'white', hover: '#388e3c' },
    gray: { bg: '#9e9e9e', color: 'white', hover: '#757575' },
    red: { bg: '#d32f2f', color: 'white', hover: '#b71c1c' },
  };
  const style = colors[type] || colors.gray;

  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 18px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 600,
        transition: 'all 0.2s ease',
        boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = style.hover}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = style.bg}
    >
      {children}
    </button>
  );
};

const styles = {
  page: {
    fontFamily: "Poppins, sans-serif",
    background: "linear-gradient(135deg, #e1f5fe, #bbdefb)",
    minHeight: "100vh",
    padding: 40,
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    background: '#fff',
    borderRadius: 16,
    padding: 0,
    width: '100%',
    maxWidth: 1100,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#2e7d9d',
    padding: '18px 24px',
    color: 'white',
    textAlign: 'center',
  },
  headerTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 600,
  },
  subtitle: { color: '#444', fontSize: 18, margin: '24px 0', textAlign: 'center' },
  dateControls: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 30, justifyContent: 'center' },
  dateInput: {
    padding: 10,
    borderRadius: 10,
    border: '1px solid #2e7d9d',
    background: '#f7fbff',
    color: '#2e7d9d',
    fontWeight: 600,
    minWidth: 140,
  },
  info: { color: '#555', fontSize: 16, textAlign: 'center', marginTop: 20 },
  error: { color: '#d32f2f', fontSize: 16, textAlign: 'center', marginTop: 20 },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 6px',
    fontSize: 15,
  },
  th: {
    padding: '12px',
    background: '#2e7d9d',
    color: 'white',
    textAlign: 'center',
    borderRadius: 6,
  },
  td: {
    padding: '12px',
    textAlign: 'center',
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  trEven: { background: '#e3f2fd' },
  trOdd: { background: '#f8fbff' },
};
