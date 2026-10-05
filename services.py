import requests
from cargaPostulante import PostulanteRepository  

class GeoService:
    def obtener_coordenadas(self, direccion):
        if not direccion:
            return None
        try:
            url = f"https://servicios.usig.buenosaires.gob.ar/normalizar/?direccion={direccion}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            datos = response.json()
            if datos.get("direccionesNormalizadas"):
                coords = datos["direccionesNormalizadas"][0].get("coordenadas")
                if coords:
                    return {"lat": coords["y"], "lng": coords["x"]}
            return None
        except requests.RequestException:
            return None

class CharlaService:
    def listar_charlas_con_mapa(self):
        charlas = [
            {"id": 1, "nombre": "Orientación General", "fecha": "2026-11-01", "horario": "10:00", "sede_nombre": "Escuela 1", "sede_direccion": "Av. Cabildo 1500, CABA"},
            {"id": 2, "nombre": "Capacitación Técnica", "fecha": "2026-11-02", "horario": "14:00", "sede_nombre": "Sede Comunal 2", "sede_direccion": "Pres. José Evaristo Uriburu 1022, CABA"},
            {"id": 3, "nombre": "Protocolo de Escrutinio", "fecha": "2026-11-03", "horario": "16:00", "sede_nombre": "Colegio Nacional", "sede_direccion": "Av. Corrientes 1500, CABA"}        ]
        geo = GeoService()
        for charla in charlas:
            charla['coordenadas'] = geo.obtener_coordenadas(charla['sede_direccion'])
        return charlas

class PostulanteService:
    def __init__(self):
        self.repo = PostulanteRepository()
        # YAGNI: Lista negra en memoria para la prueba de concepto. 
        # Simula los administradores que tienen prohibido postularse.
        self.admins_dnis = ["99999999", "11111111"]

    def registrar(self, datos):
        # 1. Validación de campos requeridos
        campos_requeridos = [
            'dni', 'nombre', 'apellido', 'fechaNacimiento', 
            'email', 'telefono', 'direccion', 'distritoElectoral'
        ]
        for campo in campos_requeridos:
            if not datos.get(campo):
                raise ValueError(f"El campo {campo} es obligatorio.")

        # 2. Regla de negocio estricta: Administrador no puede postularse
        if datos.get('dni') in self.admins_dnis:
            raise ValueError("Rechazado: Un administrador no puede registrarse como postulante.")

        # 3. Persistencia delegada
        charlas_ids = datos.get('charlasSeleccionadas', [])
        try:
            self.repo.guardar(datos, charlas_ids)
        except Exception as e:
            raise ValueError("El postulante ya se encuentra registrado o hubo un error de base de datos.")