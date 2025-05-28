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
    WHERE p.id_referencia = %s
    ORDER BY p.id;
    """

    cursor.execute(sql, (1000,))
    items = cursor.fetchall()
    cursor.close()

    return render_template(
        'index.html',
        items=items,
        referencias=referencias
    )


#  Ejecutar la app
if __name__ == '__main__':
    app.run(debug=True)  # ,host='0.0.0.0'
