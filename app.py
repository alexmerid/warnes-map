from flask import Flask, render_template, request
from flaskext.mysql import MySQL
from pymysql.cursors import DictCursor

app = Flask(__name__)

# Configuración de la conexión MySQL
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'root'
app.config['MYSQL_DATABASE_DB'] = 'warnes'
app.config['MYSQL_CURSORCLASS'] = DictCursor

# Inicializar MySQL
mysql = MySQL()
mysql.init_app(app)


# Ruta principal
@app.route('/')
def index():
    conn = mysql.get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM referencia ORDER BY id")
    referencias = cursor.fetchall()

    # Obtener filtros del formulario
    ref_mil = request.args.getlist('ref_mil', type=int)
    ref_rango = request.args.getlist('ref_rango', type=int)
    todos = request.args.get('ref_mil_todos')
    est_lum = request.args.get('estLum')

    # Agrupar referencias múltiplos de 1000
    referencias_mil = [ref for ref in referencias if ref['id'] % 1000 == 0]
    ref_ini = ref_mil[0] if ref_mil else 1000
    # referencias_rango = [ref for ref in referencias if ref_ini < ref['id'] < ref_ini + 1000]

    sql = """
    SELECT
        p.id,
        p.latitud,
        p.longitud,
        p.observacion,
        pl.id_luminaria,
        l.tipo,
        l.potencia,
        pl.estado,
        p.id_referencia
    FROM
        poste p
        INNER JOIN poste_luminaria pl ON p.id = pl.id_poste
        INNER JOIN luminaria l ON pl.id_luminaria = l.id
    """
    params = []
    where = []
    ###########################
    if todos == "on":
        # Mostrar todos los puntos (sin WHERE)
        pass
    elif not ref_mil:
        # Si no hay selección, mostrar el rango por defecto (1000 <= id_referencia < 2000)
        where.append("p.id_referencia BETWEEN %s AND %s")
        params.extend([1000, 1999])
    elif len(ref_mil) == 1:
        # Si hay una sola referencia seleccionada
        if ref_rango:
            where.append("p.id_referencia IN %s")
            params.append(tuple(ref_rango))
        else:
            where.append("p.id_referencia BETWEEN %s AND %s")
            params.extend([ref_mil[0], ref_mil[0] + 999])
    else:
        # Si hay más de una referencia seleccionada en el primer fieldset, construir varios rangos
        rangos = []
        for ref in ref_mil:
            rangos.append("(p.id_referencia BETWEEN %s AND %s)")
            params.extend([ref, ref + 999])
        where.append(" OR ".join(rangos))
    # Añadir condición para el estado de luminaria si corresponde
    if est_lum in ("0", "1"):
        where.append("pl.estado = %s")
        params.append(int(est_lum))

    if where:
        sql += " WHERE " + \
            " AND ".join([f"({w})" if 'OR' in w else w for w in where])
    sql += " ORDER BY p.id;"
    ###########################
    cursor.execute(sql, params)
    items = cursor.fetchall()
    cursor.close()

    return render_template(
        'index.html',
        items=items,
        referencias=referencias,
        referencias_mil=referencias_mil,
        ref_mil=ref_mil or [1000],  # Por defecto 1000 seleccionado
        ref_rango=ref_rango,
        todos=todos,
        est_lum=est_lum
    )


#  Ejecutar la app
if __name__ == '__main__':
    app.run(debug=True)  # ,host='0.0.0.0'
