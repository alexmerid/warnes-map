document.addEventListener('DOMContentLoaded', function () {
    const linkDescargar = document.getElementById('link-descargar');
    if (!linkDescargar) return;

    linkDescargar.addEventListener('click', function (e) {
        e.preventDefault();

        // 1. Obtener los id_luminaria visibles (checkboxes marcados)
        const visibles = Array.from(document.querySelectorAll('.filtro-luminaria'))
            .filter(cb => cb.checked)
            .map(cb => parseInt(cb.value));

        // 2. Filtrar los items por los id_luminaria visibles
        const datosFiltrados = items.filter(item => visibles.includes(item.id_luminaria));

        if (datosFiltrados.length === 0) {
            alert("No hay datos visibles para exportar.");
            return;
        }

        // 3. Elegir columnas y orden
        const columnas = ['id', 'observacion', 'tipo', 'potencia', 'estado'];
        const datosParaExcel = datosFiltrados.map(item => {
            const obj = {};
            columnas.forEach(col => obj[col] = item[col]);
            return obj;
        });

        // 4. Generar el Excel
        const ws = XLSX.utils.json_to_sheet(datosParaExcel);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Luminarias");

        // 5. Descargar el archivo
        XLSX.writeFile(wb, "luminarias.xlsx");
    });
});