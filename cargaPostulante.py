import sqlite3

class PostulanteRepository:
    def __init__(self, db_path="elecciones.db"):
        self.db_path = db_path

    def guardar(self, postulante, charlas_ids):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO postulantes (
                    dni, nombre, apellido, fecha_nacimiento, email, telefono, 
                    direccion, distrito_electoral, autoridad_de_mesa, 
                    capacitacion, nombre_partido
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                postulante['dni'], postulante['nombre'], postulante['apellido'],
                postulante['fechaNacimiento'], postulante['email'], postulante['telefono'],
                postulante['direccion'], postulante['distritoElectoral'], 
                postulante['autoridadDeMesa'], postulante['capacitacion'], 
                postulante.get('nombrePartido')
            ))
            
            if charlas_ids:
                for charla_id in charlas_ids:
                    cursor.execute("""
                        INSERT INTO postulante_charla (dni_postulante, charla_id)
                        VALUES (?, ?)
                    """, (postulante['dni'], charla_id))