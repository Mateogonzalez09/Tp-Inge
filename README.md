# Prototipo - Sistema de Registro de Autoridades de Mesa (TP2)

## Stack
- **Backend:** Python + Flask
- **Persistencia:** SQLite (archivo local `elecciones.db`, sin servidor que instalar)
- **Frontend:** HTML, CSS y JavaScript (sin build)
- **Servicios externos (sin claves ni credenciales):**
  - API de normalización de direcciones USIG: obtiene las coordenadas de cada sede a partir de su dirección.
  - Leaflet + OpenStreetMap: dibujan el mapa.

## Requisitos
- Python 3.10 o superior
- Conexión a internet (USIG, mapa y fuentes)

## Instalación (un solo comando)
En la carpeta del proyecto:

    pip install -r requirements.txt

## Ejecución
Abrir **dos terminales** en la carpeta del proyecto.

**Terminal 1 - Backend** (la primera vez crea `elecciones.db`):

    python database.py
    python app.py

El servidor queda escuchando en http://127.0.0.1:5000

**Terminal 2 - Frontend:**

    python -m http.server 5500

Abrir en el navegador: http://127.0.0.1:5500/Pr.html

> No abrir `Pr.html` con doble click: OpenStreetMap exige un origen HTTP válido y,
> de lo contrario, el mapa falla con un error 403.

## Qué se puede probar
1. Elegir el distrito electoral (CABA / Buenos Aires): el mapa muestra solo las sedes de ese distrito.
2. Tocar una sede en el mapa para ver sus charlas y marcar **Me interesa**: se suman al cuadro "Charlas de interés", donde también se pueden quitar.
3. Completar el formulario y presionar **Registrarme**.

## Datos de ejemplo
Las charlas y sus sedes están precargadas en `services.py` (nombre y dirección).
Las coordenadas **no** están cargadas: se piden a la API USIG en cada consulta.

## Estructura del proyecto
    app.py                      Endpoints HTTP (recibe el pedido y devuelve la respuesta)
    services/                   Lógica de negocio, un archivo por clase
      postulante_service.py       Validaciones y reglas del registro de postulantes
      charla_service.py           Charlas de ejemplo con la ubicación de su sede
      geo_service.py              Consulta a la API USIG para obtener coordenadas
    cargaPostulante.py          Acceso a datos (SQLite) de los postulantes
    database.py                 Creación del esquema de la base de datos
    Pr.html / Pr.css / Pr.js    Interfaz del postulante
