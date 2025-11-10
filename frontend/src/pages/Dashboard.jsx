import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Filter } from 'lucide-react';

// 🔹 URL del backend (usa variable de entorno si existe, o localhost por defecto)
const API_URL = import.meta?.env?.VITE_API_URL || 'http://127.0.0.1:8000/api';

export default function Dashboard() {
  const [dataCaja, setDataCaja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/caja/`);
        const data = await res.json();

        // ✅ Ajustar a tu estructura real: data.data
        const registros = Array.isArray(data.data) ? data.data : [];

        setDataCaja(registros);
        calcularTotales(registros);
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener datos de caja:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Nueva función — suma real de ingresos y egresos
  const calcularTotales = (registros) => {
    let ingresos = 0;
    let egresos = 0;

    registros.forEach(item => {
      const apertura = parseFloat(item.monto_apertura || 0);
      const cierre = parseFloat(item.monto_cierre || 0);

      ingresos += cierre;
      egresos += apertura;
    });

    setTotalIngresos(ingresos);
    setTotalEgresos(egresos);
  };

  // 🔹 Filtrar por fecha
  const dataFiltrada = filtroFecha
    ? dataCaja.filter(item =>
        new Date(item.fecha_hora_apertura).toISOString().slice(0, 10) === filtroFecha
      )
    : dataCaja;

  // 🔹 Agrupar movimientos por día
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
    { name: 'Ingresos', value: totalIngresos },
    { name: 'Egresos', value: totalEgresos },
  ];

  const COLORS = ['#22c55e', '#ef4444'];

  if (loading) return <p className="text-center mt-10 text-gray-600">Cargando datos...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <DollarSign className="text-blue-600" /> Panel de Caja
      </h2>

      {/* 🔹 Filtro por fecha */}
      <div className="bg-white rounded-2xl p-4 shadow mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="text-blue-600" />
          <h3 className="font-semibold text-gray-700">Filtrar por fecha:</h3>
        </div>
        <input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {filtroFecha && (
          <button
            onClick={() => setFiltroFecha('')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            Limpiar filtro
          </button>
        )}
      </div>

      {/* 🔹 Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-100 rounded-2xl p-4 shadow flex items-center justify-between">
          <div>
            <p className="text-green-700 font-semibold">Total Ingresos</p>
            <p className="text-2xl font-bold">${totalIngresos.toFixed(2)}</p>
          </div>
          <TrendingUp className="text-green-600" size={40} />
        </div>

        <div className="bg-red-100 rounded-2xl p-4 shadow flex items-center justify-between">
          <div>
            <p className="text-red-700 font-semibold">Total Egresos</p>
            <p className="text-2xl font-bold">${totalEgresos.toFixed(2)}</p>
          </div>
          <TrendingDown className="text-red-600" size={40} />
        </div>

        <div className="bg-blue-100 rounded-2xl p-4 shadow flex items-center justify-between">
          <div>
            <p className="text-blue-700 font-semibold">Saldo Actual</p>
            <p className="text-2xl font-bold">${(totalIngresos - totalEgresos).toFixed(2)}</p>
          </div>
          <DollarSign className="text-blue-600" size={40} />
        </div>
      </div>

      {/* 🔹 Gráfico de barras */}
      <div className="bg-white rounded-2xl shadow p-4 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Movimientos por Día</h3>
        {dataGrafico.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#22c55e" name="Ingresos" />
              <Bar dataKey="egresos" fill="#ef4444" name="Egresos" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">No hay datos para la fecha seleccionada.</p>
        )}
      </div>

      {/* 🔹 Gráfico de torta */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Distribución Total</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={dataPie} dataKey="value" nameKey="name" outerRadius={100} label>
              {dataPie.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
