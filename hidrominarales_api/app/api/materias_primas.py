from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from . import api_bp
from ..models import db, MateriaPrima

@api_bp.route('/materias_primas', methods=['GET'])
def get_materias_primas():
    """Obtiene materias primas, opcionalmente filtradas por cliente."""
    try:
        query = MateriaPrima.query
        cliente_id = request.args.get('cliente_id')
        if cliente_id:
            query = query.filter_by(cliente_id=cliente_id)

        materias_primas = query.order_by(MateriaPrima.nombre).all()
        return jsonify([mp.to_dict() for mp in materias_primas]), 200
    except Exception as e:
        return jsonify({'message': 'Error al obtener materias primas', 'error': str(e)}), 500

@api_bp.route('/materias_primas', methods=['POST'])
def create_materia_prima():
    """Crea una nueva materia prima para un cliente."""
    data = request.get_json()
    required = ['nombre', 'sku', 'cliente_id', 'unidad_medida']
    if not data or not all(k in data for k in required):
        return jsonify({'message': 'Faltan campos requeridos'}), 400

    nueva_mp = MateriaPrima(
        nombre=data['nombre'],
        sku=data['sku'],
        cliente_id=data['cliente_id'],
        unidad_medida=data['unidad_medida'],
        descripcion=data.get('descripcion')
    )
    try:
        db.session.add(nueva_mp)
        db.session.commit()
        return jsonify(nueva_mp.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'Una materia prima con ese SKU ya existe.'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error en el servidor', 'error': str(e)}), 500