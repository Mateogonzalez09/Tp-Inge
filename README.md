Prototipo - Sistema de Registro de Autoridades de Mesa (TP2)

Arquitectura y Stack Tecnológico

Backend: Python (Flask)

Persistencia: SQLite (Local, elecciones.db)

Frontend: JS, HTML, CSS

Integraciones Externas: API de Normalización USIG (Geocodificación) y Leaflet/OpenStreetMap (Mapeo)

Pre-requisitos
Tener instalado Python 3.x y el gestor de paquetes pip.

Pasos de Ejecución (Entorno Local)

Instalar dependencias del servidor:
Abra una terminal en la raíz del proyecto y ejecute:
pip install flask requests flask-cors

Inicializar la capa de persistencia:
Ejecute el script de base de datos para generar el esquema relacional:
python database.py
(Nota: Esto creará el archivo binario elecciones.db en el directorio).

Levantar la API (Backend):
Inicie el servidor Flask para habilitar los endpoints:
python app.py
(El servidor quedará en escucha activa en http://127.0.0.1:5000).

Desplegar la Vista (Frontend):

Sirva el archivo Pr.html utilizando un servidor HTTP local (por ejemplo, la extensión Live Server en VS Code o ejecutando python -m http.server 5500 en una terminal paralela).

Regla estricta de ejecución: No abra el archivo Pr.html directamente desde el explorador de Windows. Las políticas de seguridad del proveedor de mapas (OSM) exigen un origen HTTP válido; de lo contrario, se bloqueará la renderización arrojando un Error 403.