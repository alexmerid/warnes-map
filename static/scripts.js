// Este script maneja la lógica de mostrar y ocultar los paneles de ubicaciones y luminarias
document.addEventListener('DOMContentLoaded', function () {
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
});