// Función para obtener el marcador según el tipo de luminaria
function iconoPorLuminaria(id_luminaria) {
    switch (id_luminaria) {
        case 1000:
        case 1070:
        case 1150:
        case 1250:
            return STATIC_URL + 'img/yellow-dot20.png';
        case 2000:
        case 2125:
        case 2250:
        case 2400:
            return STATIC_URL + 'img/orange-dot20.png';
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
            return STATIC_URL + 'img/purple-dot20.png';
        case 6000:
        case 6035:
        case 6040:
        case 6050:
        case 6060:
        case 6100:
        case 6150:
            return STATIC_URL + 'img/blue-dot20.png';
        case 7000:
        case 7040:
        case 7075:
        case 7120:
        case 7150:
            return STATIC_URL + 'img/green-dot20.png';
        default:
            return STATIC_URL + 'img/red-dot20.png';
    }
};

window.initMap = function () {
    const center = items.length > 0
        ? { lat: parseFloat(items[0].latitud), lng: parseFloat(items[0].longitud) }
        : { lat: -17.7833, lng: -63.1821 };

    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: center,
        gestureHandling: "greedy" // <-- Esto permite mover el mapa con un solo dedo en móvil
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
                const info = getLuminariaInfo(item.id_luminaria);
                resumen[key] = {
                    id_luminaria: item.id_luminaria,
                    tipo: info.tipo,
                    potencia: info.potencia,
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

    const luminarias = document.getElementById('luminarias__contenedor');
    luminarias.innerHTML = ""; // Limpia el panel antes de agregar los checkboxes

    resumenLuminarias.forEach(lum => {
        const label = document.createElement('label');
        label.className = "luminaria-label";
        // label.style.display = 'block';
        // label.style.marginBottom = '0.5rem';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.value = lum.id_luminaria;
        checkbox.className = 'luminaria-checkbox';

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

    // --Marcadores por Id de poste y por Código de Luminaria--
    window.marcadoresPorId = {};
    window.marcadoresPorCodigo = {};
    // --------------------------------------------------------

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
            label: labelOptions,
            // title: `${group[0].id}`
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
            <b>Observación:</b> ${group[0].obs ? group[0].obs : ''}<br>
            <b>Via:</b> ${getViaDescripcion(group[0].id_via)}<br>
            <hr>
        `;
        content += group.map(item => {
            const info = getLuminariaInfo(item.id_luminaria);
            return `
                <b>Luminaria:</b> ${info.tipo || ''}${info.potencia ? ' ' + info.potencia + 'W' : ''}<br>
                <b>Estado:</b> ${item.estado === null || item.estado === undefined ? '' : estadoLuminaria[item.estado]}<br>
                ${item.codigo !== null && item.codigo !== undefined ? '<b>Código: </b>' + item.codigo + '<br>' : ''}
                ${item.fecha_inst !== null && item.fecha_inst !== undefined ? '<b>Fecha Inst.: </b>' + item.fecha_inst + '<br>' : ''}
            `;
        }).join('<hr>');
        content += `<hr>
            <a href="https://www.google.com/maps?q=${group[0].latitud},${group[0].longitud}" 
                target="_blank"
                class="link-maps">
                Ver en Google Maps
            </a>`;

        const infowindow = new google.maps.InfoWindow({
            content: content
        });

        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });

        // --Marcadores por Id de poste y por Código de Luminaria--
        window.marcadoresPorId[group[0].id] = { marker, infowindow };
        group.forEach(item => {
            if (item.codigo) {
                window.marcadoresPorCodigo[item.codigo] = { marker, infowindow };
            }
        });
        // --------------------------------------------------------
    });

    // Evento para filtrar los marcadores según los checkboxes
    document.querySelectorAll('.luminaria-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const id = this.value;
            const visible = this.checked;
            (marcadoresPorLuminaria[id] || []).forEach(marker => {
                marker.setVisible(visible);
            });
        });
    });
};

// Función global para mostrar el InfoWindow por ID de poste
window.mostrarInfoWindowPorId = function (id) {
    const obj = marcadoresPorId[id];
    if (obj) {
        obj.infowindow.open(obj.marker.getMap(), obj.marker);
        // Centra el mapa en el marcador
        obj.marker.getMap().setCenter(obj.marker.getPosition());
    }
};

// Función global para mostrar el InfoWindow por código de luminaria
window.mostrarInfoWindowPorCodigo = function (codigo) {
    const obj = marcadoresPorCodigo[codigo];
    if (obj) {
        obj.infowindow.open(obj.marker.getMap(), obj.marker);
        obj.marker.getMap().setCenter(obj.marker.getPosition());
    }
};

window.initMap(); // Llama a la función para inicializar el mapa
