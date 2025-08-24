document.querySelectorAll('.btn-funcion').forEach(button => {
    button.addEventListener('click', () => {
        let funcion = button.getAttribute('data-funcion');

        fetch('/caja/ajax_funcion/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value
            },
            body: JSON.stringify({funcion: funcion})
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('resultado').innerText = data.mensaje;
        });
    });
});
