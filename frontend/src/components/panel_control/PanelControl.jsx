import React, { useState, useEffect } from "react";
import ListaUsuarios from "./ListaUsuarios";
import ListaEmpleados from "./ListaEmpleados";
import ListaObras from "./ListaObras";
import ListaMetodo from "./ListaMetodos";
import ListaTratamientos from "./ListaTratamientos";

function PanelControl() {
  const [seccion, setSeccion] = useState("");

  // 🔹 Bloquear el scroll del body al montar el componente
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto"; // restaurar al salir
    };
  }, []);

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
        /* 🔹 Fondo fijo y centrado */
        .panel-root {
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image: url("fondo.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          margin: 0;
          
        }

        /* 🔹 Contenedor centrado */
        .panel-container {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          width: 90%;
          max-width: 1200px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          transition: all 0.3s ease;
          transform: translateY(-10vh);
        }

        .panel-title {
          background-color: #1976d2;
          color: white;
          font-size: 26px;
          font-weight: 700;
          margin: 0;
          padding: 20px 0;
          text-align: center;
        }

        /* 🔹 Botones centrados */
        .panel-cards {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
          width: 80%;
          max-width: 400px;
        }

        .panel-cards button:hover {
          background: #e9f2ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .panel-seccion {
          text-align: left;
          padding: 30px 50px;
          overflow: hidden;
        }

        .volver-btn {
          background: #1976d2;
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
          background: #1565c0;
        }

        @media (max-width: 768px) {
          .panel-container {
            width: 95%;
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
