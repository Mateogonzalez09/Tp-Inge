# Prototipo - Sistema de Registro de Autoridades de Mesa (TP2)

## Stack
- **Backend:** Python + Flask
- **Persistencia:** SQLite (archivo local `elecciones.db`, sin servidor que instalar)
- **Frontend:** HTML, CSS y JavaScript (sin build)
- **Servicios externos (sin claves ni credenciales):**
  - API de normalización de direcciones USIG: obtiene las coordenadas de cada sede a partir de su dirección.  (Incluye Nominatim de OpenStreetMap como respaldo para PBA).
  - Leaflet + OpenStreetMap: dibujan el mapa.

## Requisitos 
- Python 3.10 o superior
- Conexión a internet (USIG, mapa y fuentes)

## Instalación y Ejecución (Automatizada - Recomendado)
Para instalar las dependencias e iniciar tanto el backend como el frontend de una sola vez, simplemente ejecuta el archivo batch incluido.
Desde el Explorador de Windows, haz doble clic en iniciar.bat, o ejecútalo desde la consola (cmd) en la carpeta del proyecto:
iniciar.bat
Este script se encargará automáticamente de:
1.	Crear un entorno virtual (si no existe).
2.	Instalar las dependencias desde el requir
2.	Levantar el servidor Flask (Backend) y el servidor HTTP (Frontend).
3.	Abrir el navegador en http://127.0.0.1:5500/Pr.html.
(Para terminar la ejecución, simplemente cierra las ventanas de consola que se abrieron).

## Ejecución Manual (Alternativa)
Si prefieres levantar el proyecto manualmente, abre dos terminales en la carpeta del proyecto.

Terminal 1 - Backend (la primera vez crea elecciones.db):
pip install -r requirements.txt
    python database.py
    python app.py
El servidor quedará escuchando en http://127.0.0.1:5000

Terminal 2 - Frontend:
    python -m http.server 5500
Abrir en el navegador: http://127.0.0.1:5500/Pr.html (Nota: No abrir Pr.html con doble click en el archivo ya que OpenStreetMap exige un origen HTTP válido; de lo contrario, el mapa falla con error 403).


## Qué se puede probar
1. Elegir el distrito electoral (CABA / Buenos Aires): el mapa muestra solo las sedes de ese distrito.
2. Tocar una sede en el mapa para ver sus charlas y marcar **Me interesa**: se suman al cuadro "Charlas de interés", donde también se pueden quitar.
3. Completar el formulario y presionar **Registrarme**.

## Datos de ejemplo
Las charlas y sus sedes están precargadas en charla_service.py (nombre y dirección). Las coordenadas no están cargadas (hardcodeadas): se piden dinámicamente a la API USIG (con respaldo de Nominatim) en cada consulta.

## Estructura del proyecto
    iniciar.bat                 Script para instalar dependencias y ejecutar todo automáticamente
requirements.txt            Manifiesto de dependencias de Python
app.py                      Endpoints HTTP (recibe el pedido y devuelve la respuesta)
services/                   Lógica de negocio, un archivo por clase
  postulante_service.py       Validaciones y reglas del registro de postulantes
  charla_service.py           Charlas de ejemplo con la ubicación de su sede
  geo_service.py              Consulta a la API USIG para obtener coordenadas dinámicamente
cargaPostulante.py          Acceso a datos (SQLite) de los postulantes
database.py                 Creación del esquema de la base de datos
Pr.html / Pr.css / Pr.js    Interfaz del postulante

