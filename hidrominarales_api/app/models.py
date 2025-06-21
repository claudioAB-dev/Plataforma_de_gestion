# hidrominarales_api/app/models.py

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, Enum as SQLAlchemyEnum
from werkzeug.security import generate_password_hash, check_password_hash
import enum

db = SQLAlchemy()

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
    charolas_por_tarima = db.Column(db.Integer)
    activo = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.TIMESTAMP, server_default=func.now())
    updated_at = db.Column(db.TIMESTAMP, server_default=func.now(), onupdate=func.now())
    def to_dict(self): return {'id': self.id, 'nombre': self.nombre, 'presentacion': self.presentacion, 'sku': self.sku, 'charolas_por_tarima': self.charolas_por_tarima, 'activo': self.activo}


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

    created_at = db.Column(db.TIMESTAMP, server_default=func.now())
    updated_at = db.Column(db.TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    producto = db.relationship('Producto')
    pallets = db.relationship('PalletTerminado', backref='reporte', cascade="all, delete-orphan")
    paros = db.relationship('ParoLinea', backref='reporte', cascade="all, delete-orphan")
    mermas = db.relationship('Merma', backref='reporte', cascade="all, delete-orphan")

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
            'hora_arranque': self.hora_arranque.strftime('%H:%M:%S') if self.hora_arranque else None,
            'hora_termino': self.hora_termino.strftime('%H:%M:%S') if self.hora_termino else None,
            
            'operador_engargolado_id': self.operador_engargolado_id,
            'responsable_linea_id': self.responsable_linea_id,
            # FIX: Serialización segura para el campo Enum 'estado'
            'estado': self.estado.value if isinstance(self.estado, enum.Enum) else self.estado,
            'producto': self.producto.to_dict() if self.producto else None
        }
        if include_details:
            data['pallets'] = [p.to_dict() for p in self.pallets]
            data['paros'] = [p.to_dict() for p in self.paros]
            data['mermas'] = [m.to_dict() for m in self.mermas]
        return data

class PalletTerminado(db.Model):
    __tablename__ = 'pallets_terminados'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    numero_pallet = db.Column(db.Integer, nullable=False)
    cantidad_charolas = db.Column(db.Integer, nullable=False)
    hora_registro = db.Column(db.Time, nullable=False)
    def to_dict(self): return {'id': self.id, 'reporte_id': self.reporte_id, 'numero_pallet': self.numero_pallet, 'cantidad_charolas': self.cantidad_charolas, 'hora_registro': self.hora_registro.strftime('%H:%M:%S') if self.hora_registro else None}

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
            'tipo_merma': self.tipo_merma.value if isinstance(self.tipo_merma, enum.Enum) else self.tipo_merma,
            'cantidad': self.cantidad
        }