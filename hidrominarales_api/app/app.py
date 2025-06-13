import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from .models import db
from .routes import api_bp # Importamos el nuevo blueprint

def create_app():
    """
    Factory para crear y configurar la aplicación Flask.
    """
    app = Flask(__name__)

    # Configuración de CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Configuración de la base de datos desde .env
    database_uri = os.getenv('DATABASE_URI')
    if not database_uri:
        raise RuntimeError("DATABASE_URI no está configurada en .env")
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = False

    # Inicializar la extensión SQLAlchemy
    db.init_app(app)

    # Registrar Blueprints
    app.config['WTF_CSRF_ENABLED'] = False
    app.register_blueprint(api_bp)

    # Ruta de prueba
    @app.route('/')
    def index():
        return jsonify({"message": "API de Usuarios y Roles funcionando!"})

    return app