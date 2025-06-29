from flask import request, jsonify
from sqlalchemy import func
from . import api_bp
from ..models import EstadoPalletEnum, MateriaPrima, MovimientoInventario, db, InventarioMateriaPrima, PalletTerminado, ReporteProduccion, Producto
from datetime import datetime

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
    
@api_bp.route('/inventario/materia_prima/consolidado', methods=['GET'])
def get_inventario_mp_consolidado():
    """Consulta el inventario consolidado de toda la materia prima, agrupado por producto."""
    try:
        inventario = db.session.query(
            MateriaPrima.nombre,
            MateriaPrima.sku,
            MateriaPrima.unidad_medida,
            func.sum(InventarioMateriaPrima.cantidad_actual).label('stock_total')
        ).join(InventarioMateriaPrima, MateriaPrima.id == InventarioMateriaPrima.materia_prima_id)\
         .group_by(MateriaPrima.id, MateriaPrima.nombre, MateriaPrima.sku, MateriaPrima.unidad_medida)\
         .order_by(MateriaPrima.nombre)\
         .all()

        resultado = [
            {
                'nombre': item.nombre,
                'sku': item.sku,
                'unidad_medida': item.unidad_medida,
                'stock_total': float(item.stock_total or 0)
            } for item in inventario
        ]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'message': 'Error al consultar el inventario consolidado de materia prima', 'error': str(e)}), 500

@api_bp.route('/inventario/producto_terminado/consolidado', methods=['GET'])
def get_inventario_pt_consolidado():
    """Consulta el inventario consolidado de todo el producto terminado, agrupado por producto."""
    try:
        inventario = db.session.query(
            Producto.nombre,
            Producto.sku,
            func.count(PalletTerminado.id).label('pallets_totales'),
            func.sum(PalletTerminado.cantidad_charolas).label('charolas_totales')
        ).select_from(PalletTerminado)\
         .join(ReporteProduccion, PalletTerminado.reporte_id == ReporteProduccion.id)\
         .join(Producto, ReporteProduccion.producto_id == Producto.id)\
         .group_by(Producto.id, Producto.nombre, Producto.sku)\
         .order_by(Producto.nombre)\
         .all()

        resultado = [
            {
                'nombre': item.nombre,
                'sku': item.sku,
                'pallets_totales': item.pallets_totales or 0,
                'charolas_totales': int(item.charolas_totales or 0)
            } for item in inventario
        ]
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'message': 'Error al consultar el inventario de producto terminado consolidado', 'error': str(e)}), 500
    

@api_bp.route('/inventario/materia_prima/lotes', methods=['GET'])
def get_lotes_materia_prima():
    """Obtiene todos los lotes individuales del inventario de materia prima."""
    try:
        lotes = InventarioMateriaPrima.query.order_by(InventarioMateriaPrima.fecha_recepcion.desc()).all()
        return jsonify([item.to_dict() for item in lotes]), 200
    except Exception as e:
        return jsonify({'message': 'Error al consultar los lotes de inventario', 'error': str(e)}), 500




@api_bp.route('/inventario/materia_prima/registrar_recepcion', methods=['POST'])
def registrar_recepcion_mp():
    """
    Registra la llegada (recepción) de un lote de materia prima usando FormData.
    """
    data = request.form
    user_id = 1  # Placeholder

    required_fields = ['materia_prima_id', 'cantidad', 'lote_proveedor']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'message': f"Faltan datos requeridos o están vacíos: {', '.join(required_fields)}"}), 400

    try:
        cantidad = float(data['cantidad'])
        ubicacion_id_final = int(data['ubicacion_id']) if data.get('ubicacion_id') else 1,

        if cantidad <= 0:
            return jsonify({'message': 'La cantidad debe ser positiva'}), 400
        nuevo_lote = InventarioMateriaPrima(
            materia_prima_id=int(data['materia_prima_id']),
            cantidad_actual=cantidad,
            lote_proveedor=data['lote_proveedor'],
            fecha_recepcion=datetime.now().date(),  # Esto ahora funcionará
            fecha_caducidad=datetime.strptime(data['fecha_caducidad'], '%Y-%m-%d').date() if data.get('fecha_caducidad') else None,
            ubicacion_id=ubicacion_id_final # Se usa la nueva variable aquí
        )
        db.session.add(nuevo_lote)

        movimiento = MovimientoInventario(
            materia_prima_id=int(data['materia_prima_id']),
            user_id=user_id,
            tipo_movimiento='recepcion',
            cantidad=cantidad
        )
        db.session.add(movimiento)
        db.session.commit()

        return jsonify({'message': 'Recepción registrada y lote creado correctamente'}), 201

    except (ValueError, TypeError):
        return jsonify({'message': 'Formato de datos inválido'}), 400
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error al registrar la recepción', 'error': str(e)}), 500


@api_bp.route('/inventario/materia_prima/ajustar', methods=['POST'])
def ajustar_inventario_mp():
    """
    Ajusta el stock de un lote específico de materia prima y registra el movimiento.
    """
    data = request.form
    user_id = 1 # Placeholder

    required_fields = ['inventario_mp_id', 'nueva_cantidad_fisica', 'motivo']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'message': f"Faltan datos requeridos o están vacíos: {', '.join(required_fields)}"}), 400

    try:
        nueva_cantidad = float(data['nueva_cantidad_fisica'])
        if nueva_cantidad < 0:
            return jsonify({'message': 'La cantidad no puede ser negativa'}), 400

        lote_a_ajustar = InventarioMateriaPrima.query.get(int(data['inventario_mp_id']))
        if not lote_a_ajustar:
            return jsonify({'message': 'El lote de inventario no existe'}), 404

        cantidad_anterior = lote_a_ajustar.cantidad_actual
        ajuste = nueva_cantidad - cantidad_anterior

        if ajuste == 0:
            return jsonify({'message': 'No se realizó ningún ajuste'}), 200

        lote_a_ajustar.cantidad_actual = nueva_cantidad

        movimiento = MovimientoInventario(
            materia_prima_id=lote_a_ajustar.materia_prima_id,
            user_id=user_id,
            tipo_movimiento='ajuste_positivo' if ajuste > 0 else 'ajuste_negativo',
            cantidad=abs(ajuste)
        )
        db.session.add(movimiento)
        db.session.commit()

        return jsonify({'message': 'Ajuste de inventario realizado correctamente'}), 200

    except (ValueError, TypeError):
        return jsonify({'message': 'Formato de datos inválido'}), 400
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'message': 'Error al realizar el ajuste', 'error': str(e)}), 500

    
@api_bp.route('/inventario/movimientos/recientes', methods=['GET'])
def get_movimientos_recientes():
    """Obtiene los últimos movimientos de inventario de materia prima."""
    try:
        # Obtiene los 20 movimientos más recientes de materia prima
        movimientos = MovimientoInventario.query\
            .filter(MovimientoInventario.materia_prima_id.isnot(None))\
            .order_by(MovimientoInventario.timestamp.desc())\
            .limit(20).all()
        return jsonify([mov.to_dict() for mov in movimientos]), 200
    except Exception as e:
        return jsonify({'message': 'Error al consultar los movimientos recientes', 'error': str(e)}), 500
    

@api_bp.route('/inventario/producto_terminado/disponible', methods=['GET'])
def get_inventario_pt_disponible():
    """
    Obtiene todos los pallets de producto terminado que están en estado 'Almacenado'.
    """
    try:
        pallets_disponibles = PalletTerminado.query.filter_by(
            estado=EstadoPalletEnum.ALMACENADO
        ).join(ReporteProduccion).order_by(ReporteProduccion.fecha_produccion.desc(), PalletTerminado.numero_pallet.desc()).all()
        
        return jsonify([pallet.to_dict() for pallet in pallets_disponibles]), 200
    except Exception as e:
        return jsonify({'message': 'Error al consultar el inventario disponible', 'error': str(e)}), 500


@api_bp.route('/inventario/producto_terminado/despachar', methods=['POST'])
def despachar_producto_terminado():
    """
    Marca una lista de pallets como 'Despachado' y crea los movimientos de inventario correspondientes.
    Espera un JSON con una lista de IDs de pallet: { "pallet_ids": [1, 2, 3] }
    """
    data = request.get_json()
    user_id = 1  # Placeholder para el ID del usuario logueado

    if not data or 'pallet_ids' not in data or not isinstance(data['pallet_ids'], list):
        return jsonify({'message': 'Se requiere una lista de IDs de pallet ("pallet_ids")'}), 400

    pallet_ids = data['pallet_ids']
    if not pallet_ids:
        return jsonify({'message': 'La lista de pallets no puede estar vacía'}), 400

    try:
        pallets_a_despachar = PalletTerminado.query.filter(PalletTerminado.id.in_(pallet_ids)).all()

        if len(pallets_a_despachar) != len(pallet_ids):
            return jsonify({'message': 'Uno o más pallets no fueron encontrados'}), 404

        for pallet in pallets_a_despachar:
            if pallet.estado != EstadoPalletEnum.ALMACENADO:
                db.session.rollback()
                return jsonify({'message': f'El pallet N° {pallet.numero_pallet} no está en estado "Almacenado".'}), 409

            # 1. Actualizar el estado del pallet
            pallet.estado = EstadoPalletEnum.DESPACHADO
            pallet.fecha_despacho = datetime.now()

            # 2. Crear el movimiento de salida
            movimiento = MovimientoInventario(
                pallet_id=pallet.id,
                reporte_id=pallet.reporte_id, # Guardamos la referencia al reporte original
                user_id=user_id,
                tipo_movimiento='despacho_producto_terminado',
                cantidad=pallet.cantidad_charolas, # Guardamos la cantidad de charolas como referencia
                ubicacion_origen_id=pallet.ubicacion_id
            )
            db.session.add(movimiento)
        
        db.session.commit()
        return jsonify({'message': f'{len(pallets_a_despachar)} pallets despachados correctamente'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al despachar los pallets', 'error': str(e)}), 500
