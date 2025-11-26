import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const API_URL = "http://127.0.0.1:8000/api";

// Iconos SVG simples
const DollarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const TrendingDownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const SparklesIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v18M3 12h18M19.07 4.93l-14.14 14.14M4.93 4.93l14.14 14.14"></path>
  </svg>
);

export default function Dashboard() {
  const [dataCaja, setDataCaja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [filtroFecha, setFiltroFecha] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/caja/`);
        const data = await res.json();
        const registros = Array.isArray(data.data) ? data.data : [];
        setDataCaja(registros);
        calcularTotales(registros);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calcularTotales = (registros) => {
    let ingresos = 0, egresos = 0;
    for (const item of registros) {
      ingresos += parseFloat(item.monto_cierre || 0);
      egresos += parseFloat(item.monto_apertura || 0);
    }
    setTotalIngresos(ingresos);
    setTotalEgresos(egresos);
  };

  const dataFiltrada = filtroFecha
    ? dataCaja.filter(item =>
        new Date(item.fecha_hora_apertura).toISOString().slice(0, 10) === filtroFecha
      )
    : dataCaja;

  const dataPorDia = dataFiltrada.reduce((acc, mov) => {
    const fecha = new Date(mov.fecha_hora_apertura).toLocaleDateString();
    const apertura = parseFloat(mov.monto_apertura || 0);
    const cierre = parseFloat(mov.monto_cierre || 0);
    if (!acc[fecha]) acc[fecha] = { fecha, ingresos: 0, egresos: 0 };
    acc[fecha].ingresos += cierre;
    acc[fecha].egresos += apertura;
    return acc;
  }, {});

  const dataGrafico = Object.values(dataPorDia);
  const dataPie = [
    { name: "Ingresos", value: totalIngresos },
    { name: "Egresos", value: totalEgresos },
  ];

  const saldo = totalIngresos - totalEgresos;
  const saldoPositivo = saldo >= 0;

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f3f7 0%, #f0f9ff 50%, #e8f3f7 100%)',
      padding: '32px',
      fontFamily: 'Segoe UI, system-ui, -apple-system, sans-serif'
    },
    header: {
      background: 'linear-gradient(135deg, #2e7d9d 0%, #1565c0 100%)',
      borderRadius: '16px',
      padding: '28px 32px',
      boxShadow: '0 8px 24px rgba(46, 125, 157, 0.3)',
      marginBottom: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    iconBox: {
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '14px',
      borderRadius: '14px',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      fontSize: '2.2rem',
      fontWeight: '700',
      color: 'white',
      margin: '0 0 6px 0',
      letterSpacing: '0.5px'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '1rem',
      margin: 0
    },
    sparkles: {
      color: 'rgba(255, 255, 255, 0.8)'
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      marginBottom: '40px'
    },
    card: {
      background: 'white',
      borderRadius: '18px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease'
    },
    cardHover: {
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      transform: 'translateY(-4px)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    cardIconBox: {
      padding: '14px',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    cardIconGreen: {
      background: '#e8f5e9',
      color: '#4caf50'
    },
    cardIconRed: {
      background: '#ffebee',
      color: '#d32f2f'
    },
    cardIconBlue: {
      background: '#e3f2fd',
      color: '#1976d2'
    },
    badge: {
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700'
    },
    badgeGreen: {
      background: '#e8f5e9',
      color: '#4caf50'
    },
    badgeRed: {
      background: '#ffebee',
      color: '#d32f2f'
    },
    badgeBlue: {
      background: '#e3f2fd',
      color: '#1976d2'
    },
    cardLabel: {
      color: '#64748b',
      fontSize: '0.9rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      margin: '0 0 8px 0'
    },
    cardValue: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 16px 0'
    },
    cardBar: {
      height: '4px',
      borderRadius: '4px',
      marginTop: '12px'
    },
    cardBarGreen: {
      background: '#4caf50'
    },
    cardBarRed: {
      background: '#d32f2f'
    },
    cardBarBlue: {
      background: '#1976d2'
    },
    filterBox: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0',
      marginBottom: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    filterLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    filterIconBox: {
      background: '#2e7d9d',
      padding: '12px',
      borderRadius: '12px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    filterTitle: {
      color: '#2e7d9d',
      fontSize: '1.1rem',
      fontWeight: '700',
      margin: 0
    },
    filterRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    dateInput: {
      background: 'white',
      border: '2px solid #cbd5e1',
      color: '#1e293b',
      borderRadius: '10px',
      padding: '10px 16px',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    clearButton: {
      background: '#9e9e9e',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '10px 22px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(158, 158, 158, 0.3)'
    },
    chartBox: {
      background: 'white',
      borderRadius: '18px',
      padding: '28px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0',
      marginBottom: '40px'
    },
    chartTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#2e7d9d',
      margin: '0 0 28px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      paddingBottom: '12px',
      borderBottom: '2px solid #2e7d9d'
    },
    chartBar: {
      width: '4px',
      height: '32px',
      background: '#2e7d9d',
      borderRadius: '4px'
    },
    pieBox: {
      background: 'white',
      borderRadius: '18px',
      padding: '28px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0',
      maxWidth: '800px',
      margin: '0 auto'
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f3f7, #f0f9ff)',
        color: '#2e7d9d',
        textAlign: 'center'
      }}>
        <div>
          <div style={{
            width: '70px',
            height: '70px',
            border: '4px solid #e0f2fe',
            borderTop: '4px solid #2e7d9d',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 8px 0', color: '#2e7d9d' }}>
            Cargando Dashboard
          </p>
          <p style={{ color: '#64748b', margin: 0 }}>
            Procesando información financiera...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconBox}>
            <DollarIcon />
          </div>
          <div>
            <h1 style={styles.title}>Grafico de Cajas</h1>
            <p style={styles.subtitle}>Análisis en tiempo real de tu gestión</p>
          </div>
        </div>
        <div style={styles.sparkles}>
          <SparklesIcon />
        </div>
      </div>

      {/* Tarjetas */}
      <div style={styles.cardsGrid}>
        {/* Ingresos */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{...styles.cardIconBox, ...styles.cardIconGreen}}>
              <TrendingUpIcon />
            </div>
            <div style={{...styles.badge, ...styles.badgeGreen}}>↑ ACTIVO</div>
          </div>
          <p style={styles.cardLabel}>Total Ingresos</p>
          <p style={styles.cardValue}>${totalIngresos.toFixed(2)}</p>
          <div style={{...styles.cardBar, ...styles.cardBarGreen}}></div>
        </div>

        {/* Egresos */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{...styles.cardIconBox, ...styles.cardIconRed}}>
              <TrendingDownIcon />
            </div>
            <div style={{...styles.badge, ...styles.badgeRed}}>↓ ACTIVO</div>
          </div>
          <p style={styles.cardLabel}>Total Egresos</p>
          <p style={styles.cardValue}>${totalEgresos.toFixed(2)}</p>
          <div style={{...styles.cardBar, ...styles.cardBarRed}}></div>
        </div>

        {/* Saldo */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{...styles.cardIconBox, ...styles.cardIconBlue}}>
              <DollarIcon />
            </div>
            <div style={{...styles.badge, ...styles.badgeBlue}}>
              {saldoPositivo ? '✓ POSITIVO' : '⚠ ATENCIÓN'}
            </div>
          </div>
          <p style={styles.cardLabel}>Saldo Final</p>
          <p style={{...styles.cardValue, fontSize: '2.8rem', fontWeight: '800', color: saldoPositivo ? '#1976d2' : '#d32f2f'}}>
            ${saldo.toFixed(2)}
          </p>
          <div style={{...styles.cardBar, ...styles.cardBarBlue}}></div>
        </div>
      </div>

      {/* Filtro */}
      <div style={styles.filterBox}>
        <div style={styles.filterLeft}>
          <div style={styles.filterIconBox}>
            <FilterIcon />
          </div>
          <h3 style={styles.filterTitle}>Filtrar por fecha</h3>
        </div>
        <div style={styles.filterRight}>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            style={styles.dateInput}
            onFocus={(e) => e.target.style.borderColor = '#2e7d9d'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
          {filtroFecha && (
            <button 
              onClick={() => setFiltroFecha("")} 
              style={styles.clearButton}
              onMouseEnter={(e) => {
                e.target.style.background = '#757575';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(158, 158, 158, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#9e9e9e';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(158, 158, 158, 0.3)';
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Gráfico de Barras */}
      <div style={styles.chartBox}>
        <h3 style={styles.chartTitle}>
          <span style={styles.chartBar}></span>
          Movimientos Diarios
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dataGrafico}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4caf50" stopOpacity={1}/>
                <stop offset="100%" stopColor="#388e3c" stopOpacity={0.9}/>
              </linearGradient>
              <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d32f2f" stopOpacity={1}/>
                <stop offset="100%" stopColor="#c62828" stopOpacity={0.9}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="fecha" stroke="#64748b" style={{fontSize: '0.85rem'}} />
            <YAxis stroke="#64748b" style={{fontSize: '0.85rem'}} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            <Bar dataKey="ingresos" fill="url(#colorIngresos)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="egresos" fill="url(#colorEgresos)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Torta */}
      <div style={styles.pieBox}>
        <h3 style={styles.chartTitle}>
          <span style={styles.chartBar}></span>
          Distribución Total
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <defs>
              <linearGradient id="pieIngresos" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4caf50" />
                <stop offset="100%" stopColor="#388e3c" />
              </linearGradient>
              <linearGradient id="pieEgresos" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#d32f2f" />
                <stop offset="100%" stopColor="#c62828" />
              </linearGradient>
            </defs>
            <Pie
              data={dataPie}
              cx="50%"
              cy="50%"
              labelLine={{stroke: '#64748b', strokeWidth: 1.5}}
              outerRadius={140}
              innerRadius={70}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              style={{fontSize: '0.9rem', fontWeight: '600'}}
            >
              {dataPie.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={index === 0 ? "url(#pieIngresos)" : "url(#pieEgresos)"} 
                  stroke="white"
                  strokeWidth={3}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}