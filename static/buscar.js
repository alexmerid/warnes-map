document.addEventListener('DOMContentLoaded', function () {
    const formBuscar = document.getElementById('form-buscar');
    const inputBuscar = document.getElementById('buscar-input');

    formBuscar.addEventListener('submit', function (e) {
        e.preventDefault();
        const texto = inputBuscar.value.trim();

        if (!texto) return;

        // Buscar por ID de poste (número)
        if (/^\d+$/.test(texto)) {
            const idPoste = parseInt(texto);
            const poste = items.find(p => p.id === idPoste);
            if (poste) {
                // mostrarPopupPoste(poste.id);
                window.mostrarInfoWindowPorId(poste.id);
                // alert("Poste Encontrado");
                return;
            }
        } else {
            // Buscar por código de luminaria (texto)
            const luminaria = items.find(l => l.codigo === texto);
            if (luminaria) {
                //mostrarPopupLuminaria(luminaria.codigo);
                window.mostrarInfoWindowPorCodigo(luminaria.codigo);
                // alert("Luminaria Encontrada");
                return;
            }
        }
        alert('No se encontró ningún poste o luminaria con ese dato.');
    });
});

