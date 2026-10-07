from .geo_service import GeoService

# Datos de ejemplo precargados. Las coordenadas NO se cargan acá: se piden a la
# API USIG a partir de la dirección de cada sede. "distrito" permite filtrar las
# sedes en el frontend.
CHARLAS_DE_EJEMPLO = [
    {"id": 1, "nombre": "Orientación General", "tema": "Rol y responsabilidades de la autoridad de mesa",
     "fecha": "2026-11-01", "horario": "10:00", "distrito": "CABA",
     "sede_nombre": "Escuela 1", "sede_direccion": "Av. Cabildo 1500, CABA"},
    {"id": 2, "nombre": "Capacitación Técnica", "tema": "Uso de la urna y del material electoral",
     "fecha": "2026-11-02", "horario": "14:00", "distrito": "CABA",
     "sede_nombre": "Sede Comunal 2", "sede_direccion": "Pres. José Evaristo Uriburu 1022, CABA"},
    {"id": 3, "nombre": "Protocolo de Escrutinio", "tema": "Conteo de votos y armado del acta",
     "fecha": "2026-11-03", "horario": "16:00", "distrito": "CABA",
     "sede_nombre": "Colegio Nacional", "sede_direccion": "Av. Corrientes 1500, CABA"},
    {"id": 4, "nombre": "Orientación General", "tema": "Rol y responsabilidades de la autoridad de mesa",
     "fecha": "2026-11-05", "horario": "10:00", "distrito": "Buenos Aires",
     "sede_nombre": "Sede Regional Morón", "sede_direccion": "Av. Rivadavia 17800, Morón, Buenos Aires"},
    {"id": 5, "nombre": "Capacitación Técnica", "tema": "Uso de la urna y del material electoral",
     "fecha": "2026-11-06", "horario": "14:00", "distrito": "Buenos Aires",
     "sede_nombre": "Sede Regional Lanús", "sede_direccion": "Av. Hipólito Yrigoyen 3900, Lanús, Buenos Aires"},
    {"id": 6, "nombre": "Protocolo de Escrutinio", "tema": "Conteo de votos y armado del acta",
     "fecha": "2026-11-07", "horario": "16:00", "distrito": "Buenos Aires",
     "sede_nombre": "Sede Regional Morón", "sede_direccion": "Av. Rivadavia 17800, Morón, Buenos Aires"},
]


class CharlaService:
    """Entrega las charlas orientativas con la ubicación de su sede."""

    def __init__(self, geo_service=None):
        # El servicio de mapas es externo y puede cambiar o fallar: se puede reemplazar.
        self.geo = geo_service or GeoService()

    def listar_charlas_con_mapa(self):
        return [
            {**charla, "coordenadas": self.geo.obtener_coordenadas(charla["sede_direccion"])}
            for charla in CHARLAS_DE_EJEMPLO
        ]
