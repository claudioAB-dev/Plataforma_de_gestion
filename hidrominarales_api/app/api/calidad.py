from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from ..models import db, ControlCalidadProceso, InspeccionSelloLateral
from datetime import datetime
from . import api_bp
# --- RUTAS DE CALIDAD ---

# --- CRUD para Controles de Calidad de Proceso ---

@api_bp.route('/controles_calidad', methods=['POST'])
def create_control_calidad():
    """Crea un nuevo registro de control de calidad."""
    data = request.get_json()
    if not data or not all(k in data for k in ['reporte_id', 'hora_medicion', 'inspector_id']):
        return jsonify({'message': 'reporte_id, hora_medicion, e inspector_id son requeridos'}), 400

    try:
        nuevo_control = ControlCalidadProceso(
            reporte_id=data['reporte_id'],
            hora_medicion=datetime.strptime(data['hora_medicion'], '%H:%M:%S').time(),
            olor=data.get('olor'),
            sabor=data.get('sabor'),
            lampara_uv=data.get('lampara_uv'),
            fugas=data.get('fugas'),
            rosca=data.get('rosca'),
            faldon=data.get('faldon'),
            inversion=data.get('inversion'),
            tq1=data.get('tq1'),
            tq2=data.get('tq2'),
            tq3=data.get('tq3'),
            media=data.get('media'),
            presion=data.get('presion'),
            temperatura=data.get('temperatura'),
            vol_co2=data.get('vol_co2'),
            saturador=data.get('saturador'),
            inspector_id=data['inspector_id']
        )
        db.session.add(nuevo_control)
        db.session.commit()
        return jsonify(nuevo_control.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al crear el registro de calidad', 'error': str(e)}), 500

@api_bp.route('/controles_calidad/<int:id>', methods=['GET'])
def get_control_calidad(id):
    """Obtiene un control de calidad por su ID."""
    control = ControlCalidadProceso.query.get_or_404(id)
    return jsonify(control.to_dict())

@api_bp.route('/controles_calidad/<int:id>', methods=['PUT'])
def update_control_calidad(id):
    """Actualiza un control de calidad existente."""
    control = ControlCalidadProceso.query.get_or_404(id)
    data = request.get_json()
    
    for key, value in data.items():
        if key == 'hora_medicion' and value:
            value = datetime.strptime(value, '%H:%M:%S').time()
        if hasattr(control, key):
            setattr(control, key, value)
            
    db.session.commit()
    return jsonify(control.to_dict())

@api_bp.route('/controles_calidad/<int:id>', methods=['DELETE'])
def delete_control_calidad(id):
    """Elimina un control de calidad."""
    control = ControlCalidadProceso.query.get_or_404(id)
    db.session.delete(control)
    db.session.commit()
    return '', 204


# --- CRUD para Inspecciones de Sello Lateral ---

@api_bp.route('/inspecciones_sello', methods=['POST'])
def create_inspeccion_sello():
    """Crea un nuevo registro de inspección de sello."""
    data = request.get_json()
    if not data or not all(k in data for k in ['reporte_id', 'hora_medicion', 'realizo_id']):
        return jsonify({'message': 'reporte_id, hora_medicion, y realizo_id son requeridos'}), 400

    try:
        nueva_inspeccion = InspeccionSelloLateral(
            reporte_id=data['reporte_id'],
            hora_medicion=datetime.strptime(data['hora_medicion'], '%H:%M:%S').time(),
            profundidad_superior_1=data.get('profundidad_superior_1'),
            profundidad_superior_2=data.get('profundidad_superior_2'),
            profundidad_superior_3=data.get('profundidad_superior_3'),
            profundidad_superior_4=data.get('profundidad_superior_4'),
            sello_lateral_1=data.get('sello_lateral_1'),
            sello_lateral_2=data.get('sello_lateral_2'),
            sello_lateral_3=data.get('sello_lateral_3'),
            sello_lateral_4=data.get('sello_lateral_4'),
            realizo_id=data['realizo_id']
        )
        db.session.add(nueva_inspeccion)
        db.session.commit()
        return jsonify(nueva_inspeccion.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al crear la inspección de sello', 'error': str(e)}), 500

@api_bp.route('/inspecciones_sello/<int:id>', methods=['GET'])
def get_inspeccion_sello(id):
    """Obtiene una inspección de sello por su ID."""
    inspeccion = InspeccionSelloLateral.query.get_or_404(id)
    return jsonify(inspeccion.to_dict())

@api_bp.route('/inspecciones_sello/<int:id>', methods=['PUT'])
def update_inspeccion_sello(id):
    """Actualiza una inspección de sello existente."""
    inspeccion = InspeccionSelloLateral.query.get_or_404(id)
    data = request.get_json()
    
    for key, value in data.items():
        if key == 'hora_medicion' and value:
            value = datetime.strptime(value, '%H:%M:%S').time()
        if hasattr(inspeccion, key):
            setattr(inspeccion, key, value)

    db.session.commit()
    return jsonify(inspeccion.to_dict())

@api_bp.route('/inspecciones_sello/<int:id>', methods=['DELETE'])
def delete_inspeccion_sello(id):
    """Elimina una inspección de sello."""
    inspeccion = InspeccionSelloLateral.query.get_or_404(id)
    db.session.delete(inspeccion)
    db.session.commit()
    return '', 204

