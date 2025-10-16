import './App.css';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import ListaPacientes from './pages/pacientes/listaPacientes';
import Home from './pages/home/home';
import ListaCajas from './pages/cajas/listaCajas';
import DetalleCaja from './pages/cajas/detalleCaja';

import React from 'react';

function App() {
  return (
    <div className="App" style={{ fontFamily: "'Poppins', sans-serif", minHeight: "100vh", backgroundColor: "#f9fafc" }}>
      <BrowserRouter>
        {/* Barra de navegación */}
        <header
          style={{
            backgroundColor: "#1976d2",
            color: "#fff",
            padding: "12px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            position: "sticky",
            top: 0,
            zIndex: 1000
          }}
        >
          <nav
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap"
            }}
          >
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: "bold" }}>🦷 Consultorio GF</h1>

            <div style={{ display: "flex", gap: 16 }}>
              <StyledLink to="/">Inicio</StyledLink>
              <StyledLink to="/pacientes">Pacientes</StyledLink>
              <StyledLink to="/cajas">Cajas</StyledLink>
              


            </div>
          </nav>
        </header>

        {/* Contenido principal */}
        <main style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pacientes" element={<ListaPacientes />} />
            <Route path="/cajas" element={<ListaCajas />} />
            <Route path="/caja/:id" element={<DetalleCajaWrapper />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;

// Componente para capturar el parámetro :id de la URL
function DetalleCajaWrapper() {
  const { id } = useParams();
  return <DetalleCaja id={id} />;
}

// Componente para los enlaces estilizados
function StyledLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        color: "#fff",
        textDecoration: "none",
        fontWeight: "500",
        padding: "8px 12px",
        borderRadius: 8,
        transition: "background-color 0.2s, transform 0.2s"
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
        e.target.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = "transparent";
        e.target.style.transform = "scale(1)";
      }}
    >
      {children}
    </Link>
  );
}
