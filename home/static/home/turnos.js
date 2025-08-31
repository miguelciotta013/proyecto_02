const URLS = {
  list: URLS_LIST,  // se reemplaza desde el template
  deletePattern: URLS_DELETE,
  editPattern: URLS_EDIT
};

// CSRF helper
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie("csrftoken");

let selectedId = null;
let tabla = null;
let modalEliminar = null;

document.addEventListener("DOMContentLoaded", function() {
  modalEliminar = new bootstrap.Modal(document.getElementById('modalEliminar'));

  tabla = $('#tablaTurnos').DataTable({
    ajax: URLS.list,
    columns: [
      { data: "id" },
      { data: "paciente" },
      { data: "apellido" },
      { data: "fecha" },
      { data: "hora" },
      { data: "asunto" },
      { data: "comentario" },
      {
        data: "id",
        orderable: false,
        searchable: false,
        render: function(id) {
          const editUrl = URLS.editPattern.replace("__ID__", id);
          return `
            <div class="d-flex gap-1">
              <a href="${editUrl}" class="btn btn-warning btn-sm" title="Editar">
                <i class="fa-solid fa-pen"></i>
              </a>
              <button class="btn btn-danger btn-sm btn-delete" data-id="${id}" title="Eliminar">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          `;
        }
      }
    ],
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json"
    },
    pageLength: 10,
    responsive: true,
    order: [[3, "desc"], [4, "desc"]]
  });

  document.getElementById("tablaTurnos").addEventListener("click", function(e) {
    const btn = e.target.closest(".btn-delete");
    if (!btn) return;
    selectedId = btn.getAttribute("data-id");
    modalEliminar.show();
  });

  document.getElementById("btnConfirmDelete").addEventListener("click", async function() {
    if (!selectedId) return;
    const url = URLS.deletePattern.replace("__ID__", selectedId);
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      if (!resp.ok) throw new Error("Error eliminando");
      await resp.json();
      tabla.ajax.reload(null, false);
      modalEliminar.hide();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el turno.");
    } finally {
      selectedId = null;
    }
  });
});
