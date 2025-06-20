# hidrominarales_api/app/routes.py

from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from .models import db, User, Rol, Producto, ReporteProduccion, PalletTerminado, ParoLinea, Merma
from datetime import datetime

# Define un Blueprint para organizar las rutas de la API
api_bp = Blueprint('api', __name__, url_prefix='/api')


# --- Rutas para Roles y Autenticación ---

@api_bp.route('/roles', methods=['GET'])
def get_roles():
    """Obtiene todos los roles disponibles."""
    roles = Rol.query.all()
    return jsonify([rol.serialize() for rol in roles]), 200

@api_bp.route('/users', methods=['POST'])
def create_user():
    """Crea un nuevo usuario."""
    data = request.get_json()
    if not data or not all(k in data for k in ['nombre', 'contrasena', 'rol_id']):
        return jsonify({'message': 'Los campos "nombre", "contrasena" y "rol_id" son requeridos'}), 400
    
    if not Rol.query.get(data['rol_id']):
        return jsonify({'message': 'El rol_id proporcionado no existe'}), 404

    nuevo_usuario = User(nombre=data['nombre'], rol_id=data['rol_id'])
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
        return jsonify({'error': str(e)}), 500

@api_bp.route('/users', methods=['GET'])
def get_users():
    """Obtiene todos los usuarios."""
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Obtiene un usuario específico por su ID."""
    user = User.query.get_or_404(user_id)
    return jsonify(user.serialize()), 200

@api_bp.route('/login', methods=['POST'])
def login():
    """Autentica a un usuario."""
    data = request.get_json()
    if not data or not all(k in data for k in ['nombre', 'contrasena']):
        return jsonify({'message': 'Nombre de usuario y contraseña requeridos'}), 400

    user = User.query.filter_by(nombre=data['nombre']).first()

    if user and user.check_password(data['contrasena']):
        return jsonify({
            'message': 'Login exitoso',
            'user': user.serialize()
        }), 200
    
    return jsonify({'message': 'Credenciales inválidas'}), 401


# --- Rutas para Productos ---

@api_bp.route('/productos', methods=['POST'])
def create_producto():
    """Crea un nuevo producto."""
    data = request.get_json()
    nuevo_producto = Producto(**data)
    db.session.add(nuevo_producto)
    db.session.commit()
    return jsonify(nuevo_producto.to_dict()), 201

@api_bp.route('/productos', methods=['GET'])
def get_productos():
    """Obtiene solo los productos activos (ideal para selectores en modales de producción)."""
    productos = Producto.query.filter_by(activo=True).all()
    return jsonify([p.to_dict() for p in productos])

@api_bp.route('/productos/all', methods=['GET'])
def get_all_productos():
    """Obtiene todos los productos, incluyendo activos e inactivos (para tablas de gestión)."""
    productos = Producto.query.all()
    return jsonify([p.to_dict() for p in productos])

@api_bp.route('/productos/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_producto(id):
    """Maneja un producto específico (obtener, actualizar, activar/desactivar)."""
    producto = Producto.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(producto.to_dict())
    
    elif request.method == 'PUT':
        data = request.get_json()
        # Actualiza solo los campos que vengan en el request
        if 'nombre' in data:
            producto.nombre = data['nombre']
        if 'presentacion' in data:
            producto.presentacion = data['presentacion']
        if 'sku' in data:
            producto.sku = data['sku']
        if 'activo' in data:
            producto.activo = data['activo']
        # Se podrían añadir más campos aquí si el modelo Producto los tuviera
        # ej: if 'charolas_por_tarima' in data:
        #         producto.charolas_por_tarima = data['charolas_por_tarima']
        db.session.commit()
        return jsonify(producto.to_dict())
        
    elif request.method == 'DELETE':
        # Se usa como borrado lógico (desactivar)
        producto.activo = False
        db.session.commit()
        return jsonify({'message': 'Producto desactivado (borrado lógico)'}), 200


# --- Rutas para Reportes de Producción ---

@api_bp.route('/reportes', methods=['GET'])
def get_all_reportes():
    """
    Obtiene todos los reportes, con opción de filtrar por 'linea' y 'estado'.
    """
    try:
        query = ReporteProduccion.query
        linea = request.args.get('linea')
        estado = request.args.get('estado')

        if linea:
            query = query.filter_by(linea=linea)
        if estado:
            query = query.filter_by(estado=estado)

        reportes = query.order_by(ReporteProduccion.id.desc()).all()
        return jsonify([reporte.to_dict() for reporte in reportes]), 200
    except Exception as e:
        return jsonify({'message': 'Error al obtener los reportes', 'error': str(e)}), 500

@api_bp.route('/reportes', methods=['POST'])
def create_reporte():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos'}), 400

    try:
        nuevo_reporte = ReporteProduccion(
            producto_id=data.get('producto_id'),
            lote=data.get('lote'),
            produccion_objetivo=data.get('produccion_objetivo'),
            # Usar 'linea' que es el campo del modelo, y obtenerlo de 'linea_produccion' del JSON
            linea=data.get('linea_produccion'),
            operador_engargolado_id=data.get('operador_engargolado_id'),
            responsable_linea_id=data.get('responsable_linea_id'),
            hora_arranque=datetime.now().strftime('%H:%M'),
            fecha_produccion=datetime.now().date(),
            estado='En Proceso'
        )
        db.session.add(nuevo_reporte)
        db.session.commit()
        return jsonify(nuevo_reporte.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        # Devuelve el error real para un mejor diagnóstico
        return jsonify({'message': 'Error al crear el reporte', 'error': str(e)}), 500

@api_bp.route('/reportes/<int:id>', methods=['PUT'])
def update_reporte(id):
    """
    Actualiza un reporte. Se usa principalmente para cambiar su estado a 'Terminado'.
    """
    data = request.get_json()
    reporte = ReporteProduccion.query.get_or_404(id)
    try:
        if 'estado' in data:
            reporte.estado = data['estado']
        # Aquí se podrían actualizar otros campos si fuera necesario
        
        db.session.commit()
        return jsonify(reporte.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar el reporte', 'error': str(e)}), 500


# --- Rutas para Sub-recursos de Reportes (Pallets, Paros, Mermas) ---

@api_bp.route('/reportes/<int:reporte_id>/pallets', methods=['POST'])
def add_pallet_to_reporte(reporte_id):
    """Añade un pallet a un reporte específico."""
    ReporteProduccion.query.get_or_404(reporte_id)
    data = request.get_json()
    nuevo_pallet = PalletTerminado(reporte_id=reporte_id, **data)
    db.session.add(nuevo_pallet)
    db.session.commit()
    return jsonify(nuevo_pallet.to_dict()), 201

@api_bp.route('/reportes/<int:reporte_id>/paros', methods=['POST'])
def add_paro_to_reporte(reporte_id):
    """Añade un paro de línea a un reporte específico."""
    ReporteProduccion.query.get_or_404(reporte_id)
    data = request.get_json()
    nuevo_paro = ParoLinea(reporte_id=reporte_id, **data)
    db.session.add(nuevo_paro)
    db.session.commit()
    return jsonify(nuevo_paro.to_dict()), 201
    
@api_bp.route('/reportes/<int:reporte_id>/mermas', methods=['POST'])
def add_merma_to_reporte(reporte_id):
    """Añade merma a un reporte específico."""
    ReporteProduccion.query.get_or_404(reporte_id)
    data = request.get_json()
    nueva_merma = Merma(reporte_id=reporte_id, **data)
    db.session.add(nueva_merma)
    db.session.commit()
    return jsonify(nueva_merma.to_dict()), 201
    

# --- Rutas para manejar sub-recursos por su ID propio ---

@api_bp.route('/pallets/<int:id>', methods=['PUT', 'DELETE'])
def handle_pallet(id):
    """Maneja un pallet específico (actualizar, eliminar)."""
    pallet = PalletTerminado.query.get_or_404(id)
    if request.method == 'PUT':
        data = request.get_json()
        for key, value in data.items():
            setattr(pallet, key, value)
        db.session.commit()
        return jsonify(pallet.to_dict())
    elif request.method == 'DELETE':
        db.session.delete(pallet)
        db.session.commit()
        return jsonify({'message': 'Pallet eliminado'}), 204