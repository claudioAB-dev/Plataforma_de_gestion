from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from ..models import db, User, Rol
from datetime import datetime
from . import api_bp


@api_bp.route('/users', methods=['GET'])
def get_users():
    """Obtiene todos los usuarios."""
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200


@api_bp.route('/roles', methods=['GET'])
def get_roles():
    roles = Rol.query.all()
    return jsonify([rol.serialize() for rol in roles]), 200

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

@api_bp.route('/users', methods=['POST'])
def create_user():
    """Crea un nuevo usuario."""
    data = request.get_json()
    if not data or not 'nombre' in data or not 'contrasena' in data or not 'rol_id' in data:
        return jsonify({'message': 'Nombre, contraseña y rol son requeridos'}), 400
    
    nuevo_usuario = User(
        nombre=data['nombre'],
        rol_id=data['rol_id']
    )
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
        return jsonify({'message': 'Error en el servidor', 'error': str(e)}), 500


@api_bp.route('/users/<int:id>', methods=['PUT'])
def update_user(id):
    """Actualiza un usuario existente."""
    user = User.query.get_or_404(id)
    data = request.get_json()

    user.nombre = data.get('nombre', user.nombre)
    user.rol_id = data.get('rol_id', user.rol_id)
    
    if 'contrasena' in data and data['contrasena']:
        user.set_password(data['contrasena'])
    
    try:
        db.session.commit()
        return jsonify(user.serialize()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El nombre de usuario ya existe'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error en el servidor', 'error': str(e)}), 500

@api_bp.route('/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    """Elimina un usuario."""
    user = User.query.get_or_404(id)
    try:
        db.session.delete(user)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error en el servidor', 'error': str(e)}), 500

# --- Gestión de Roles (CRUD) ---

@api_bp.route('/roles', methods=['POST'])
def create_rol():
    """Crea un nuevo rol."""
    data = request.get_json()
    if not data or not 'nombre' in data:
        return jsonify({'message': 'El nombre del rol es requerido'}), 400
        
    nuevo_rol = Rol(nombre=data['nombre'], permisos=data.get('permisos', ''))
    
    try:
        db.session.add(nuevo_rol)
        db.session.commit()
        return jsonify(nuevo_rol.serialize()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El nombre del rol ya existe'}), 409

@api_bp.route('/roles/<int:id>', methods=['PUT'])
def update_rol(id):
    """Actualiza un rol existente."""
    rol = Rol.query.get_or_404(id)
    data = request.get_json()
    
    rol.nombre = data.get('nombre', rol.nombre)
    rol.permisos = data.get('permisos', rol.permisos)

    try:
        db.session.commit()
        return jsonify(rol.serialize()), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El nombre del rol ya existe'}), 409

@api_bp.route('/roles/<int:id>', methods=['DELETE'])
def delete_rol(id):
    """Elimina un rol."""
    rol = Rol.query.get_or_404(id)
    if rol.users:
        return jsonify({'message': 'No se puede eliminar un rol con usuarios asignados'}), 409
    
    try:
        db.session.delete(rol)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error en el servidor', 'error': str(e)}), 500