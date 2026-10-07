import re
from datetime import date

from cargaPostulante import PostulanteRepository, PostulanteDuplicadoError

DISTRITOS_VALIDOS = ("CABA", "Buenos Aires")
PATRON_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# campo del payload -> nombre legible para el mensaje de error
CAMPOS_REQUERIDOS = {
    "dni": "DNI",
    "nombre": "nombre",
    "apellido": "apellido",
    "fechaNacimiento": "fecha de nacimiento",
    "email": "correo de contacto",
    "telefono": "teléfono",
    "direccion": "dirección",
    "distritoElectoral": "distrito electoral",
}


class PostulanteService:
    """Reglas de negocio del registro de postulantes. No conoce HTTP ni SQL."""

    def __init__(self):
        self.repo = PostulanteRepository()
        # YAGNI: lista en memoria para la prueba de concepto.
        # Simula los administradores que tienen prohibido postularse.
        self.admins_dnis = ["99999999", "11111111"]

    def registrar(self, datos):
        self._validar_datos(datos)
        self._validar_reglas_de_negocio(datos)
        try:
            self.repo.guardar(datos, datos.get("charlasSeleccionadas", []))
        except PostulanteDuplicadoError:
            raise ValueError("Ya existe un postulante registrado con ese DNI.")

    def _validar_datos(self, datos):
        for campo, nombre in CAMPOS_REQUERIDOS.items():
            if not datos.get(campo):
                raise ValueError(f"El campo {nombre} es obligatorio.")

        if not PATRON_EMAIL.match(str(datos["email"])):
            raise ValueError("El correo de contacto no tiene un formato válido.")

        if not str(datos["telefono"]).isdigit():
            raise ValueError("El teléfono debe contener solo números.")

        try:
            nacimiento = date.fromisoformat(str(datos["fechaNacimiento"]))
        except ValueError:
            raise ValueError("La fecha de nacimiento no es válida.")
        if nacimiento >= date.today():
            raise ValueError("La fecha de nacimiento debe ser anterior a hoy.")

        if datos["distritoElectoral"] not in DISTRITOS_VALIDOS:
            raise ValueError("El distrito electoral seleccionado no es válido.")

    def _validar_reglas_de_negocio(self, datos):
        if datos["dni"] in self.admins_dnis:
            raise ValueError("Rechazado: Un administrador no puede registrarse como postulante.")
