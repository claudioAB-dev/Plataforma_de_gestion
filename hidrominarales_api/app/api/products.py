from . import api_bp
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from ..models import db, Producto
from datetime import datetime

@api_bp.route('/productos', methods=['POST'])
def create_producto():
    data = request.get_json()
    if "co2Nominal" in data:
        data["co2_nominal"] = data.pop("co2Nominal")
    nuevo_producto = Producto(**data)
    db.session.add(nuevo_producto)
    db.session.commit()
    return jsonify(nuevo_producto.to_dict()), 201

@api_bp.route('/productos', methods=['GET'])
def get_all_productos():
    productos = Producto.query.filter_by(activo=True).all()
    return jsonify([p.to_dict() for p in productos])

@api_bp.route('/productos/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_producto(id):
    producto = Producto.query.get_or_404(id)
    if request.method == 'GET':
        return jsonify(producto.to_dict())
    elif request.method == 'PUT':
        data = request.get_json()
        for key, value in data.items():
            setattr(producto, key, value)
        db.session.commit()
        return jsonify(producto.to_dict())
    elif request.method == 'DELETE':
        # Borrado lógico
        producto.activo = False
        db.session.commit()
        return '', 204
