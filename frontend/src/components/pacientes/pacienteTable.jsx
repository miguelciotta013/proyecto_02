import React, { useState, useEffect, useMemo } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import { Eye, Search } from "lucide-react";

// 🎨 Tema personalizado estilo clínico
createTheme(
  "clinico",
  {
    text: {
      primary: "#1d4e89",
      secondary: "#3c6e91",
    },
    background: {
      default: "#ffffff",
    },
    context: {
      background: "#e3f2fd",
      text: "#1d4e89",
    },
    divider: {
      default: "#e0eff7",
    },
    highlightOnHover: {
      default: "#e6f4ff",
      text: "#1d4e89",
    },
  },
  "light"
);

export default function PacienteTable({ pacientes = [], onView, loading = false }) {
  const [search, setSearch] = useState("");
  const [localPacientes, setLocalPacientes] = useState([]);

  useEffect(() => {
    setLocalPacientes(pacientes);
  }, [pacientes]);

  const filteredPacientes = useMemo(() => {
    if (!search.trim()) return localPacientes;

    const text = search.toLowerCase().trim();

    return localPacientes.filter((p) =>
      [
        p.dni_paciente?.toString()?.toLowerCase(),
        p.nombre_paciente?.toLowerCase(),
        p.apellido_paciente?.toLowerCase(),
      ].some((v) => v?.includes(text))
    );
  }, [search, localPacientes]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-AR");
  };

  // 📌 Columnas estilizadas
  const columns = [
    {
      name: "DNI",
      selector: (p) => p.dni_paciente,
      sortable: true,
      width: "120px",
    },
    {
      name: "Nombres",
      selector: (p) => p.nombre_paciente,
      sortable: true,
    },
    {
      name: "Apellidos",
      selector: (p) => p.apellido_paciente,
      sortable: true,
    },
    {
      name: "Nacimiento",
      selector: (p) => formatearFecha(p.fecha_nacimiento),
      sortable: true,
      width: "150px",
    },
    {
      name: "Teléfono",
      width: "140px",
      cell: (p) => {
        if (!p.telefono) return <span style={{color:'#999'}}>-</span>;
        
        // Limpiar el número: solo dígitos
        const numLimpio = p.telefono.replace(/\D/g, '');
        
        // Si no comienza con código país, asumir +54 (Argentina)
        const numFinal = numLimpio.startsWith('54') || numLimpio.startsWith('0') 
          ? (numLimpio.startsWith('0') ? '54' + numLimpio.slice(1) : numLimpio)
          : '54' + numLimpio;
        
        const urlWhatsApp = `https://wa.me/${numFinal}`;
        
        return (
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#25d366',
              textDecoration: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: '4px',
              display: 'inline-block',
              transition: 'all 0.2s',
              backgroundColor: 'rgba(37, 211, 102, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(37, 211, 102, 0.2)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(37, 211, 102, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
            title={`Abrir WhatsApp con ${p.telefono}`}
          >
            💬 {p.telefono}
          </a>
        );
      },
    },
    {
      name: "Acciones",
      width: "140px",
      cell: (p) => (
        <button
          onClick={() => onView(p.id_paciente)}
          style={btnVer}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          <Eye size={16} /> Detalles
        </button>
      ),
    },
  ];

  return (
    <div style={{ padding: 30 }}>
      {/* 🔎 Buscador Moderno */}
      <div style={searchBox}>
        <Search size={20} style={{ color: "#0e4a62" }} />
        <input
          type="text"
          placeholder="Buscar por DNI, nombre o apellido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput}
        />
      </div>

      {/* 📋 Tabla con estilos profesionales */}
      <DataTable
        columns={columns}
        data={filteredPacientes}
        progressPending={loading}
        pagination
        striped
        highlightOnHover
        pointerOnHover
        responsive
        theme="clinico"
        noDataComponent="No se encontraron pacientes."
        customStyles={tableStyles}
      />
    </div>
  );
}

/* 🎨 Estilos completos */
const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#f0f8ff",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #b9e5ff",
  maxWidth: "420px",
  marginBottom: "14px",
};

const searchInput = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "18px",
  background: "transparent",
  color: "#0e4a62",
};

const btnVer = {
  padding: "8px 14px",
  background: "linear-gradient(90deg, #0a74a6, #0881a0ff)",
  border: "none",
  color: "#fff",
  borderRadius: "20px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: "bold",
  transition: "0.2s",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
};

/* 📦 Estilos de DataTable */
const tableStyles = {
  table: {
    style: {
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
  },
  headCells: {
    style: {
      backgroundColor: "#d7effa",
      color: "#0e4a62",
      fontWeight: "bold",
      fontSize: "16px",
      paddingTop: "12px",
      paddingBottom: "12px",
    },
  },
  cells: {
    style: {
      fontSize: "16px",
      paddingTop: "10px",
      paddingBottom: "10px",
    },
  },
  rows: {
    style: {
      minHeight: "55px",
      "&:hover": {
        backgroundColor: "#eaf7ff !important",
      },
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e0eff7",
      padding: "10px",
    },
  },
};
