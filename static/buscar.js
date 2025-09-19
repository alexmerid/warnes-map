document.addEventListener('DOMContentLoaded', function () {
    const formBuscar = document.getElementById('form-buscar');
    const inputBuscar = document.getElementById('buscar-input');

    formBuscar.addEventListener('submit', async function (e) {
        e.preventDefault();
        const texto = inputBuscar.value.trim();

        if (!texto) return;

        if (/^\d+$/.test(texto)) {
            // Buscar por ID de poste (número)
            const idPoste = parseInt(texto);
            const poste = items.find(p => p.id === idPoste);
            if (poste) {
                window.mostrarInfoWindowPorId(poste.id);
            } else {
                // Buscar el Poste en la BdD
                try {
                    const response = await fetch(`buscar_poste/${idPoste}`);
                    const resultado = await response.json();
                    if (Object.keys(resultado).length > 0) {
                        let msgPoste = `El poste con Id ${idPoste} se encuentra en:\n`;
                        msgPoste += resultado.distrito ? `Distrito ${resultado.distrito} - ` : '';
                        msgPoste += `${resultado.descripcion}`;
                        alert(msgPoste);
                    } else {
                        alert('No se encontró ningún poste con Id ' + idPoste);
                    }
                } catch (error) {
                    console.error('Error: ', error);
                    alert('Error al buscar el poste.');
                }
            }
        } else {
            // Buscar por código de luminaria (texto)
            const codLuminaria = texto.toUpperCase();
            const luminaria = items.find(l => l.codigo === codLuminaria);
            if (luminaria) {
                window.mostrarInfoWindowPorCodigo(luminaria.codigo);
            } else {
                // Buscar la Luminaria en la BdD
                try {
                    const response = await fetch(`buscar_luminaria/${codLuminaria}`);
                    const resultado = await response.json();
                    if (Object.keys(resultado).length > 0) {
                        let msgLuminaria = `La Luminaria con Código ${codLuminaria} se encuentra en:\n`;
                        msgLuminaria += resultado.distrito ? `Distrito ${resultado.distrito} - ` : '';
                        msgLuminaria += `${resultado.descripcion}`;
                        msgLuminaria += `\nInstalada el ${resultado.fecha_inst}`;
                        msgLuminaria += resultado.fecha_desinst ? `\nDesinstalada el ${resultado.fecha_desinst}` : '';
                        alert(msgLuminaria);
                    } else {
                        alert('No se encontró ninguna luminaria con Código ' + codLuminaria);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error al buscar la luminaria.');
                }
            }
        }
    });
});

