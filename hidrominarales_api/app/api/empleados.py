from flask import request, jsonify
from . import api_bp
from ..models import db, SolicitudFalta, User, EstadoSolicitudEnum
from datetime import datetime
from sqlalchemy import extract, and_

# --- ENDPOINTS PARA EMPLEADOS ---

@api_bp.route('/solicitudes_falta', methods=['POST'])
def crear_solicitud_falta():
    """Crea una nueva solicitud de falta, validando el límite mensual."""
    data = request.get_json()
    user_id = data.get('user_id') # Temporal: obtener de la sesión/token en producción
    
    if not all(k in data for k in ['user_id', 'fecha_solicitud', 'motivo']):
        return jsonify({'message': 'Faltan campos requeridos.'}), 400

    # --- REGLA DE NEGOCIO: No más de 2 faltas por mes ---
    now = datetime.now()
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    count = SolicitudFalta.query.filter(
        and_(
            SolicitudFalta.user_id == user_id,
            SolicitudFalta.timestamp >= start_of_month
        )
    ).count()

    if count >= 2:
        return jsonify({'message': 'Límite de 2 solicitudes mensuales alcanzado.'}), 403

    try:
        nueva_solicitud = SolicitudFalta(
            user_id=user_id,
            fecha_solicitud=datetime.strptime(data['fecha_solicitud'], '%Y-%m-%d').date(),
            motivo=data['motivo'],
            estado=EstadoSolicitudEnum.PENDIENTE
        )
        db.session.add(nueva_solicitud)
        db.session.commit()
        return jsonify(nueva_solicitud.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al crear la solicitud', 'error': str(e)}), 500

@api_bp.route('/solicitudes_falta/mis_solicitudes/<int:user_id>', methods=['GET'])
def get_mis_solicitudes(user_id):
    """Obtiene todas las solicitudes de un empleado específico."""
    try:
        solicitudes = SolicitudFalta.query.filter_by(user_id=user_id).order_by(SolicitudFalta.timestamp.desc()).all()
        return jsonify([s.to_dict() for s in solicitudes]), 200
    except Exception as e:
        return jsonify({'message': 'Error al obtener las solicitudes', 'error': str(e)}), 500

# --- ENDPOINTS PARA GERENTES ---

@api_bp.route('/solicitudes_falta', methods=['GET'])
def get_todas_solicitudes():
    """Obtiene todas las solicitudes, con opción de filtrar por estado."""
    status_filter = request.args.get('estado')
    query = SolicitudFalta.query
    if status_filter:
        query = query.filter(SolicitudFalta.estado == status_filter)
    
    solicitudes = query.order_by(SolicitudFalta.timestamp.desc()).all()
    return jsonify([s.to_dict() for s in solicitudes]), 200

@api_bp.route('/solicitudes_falta/<int:solicitud_id>/revisar', methods=['PUT'])
def revisar_solicitud(solicitud_id):
    """Aprueba o rechaza una solicitud."""
    data = request.get_json()
    revisor_id = data.get('revisor_id') # Temporal: obtener de la sesión/token
    nuevo_estado = data.get('estado')
    
    if not revisor_id or not nuevo_estado:
        return jsonify({'message': 'ID del revisor y nuevo estado son requeridos.'}), 400

    solicitud = SolicitudFalta.query.get_or_404(solicitud_id)
    if solicitud.estado != EstadoSolicitudEnum.PENDIENTE:
        return jsonify({'message': 'Esta solicitud ya ha sido revisada.'}), 409
        
    try:
        solicitud.estado = EstadoSolicitudEnum(nuevo_estado)
        solicitud.revisado_por_id = revisor_id
        solicitud.fecha_revision = datetime.now()
        solicitud.comentario_gerente = data.get('comentario_gerente')
        
        db.session.commit()
        return jsonify(solicitud.to_dict()), 200
    except ValueError:
        return jsonify({'message': 'El estado proporcionado no es válido.'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar la solicitud', 'error': str(e)}), 500