import React, { useEffect, useState, useCallback } from "react";
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

  const fetchData = useCallback(async (fechaFiltro) => {
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
  }, [selectedDate]);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate, fetchData]);

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
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Agenda del Día 🗓️</h1>
        </div>

        <p style={styles.subtitle}>
          <span style={{ color: '#1565c0', fontWeight: 600 }}>
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
    case 'confirmado': return '#2e7d32';
    case 'cancelado': return '#c62828';
    case 'pendiente': return '#f9a825';
    default: return '#1565c0';
  }
}

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h3 style={{ color: "#1565c0", marginBottom: 16, fontSize: 24 }}>{title}</h3>
    {children}
  </div>
);

const DateButton = ({ children, onClick, type }) => {
  const colors = {
    blue: { bg: '#1976d2', color: 'white', hover: '#115293' },
    green: { bg: '#388e3c', color: 'white', hover: '#2e7d32' },
    gray: { bg: '#90a4ae', color: 'white', hover: '#607d8b' },
    red: { bg: '#c62828', color: 'white', hover: '#b71c1c' },
  };
  const style = colors[type] || colors.gray;

  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: 14,
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

const styles = {
  page: {
    fontFamily: "'Roboto', sans-serif",
    background: "#f5f7fa",
    minHeight: "100vh",
    padding: 30,
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    background: '#fff',
    borderRadius: 12,
    padding: 30,
    width: '100%',
    maxWidth: 1200,
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1565c0',
    padding: '20px 24px',
    color: 'white',
    textAlign: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    margin: 0,
    fontSize: 36,
    fontWeight: 700,
  },
  subtitle: { color: '#444', fontSize: 20, margin: '24px 0', textAlign: 'center' },
  dateControls: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30, justifyContent: 'center' },
  dateInput: {
    padding: 10,
    borderRadius: 8,
    border: '1px solid #1565c0',
    background: '#f1f5f9',
    color: '#1565c0',
    fontWeight: 600,
    minWidth: 140,
  },
  info: { color: '#555', fontSize: 16, textAlign: 'center', marginTop: 20 },
  error: { color: '#c62828', fontSize: 16, textAlign: 'center', marginTop: 20 },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 6px',
    fontSize: 15,
    minWidth: 800,
  },
  th: {
    padding: '14px',
    background: '#1565c0',
    color: 'white',
    textAlign: 'center',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: 14,
  },
  td: {
    padding: '12px',
    textAlign: 'center',
    background: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  },
  trEven: { background: '#e3f2fd' },
  trOdd: { background: '#f8fbff' },
};
