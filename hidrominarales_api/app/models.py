from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, Enum as SQLAlchemyEnum
from werkzeug.security import generate_password_hash, check_password_hash
import enum
from .extensions import db

# --- Modelos Rol, User y Producto (sin cambios) ---
class Rol(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)
    permisos = db.Column(db.Text, nullable=True)
    users = db.relationship('User', backref='rol', lazy=True)
    def serialize(self): return {'id': self.id, 'nombre': self.nombre, 'permisos': self.permisos, 'user_count': len(self.users)}

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    contrasena = db.Column(db.String(255), nullable=False)
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    def set_password(self, contrasena): self.contrasena = generate_password_hash(contrasena)
    def check_password(self, contrasena): return check_password_hash(self.contrasena, contrasena)
    def serialize(self): return {'id': self.id, 'nombre': self.nombre, 'rol_id': self.rol_id, 'rol_nombre': self.rol.nombre if self.rol else None}

class Producto(db.Model):
    __tablename__ = 'productos'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    presentacion = db.Column(db.String(100))
    sku = db.Column(db.String(50), unique=True)
    co2_nominal = db.Column(db.Integer, nullable=True) 
    charolas_por_tarima = db.Column(db.Integer)

    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    cliente = db.relationship('Cliente', back_populates='productos')

    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.TIMESTAMP, server_default=func.now())
    updated_at = db.Column(db.TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {
            'id': self.id, 
            'nombre': self.nombre, 
            'presentacion': self.presentacion, 
            'sku': self.sku,
            'co2_nominal': self.co2_nominal, 
            'charolas_por_tarima': self.charolas_por_tarima,
            'cliente_id': self.cliente_id,  # Agregado
            'cliente_nombre': self.cliente.nombre if self.cliente else None, # Opcional, pero útil
            'activo': self.activo
        }

# --- Enums (sin cambios) ---
class EstadoProduccionEnum(enum.Enum):
    EN_PROCESO = "En Proceso"
    TERMINADO = "Terminado"
    CANCELADO = "Cancelado"

class TipoMermaEnum(enum.Enum):
    TAPA_CASQUILLO_OPERADOR = 'Tapa/casquillo operador'
    TAPA_CASQUILLO_EQUIPO = 'Tapa/casquillo equipo'
    TAPA_CASQUILLO_MUESTREO = 'Tapa/casquillo muestreo'
    BOTELLA_MUESTREO = 'Botella muestreo'


# --- Modelos con serialización robustecida ---

class ReporteProduccion(db.Model):
    __tablename__ = 'reportes_produccion'
    id = db.Column(db.Integer, primary_key=True)
    turno = db.Column(db.Integer, nullable=False)
    fecha_produccion = db.Column(db.Date, nullable=False)
    linea = db.Column(db.String(50), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    lote = db.Column(db.String(100), nullable=False, unique=True)
    produccion_objetivo = db.Column(db.Integer)
    operador_engargolado_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    responsable_linea_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    hora_arranque = db.Column(db.Time)
    hora_termino = db.Column(db.Time, nullable=True)

    estado = db.Column(
        SQLAlchemyEnum(
            EstadoProduccionEnum,
            name="estadoproduccionenum",
            values_callable=lambda x: [e.value for e in x]
        ),
        nullable=False,
        default=EstadoProduccionEnum.EN_PROCESO.value # Usamos .value también en el default
    )    
    fecha_caducidad = db.Column(db.Date, nullable=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)

    created_at = db.Column(db.TIMESTAMP, server_default=func.now())
    updated_at = db.Column(db.TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    producto = db.relationship('Producto')
    pallets = db.relationship('PalletTerminado', backref='reporte', cascade="all, delete-orphan")
    paros = db.relationship('ParoLinea', backref='reporte', cascade="all, delete-orphan")
    mermas = db.relationship('Merma', backref='reporte', cascade="all, delete-orphan")
    controles_calidad = db.relationship('ControlCalidadProceso', backref='reporte', cascade="all, delete-orphan")
    inspecciones_sello = db.relationship('InspeccionSelloLateral', backref='reporte', cascade="all, delete-orphan")

    def to_dict(self, include_details=False):
        data = {
            'id': self.id,
            'turno': self.turno,
            'fecha_produccion': self.fecha_produccion.isoformat() if self.fecha_produccion else None,
            'linea': self.linea,
            'producto_id': self.producto_id,
            'lote': self.lote,
            'produccion_objetivo': self.produccion_objetivo,
            'fecha_caducidad': self.fecha_caducidad.isoformat() if self.fecha_caducidad else None,
            'cliente_id': self.cliente_id,
            'hora_arranque':  self.hora_arranque.isoformat() if self.hora_arranque else None,
            'hora_termino': self.hora_termino.isoformat() if self.hora_termino else None,
            
            'operador_engargolado_id': self.operador_engargolado_id,
            'responsable_linea_id': self.responsable_linea_id,
            'estado': self.estado.value if isinstance(self.estado, enum.Enum) else self.estado,
            'producto': self.producto.to_dict() if self.producto else None
        }

        # Si la llamada a la función pide los detalles, los incluimos.
        if include_details:
            data['pallets'] = [p.to_dict() for p in self.pallets]
            data['paros'] = [p.to_dict() for p in self.paros]
            data['mermas'] = [m.to_dict() for m in self.mermas]
            data['controles_calidad'] = [c.to_dict() for c in self.controles_calidad]
            data['inspecciones_sello'] = [i.to_dict() for i in self.inspecciones_sello]
            # --- FIN DE LA MODIFICACIÓN ---
        return data

class PalletTerminado(db.Model):
    __tablename__ = 'pallets_terminados'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    numero_pallet = db.Column(db.Integer, nullable=False)
    ubicacion_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=True)

    cantidad_charolas = db.Column(db.Integer, nullable=False)
    hora_registro = db.Column(db.Time, nullable=False)
    def to_dict(self): return {'id': self.id, 'reporte_id': self.reporte_id, 'numero_pallet': self.numero_pallet, 'ubicacion_id': self.ubicacion_id,'cantidad_charolas': self.cantidad_charolas, 'hora_registro': self.hora_registro.strftime('%H:%M:%S') if self.hora_registro else None}

class ParoLinea(db.Model):
    __tablename__ = 'paros_linea'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    hora_inicio = db.Column(db.Time)
    hora_fin = db.Column(db.Time)
    duracion_minutos = db.Column(db.Integer, nullable=False)
    descripcion_motivo = db.Column(db.String(255), nullable=False)
    # FIX: Serialización segura para campos de hora que pueden ser nulos.
    def to_dict(self): return {'id': self.id, 'reporte_id': self.reporte_id, 'hora_inicio': self.hora_inicio.strftime('%H:%M:%S') if self.hora_inicio else None, 'hora_fin': self.hora_fin.strftime('%H:%M:%S') if self.hora_fin else None, 'duracion_minutos': self.duracion_minutos, 'descripcion_motivo': self.descripcion_motivo}

class Merma(db.Model):
    __tablename__ = 'mermas'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    materia_prima_id = db.Column(db.Integer, db.ForeignKey('materias_primas.id'), nullable=False)

    tipo_merma = db.Column(
        SQLAlchemyEnum(
            TipoMermaEnum,
            name="tipomermaenum",
            values_callable=lambda x: [e.value for e in x]
        ),
        nullable=False
    )
    cantidad = db.Column(db.Integer, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'reporte_id': self.reporte_id,
            # FIX: Serialización segura para el campo Enum 'tipo_merma'
            'materia_prima_id': self.materia_prima_id,
            'tipo_merma': self.tipo_merma.value if isinstance(self.tipo_merma, enum.Enum) else self.tipo_merma,
            'cantidad': self.cantidad
        }
# --- MODELOS DE CALIDAD ---

class ControlCalidadProceso(db.Model):
    """
    Modelo para la tabla controles_calidad_proceso.
    Almacena mediciones periódicas de calidad del producto en la línea.
    """
    __tablename__ = 'controles_calidad_proceso'

    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    hora_medicion = db.Column(db.Time, nullable=False)
    
    # Características Organolépticas
    olor = db.Column(db.String(20))
    sabor = db.Column(db.String(20))

    # Inspección General
    lampara_uv = db.Column(db.Boolean)
    fugas = db.Column(db.String(20))
    rosca = db.Column(db.String(20))
    faldon = db.Column(db.String(20))
    inversion = db.Column(db.String(20))

    # Mediciones
    tq1 = db.Column(db.Numeric(5, 2))
    tq2 = db.Column(db.Numeric(5, 2))
    tq3 = db.Column(db.Numeric(5, 2))
    media = db.Column(db.Numeric(5, 2))
    presion = db.Column(db.Numeric(5, 2))
    temperatura = db.Column(db.Numeric(5, 2))
    vol_co2 = db.Column(db.Numeric(5, 2))
    saturador = db.Column(db.Numeric(5, 2))
    
    inspector_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    inspector = db.relationship('User')

    def to_dict(self):
        """Serializa el objeto a un diccionario para respuestas JSON."""
        return {
            'id': self.id,
            'reporte_id': self.reporte_id,
            'hora_medicion': self.hora_medicion.strftime('%H:%M:%S') if self.hora_medicion else None,
            'olor': self.olor,
            'sabor': self.sabor,
            'lampara_uv': self.lampara_uv,
            'fugas': self.fugas,
            'rosca': self.rosca,
            'faldon': self.faldon,
            'inversion': self.inversion,
            'tq1': float(self.tq1) if self.tq1 is not None else None,
            'tq2': float(self.tq2) if self.tq2 is not None else None,
            'tq3': float(self.tq3) if self.tq3 is not None else None,
            'media': float(self.media) if self.media is not None else None,
            'presion': float(self.presion) if self.presion is not None else None,
            'temperatura': float(self.temperatura) if self.temperatura is not None else None,
            'vol_co2': float(self.vol_co2) if self.vol_co2 is not None else None,
            'saturador': float(self.saturador) if self.saturador is not None else None,
            'inspector_id': self.inspector_id,
            'inspector_nombre': self.inspector.nombre if self.inspector else None
        }


class InspeccionSelloLateral(db.Model):
    """
    Modelo para la tabla inspecciones_sello_lateral.
    Almacena mediciones específicas del sello de la botella.
    """
    __tablename__ = 'inspecciones_sello_lateral'

    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    hora_medicion = db.Column(db.Time, nullable=False)

    # Mediciones de Profundidad
    profundidad_superior_1 = db.Column(db.Numeric(5, 2))
    profundidad_superior_2 = db.Column(db.Numeric(5, 2))
    profundidad_superior_3 = db.Column(db.Numeric(5, 2))
    profundidad_superior_4 = db.Column(db.Numeric(5, 2))

    # Mediciones de Sello
    sello_lateral_1 = db.Column(db.Numeric(5, 2))
    sello_lateral_2 = db.Column(db.Numeric(5, 2))
    sello_lateral_3 = db.Column(db.Numeric(5, 2))
    sello_lateral_4 = db.Column(db.Numeric(5, 2))

    realizo_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    realizo = db.relationship('User')

    def to_dict(self):
        """Serializa el objeto a un diccionario para respuestas JSON."""
        return {
            'id': self.id,
            'reporte_id': self.reporte_id,
            'hora_medicion': self.hora_medicion.strftime('%H:%M:%S') if self.hora_medicion else None,
            'profundidad_superior_1': float(self.profundidad_superior_1) if self.profundidad_superior_1 is not None else None,
            'profundidad_superior_2': float(self.profundidad_superior_2) if self.profundidad_superior_2 is not None else None,
            'profundidad_superior_3': float(self.profundidad_superior_3) if self.profundidad_superior_3 is not None else None,
            'profundidad_superior_4': float(self.profundidad_superior_4) if self.profundidad_superior_4 is not None else None,
            'sello_lateral_1': float(self.sello_lateral_1) if self.sello_lateral_1 is not None else None,
            'sello_lateral_2': float(self.sello_lateral_2) if self.sello_lateral_2 is not None else None,
            'sello_lateral_3': float(self.sello_lateral_3) if self.sello_lateral_3 is not None else None,
            'sello_lateral_4': float(self.sello_lateral_4) if self.sello_lateral_4 is not None else None,
            'realizo_id': self.realizo_id,
            'realizo_nombre': self.realizo.nombre if self.realizo else None
        }
    # en models.py

class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), unique=True, nullable=False)
    rfc = db.Column(db.String(13), unique=True)
    datos_contacto = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)

    # Relaciones inversas
    productos = db.relationship('Producto', back_populates='cliente')
    materias_primas = db.relationship('MateriaPrima', backref='cliente', lazy=True)
    
    def to_dict(self):
        return {'id': self.id, 'nombre': self.nombre, 'rfc': self.rfc, 'activo': self.activo}

class MateriaPrima(db.Model):
    """ Catálogo de todas las materias primas que se manejan. """
    __tablename__ = 'materias_primas'
    id = db.Column(db.Integer, primary_key=True)
    # De qué cliente es esta materia prima.
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    
    nombre = db.Column(db.String(255), nullable=False)
    sku = db.Column(db.String(50), unique=True)
    descripcion = db.Column(db.Text)
    unidad_medida = db.Column(db.String(50)) # Ej: Unidades, Litros, Kilos
    stock_minimo_alerta = db.Column(db.Numeric(10, 2), default=0)

    # Relación inversa
    inventario = db.relationship('InventarioMateriaPrima', backref='materia_prima', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'cliente_id': self.cliente_id, 'nombre': self.nombre, 'sku': self.sku, 'unidad_medida': self.unidad_medida}

class Ubicacion(db.Model):
    """ Representa una ubicación física en el almacén. """
    __tablename__ = 'ubicaciones'
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), unique=True, nullable=False) # Ej: A01-S03-N02 (Escaneable)
    zona = db.Column(db.String(100)) # Ej: Materia Prima, Producto Terminado, Cuarentena
    pasillo = db.Column(db.String(50))
    estante = db.Column(db.String(50))
    nivel = db.Column(db.String(50))
    activa = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {'id': self.id, 'codigo': self.codigo, 'zona': self.zona, 'pasillo': self.pasillo, 'estante': self.estante, 'nivel': self.nivel}


# --- NUEVOS MODELOS DE INVENTARIO ---

class InventarioMateriaPrima(db.Model):
    """
    Controla el stock real de lotes de materia prima en ubicaciones específicas.
    Esta es una de las tablas más importantes.
    """
    __tablename__ = 'inventario_materias_primas'
    id = db.Column(db.Integer, primary_key=True)
    materia_prima_id = db.Column(db.Integer, db.ForeignKey('materias_primas.id'), nullable=False)
    ubicacion_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=False)
    
    lote_proveedor = db.Column(db.String(100))
    cantidad_actual = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    fecha_recepcion = db.Column(db.Date, server_default=func.now())
    fecha_caducidad = db.Column(db.Date, nullable=True)
    
    # Relaciones para acceder fácilmente a los objetos
    ubicacion = db.relationship('Ubicacion')
    
    def to_dict(self):
        return {
            'id': self.id,
            'materia_prima_id': self.materia_prima_id,
            'materia_prima_nombre': self.materia_prima.nombre,
            'cliente_id': self.materia_prima.cliente_id,
            'cliente_nombre': self.materia_prima.cliente.nombre,
            'ubicacion_id': self.ubicacion_id,
            'ubicacion_codigo': self.ubicacion.codigo,
            'lote_proveedor': self.lote_proveedor,
            'cantidad_actual': float(self.cantidad_actual),
            'fecha_caducidad': self.fecha_caducidad.isoformat() if self.fecha_caducidad else None
        }

class MovimientoInventario(db.Model):
    """ (Recomendado) Tabla de auditoría para cada movimiento de inventario. """
    __tablename__ = 'movimientos_inventario'
    id = db.Column(db.Integer, primary_key=True)
    
    # Puede ser un movimiento de materia prima o de producto terminado (pallet)
    materia_prima_id = db.Column(db.Integer, db.ForeignKey('materias_primas.id'), nullable=True)
    pallet_id = db.Column(db.Integer, db.ForeignKey('pallets_terminados.id'), nullable=True)
    
    tipo_movimiento = db.Column(db.String(50), nullable=False) # Ej: Recepción, Consumo a Producción, Despacho, Ajuste, Traslado
    cantidad = db.Column(db.Numeric(10, 2), nullable=False)
    
    ubicacion_origen_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=True)
    ubicacion_destino_id = db.Column(db.Integer, db.ForeignKey('ubicaciones.id'), nullable=True)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    timestamp = db.Column(db.TIMESTAMP, server_default=func.now())
    
    # Relaciones
    user = db.relationship('User')
    materia_prima = db.relationship('MateriaPrima')
    pallet = db.relationship('PalletTerminado')