// Función para obtener el marcador según el tipo de luminaria
function iconoPorLuminaria(id_luminaria) {
    switch (id_luminaria) {
        case 1000:
        case 1070:
        case 1150:
        case 1250:
            return '/static/img/yellow-dot20.png';
        case 2000:
        case 2125:
        case 2250:
        case 2400:
            return '/static/img/orange-dot20.png';
        case 3000:
        case 3035:
        case 3070:
        case 3150:
        case 3250:
        case 4000:
        case 4020:
        case 4040:
        case 5000:
        case 5100:
            return '/static/img/purple-dot20.png';
        case 6000:
        case 6035:
        case 6040:
        case 6050:
        case 6060:
        case 6100:
        case 6150:
            return '/static/img/blue-dot20.png';
        default:
            return '/static/img/red-dot20.png';
    }
};

//Estado de la luminaria
const estadoLuminaria = {
    0: 'Malo',
    1: 'Bueno'
};

window.initMap = function () {
    const center = items.length > 0
        ? { lat: parseFloat(items[0].latitud), lng: parseFloat(items[0].longitud) }
        : { lat: -17.7833, lng: -63.1821 };

    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: center
    });

    // Agrupa los items por latitud y longitud exacta
    const grouped = {};
    items.forEach(item => {
        const key = `${item.latitud},${item.longitud}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
    });

    // Resumen de luminarias para los checkboxes
    function obtenerResumenLuminarias(items) {
        const resumen = {};
        items.forEach(item => {
            const key = item.id_luminaria;
            if (!resumen[key]) {
                resumen[key] = {
                    id_luminaria: item.id_luminaria,
                    tipo: item.tipo,
                    potencia: item.potencia,
                    cantidad: 0
                };
            }
            resumen[key].cantidad += 1;
        });
        return Object.values(resumen).sort((a, b) => a.id_luminaria - b.id_luminaria);
    }

    // Genera los checkboxes en el panel luminarias
    const resumenLuminarias = obtenerResumenLuminarias(items);
    const totalLuminarias = resumenLuminarias.reduce((acc, lum) => acc + lum.cantidad, 0);

    const luminarias = document.getElementById('luminarias');
    luminarias.innerHTML = ""; // Limpia el panel antes de agregar los checkboxes

    resumenLuminarias.forEach(lum => {
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginBottom = '0.5rem';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.value = lum.id_luminaria;
        checkbox.className = 'filtro-luminaria';

        label.appendChild(checkbox);

        let texto = `${lum.tipo}`;
        if (lum.potencia) texto += ` ${lum.potencia}W`;
        texto += ` (${lum.cantidad})`;

        label.appendChild(document.createTextNode(' ' + texto));
        luminarias.appendChild(label);
    });

    // Agrega el total al final
    const totalDiv = document.createElement('div');
    totalDiv.style.marginTop = '1rem';
    totalDiv.innerHTML = `<b>Total:</b> ${totalLuminarias}`;
    luminarias.appendChild(totalDiv);

    // Crea los marcadores y los agrupa por id_luminaria
    const marcadoresPorLuminaria = {};
    Object.values(grouped).forEach(group => {
        const position = {
            lat: parseFloat(group[0].latitud),
            lng: parseFloat(group[0].longitud)
        };

        let labelOptions = undefined;
        if (group.length > 1) {
            labelOptions = {
                text: String(group.length),
                color: "#000",
                fontWeight: "bold",
                fontSize: "12px",
                className: "custom-label-circle"
            };
        }

        const marker = new google.maps.Marker({
            position: position,
            map: map,
            icon: iconoPorLuminaria(group[0].id_luminaria),
            label: labelOptions
        });

        // Agrupa los marcadores por id_luminaria
        const idLum = group[0].id_luminaria;
        if (!marcadoresPorLuminaria[idLum]) {
            marcadoresPorLuminaria[idLum] = [];
        }
        marcadoresPorLuminaria[idLum].push(marker);

        // Construye el contenido del infowindow
        let content = `
            <b>Poste: ${group[0].id}</b><br>
            <b>Observación:</b> ${group[0].observacion ? group[0].observacion : ''}<br>
            <hr>
        `;
        content += group.map(item => `
            <b>Luminaria:</b> ${item.tipo}${item.potencia ? ' ' + item.potencia + 'W' : ''}<br>
            <b>Estado:</b> ${item.estado ? estadoLuminaria[item.estado] : ''}<br>
        `).join('<hr>');

        const infowindow = new google.maps.InfoWindow({
            content: content
        });

        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });
    });

    // Evento para filtrar los marcadores según los checkboxes
    document.querySelectorAll('.filtro-luminaria').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const id = this.value;
            const visible = this.checked;
            (marcadoresPorLuminaria[id] || []).forEach(marker => {
                marker.setVisible(visible);
            });
        });
    });
};

window.initMap(); // Llama a la función para inicializar el mapa
