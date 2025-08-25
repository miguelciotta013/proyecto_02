// Abrir y cerrar modales
const abrirModal = (id) => document.getElementById(id).style.display = 'flex';
const cerrarModal = (id) => document.getElementById(id).style.display = 'none';

document.getElementById('btn-apertura').onclick = () => abrirModal('modal-apertura');
document.getElementById('btn-cobro').onclick = () => abrirModal('modal-cobro');
document.getElementById('btn-cierre').onclick = () => abrirModal('modal-cierre');

document.querySelectorAll('.btn-cerrar').forEach(btn => {
    btn.onclick = () => btn.parentElement.parentElement.style.display = 'none';
});

// CSRF token para Django
function getCookie(name) {
    let cookieValue = null;
    if(document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for(let i=0;i<cookies.length;i++){
            const cookie = cookies[i].trim();
            if(cookie.startsWith(name+'=')){
                cookieValue = decodeURIComponent(cookie.substring(name.length+1));
                break;
            }
        }
    }
    return cookieValue;
}

// Función para agregar fila a la tabla
function agregarFila(caja) {
    const tbody = document.getElementById('cajas-body');
    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${caja.id}</td>
        <td>${caja.fecha_apertura || ''}</td>
        <td>${caja.hora_apertura || ''}</td>
        <td>${caja.monto_apertura || ''}</td>
        <td>${caja.fecha_cierre || ''}</td>
        <td>${caja.hora_cierre || ''}</td>
        <td>${caja.monto_cierre || ''}</td>
        <td>${caja.paciente || ''}</td>
        <td>${caja.tratamiento || ''}</td>
        <td>${caja.tipo_cobro || ''}</td>
        <td>${caja.estado || ''}</td>
        <td><button class="btn-editar" data-id="${caja.id}">Editar</button></td>
    `;
    tbody.prepend(fila);
    actualizarTarjetas();
}

// Función para actualizar tarjetas resumen
function actualizarTarjetas() {
    const filas = document.querySelectorAll('#cajas-body tr');
    let abiertas = 0, cobradas = 0, servicios = 0;
    filas.forEach(fila => {
        const estado = fila.children[10].textContent;
        const montoCobro = parseFloat(fila.children[6].textContent) || 0;
        const tratamiento = fila.children[8].textContent;
        if(estado === 'Abierta') abiertas++;
        if(!isNaN(montoCobro)) cobradas += montoCobro;
        if(tratamiento) servicios++;
    });
    document.getElementById('total-abiertas').textContent = abiertas;
    document.getElementById('total-cobrado').textContent = '$'+cobradas.toFixed(2);
    document.getElementById('total-servicios').textContent = servicios;
}

// Función para enviar formularios via AJAX
function enviarFormulario(formId, url, modalId) {
    const form = document.getElementById(formId);
    form.addEventListener('submit', function(e){
        e.preventDefault();
        const formData = new FormData(form);
        fetch(url, {
            method: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                agregarFila(data.caja);
                cerrarModal(modalId);
                form.reset();
            } else {
                alert('Error: '+data.error);
            }
        })
        .catch(err => console.error(err));
    });
}

// Inicializar envíos AJAX
enviarFormulario('form-apertura', '/caja/apertura/', 'modal-apertura');
enviarFormulario('form-cobro', '/caja/cobro/', 'modal-cobro');
enviarFormulario('form-cierre', '/caja/cierre/', 'modal-cierre');
