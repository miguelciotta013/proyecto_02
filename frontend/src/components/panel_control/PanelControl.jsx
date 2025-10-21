import React, { useState } from "react";
import ListaUsuarios from "./ListaUsuarios";
import ListaEmpleados from "./ListaEmpleados";
import ListaObras from "./ListaObras";
import ListaMetodo from "./ListaMetodos";
import ListaTratamientos from "./ListaTratamientos";

function PanelControl() {
  const [seccion, setSeccion] = useState("");

  return (
    <div className="panel-root">
      <div className="panel-container">
        {!seccion ? (
          <div className="panel-menu">
            <h1 className="panel-title">Panel de Control</h1>

            <div className="panel-cards">
              <button onClick={() => setSeccion("usuarios")}>Usuarios</button>
              <button onClick={() => setSeccion("empleados")}>Empleados</button>
              <button onClick={() => setSeccion("obras")}>Obras Sociales</button>
              <button onClick={() => setSeccion("tratamientos")}>Tratamientos</button>
              <button onClick={() => setSeccion("metodos")}>Métodos de Pago</button>
            </div>
          </div>
        ) : (
          <div className="panel-seccion">
            <button className="volver-btn" onClick={() => setSeccion("")}>
              ← Volver al Panel
            </button>

            {seccion === "usuarios" && <ListaUsuarios />}
            {seccion === "empleados" && <ListaEmpleados />}
            {seccion === "obras" && <ListaObras />}
            {seccion === "metodos" && <ListaMetodo />}
            {seccion === "tratamientos" && <ListaTratamientos />}
          </div>
        )}
      </div>

      <style>{`
        .panel-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url("fondo.jpg"); /* Cambia por tu imagen */
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          padding: 30px;
        }

        .panel-container {
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          padding: 0;
          width: 94%;
          max-width: 1200px;
          margin: 0 3%;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .panel-title {
          background-color: #1E56A8;
          color: white;
          font-size: 26px;
          font-weight: 700;
          margin: 0;
          padding: 20px 0;
          text-align: center;
          letter-spacing: 0.5px;
        }

        /* 🔹 Botones en columna (vertical) */
        .panel-cards {
          display: flex;
          flex-direction: column; /* ← ahora están uno debajo del otro */
          align-items: center;
          gap: 20px;
          padding: 40px 0;
        }

        .panel-cards button {
          background: #ffffff;
          color: #111;
          border: none;
          padding: 18px 26px;
          font-size: 17px;
          border-radius: 12px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          width: 80%; /* mismos márgenes laterales */
          max-width: 400px;
        }

        .panel-cards button:hover {
          background: #e9f2ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .panel-seccion {
          text-align: left;
          padding: 30px 50px;
        }

        .volver-btn {
          background: #1E56A8;
          color: white;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 20px;
          transition: background 0.2s ease;
        }

        .volver-btn:hover {
          background: #174b94;
        }

        @media (max-width: 768px) {
          .panel-container {
            width: 96%;
            margin: 0 2%;
          }
          .panel-cards button {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
}

export default PanelControl;
