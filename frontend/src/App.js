import React from "react";
import loginApi from "./api/loginApi";
import "./App.css";
import "tailwindcss/tailwind.css"; 
import { BrowserRouter as Router, Routes, Route, NavLink, useParams } from "react-router-dom";

import Home from "./pages/home/home";
import ListaPacientes from "./pages/pacientes/listaPacientes";
import LoginPage from "./pages/login/login";
import RequireAuth from "./components/Auth/RequireAuth";

import ListaCajas from "./pages/cajas/listaCajas";
import DetalleCaja from "./pages/cajas/detalleCaja";

import ListadoTurnos from "./pages/turnos/ListadoTurnos";
import NuevoTurno from "./pages/turnos/NuevoTurno";
import EditarTurno from "./pages/turnos/EditarTurno";
import DetalleTurno from "./pages/turnos/DetalleTurno";
import TratamientosPacientePage from "./pages/fichasMedicas/TratamientosPacientePage";
import HistorialPage  from "./pages/fichasMedicas/HistorialPage";

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <div className="App" style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", backgroundColor: "#f9fafc" }}>
      <AuthProvider>
      <Router>
        <Header />
        <main style={{ padding: 24 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/pacientes" element={<RequireAuth><ListaPacientes /></RequireAuth>} />

            <Route path="/historial" element={<RequireAuth><HistorialPage /></RequireAuth>} />
            <Route path="/historial/:id" element={<RequireAuth><TratamientosPacientePage /></RequireAuth>} />
            <Route path="/cajas" element={<RequireAuth><ListaCajas /></RequireAuth>} />
            <Route path="/caja/:id" element={<RequireAuth><DetalleCajaWrapper /></RequireAuth>} />

            <Route path="/turnos" element={<RequireAuth><ListadoTurnos /></RequireAuth>} />
            <Route path="/turnos/nuevo" element={<RequireAuth><NuevoTurno /></RequireAuth>} />
            <Route path="/turnos/:id" element={<RequireAuth><DetalleTurno /></RequireAuth>} />
            <Route path="/turnos/:id/editar" element={<RequireAuth><EditarTurno /></RequireAuth>} />
          </Routes>
        </main>
      </Router>
      </AuthProvider>
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

        <div style={{ display: "flex", gap: 12, alignItems: 'center' }}>
          <StyledNav to="/">Inicio</StyledNav>
          <StyledNav to="/pacientes">Pacientes</StyledNav>
          <StyledNav to="/turnos">Turnos</StyledNav>
          <StyledNav to="/historial">Fichas Medicas</StyledNav>
          <StyledNav to="/cajas">Cajas</StyledNav>
          {/* Login/Logout */}
          {localStorage.getItem('access_token') ? (
            <button onClick={() => loginApi.logout()} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none' }}>Cerrar sesión</button>
          ) : (
            <StyledNav to="/login">Login</StyledNav>
          )}
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

