import requests

USIG_URL = "https://servicios.usig.buenosaires.gob.ar/normalizar/"


class GeoService:
    """Obtiene las coordenadas de una dirección consultando la API de normalización USIG."""

    def obtener_coordenadas(self, direccion):
        if not direccion:
            return None
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
                    return {"lat": coords["y"], "lng": coords["x"]}
            return None
        except (requests.RequestException, ValueError):
            # Si USIG falla o responde algo ilegible, la sede queda sin ubicar
            # y el frontend lo informa; no se rompe la consulta de charlas.
            return None
