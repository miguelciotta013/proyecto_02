document.addEventListener("DOMContentLoaded", () => {

  // 🔹 Función para mostrar alertas Bootstrap
  function showAlert(tipo, mensaje) {
    const container = document.getElementById("alertContainer");
    if (!container) return;

    const div = document.createElement("div");
    div.className = `alert alert-${tipo} alert-dismissible fade show mt-2`;
    div.innerHTML = `
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    container.appendChild(div);

    // Ocultar automáticamente después de 3s
    setTimeout(() => {
      div.classList.remove("show");
      setTimeout(() => div.remove(), 300);
    }, 3000);
  }

  // 🔹 Detectar querystring para alertas (alta o modificación)
  const params = new URLSearchParams(window.location.search);
  if (params.get("status") === "created") {
    showAlert("success", "Turno agregado correctamente.");
  }
  if (params.get("status") === "updated") {
    showAlert("warning", "Turno modificado correctamente.");
  }

  // 🔹 Validación de duplicados al enviar formulario
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", (e) => {
      const fechaInput = form.querySelector('input[type="date"]')?.value;
      const horaInput = form.querySelector('input[type="time"]')?.value;

      if (fechaInput && horaInput) {
        const [año, mes, dia] = fechaInput.split("-");
        const fechaFormateada = `${dia}/${mes}/${año}`;
        let duplicado = false;

        document.querySelectorAll("#tablaTurnos tbody tr").forEach(fila => {
          const fechaFila = fila.querySelector(".fecha")?.innerText.trim();
          const horaFila = fila.querySelector(".hora")?.innerText.trim();
          if (fechaFila === fechaFormateada && horaFila === horaInput) duplicado = true;
        });

        if (duplicado) {
          alert("⚠️ Ya existe un turno en esa fecha y hora.");
          e.preventDefault();
        }
      }
    });
  }

  // 🔹 Filtro dinámico por paciente o fecha
  const filtroInput = document.querySelector("#filtroTurnos");
  if (filtroInput) {
    filtroInput.addEventListener("input", () => {
      const filtro = filtroInput.value.toLowerCase();
      document.querySelectorAll("#tablaTurnos tbody tr").forEach(fila => {
        const nombre = fila.querySelector(".paciente")?.innerText.toLowerCase() || "";
        const fecha = fila.querySelector(".fecha")?.innerText.toLowerCase() || "";
        fila.style.display = (nombre.includes(filtro) || fecha.includes(filtro)) ? "" : "none";
      });
    });
  }

});