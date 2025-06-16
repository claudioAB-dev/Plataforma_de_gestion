from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from .models import db, User, Rol, Producto, ReporteProduccion, PalletTerminado, ParoLinea, Merma

# Define un Blueprint para organizar las rutas
api_bp = Blueprint('api', __name__, url_prefix='/api')



@api_bp.route('/roles', methods=['GET'])
def get_roles():
    roles = Rol.query.all()
    return jsonify([rol.serialize() for rol in roles]), 200

# --- Rutas para Usuarios ---

@api_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or not 'nombre' in data or not 'contrasena' in data or not 'rol_id' in data:
        return jsonify({'message': 'Los campos "nombre", "contrasena" y "rol_id" son requeridos'}), 400
    
    # Verificar que el rol exista
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
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404
    return jsonify(user.serialize()), 200


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


@api_bp.route('/productos', methods=['POST'])
def create_producto():
    data = request.get_json()
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

# --- Rutas para Reportes de Producción (Principal) ---
@api_bp.route('/reportes', methods=['POST'])
def create_reporte():
    data = request.get_json()
    nuevo_reporte = ReporteProduccion(**data)
    db.session.add(nuevo_reporte)
    db.session.commit()
    return jsonify(nuevo_reporte.to_dict()), 201

@api_bp.route('/reportes', methods=['GET'])
def get_all_reportes():
    reportes = ReporteProduccion.query.order_by(ReporteProduccion.fecha_produccion.desc()).all()
    return jsonify([r.to_dict() for r in reportes])

@api_bp.route('/reportes/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def handle_reporte(id):
    reporte = ReporteProduccion.query.get_or_404(id)
    if request.method == 'GET':
        # Incluir todos los detalles al solicitar un reporte específico
        return jsonify(reporte.to_dict(include_details=True))
    elif request.method == 'PUT':
        data = request.get_json()
        for key, value in data.items():
            setattr(reporte, key, value)
        db.session.commit()
        return jsonify(reporte.to_dict())
    elif request.method == 'DELETE':
        # Borrado físico debido a la cascada
        db.session.delete(reporte)
        db.session.commit()
        return '', 204

# --- Rutas para Sub-recursos (Pallets, Paros, Mermas, etc.) ---
# Se recomienda crear sub-recursos anidados bajo su reporte correspondiente.

@api_bp.route('/reportes/<int:reporte_id>/pallets', methods=['POST'])
def add_pallet_to_reporte(reporte_id):
    reporte = ReporteProduccion.query.get_or_404(reporte_id)
    data = request.get_json()
    nuevo_pallet = PalletTerminado(
        reporte_id=reporte.id,
        **data
    )
    db.session.add(nuevo_pallet)
    db.session.commit()
    return jsonify(nuevo_pallet.to_dict()), 201

@api_bp.route('/reportes/<int:reporte_id>/paros', methods=['POST'])
def add_paro_to_reporte(reporte_id):
    ReporteProduccion.query.get_or_404(reporte_id)
    data = request.get_json()
    nuevo_paro = ParoLinea(reporte_id=reporte_id, **data)
    db.session.add(nuevo_paro)
    db.session.commit()
    return jsonify(nuevo_paro.to_dict()), 201
    
@api_bp.route('/reportes/<int:reporte_id>/mermas', methods=['POST'])
def add_merma_to_reporte(reporte_id):
    ReporteProduccion.query.get_or_404(reporte_id)
    data = request.get_json()
    nueva_merma = Merma(reporte_id=reporte_id, **data)
    db.session.add(nueva_merma)
    db.session.commit()
    return jsonify(nueva_merma.to_dict()), 201
    
# ... y así sucesivamente para 'controles_calidad' e 'inspecciones_sello'
# ...

# Para la edición o borrado de un sub-recurso, es más simple usar su ID propio.
@api_bp.route('/pallets/<int:id>', methods=['PUT', 'DELETE'])
def handle_pallet(id):
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
        return '', 204