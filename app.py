from flask import Flask, render_template, request
from flaskext.mysql import MySQL
from pymysql.cursors import DictCursor
from datetime import date

app = Flask(__name__)

# Cargar configuración desde config.py
app.config.from_pyfile('config.py')

# Configuración de la conexión MySQL
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
# El usuario y password ahora se leen desde config.py
# app.config['MYSQL_DATABASE_USER'] = 'root'
# app.config['MYSQL_DATABASE_PASSWORD'] = 'root'
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

    cursor.execute(
        "SELECT id, distrito, descripcion FROM referencia ORDER BY id")
    referencias = cursor.fetchall()

    cursor.execute("SELECT id, tipo, potencia FROM luminaria ORDER BY id")
    luminarias = cursor.fetchall()

    cursor.execute("SELECT id, descripcion FROM via ORDER BY id")
    vias = cursor.fetchall()

    # Obtener filtros del formulario
    ref_mil = request.args.getlist('ref_mil', type=int)
    ref_rango = request.args.getlist('ref_rango', type=int)
    todos = request.args.get('ref_mil_todos')
    est_lum = request.args.get('estLum')  # QUITAR
    fecha = request.args.get('fecha') or date.today().isoformat()

    sql = f"""
    WITH pl_vigentes AS
    (SELECT *
        FROM poste_luminaria
        WHERE (fecha_inst IS NULL AND fecha_desinst IS NULL)
            OR (fecha_inst IS NULL AND fecha_desinst > '{fecha}') 
            OR (fecha_inst <= '{fecha}' AND fecha_desinst IS NULL)
            OR (fecha_inst <= '{fecha}' AND fecha_desinst > '{fecha}'))
    SELECT p.id, p.latitud, p.longitud, p.observacion, p.id_referencia, p.id_via,
        pl.id_luminaria, pl.estado, DATE_FORMAT(fecha_inst, '%%d/%%m/%%Y') as fecha_inst, pl.codigo
    FROM
        poste p
        INNER JOIN pl_vigentes pl ON p.id = pl.id_poste
    """
    params = []
    where = []
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

    # Añadir condición para el estado de luminaria si corresponde  # QUITAR
    # if est_lum in ("0", "1"):
    #     where.append("pl.estado = %s")
    #     params.append(int(est_lum))

    if where:
        sql += " WHERE " + \
            " AND ".join([f"({w})" if 'OR' in w else w for w in where])
    sql += " ORDER BY p.id;"
    cursor.execute(sql, params)
    items = cursor.fetchall()
    cursor.close()

    return render_template(
        'index.html',
        items=items,
        referencias=referencias,
        luminarias=luminarias,
        vias=vias,
        ref_mil=ref_mil or [1000],  # Por defecto 1000 seleccionado
        ref_rango=ref_rango,
        todos=todos,
        est_lum=est_lum,  # QUITAR
        fecha=fecha,
        maps_key=app.config['MAPS_KEY']
    )


#  Ejecutar la app
if __name__ == '__main__':
    app.run(debug=True)  # ,host='0.0.0.0'
