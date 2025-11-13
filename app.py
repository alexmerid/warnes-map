# Principal
from datetime import date, timedelta
from flask import Flask, render_template, request
from flaskext.mysql import MySQL
from pymysql.cursors import DictCursor

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
    fecha_ini = request.args.get(
        'fecha_ini') or (date.today() - timedelta(days=15)).isoformat()
    fecha = request.args.get('fecha') or date.today().isoformat()
    instaladas = request.args.get('instaladas') or '0'

    if instaladas == "1":
        sql = """
        SELECT p.id, p.latitud, p.longitud, '' as obs, p.id_referencia, p.id_via,
        pl.id_luminaria, pl.estado, DATE_FORMAT(pl.fecha_inst, '%%d/%%m/%%Y') as fecha_inst,
        pl.codigo, pl2.id_luminaria as id_luminaria_ant, pl2.estado as estado_ant
        FROM 
        poste p INNER JOIN poste_luminaria pl  ON p.id = pl.id_poste
        LEFT JOIN poste_luminaria pl2 ON pl.reemp = pl2.id
        """
        where = ["pl.fecha_inst BETWEEN %s AND %s"]
        params = [fecha_ini, fecha]
    else:
        sql = f"""
        WITH
        pl_vigentes AS
        (SELECT *
            FROM poste_luminaria
            WHERE (fecha_inst IS NULL AND fecha_desinst IS NULL)
                OR (fecha_inst IS NULL AND fecha_desinst > '{fecha}')
                OR (fecha_inst <= '{fecha}' AND fecha_desinst IS NULL)
                OR (fecha_inst <= '{fecha}' AND fecha_desinst > '{fecha}')
        ),
        obs_vigentes AS
        (SELECT *
            FROM observacion
            WHERE (fecha_obs <= '{fecha}' AND fecha_fin IS NULL)
            OR (fecha_obs <= '{fecha}' AND fecha_fin > '{fecha}')
        )    
        SELECT p.id, p.latitud, p.longitud, o.descripcion as obs, p.id_referencia, p.id_via,
            pl.id_luminaria, pl.estado, DATE_FORMAT(pl.fecha_inst, '%%d/%%m/%%Y') as fecha_inst, pl.codigo
        FROM poste p
            INNER JOIN pl_vigentes pl ON p.id = pl.id_poste
            LEFT JOIN obs_vigentes o ON p.id = o.id_poste 
        """
        where = []
        params = []
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

    if where:
        sql += " WHERE " + \
            " AND ".join([f"({w})" if 'OR' in w else w for w in where])
    sql += " ORDER BY p.id;"
    print(sql)
    print(fecha_ini)
    print(fecha)
    cursor.execute(sql, params)
    items = cursor.fetchall()
    cursor.close()

    # Usar empty string si PRUEBA es True, sino usar la API Key real
    maps_key = '' if app.config['PRUEBA'] else app.config['MAPS_KEY']
    return render_template(
        'index.html',
        items=items,
        referencias=referencias,
        luminarias=luminarias,
        vias=vias,
        ref_mil=ref_mil or [1000],  # Por defecto 1000 seleccionado
        ref_rango=ref_rango,
        todos=todos,
        instaladas=instaladas,
        fecha_ini=fecha_ini,
        fecha=fecha,
        maps_key=maps_key
    )


# Buscar Poste por ID
@app.route('/buscar_poste/<int:id_poste>')
def buscar_poste(id_poste):
    conn = mysql.get_db()
    cursor = conn.cursor()

    sql = """
    SELECT p.id_referencia, r.distrito, r.descripcion
    FROM poste p INNER JOIN referencia r  on p.id_referencia = r.id
    WHERE p.id = %s
    """
    cursor.execute(sql, (id_poste,))
    poste = cursor.fetchone()
    cursor.close()

    return poste if poste else {}


# Buscar Luminaria por Codigo
@app.route('/buscar_luminaria/<codigo>')
def buscar_luminaria(codigo):
    conn = mysql.get_db()
    cursor = conn.cursor()

    sql = """
    SELECT p.id, p.id_referencia, r.distrito, r.descripcion,
    DATE_FORMAT(pl.fecha_inst, '%%d/%%m/%%Y') as fecha_inst, DATE_FORMAT(pl.fecha_desinst, '%%d/%%m/%%Y') as fecha_desinst
    FROM poste p INNER JOIN poste_luminaria pl on p.id = pl.id_poste
    INNER JOIN referencia r on p.id_referencia = r.id
    WHERE pl.codigo = %s
    """

    cursor.execute(sql, (codigo,))
    luminaria = cursor.fetchone()
    cursor.close()

    return luminaria if luminaria else {}


#  Ejecutar la app
if __name__ == '__main__':
    app.run(debug=True)  # ,host='0.0.0.0'
