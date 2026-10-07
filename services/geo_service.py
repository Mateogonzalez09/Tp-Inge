import requests

USIG_URL = "https://servicios.usig.buenosaires.gob.ar/normalizar/"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

_CACHE = {}


class GeoService:
    """Obtiene las coordenadas apartir de una dirección
        en caso de que USIG no cargue las sedes de Buenos Aires
        busca las coordenadas usando NOMINATIM
    """

    def obtener_coordenadas(self, direccion):
        if not direccion:
            return None
        if direccion in _CACHE:
            return _CACHE[direccion]

        coords = self._desde_usig(direccion) or self._desde_nominatim(direccion)
        if coords:  
            _CACHE[direccion] = coords
        return coords

    def _desde_usig(self, direccion):
        try:
            response = requests.get(
                USIG_URL,
                params={"direccion": direccion, "geocodificar": "true"},
                timeout=5,
            )
            response.raise_for_status()
            datos = response.json()
            if datos.get("direccionesNormalizadas"):
                coords = datos["direccionesNormalizadas"][0].get("coordenadas")
                if coords:
                    return {"lat": float(coords["y"]), "lng": float(coords["x"])}
            return None
        except (requests.RequestException, ValueError, KeyError):
            return None

    def _desde_nominatim(self, direccion):
        try:
            response = requests.get(
                NOMINATIM_URL,
                params={"q": direccion, "format": "json", "limit": 1, "countrycodes": "ar"},
                headers={"User-Agent": "TP-Autoridades-de-Mesa/1.0"},  
                timeout=5,
            )
            response.raise_for_status()
            resultados = response.json()
            if resultados:
                return {"lat": float(resultados[0]["lat"]), "lng": float(resultados[0]["lon"])}
            return None
        except (requests.RequestException, ValueError, KeyError):
            return None