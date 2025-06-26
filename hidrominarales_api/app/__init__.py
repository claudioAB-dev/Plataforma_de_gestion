from flask import Flask
from .extensions import db, cors
import os
from dotenv import load_dotenv  

load_dotenv()  

def create_app():
    app = Flask(__name__)
    
    # --- Configuración ---
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


    # --- Inicializar Extensiones ---
    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # --- REGISTRO DE RUTAS Y BLUEPRINT ---
    
    # 1. Importa el objeto Blueprint desde el paquete api
    from .api import api_bp

    # 2. IMPORTANTE: Ahora, importa aquí los módulos que contienen las rutas.
    #    Al hacer esto, Python ejecuta esos archivos (reports.py, etc.), y las rutas
    #    definidas en ellos se asocian con el objeto 'api_bp' que ya existe.
    from .api import reports, auth, products, lines, calidad, clientes, materias_primas, inventario

    # 3. Finalmente, registra el blueprint (que ahora ya tiene todas las rutas asociadas) en la aplicación.
    app.register_blueprint(api_bp, url_prefix='/api')

    return app