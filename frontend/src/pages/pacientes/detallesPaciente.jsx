/*
Detalle del paciente(card) con todolos los datos del paciente
-boton de editar
-boton de dar de baja(eliminar)
- boton para asignar la obra social(posteriormente tambien obcion de editar y eliminar)
- boton para agregar ficha patologica(posteriormente tambien obcion de editar y eliminar)

*/


import React from "react";
import PacienteCard from "./PacienteCard";

export default function App() {
  const paciente = {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    dni: "12345678",
    edad: 30,
    telefono: "1234-5678",
    direccion: "Calle Falsa 123",
    obraSocial: null
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <PacienteCard
        paciente={paciente}
        onEditar={(id) => alert("Editar paciente " + id)}
        onEliminar={(id) => alert("Paciente dado de baja " + id)}
        onAsignarObra={(id) => alert("Asignar obra social a paciente " + id)}
        onAgregarFicha={(id) => alert("Agregar ficha patológica a paciente " + id)}
      />
    </div>
  );
}
