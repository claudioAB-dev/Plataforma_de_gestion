from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from .models import db, User, Rol

# Define un Blueprint para organizar las rutas
api_bp = Blueprint('api', __name__, url_prefix='/api')


# --- Rutas para Roles ---

@api_bp.route('/roles', methods=['POST'])
def create_rol():
    data = request.get_json()
    if not data or not 'nombre' in data:
        return jsonify({'message': 'El campo "nombre" es requerido'}), 400

    nuevo_rol = Rol(nombre=data['nombre'], permisos=data.get('permisos'))
    try:
        db.session.add(nuevo_rol)
        db.session.commit()
        return jsonify(nuevo_rol.serialize()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El rol ya existe'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/roles', methods=['GET'])
def get_roles():
    roles = Rol.query.all()
    return jsonify([rol.serialize() for rol in roles]), 200

# --- Rutas para Usuarios ---

@api_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or not 'nombre' in data or not 'contrasena' in data or not 'rol_id' in data:
        return jsonify({'message': 'Los campos "nombre", "contrasena" y "rol_id" son requeridos'}), 400
    
    # Verificar que el rol exista
    if not Rol.query.get(data['rol_id']):
        return jsonify({'message': 'El rol_id proporcionado no existe'}), 404

    nuevo_usuario = User(nombre=data['nombre'], rol_id=data['rol_id'])
    nuevo_usuario.set_password(data['contrasena'])

    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify(nuevo_usuario.serialize()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El nombre de usuario ya existe'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404
    return jsonify(user.serialize()), 200

# --- Ruta de Login (Ejemplo) ---

@api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not 'nombre' in data or not 'contrasena' in data:
        return jsonify({'message': 'Nombre de usuario y contraseña requeridos'}), 400

    user = User.query.filter_by(nombre=data['nombre']).first()

    if user and user.check_password(data['contrasena']):
        # Aquí normalmente generarías un token (JWT, etc.)
        return jsonify({
            'message': 'Login exitoso',
            'user': user.serialize()
        }), 200
    
    return jsonify({'message': 'Credenciales inválidas'}), 401