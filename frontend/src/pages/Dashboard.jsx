import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter
} from "lucide-react";

/* ✔ Corrección Webpack */
const API_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  "http://127.0.0.1:8000/api";

export default function Dashboard() {
  const [dataCaja, setDataCaja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [filtroFecha, setFiltroFecha] = useState("");

  /* 📌 Cargar datos */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/caja/`);
        const data = await res.json();
        const registros = Array.isArray(data.data) ? data.data : [];

        setDataCaja(registros);
        calcularTotales(registros);
      } catch (err) {
        console.error("Error al obtener datos de caja:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* 📌 Totales */
  const calcularTotales = (registros) => {
    let ingresos = 0;
    let egresos = 0;

    for (const item of registros) {
      ingresos += parseFloat(item.monto_cierre || 0);
      egresos += parseFloat(item.monto_apertura || 0);
    }

    setTotalIngresos(ingresos);
    setTotalEgresos(egresos);
  };

  /* 📌 Filtrar */
  const dataFiltrada = filtroFecha
    ? dataCaja.filter(
        (item) =>
          new Date(item.fecha_hora_apertura)
            .toISOString()
            .slice(0, 10) === filtroFecha
      )
    : dataCaja;

  /* 📌 Agrupación */
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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Cargando datos...</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">

      {/* 🔷 Título con animación */}
      <div className="mb-12">
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center gap-4 mb-2">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300">
            <DollarSign className="text-white" size={40} />
          </div>
          Panel Financiero
        </h2>
        <p className="text-gray-600 ml-16 text-lg">Gestión inteligente de tus finanzas</p>
      </div>

      {/* 🔷 Tarjetas resumen con efectos glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">

        {/* Ingresos - Efecto hover elevado */}
        <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center gap-5">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white p-5 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <TrendingUp size={36} />
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider mb-1">
                Ingresos Totales
              </p>
              <p className="text-4xl font-black text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ${totalIngresos.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Egresos */}
        <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-100 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center gap-5">
            <div className="bg-gradient-to-br from-red-400 to-rose-500 text-white p-5 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
              <TrendingDown size={36} />
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase text-xs tracking-wider mb-1">
                Egresos Totales
              </p>
              <p className="text-4xl font-black text-gray-900 bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                ${totalEgresos.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Saldo - Destacado especial */}
        <div className="group relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-6 hover:shadow-3xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 overflow-hidden md:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex items-center gap-5">
            <div className="bg-white/25 backdrop-blur-md text-white p-5 rounded-2xl shadow-lg border border-white/30 transform group-hover:scale-110 transition-all duration-500">
              <DollarSign size={36} />
            </div>
            <div>
              <p className="text-white/90 font-semibold uppercase text-xs tracking-wider mb-1">
                Saldo Actual
              </p>
              <p className="text-5xl font-black text-white drop-shadow-lg">
                ${(totalIngresos - totalEgresos).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔷 Filtro con diseño moderno */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-purple-100 mb-12 hover:shadow-2xl transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-xl shadow-lg">
              <Filter className="text-white" size={20} />
            </div>
            <h3 className="font-bold text-gray-700 text-lg">
              Filtrar por fecha
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="border-2 border-purple-200 rounded-xl px-5 py-3 shadow-md focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all duration-300 outline-none"
            />

            {filtroFecha && (
              <button
                onClick={() => setFiltroFecha("")}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 font-semibold"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 🔷 Gráfico de Barras con efecto glassmorphism */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-indigo-100 mb-12 hover:shadow-3xl transition-all duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Movimientos por día
          </h3>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dataGrafico}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
              </linearGradient>
              <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="fecha" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
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

      {/* 🔷 Gráfico Torta con efectos premium */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-100 max-w-2xl mx-auto hover:shadow-3xl transition-all duration-500 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-pink-500 to-indigo-500 rounded-full"></div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-indigo-600">
              Distribución General
            </h3>
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-pink-500 rounded-full"></div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <defs>
                <linearGradient id="pieIngresos" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="pieEgresos" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
              <Pie
                data={dataPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={130}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
              >
                {dataPie.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={index === 0 ? "url(#pieIngresos)" : "url(#pieEgresos)"} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}