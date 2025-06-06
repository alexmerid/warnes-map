// Este script se encarga de descargar los datos de luminarias en formato Excel
function descargarExcel(e, columnas, titulos) {
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

    // 3. Construir los datos para Excel, usando getLuminariaInfo para tipo y potencia
    const datosParaExcel = datosFiltrados.map(item => {
        const obj = {};
        columnas.forEach(col => {
            if (col == 'estado') {
                obj[col] = item[col] === null || item[col] === undefined ? '' : estadoLuminaria[item[col]];
            } else if (col === 'tipo' || col === 'potencia') {
                const info = getLuminariaInfo(item.id_luminaria);
                obj[col] = info[col] || '';
            } else {
                obj[col] = item[col];
            }
        });
        return obj;
    });

    // 4. Generar el Excel con encabezados personalizados
    const ws = XLSX.utils.json_to_sheet(datosParaExcel, { header: columnas });

    // Reemplaza los encabezados por los títulos personalizados
    titulos.forEach((titulo, idx) => {
        const letraCol = XLSX.utils.encode_col(idx); // A, B, C, ...
        ws[letraCol + "1"].v = titulo;
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Luminarias");

    // 5. Descargar el archivo
    XLSX.writeFile(wb, "Planilla.xlsx");
};

document.addEventListener('DOMContentLoaded', function () {
    const linkPostesLum = document.getElementById('link-postesLum');
    const linkInstalarLum = document.getElementById('link-instalarLum');

    if (linkPostesLum) {
        linkPostesLum.addEventListener('click', function (e) {
            descargarExcel(e, ['id', 'latitud', 'longitud', 'observacion', 'tipo', 'potencia', 'estado'],
                ['ID Poste', 'Latitud', 'Longitud', 'Observación', 'Tipo', 'Potencia', 'Estado']);
        });
    }

    if (linkInstalarLum) {
        linkInstalarLum.addEventListener('click', function (e) {
            descargarExcel(e, ['id', 'observacion', 'tipo', 'potencia'],
                ['ID Poste', 'Observación', 'Tipo', 'Potencia']);
        });
    }
});