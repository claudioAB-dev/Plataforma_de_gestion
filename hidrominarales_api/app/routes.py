from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from .models import db, User, Rol, Producto, ReporteProduccion, PalletTerminado, ParoLinea, Merma, EstadoProduccionEnum
from datetime import datetime

api_bp = Blueprint('api', __name__, url_prefix='/api')





# --- Rutas para Usuarios y Roles (requeridas por los selectores) ---
@api_bp.route('/users', methods=['GET'])
def get_users():
    """Obtiene todos los usuarios."""
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200


@api_bp.route('/roles', methods=['GET'])
def get_roles():
    roles = Rol.query.all()
    return jsonify([rol.serialize() for rol in roles]), 200



# --- Rutas para Productos (requeridas por los selectores) ---
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


# --- Rutas para el Login y Autenticación ---

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




# --- Rutas para Reportes de Producción ---

@api_bp.route('/reportes', methods=['GET'])
def get_all_reportes():
    """
    Obtiene todos los reportes, con opción de filtrar por 'linea' y 'estado'.
    Ordena por ID descendente para obtener el más reciente primero.
    """
    try:
        query = ReporteProduccion.query
        linea = request.args.get('linea')
        
        # --- INICIO DE LA CORRECCIÓN ---
        # 2. Convertir el string del query param al miembro del Enum
        estado_str = request.args.get('estado')

        if linea:
            query = query.filter_by(linea=linea)
        
        if estado_str:
            try:
                # Se busca el miembro del Enum cuyo VALOR coincide con el string recibido
                estado_enum = EstadoProduccionEnum(estado_str)
                # Se pasa el miembro del Enum a la consulta, no el string
                query = query.filter_by(estado=estado_enum)
            except ValueError:
                # Esto maneja el caso de que se envíe un estado inválido (ej. ?estado=Desconocido)
                return jsonify({'message': f"El valor para 'estado' ('{estado_str}') no es válido."}), 400
        reportes = query.order_by(ReporteProduccion.id.desc()).all()
        return jsonify([reporte.to_dict(include_details=True) for reporte in reportes]), 200
    except Exception as e:
        return jsonify({'message': 'Error al obtener los reportes', 'error': str(e)}), 500
def get_reportes():
    """Obtiene los reportes, puede filtrar por línea y/o estado."""
    try:
        query = ReporteProduccion.query
        linea = request.args.get('linea')
        estado_str = request.args.get('estado')

        if linea:
            query = query.filter_by(linea_produccion=linea)
        
        if estado_str:
            try:
                # Convertir el string del query param al miembro del Enum
                estado_enum = EstadoProduccionEnum(estado_str)
                query = query.filter_by(estado=estado_enum)
            except ValueError:
                # Manejar caso de estado inválido
                return jsonify({'message': f"El valor para 'estado' ('{estado_str}') no es válido."}), 400

        # Ordenar por ID descendente para obtener siempre el más reciente primero
        reportes = query.order_by(ReporteProduccion.id.desc()).all()
        
        # El frontend espera una lista, aunque solo nos interese el primero
        return jsonify([reporte.to_dict(include_details=True) for reporte in reportes]), 200
        
    except Exception as e:
        # Log del error en el servidor para depuración
        print(f"Error en get_reportes: {e}") 
        return jsonify({'message': 'Error al obtener los reportes', 'error': str(e)}), 500


@api_bp.route('/reportes/<int:report_id>', methods=['GET'])
def get_report_by_id(report_id):
    """
    Obtiene un reporte de producción específico por su ID.
    """
    report = ReporteProduccion.query.get(report_id)

    if not report:
        return jsonify({'message': 'Reporte no encontrado'}), 404

    return jsonify(report.to_dict(include_details=True))


@api_bp.route('/reportes', methods=['POST'])
def create_reporte():
    """Crea un nuevo ReporteProduccion."""
    data = request.get_json()
    
    # --- INICIO DE LA CORRECCIÓN ---
    # Añadir 'turno' a la lista de campos requeridos.
    required_fields = ["turno", "lote", "produccion_objetivo", "linea_produccion", "producto_id", "operador_engargolado_id", "responsable_linea_id"]
    # --- FIN DE LA CORRECCIÓN ---

    if not data or not all(field in data for field in required_fields):
        return jsonify({'message': 'Faltan campos requeridos en la solicitud.'}), 400

    try:
        nuevo_reporte = ReporteProduccion(
            # --- INICIO DE LA CORRECCIÓN ---
            # Añadir el campo 'turno' al crear el objeto.
            turno=data.get('turno'),
            # --- FIN DE LA CORRECCIÓN ---
            producto_id=data.get('producto_id'),
            lote=data.get('lote'),
            produccion_objetivo=data.get('produccion_objetivo'),
            linea=data.get('linea_produccion'),
            operador_engargolado_id=data.get('operador_engargolado_id'),
            responsable_linea_id=data.get('responsable_linea_id'),
            hora_arranque=datetime.now().time(),
            fecha_produccion=datetime.now().date(),
            estado=EstadoProduccionEnum.EN_PROCESO.value
        )
        db.session.add(nuevo_reporte)
        db.session.commit()
        return jsonify(nuevo_reporte.to_dict()), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({'message': 'El Lote de Producción ya existe. Por favor, ingrese uno diferente.'}), 409
    
    except Exception as e:
        db.session.rollback()
        print(f"Error inesperado en create_reporte: {e}") 
        return jsonify({'message': 'Ocurrió un error inesperado en el servidor.'}), 500

@api_bp.route('/reportes/<int:id>', methods=['PUT'])
def update_reporte(id):
    """Actualiza un reporte, principalmente para cambiar su estado a 'Terminado'."""
    data = request.get_json()
    reporte = ReporteProduccion.query.get_or_404(id)
    try:
        if 'estado' in data and data['estado'] == 'Terminado':
            reporte.estado = 'Terminado'
            reporte.hora_termino = datetime.now().time()
        
        db.session.commit()
        return jsonify(reporte.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al actualizar el reporte', 'error': str(e)}), 500
@api_bp.route('/reportes/<int:id>', methods=['DELETE'])
def delete_reporte(id):
    """Elimina un reporte de producción."""
    reporte = ReporteProduccion.query.get_or_404(id)
    try:
        db.session.delete(reporte)
        db.session.commit()
        return jsonify({'message': f'Reporte con ID {id} eliminado exitosamente.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al eliminar el reporte', 'error': str(e)}), 500

# --- Rutas para Sub-recursos de Reportes (Pallets, Paros, Mermas) ---

@api_bp.route('/reportes/<int:reporte_id>/pallets', methods=['POST'])
def add_pallet_to_reporte(reporte_id):
    """Añade un pallet a un reporte específico."""
    ReporteProduccion.query.get_or_404(reporte_id)
    data = request.get_json()
    try:
        hora_registro_obj = datetime.strptime(data['hora_registro'], '%H:%M').time()
        
        nuevo_pallet = PalletTerminado(
            reporte_id=reporte_id,
            numero_pallet=data['numero_pallet'],
            cantidad_charolas=data['cantidad_charolas'],
            hora_registro=hora_registro_obj
        )
        db.session.add(nuevo_pallet)
        db.session.commit()
        return jsonify(nuevo_pallet.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al añadir el pallet', 'error': str(e)}), 500

@api_bp.route('/reportes/<int:reporte_id>/paros', methods=['POST'])
def add_paro_to_reporte(reporte_id):
    """Añade un paro de línea a un reporte específico."""
    ReporteProduccion.query.get_or_404(reporte_id)
    data = request.get_json()
    try:
        hora_inicio_obj = datetime.strptime(data['hora_inicio'], '%H:%M').time()

        nuevo_paro = ParoLinea(
            reporte_id=reporte_id,
            hora_inicio=hora_inicio_obj,
            duracion_minutos=data['duracion_minutos'],
            descripcion_motivo=data['descripcion_motivo']
        )
        db.session.add(nuevo_paro)
        db.session.commit()
        return jsonify(nuevo_paro.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al añadir el paro', 'error': str(e)}), 500
    
@api_bp.route('/reportes/<int:reporte_id>/mermas', methods=['POST'])
def add_merma_to_reporte(reporte_id):
    """Añade merma a un reporte específico."""
    ReporteProduccion.query.get_or_404(reporte_id)
    data = request.get_json()
    try:
        nueva_merma = Merma(
            reporte_id=reporte_id,
            tipo_merma=data['tipo_merma'],
            cantidad=data['cantidad']
        )
        db.session.add(nueva_merma)
        db.session.commit()
        return jsonify(nueva_merma.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error al añadir la merma', 'error': str(e)}), 500