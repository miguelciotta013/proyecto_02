// src/App.js
import React, { useContext } from "react";
import "./App.css";
import "tailwindcss/tailwind.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useParams,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import RequireAuth from "./components/Auth/RequireAuth";

// 🏠 Páginas principales
import Home from "./pages/home/home";
import ListaPacientes from "./pages/pacientes/listaPacientes";
import LoginPage from "./pages/login/login";

// 💰 Cajas
import ListaCajas from "./pages/cajas/listaCajas";
import DetalleCaja from "./pages/cajas/detalleCaja";

// 🗓️ Turnos
import ListadoTurnos from "./pages/turnos/ListadoTurnos";
import NuevoTurno from "./pages/turnos/NuevoTurno";
import EditarTurno from "./pages/turnos/EditarTurno";
import DetalleTurno from "./pages/turnos/DetalleTurno";
import PacienteTurnos from "./pages/turnos/PacienteTurnos";

// 🩺 Fichas médicas
import TratamientosPacientePage from "./pages/fichasMedicas/TratamientosPacientePage";
import HistorialPage from "./pages/fichasMedicas/HistorialPage";
import FichaMedicaDetailPage from "./pages/fichasMedicas/FichaMedicaDetailPage";
import OdontogramaPage from "./pages/fichasMedicas/OdontogramaPage";

// ⚙️ Panel
import VistaPanel from "./pages/panel_control/vista_panel";

// 🔐 Recuperación de contraseña
import RecuperarContrasenaPage from "./pages/recuperar/RecuperarContrasenaPage";
import ValidarCodigo from "./pages/recuperar/ValidarCodigoPage";
import CambiarContrasena from "./pages/recuperar/CambiarContrasenaPage";

// 📊 Dashboard
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div
      className="App"
      style={{
        fontFamily: "'Poppins', sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f9fafc",
      }}
    >
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </div>
  );
}

// Componente separado para poder usar useLocation
function AppContent() {
  const { accessToken } = useContext(AuthContext);
  const location = useLocation();
  
  // Lista de rutas donde NO se debe mostrar el header (rutas públicas)
  const rutasSinHeader = [
    '/login',
    '/recuperar-contraseña',
    '/validar-codigo',
    '/cambiar-contraseña'
  ];
  
  const mostrarHeader = accessToken && !rutasSinHeader.includes(location.pathname);

  return (
    <>
      {/* Solo mostrar Header si está logueado */}
      {mostrarHeader && <Header />}
      
      <main style={{ padding: mostrarHeader ? 24 : 0 }}>
        <Routes>
          {/* 🏠 Inicio */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <AuthGate />
              </RequireAuth>
            }
          />

          {/* 🔐 Login y recuperación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-contraseña" element={<RecuperarContrasenaPage />} />
          <Route path="/validar-codigo" element={<ValidarCodigo />} />
          <Route path="/cambiar-contraseña" element={<CambiarContrasena />} />

          {/* 👥 Pacientes */}
          <Route
            path="/pacientes"
            element={
              <RequireAuth>
                <ListaPacientes />
              </RequireAuth>
            }
          />

          {/* 🩺 Historial / Fichas */}
          <Route
            path="/historial"
            element={
              <RequireAuth>
                <HistorialPage />
              </RequireAuth>
            }
          />
          <Route
            path="/historial/:id"
            element={
              <RequireAuth>
                <TratamientosPacientePage />
              </RequireAuth>
            }
          />
          <Route
            path="/historial/:idPaciente/ficha/:idFicha"
            element={
              <RequireAuth>
                <FichaMedicaDetailPage />
              </RequireAuth>
            }
          />
          <Route 
          path="/odontograma/:idPaciente/:idFicha" 
          element={
            <OdontogramaPage />
            } 
          />

          {/* 💰 Cajas */}
          <Route
            path="/cajas"
            element={
              <RequireAuth>
                <ListaCajas />
              </RequireAuth>
            }
          />
          <Route
            path="/caja/:id"
            element={
              <RequireAuth>
                <DetalleCajaWrapper />
              </RequireAuth>
            }
          />

          {/* 🗓️ Turnos */}
          <Route
            path="/turnos"
            element={
              <RequireAuth>
                <ListadoTurnos />
              </RequireAuth>
            }
          />
          <Route
            path="/turnos/paciente/:id"
            element={
              <RequireAuth>
                <PacienteTurnos />
              </RequireAuth>
            }
          />
          <Route
            path="/turnos/nuevo"
            element={
              <RequireAuth>
                <NuevoTurno />
              </RequireAuth>
            }
          />
          <Route
            path="/turnos/:id"
            element={
              <RequireAuth>
                <DetalleTurno />
              </RequireAuth>
            }
          />
          <Route
            path="/turnos/:id/editar"
            element={
              <RequireAuth>
                <EditarTurno />
              </RequireAuth>
            }
          />

          {/* ⚙️ Panel */}
          <Route
            path="/panel"
            element={
              <RequireAuth>
                <VistaPanel />
              </RequireAuth>
            }
          />

          {/* 📊 Dashboard - PROTEGIDO */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default App;

function Header() {
  const { accessToken, logout } = useContext(AuthContext);

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
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: "bold" }}>
          🦷 Consultorio GF
        </h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <StyledNav to="/">Inicio</StyledNav>
          <StyledNav to="/turnos">Turnos</StyledNav>
          <StyledNav to="/pacientes">Pacientes</StyledNav>
          <StyledNav to="/historial">Fichas Médicas</StyledNav>
          <StyledNav to="/cajas">Cajas</StyledNav>
          <StyledNav to="/panel">Panel</StyledNav>
          <StyledNav to="/dashboard">📊 Graficos </StyledNav>

          {accessToken ? (
            <button
              onClick={logout}
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "6px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cerrar sesión
            </button>
          ) : (
            <StyledNav to="/login">Login</StyledNav>
          )}
        </div>
      </nav>
    </header>
  );
}

function AuthGate() {
  const { accessToken } = useContext(AuthContext);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Home />;
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
      })}
    >
      {children}
    </NavLink>
  );
}