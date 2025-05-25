from flask import Flask, render_template, request
from flaskext.mysql import MySQL
from pymysql.cursors import DictCursor
import os

app = Flask(__name__)

# Configuración de la conexión MySQL
app.config['MYSQL_DATABASE_HOST'] = os.environ.get('DB_HOST', 'localhost')
app.config['MYSQL_DATABASE_USER'] = os.environ.get('DB_USER', 'root')
app.config['MYSQL_DATABASE_PASSWORD'] = os.environ.get('DB_PASSWORD', 'root')
app.config['MYSQL_DATABASE_DB'] = 'warnes'
app.config['MYSQL_CURSORCLASS'] = DictCursor

# Inicializar MySQL
mysql = MySQL()
mysql.init_app(app)


# Ruta principal
@app.route('/')
def index():
    ref_ini = request.args.get('ref_ini', default=1000, type=int)
    ref_sel = request.args.getlist('ref_sel', type=int)

    conn = mysql.get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM referencia ORDER BY id")
    referencias = cursor.fetchall()

    # Primer combo: referencias con id múltiplo de 1000
    referencias_mil = [ref for ref in referencias if ref['id'] % 1000 == 0]

    # Segundo combo: referencias dentro del rango seleccionado
    referencias_rango = [
        ref for ref in referencias if ref_ini < ref['id'] < ref_ini + 1000]

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
    from
        poste p
        inner join poste_luminaria pl on p.id = pl.id_poste
        inner join luminaria l on pl.id_luminaria = l.id
    """
    params = []
    if ref_sel:
        sql += " WHERE p.id_referencia IN %s"
        params.append(tuple(ref_sel))
    else:
        sql += " WHERE p.id_referencia >= %s AND p.id_referencia < %s"
        params.extend([ref_ini, ref_ini + 1000])

    sql += " ORDER BY p.id;"

    cursor.execute(sql, params)
    items = cursor.fetchall()
    cursor.close()

    return render_template(
        'index.html',
        items=items,
        referencias=referencias,
        referencias_mil=referencias_mil,
        referencias_rango=referencias_rango,
        ref_ini=ref_ini,
        ref_sel=ref_sel
    )


#  Ejecutar la app
if __name__ == '__main__':
    app.run(debug=True)  # ,host='0.0.0.0'
