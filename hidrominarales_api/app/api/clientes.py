from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from . import api_bp
from ..models import db, Cliente

@api_bp.route('/clientes', methods=['GET'])
def get_clientes():
    """Obtiene todos los clientes activos."""
    try:
        clientes = Cliente.query.filter_by(activo=True).order_by(Cliente.nombre).all()
        return jsonify([cliente.to_dict() for cliente in clientes]), 200
    except Exception as e:
        return jsonify({'message': 'Error al obtener los clientes', 'error': str(e)}), 500

@api_bp.route('/clientes', methods=['POST'])
def create_cliente():
    """Crea un nuevo cliente."""
    data = request.get_json()
    if not data or not data.get('nombre'):
        return jsonify({'message': 'El nombre del cliente es requerido'}), 400

    nuevo_cliente = Cliente(
        nombre=data['nombre'],
        rfc=data.get('rfc'),
        datos_contacto=data.get('datos_contacto')
    )
    try:
        db.session.add(nuevo_cliente)
        db.session.commit()
        return jsonify(nuevo_cliente.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Un cliente con ese nombre o RFC ya existe.'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error en el servidor', 'error': str(e)}), 500

@api_bp.route('/clientes/<int:id>', methods=['PUT'])
def update_cliente(id):
    """Actualiza un cliente existente."""
    cliente = Cliente.query.get_or_404(id)
    data = request.get_json()

    cliente.nombre = data.get('nombre', cliente.nombre)
    cliente.rfc = data.get('rfc', cliente.rfc)
    cliente.datos_contacto = data.get('datos_contacto', cliente.datos_contacto)
    cliente.activo = data.get('activo', cliente.activo)

    try:
        db.session.commit()
        return jsonify(cliente.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar el cliente', 'error': str(e)}), 500

@api_bp.route('/clientes/<int:id>', methods=['DELETE'])
def delete_cliente(id):
    """Desactiva un cliente (borrado lógico)."""
    cliente = Cliente.query.get_or_404(id)
    try:
        cliente.activo = False
        db.session.commit()
        return jsonify({'message': f'Cliente {id} desactivado'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al desactivar el cliente', 'error': str(e)}), 500