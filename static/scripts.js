document.addEventListener('DOMContentLoaded', function () {
    // --- Paneles flotantes ---
    const panels = {
        ubicaciones: document.getElementById('ubicaciones'),
        luminarias: document.getElementById('luminarias')
    };
    const links = {
        ubicaciones: document.getElementById('link-ubicaciones'),
        luminarias: document.getElementById('link-luminarias')
    };

    function showPanel(panelName) {
        // Oculta todos los paneles y desactiva todos los links
        Object.keys(panels).forEach(name => {
            panels[name].style.display = 'none';
            links[name].classList.remove('activo');
        });
        // Muestra el panel y activa el link
        panels[panelName].style.display = 'block';
        links[panelName].classList.add('activo');
    }

    function hidePanels() {
        Object.keys(panels).forEach(name => {
            panels[name].style.display = 'none';
            links[name].classList.remove('activo');
        });
    }

    links.ubicaciones.addEventListener('click', function (e) {
        e.stopPropagation();
        if (panels.ubicaciones.style.display === 'block') {
            hidePanels();
        } else {
            showPanel('ubicaciones');
        }
    });

    links.luminarias.addEventListener('click', function (e) {
        e.stopPropagation();
        if (panels.luminarias.style.display === 'block') {
            hidePanels();
        } else {
            showPanel('luminarias');
        }
    });

    // Oculta paneles al hacer click fuera
    document.addEventListener('click', function (e) {
        // Si el click no fue dentro de un panel ni de un link, oculta
        if (![panels.ubicaciones, panels.luminarias, links.ubicaciones, links.luminarias].some(el => el.contains(e.target))) {
            hidePanels();
        }
    });

    // Evita que el click dentro del panel lo cierre
    Object.values(panels).forEach(panel => {
        panel.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });

    // --- Lógica dinámica de filtros de ubicaciones ---
    function checkedMil() {
        return Array.from(document.querySelectorAll('input[name="ref_mil"]:checked')).map(cb => parseInt(cb.value));
    }

    function renderRangoCheckboxes() {
        const cont = document.getElementById('rango-checkboxes');
        cont.innerHTML = '';
        // Si hay más de un ref_mil o "Todos" está seleccionado, no mostrar nada
        if (todos === "on" || checkedMil().length !== 1) {
            return;
        }
        const refIni = checkedMil()[0];
        referencias.forEach(ref => {
            if (ref.id > refIni && ref.id < refIni + 1000) {
                const label = document.createElement('label');
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.name = 'ref_rango';
                cb.value = ref.id;
                cb.className = 'ubicacion-checkbox';
                if (ref_rango && ref_rango.includes(ref.id)) cb.checked = true;
                label.appendChild(cb);
                label.append(' ' + ref.descripcion);
                label.className = 'ubicacion-label';
                cont.appendChild(label);
                // cont.appendChild(document.createElement('br'));
            }
        });
    }

    function updateMilCheckboxes() {
        const milChecks = document.querySelectorAll('input[name="ref_mil"]');
        const todosCb = document.querySelector('input[name="ref_mil_todos"]');
        if (todosCb.checked) {
            milChecks.forEach(cb => {
                cb.checked = false;
                cb.disabled = true;
            });
        } else {
            milChecks.forEach(cb => cb.disabled = false);
        }
        renderRangoCheckboxes();
    }

    document.querySelector('input[name="ref_mil_todos"]').addEventListener('change', updateMilCheckboxes);
    document.querySelectorAll('input[name="ref_mil"]').forEach(cb => {
        cb.addEventListener('change', function () {
            renderRangoCheckboxes();
            // Desmarca "Todos" si selecciona alguno
            if (checkedMil().length) {
                document.querySelector('input[name="ref_mil_todos"]').checked = false;
            }
        });
    });

    // --- Habilitar/deshabilitar Botón de filtrado ---
    function updateFiltrarBtn() {
        const milChecks = document.querySelectorAll('input[name="ref_mil"]:checked');
        const rangoChecks = document.querySelectorAll('input[name="ref_rango"]:checked');
        const todosCb = document.querySelector('input[name="ref_mil_todos"]');
        const btn = document.getElementById('btn-filtrar');
        // Si "Todos" está seleccionado, habilita el botón
        if (todosCb && todosCb.checked) {
            btn.disabled = false;
            return;
        }
        // Si hay al menos una referencia seleccionada en mil o rango, habilita
        if ((milChecks && milChecks.length > 0) || (rangoChecks && rangoChecks.length > 0)) {
            btn.disabled = false;
        } else {
            btn.disabled = true;
        }
    }

    document.querySelectorAll('input[name="ref_mil"], input[name="ref_rango"], input[name="ref_mil_todos"]').forEach(cb => {
        cb.addEventListener('change', updateFiltrarBtn);
    });

    // --- Inicialización al cargar ---
    updateMilCheckboxes();
    updateFiltrarBtn();
});