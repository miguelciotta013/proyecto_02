import React from "react";
import "./App.css";
import "tailwindcss/tailwind.css"; 
import { BrowserRouter as Router, Routes, Route, NavLink, useParams } from "react-router-dom";

import Home from "./pages/home/home";
import ListaPacientes from "./pages/pacientes/listaPacientes";

import ListaCajas from "./pages/cajas/listaCajas";
import DetalleCaja from "./pages/cajas/detalleCaja";

import ListadoTurnos from "./pages/turnos/ListadoTurnos";
import NuevoTurno from "./pages/turnos/NuevoTurno";
import EditarTurno from "./pages/turnos/EditarTurno";
import DetalleTurno from "./pages/turnos/DetalleTurno";

import TratamientosPacientePage from "./pages/fichasMedicas/TratamientosPacientePage";
import HistorialPage from "./pages/fichasMedicas/HistorialPage";

function App() {
  return (
    <div className="App" style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", backgroundColor: "#f9fafc" }}>
      <Router>
        <Header />
        <main style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pacientes" element={<ListaPacientes />} />

            <Route path="/historial" element={<HistorialPage />} />
            <Route path="/historial/paciente/:id" element={<TratamientosPacientePage />} />  

            <Route path="/cajas" element={<ListaCajas />} />
            <Route path="/caja/:id" element={<DetalleCajaWrapper />} />

            <Route path="/turnos" element={<ListadoTurnos />} />
            <Route path="/turnos/nuevo" element={<NuevoTurno />} />
            <Route path="/turnos/:id" element={<DetalleTurno />} />
            <Route path="/turnos/:id/editar" element={<EditarTurno />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;

function Header() {
  return (
    <header
      style={{
        backgroundColor: "#1976d2",
        color: "#fff",
        padding: "12px 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: "bold" }}>🦷 Consultorio GF</h1>

        <div style={{ display: "flex", gap: 12 }}>
          <StyledNav to="/">Inicio</StyledNav>
          <StyledNav to="/pacientes">Pacientes</StyledNav>
          <StyledNav to="/turnos">Turnos</StyledNav>
          <StyledNav to="/cajas">Cajas</StyledNav>
          <StyledNav to="/historial">Fichas Medicas</StyledNav>
        </div>
      </nav>
    </header>
  );
}

function DetalleCajaWrapper() {
  const { id } = useParams();
  return <DetalleCaja id={id} />;
}

function StyledNav({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/"} 
      style={({ isActive }) => ({
        color: "#fff",
        textDecoration: "none",
        fontWeight: 500,
        padding: "8px 12px",
        borderRadius: 8,
        transition: "background-color 0.15s, transform 0.15s",
        backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
        transform: "scale(1)",
      })}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = e.currentTarget.style.backgroundColor || "rgba(255,255,255,0.18)";
        e.currentTarget.style.transform = "scale(1.04)";
      }}
      onMouseLeave={(e) => {
        const isActive = e.currentTarget.getAttribute("aria-current") === "page";
        e.currentTarget.style.backgroundColor = isActive ? "rgba(255,255,255,0.15)" : "transparent";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {children}
    </NavLink>
  );
}

