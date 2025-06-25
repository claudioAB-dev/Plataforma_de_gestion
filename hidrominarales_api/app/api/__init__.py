from flask import Blueprint

# La única responsabilidad de este archivo es crear el blueprint.
# No importamos ningún módulo de rutas aquí.
api_bp = Blueprint('api', __name__)