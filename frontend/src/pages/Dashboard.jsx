// frontend/src/pages/Dashboard.jsx - VERSIÓN MEJORADA
import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Calendar, Filter } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { accessToken } = useContext(AuthContext);
  
  const [stats, setStats] = useState({});
  const [movimientosCaja, setMovimientosCaja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const hoy = new Date();
  const hace30Dias = new Date(hoy);
  hace30Dias.setDate(hace30Dias.getDate() - 30);
  
  const [filtroCaja, setFiltroCaja] = useState({
    fechaDesde: hace30Dias.toISOString().split('T')[0],
    fechaHasta: hoy.toISOString().split('T')[0],
    tipo: 'mes'
  });

  const API_URL = 'http://localhost:8000/api';

  useEffect(() => {
    cargarDatos();
  }, [filtroCaja]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, cajaRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats/`),
        fetch(`${API_URL}/movimientos/caja/?periodo=${filtroCaja.tipo}`)
      ]);

      const statsData = await statsRes.json();
      const cajaData = await cajaRes.json();

      setStats(statsData);
      setMovimientosCaja(cajaData.data || []);
      
      setLoading(false);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al conectar con el servidor');
      setLoading(false);
    }
  };

  const aplicarRangoRapido = (dias) => {
    const hasta = new Date();
    const desde = new Date();
    desde.setDate(desde.getDate() - dias);
    
    let tipoAgrupacion = 'mes';
    if (dias <= 7) tipoAgrupacion = 'dia';
    else if (dias <= 60) tipoAgrupacion = 'semana';
    else if (dias > 365) tipoAgrupacion = 'año';
    
    setFiltroCaja({
      fechaDesde: desde.toISOString().split('T')[0],
      fechaHasta: hasta.toISOString().split('T')[0],
      tipo: tipoAgrupacion
    });
  };

  const calcularTotales = () => {
    const totalIngresos = movimientosCaja.reduce((sum, item) => sum + (item.ingresos || 0), 0);
    const totalEgresos = movimientosCaja.reduce((sum, item) => sum + (item.egresos || 0), 0);
    const balanceTotal = totalIngresos - totalEgresos;
    return { totalIngresos, totalEgresos, balanceTotal };
  };

  const { totalIngresos, totalEgresos, balanceTotal } = movimientosCaja.length > 0 
    ? calcularTotales() 
    : { totalIngresos: 0, totalEgresos: 0, balanceTotal: 0 };

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw className="animate-spin" style={{ color: '#2e7d9d', marginBottom: 20 }} size={56} />
        <div style={styles.loadingText}>Cargando Dashboard...</div>
        <div style={styles.loadingSubtext}>Obteniendo datos del servidor</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorBox}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorTitle}>Error de Conexión</p>
          <p style={styles.errorMessage}>{error}</p>
          <button onClick={cargarDatos} style={styles.errorButton}>
            <RefreshCw size={16} style={{ marginRight: 8 }} />
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* HEADER PRINCIPAL */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              <DollarSign size={32} style={{ marginRight: 12, verticalAlign: 'middle' }} />
              Centro de Control Financiero
            </h1>
            <p style={styles.headerSubtitle}>
              Análisis en tiempo real de ingresos, egresos y balance de caja
            </p>
          </div>
          <button onClick={cargarDatos} style={styles.refreshButton}>
            <RefreshCw size={18} />
          </button>
        </div>

        {/* TARJETAS DE RESUMEN */}
        <div style={styles.cardsGrid}>
          
          <div style={{ ...styles.card, ...styles.cardGreen }}>
            <div style={styles.cardIcon}>
              <TrendingUp size={32} />
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Ingresos Totales</div>
              <div style={styles.cardValue}>${totalIngresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
              <div style={styles.cardFooter}>Período seleccionado</div>
            </div>
          </div>

          <div style={{ ...styles.card, ...styles.cardRed }}>
            <div style={styles.cardIcon}>
              <TrendingDown size={32} />
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Egresos Totales</div>
              <div style={styles.cardValue}>${totalEgresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</div>
              <div style={styles.cardFooter}>Período seleccionado</div>
            </div>
          </div>

          <div style={{ ...styles.card, ...(balanceTotal >= 0 ? styles.cardBlue : styles.cardOrange) }}>
            <div style={styles.cardIcon}>
              <DollarSign size={32} />
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Balance Neto</div>
              <div style={styles.cardValue}>
                {balanceTotal >= 0 ? '+' : ''}${balanceTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
              <div style={styles.cardFooter}>
                {balanceTotal >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
              </div>
            </div>
          </div>

          <div style={{ ...styles.card, ...styles.cardPurple }}>
            <div style={styles.cardIcon}>
              <Calendar size={32} />
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardLabel}>Ingresos del Mes</div>
              <div style={styles.cardValue}>${stats.ingresos_mes?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}</div>
              <div style={styles.cardFooter}>Mes corriente</div>
            </div>
          </div>
        </div>

        {/* PANEL DE GRÁFICOS */}
        <div style={styles.chartPanel}>
          
          {/* CONTROLES DE FILTRO */}
          <div style={styles.filterSection}>
            <div style={styles.filterHeader}>
              <div style={styles.filterTitle}>
                <Filter size={20} />
                <span>Configurar Visualización</span>
              </div>
            </div>

            <div style={styles.filterControls}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Fecha Inicio</label>
                <input
                  type="date"
                  value={filtroCaja.fechaDesde}
                  onChange={(e) => setFiltroCaja({ ...filtroCaja, fechaDesde: e.target.value })}
                  style={styles.filterInput}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Fecha Fin</label>
                <input
                  type="date"
                  value={filtroCaja.fechaHasta}
                  onChange={(e) => setFiltroCaja({ ...filtroCaja, fechaHasta: e.target.value })}
                  style={styles.filterInput}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Agrupar por</label>
                <select
                  value={filtroCaja.tipo}
                  onChange={(e) => setFiltroCaja({ ...filtroCaja, tipo: e.target.value })}
                  style={styles.filterSelect}
                >
                  <option value="dia">📅 Días</option>
                  <option value="semana">📊 Semanas</option>
                  <option value="mes">📆 Meses</option>
                  <option value="año">🗓️ Años</option>
                </select>
              </div>
            </div>

            <div style={styles.quickFilters}>
              <span style={styles.quickFiltersLabel}>Accesos rápidos:</span>
              <button onClick={() => aplicarRangoRapido(7)} style={styles.quickButton}>7 días</button>
              <button onClick={() => aplicarRangoRapido(30)} style={styles.quickButton}>30 días</button>
              <button onClick={() => aplicarRangoRapido(90)} style={styles.quickButton}>3 meses</button>
              <button onClick={() => aplicarRangoRapido(180)} style={styles.quickButton}>6 meses</button>
              <button onClick={() => aplicarRangoRapido(365)} style={styles.quickButton}>1 año</button>
            </div>
          </div>

          {/* GRÁFICO PRINCIPAL */}
          <div style={styles.chartContainer}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Análisis Comparativo de Movimientos</h3>
              <p style={styles.chartSubtitle}>
                Visualización de ingresos, egresos y balance en el período seleccionado
              </p>
            </div>

            {movimientosCaja.length > 0 ? (
              <ResponsiveContainer width="100%" height={450}>
                <ComposedChart data={movimientosCaja} margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#17a2b8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#17a2b8" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="periodo" 
                    stroke="#666"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: 13, fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="#666"
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                    style={{ fontSize: 13, fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={styles.tooltip}
                    formatter={(value) => `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: 20, fontSize: 14, fontWeight: 600 }}
                    iconType="rect"
                  />
                  <Bar 
                    dataKey="ingresos" 
                    fill="url(#colorIngresos)"
                    name="💰 Ingresos" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={70}
                  />
                  <Bar 
                    dataKey="egresos" 
                    fill="url(#colorEgresos)"
                    name="💸 Egresos" 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={70}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#d32f2f" 
                    strokeWidth={4} 
                    name="📈 Balance"
                    dot={{ r: 5, fill: '#d32f2f', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div style={styles.noData}>
                <DollarSign size={64} color="#ccc" />
                <p style={styles.noDataText}>No hay datos disponibles</p>
                <p style={styles.noDataSubtext}>Selecciona un rango de fechas diferente o verifica que existan registros en caja</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Última actualización: {new Date().toLocaleString('es-AR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ESTILOS COMPLETOS
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '24px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  wrapper: {
    maxWidth: '1600px',
    margin: '0 auto'
  },
  
  // HEADER
  header: {
    background: 'linear-gradient(135deg, #2e7d9d 0%, #1976d2 100%)',
    padding: '32px 40px',
    borderRadius: '16px 16px 0 0',
    marginBottom: '0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white'
  },
  headerTitle: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center'
  },
  headerSubtitle: {
    margin: '12px 0 0',
    fontSize: '15px',
    opacity: 0.95,
    fontWeight: '400'
  },
  refreshButton: {
    background: 'rgba(255,255,255,0.2)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '12px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // CARDS
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    margin: '0',
    padding: '24px',
    background: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  card: {
    padding: '24px',
    borderRadius: '12px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    transition: 'all 0.3s',
    cursor: 'default',
    border: '2px solid transparent'
  },
  cardGreen: {
    background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
    borderColor: '#4caf50'
  },
  cardRed: {
    background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
    borderColor: '#d32f2f'
  },
  cardBlue: {
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    borderColor: '#2e7d9d'
  },
  cardOrange: {
    background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
    borderColor: '#f59e0b'
  },
  cardPurple: {
    background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    borderColor: '#9c27b0'
  },
  cardIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.7)',
    flexShrink: 0
  },
  cardContent: {
    flex: 1
  },
  cardLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px'
  },
  cardValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '4px'
  },
  cardFooter: {
    fontSize: '12px',
    color: '#888',
    fontWeight: '500'
  },
  
  // PANEL DE FILTROS
  chartPanel: {
    background: 'white',
    padding: '32px',
    borderRadius: '0 0 16px 16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  filterSection: {
    marginBottom: '32px',
    padding: '24px',
    background: '#f8f9fa',
    borderRadius: '12px',
    border: '2px solid #e0e0e0'
  },
  filterHeader: {
    marginBottom: '20px'
  },
  filterTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2e7d9d',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  filterControls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  filterInput: {
    padding: '12px 16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  filterSelect: {
    padding: '12px 16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  quickFilters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '2px solid #e0e0e0'
  },
  quickFiltersLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#666'
  },
  quickButton: {
    padding: '8px 16px',
    background: '#9e9e9e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  // GRÁFICO
  chartContainer: {
    background: '#fafafa',
    padding: '32px',
    borderRadius: '12px',
    border: '2px solid #e0e0e0'
  },
  chartHeader: {
    marginBottom: '24px',
    textAlign: 'center'
  },
  chartTitle: {
    margin: '0 0 8px',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  chartSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#666'
  },
  tooltip: {
    background: 'white',
    border: '2px solid #2e7d9d',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  noData: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '450px',
    color: '#999'
  },
  noDataText: {
    fontSize: '20px',
    fontWeight: '600',
    marginTop: '20px',
    marginBottom: '8px'
  },
  noDataSubtext: {
    fontSize: '14px',
    color: '#bbb',
    maxWidth: '400px',
    textAlign: 'center'
  },
  
  // LOADING & ERROR
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  },
  loadingText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2e7d9d',
    marginBottom: '8px'
  },
  loadingSubtext: {
    fontSize: '14px',
    color: '#666'
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '20px'
  },
  errorBox: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    textAlign: 'center',
    maxWidth: '500px'
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#d32f2f',
    marginBottom: '12px'
  },
  errorMessage: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px'
  },
  errorButton: {
    background: '#d32f2f',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  },
  
  // FOOTER
  footer: {
    textAlign: 'center',
    padding: '24px',
    color: '#666',
    fontSize: '13px'
  },
  footerText: {
    margin: 0
  }
};