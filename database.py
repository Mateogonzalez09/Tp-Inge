import sqlite3

def inicializar_base_datos(ruta_db="elecciones.db"):
    with sqlite3.connect(ruta_db) as conexion:
        cursor = conexion.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sedes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                direccion TEXT NOT NULL
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS charlas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                tema TEXT NOT NULL,
                fecha TEXT NOT NULL,
                horario TEXT NOT NULL,
                sede_id INTEGER NOT NULL,
                FOREIGN KEY (sede_id) REFERENCES sedes (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS postulantes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dni TEXT UNIQUE NOT NULL,
                nombre TEXT NOT NULL,
                apellido TEXT NOT NULL,
                fecha_nacimiento TEXT NOT NULL,
                email TEXT NOT NULL,
                telefono TEXT NOT NULL,
                direccion TEXT NOT NULL,
                distrito_electoral TEXT NOT NULL,
                autoridad_de_mesa INTEGER NOT NULL,
                capacitacion INTEGER NOT NULL,
                nombre_partido TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS postulante_charla (
                postulante_id INTEGER NOT NULL,
                charla_id INTEGER NOT NULL,
                PRIMARY KEY (postulante_id, charla_id),
                FOREIGN KEY (postulante_id) REFERENCES postulantes (id),
                FOREIGN KEY (charla_id) REFERENCES charlas (id)
            )
        """)
        
        conexion.commit()

if __name__ == "__main__":
    inicializar_base_datos()
    print("Base de datos SQLite inicializada. Archivo 'elecciones.db' listo para usar.")