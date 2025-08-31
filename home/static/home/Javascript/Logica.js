document.addEventListener("DOMContentLoaded", () => {

    // 🔹 Función para ordenar turnos por fecha y hora
    function ordenarTurnos() {
        const tbody = document.querySelector("table tbody");
        if (!tbody) return;

        const filas = Array.from(tbody.querySelectorAll("tr"));

        filas.sort((a, b) => {
            const fechaA = a.querySelector(".fecha")?.innerText.trim().split("/").reverse().join("-") || "";
            const horaA = a.querySelector(".hora")?.innerText.trim() || "";
            const fechaB = b.querySelector(".fecha")?.innerText.trim().split("/").reverse().join("-") || "";
            const horaB = b.querySelector(".hora")?.innerText.trim() || "";
            return fechaA.localeCompare(fechaB) || horaA.localeCompare(horaB);
        });

        filas.forEach(fila => tbody.appendChild(fila));

        actualizarColores(); // Resaltar y colorear correctamente
    }

    // 🔹 Función para actualizar colores de filas
    function actualizarColores() {
        const hoy = new Date();
        document.querySelectorAll("table tbody tr").forEach(fila => {
            const tipo = fila.querySelector(".servicio")?.innerText.toLowerCase() || "";
            let colorBase = "";

            if (tipo === "limpieza") colorBase = "#e0f7fa";
            if (tipo === "ortodoncia") colorBase = "#ffe0b2";
            if (tipo === "cirugía") colorBase = "#ffd6d6";

            // Resaltar turnos próximos (hoy y mañana) con verde
            const fechaText = fila.querySelector(".fecha")?.innerText.trim();
            if (fechaText) {
                const [dia, mes, año] = fechaText.split("/");
                const fechaTurno = new Date(`${año}-${mes}-${dia}`);
                const diffDias = (fechaTurno - hoy) / (1000 * 60 * 60 * 24);
                if (diffDias >= 0 && diffDias <= 1) {
                    fila.style.backgroundColor = "#d1f7d1"; // verde prioridad
                    return; // no sobrescribir
                }
            }

            fila.style.backgroundColor = colorBase; // color según servicio
        });
    }

    // 🔹 Validación de duplicados al enviar formulario
    const form = document.querySelector("form");
    if (form) {
        form.addEventListener("submit", e => {
            const fecha = form.querySelector('input[type="date"]')?.value;
            const hora = form.querySelector('input[type="time"]')?.value;

            if (fecha && hora) {
                const [año, mes, dia] = fecha.split("-");
                const fechaFormateada = `${dia}/${mes}/${año}`;

                let duplicado = false;
                document.querySelectorAll("table tbody tr").forEach(fila => {
                    const fechaFila = fila.querySelector(".fecha")?.innerText.trim();
                    const horaFila = fila.querySelector(".hora")?.innerText.trim();
                    if (fechaFila === fechaFormateada && horaFila === hora) duplicado = true;
                });

                if (duplicado) {
                    alert("⚠️ Ya existe un turno en esa fecha y hora.");
                    e.preventDefault();
                } else {
                    setTimeout(() => ordenarTurnos(), 50);
                }
            }
        });
    }

 
    // 🔹 Filtro dinámico por paciente o fecha
    const filtroInput = document.querySelector("#filtroTurnos");
    if (filtroInput) {
        filtroInput.addEventListener("input", () => {
            const filtro = filtroInput.value.toLowerCase();
            document.querySelectorAll("table tbody tr").forEach(fila => {
                const nombre = fila.querySelector(".paciente")?.innerText.toLowerCase() || "";
                const fecha = fila.querySelector(".fecha")?.innerText.toLowerCase() || "";
                fila.style.display = (nombre.includes(filtro) || fecha.includes(filtro)) ? "" : "none";
            });
        });
    }

    // 🔹 Ordenar turnos al cargar
    ordenarTurnos();

});
// caja
document.getElementById('hora_cierre')
document.getElementById('monto_final')
document.getElementById('responsable')

