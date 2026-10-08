@echo off
setlocal
cd /d "%~dp0"

rem --- Buscar Python (python o py) ---
set PY=python
where python >nul 2>nul || set PY=py
where %PY% >nul 2>nul || (
    echo No se encontro Python 3.10 o superior. Descargalo de https://www.python.org/downloads/
    pause
    exit /b 1
)

rem --- Entorno virtual (solo se crea la primera vez) ---
if not exist ".venv\Scripts\activate.bat" (
    echo Creando entorno virtual...
    %PY% -m venv .venv || (pause & exit /b 1)
)
call ".venv\Scripts\activate.bat"

rem --- Dependencias y base de datos ---
echo Instalando dependencias...
python -m pip install -q -r requirements.txt || (pause & exit /b 1)
python database.py

rem --- Backend en otra ventana (http://127.0.0.1:5000) ---
start "Backend - Flask" cmd /k python app.py

rem --- Abrir el navegador a los 3 segundos ---
start "" /min cmd /c "timeout /t 3 >nul & start http://127.0.0.1:5500/static/index.html"

rem --- Frontend en esta ventana (http://127.0.0.1:5500) ---
echo.
echo Frontend en http://127.0.0.1:5500/static/index.html
echo Para terminar, cerra esta ventana y la del Backend.
python -m http.server 5500
