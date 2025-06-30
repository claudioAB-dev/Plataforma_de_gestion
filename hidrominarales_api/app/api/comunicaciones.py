from flask import request, jsonify
from . import api_bp
from ..models import db, Anuncio, User
from datetime import date, datetime

# --- ENDPOINTS PARA ANUNCIOS ---

@api_bp.route('/anuncios', methods=['GET'])
def get_anuncios_activos():
    """Obtiene todos los anuncios que no han expirado."""
    try:
        today = date.today()
        # Filtra anuncios que no tienen fecha de expiración o cuya fecha es futura.
        anuncios = Anuncio.query.filter(
            (Anuncio.fecha_expiracion == None) | (Anuncio.fecha_expiracion >= today)
        ).order_by(Anuncio.timestamp.desc()).all()
        return jsonify([a.to_dict() for a in anuncios]), 200
    except Exception as e:
        return jsonify({'message': 'Error al obtener los anuncios', 'error': str(e)}), 500

# --- ENDPOINTS DE GESTIÓN (PARA GERENTES) ---

@api_bp.route('/anuncios/todos', methods=['GET'])
def get_todos_los_anuncios():
    """Obtiene absolutamente todos los anuncios para gestión."""
    try:
        anuncios = Anuncio.query.order_by(Anuncio.timestamp.desc()).all()
        return jsonify([a.to_dict() for a in anuncios]), 200
    except Exception as e:
        return jsonify({'message': 'Error al obtener los anuncios', 'error': str(e)}), 500

@api_bp.route('/anuncios', methods=['POST'])
def crear_anuncio():
    """Crea un nuevo anuncio."""
    data = request.get_json()
    if not all(k in data for k in ['titulo', 'contenido', 'user_id']):
        return jsonify({'message': 'Faltan campos requeridos.'}), 400
    
    try:
        nuevo_anuncio = Anuncio(
            titulo=data['titulo'],
            contenido=data['contenido'],
            user_id=data['user_id'],
            fecha_expiracion=datetime.strptime(data['fecha_expiracion'], '%Y-%m-%d').date() if data.get('fecha_expiracion') else None
        )
        db.session.add(nuevo_anuncio)
        db.session.commit()
        return jsonify(nuevo_anuncio.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al crear el anuncio', 'error': str(e)}), 500

@api_bp.route('/anuncios/<int:anuncio_id>', methods=['PUT'])
def actualizar_anuncio(anuncio_id):
    """Actualiza un anuncio existente."""
    anuncio = Anuncio.query.get_or_404(anuncio_id)
    data = request.get_json()
    
    try:
        anuncio.titulo = data.get('titulo', anuncio.titulo)
        anuncio.contenido = data.get('contenido', anuncio.contenido)
        anuncio.fecha_expiracion = datetime.strptime(data['fecha_expiracion'], '%Y-%m-%d').date() if data.get('fecha_expiracion') else None
        db.session.commit()
        return jsonify(anuncio.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar', 'error': str(e)}), 500

@api_bp.route('/anuncios/<int:anuncio_id>', methods=['DELETE'])
def eliminar_anuncio(anuncio_id):
    """Elimina un anuncio."""
    anuncio = Anuncio.query.get_or_404(anuncio_id)
    try:
        db.session.delete(anuncio)
        db.session.commit()
        return jsonify({'message': 'Anuncio eliminado correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al eliminar', 'error': str(e)}), 500