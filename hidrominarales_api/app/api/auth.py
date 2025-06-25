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

