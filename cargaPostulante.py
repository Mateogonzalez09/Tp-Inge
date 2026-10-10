import sqlite3


class PostulanteDuplicadoError(Exception):
    """Ya existe un postulante con ese DNI."""


class PostulanteRepository:
    def __init__(self, db_path="elecciones.db"):
        self.db_path = db_path

    def guardar(self, postulante, charlas_ids):
        try:
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
            
                # NUEVO: Capturamos el ID autogenerado del postulante que acabamos de insertar
                postulante_id = cursor.lastrowid
            
                if charlas_ids:
                    for charla_id in charlas_ids:
                        # MODIFICADO: Ahora insertamos postulante_id en vez del DNI
                        cursor.execute("""
                            INSERT INTO postulante_charla (postulante_id, charla_id)
                            VALUES (?, ?)
                        """, (postulante_id, charla_id))
        except sqlite3.IntegrityError as error:
            # El error saltará automáticamente si se viola el UNIQUE del DNI
            raise PostulanteDuplicadoError() from error 
