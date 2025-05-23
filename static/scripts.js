window.addEventListener('DOMContentLoaded', function () {
    // Actualizar el segundo combo según el primero
    const refIniSelect = document.getElementById('ref_ini');
    const refSelSelect = document.getElementById('ref_sel');
    if (refIniSelect && refSelSelect && typeof referencias !== 'undefined') {
        refIniSelect.addEventListener('change', function () {
            const refIni = parseInt(this.value);
            refSelSelect.innerHTML = '<option value="">Todas</option>';
            referencias.forEach(ref => {
                if (ref.id > refIni && ref.id < refIni + 1000) {
                    const opt = document.createElement('option');
                    opt.value = ref.id;
                    opt.textContent = `${ref.descripcion}`;
                    refSelSelect.appendChild(opt);
                }
            });
        });
    }


    if (typeof items === 'undefined' || typeof center === 'undefined') return;

    // Capa base de OpenStreetMap
    const callejero = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    });

    // Capa base satelital (Esri)
    const satelital = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 17,
        attribution: 'Tiles © Esri'
    });

    // Capa de etiquetas (solo nombres de calles y lugares)
    const etiquetas = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Labels © Esri'
    });

    const satelitalConEtiquetas = L.layerGroup([satelital, etiquetas]);

    // Inicializar el mapa
    const map = L.map('map', {
        center: center,
        zoom: 14,
        layers: [callejero] // capa por defecto
    });

    // Control de capas
    L.control.layers({
        'Callejero': callejero,
        // 'Satelital': satelital
        'Satelital': satelitalConEtiquetas
    }).addTo(map);

    // Crear grupo de clusters
    const markers = L.markerClusterGroup({
        maxClusterRadius: 1 // Solo agrupa si la distancia es 1px (prácticamente igual)
    });

    items.forEach(item => {
        // Crea el icono según id_luminaria
        const icono = new L.Icon({
            iconUrl: getColorIcon(item.id_luminaria),
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [16, 24],
            iconAnchor: [8, 24],
            popupAnchor: [1, -20],
            shadowSize: [24, 24]
        });

        const marker = L.marker([item.latitud, item.longitud], { icon: icono })
            .bindPopup(
                `<b>ID Poste:</b> ${item.id}<br>
                     <b>Latitud:</b> ${item.latitud}<br>
                     <b>Longitud:</b> ${item.longitud}<br>
                     <b>Tipo:</b> ${item.tipo}<br>
                     <b>Potencia:</b> ${item.potencia}W<br>
                     <b>Estado:</b> ${item.estado}<br>
                     <b>Observación:</b> ${item.observacion || ''}`
            );
        markers.addLayer(marker);
    });

    map.addLayer(markers);

    // Funcion para obtener un color de ícono según id_luminaria
    function getColorIcon(id_luminaria) {
        switch (id_luminaria) {
            case 1000:
            case 1070:
            case 1150:
            case 1250:
                return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png';
            case 2000:
            case 2125:
            case 2250:
            case 2400:
                return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png';
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
                return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png';
            case 6000:
            case 6035:
            case 6040:
            case 6050:
            case 6060:
            case 6100:
            case 6150:
                return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png';
            default:
                return 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
        }
    }
});