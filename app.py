from flask import Flask, request, jsonify
from services import PostulanteService, CharlaService

from flask_cors import CORS
app = Flask(__name__)
CORS(app)

postulante_service = PostulanteService()
charla_service = CharlaService()

@app.route('/api/postulantes', methods=['POST'])
def inscribir_postulante():
    datos = request.json
    try:
        postulante_service.registrar(datos)
        return jsonify({"mensaje": "Postulante registrado con éxito"}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/api/charlas', methods=['GET'])
def listar_charlas():
    try:
        charlas = charla_service.listar_charlas_con_mapa()
        return jsonify(charlas), 200
    except Exception as e:
        return jsonify({"error": "No se pudieron obtener las charlas"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)