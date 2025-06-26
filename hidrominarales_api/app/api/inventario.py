from flask import request, jsonify
from . import api_bp
from ..models import MateriaPrima, db, InventarioMateriaPrima, PalletTerminado, ReporteProduccion, Producto

@api_bp.route('/inventario/materia_prima', methods=['GET'])
def get_inventario_materia_prima():
    """Consulta el inventario de materia prima por cliente."""
    cliente_id = request.args.get('cliente_id')
    if not cliente_id:
        return jsonify({'message': 'El ID del cliente es requerido'}), 400

    try:
        inventario = db.session.query(InventarioMateriaPrima).join(MateriaPrima).filter(MateriaPrima.cliente_id == cliente_id).all()
        return jsonify([item.to_dict() for item in inventario]), 200
    except Exception as e:
        return jsonify({'message': 'Error al consultar el inventario', 'error': str(e)}), 500


@api_bp.route('/inventario/producto_terminado', methods=['GET'])
def get_inventario_producto_terminado():
    """Consulta el inventario de producto terminado (pallets) por cliente."""
    cliente_id = request.args.get('cliente_id')
    if not cliente_id:
        return jsonify({'message': 'El ID del cliente es requerido'}), 400

    try:
        pallets = db.session.query(PalletTerminado).join(ReporteProduccion).join(Producto).filter(Producto.cliente_id == cliente_id).all()
        return jsonify([pallet.to_dict() for pallet in pallets]), 200
    except Exception as e:
        return jsonify({'message': 'Error al consultar el inventario de producto terminado', 'error': str(e)}), 500