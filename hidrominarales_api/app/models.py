from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Enum as SQLAlchemyEnum
from enum import Enum
import enum

db = SQLAlchemy()

class Rol(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), unique=True, nullable=False)
    permisos = db.Column(db.Text, nullable=True) # Puede ser un JSON como texto

    # Relación uno a muchos: un rol puede tener muchos usuarios
    users = db.relationship('User', backref='rol', lazy=True)

    def __repr__(self):
        return f"<Rol {self.nombre}>"

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'permisos': self.permisos,
            'user_count': len(self.users)
        }

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    # Nunca almacenes contraseñas en texto plano
    contrasena = db.Column(db.String(255), nullable=False)
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)

    def __repr__(self):
        return f"<User {self.nombre}>"

    def set_password(self, contrasena):
        """Crea un hash de la contraseña."""
        self.contrasena = generate_password_hash(contrasena)

    def check_password(self, contrasena):
        """Verifica el hash de la contraseña."""
        return check_password_hash(self.contrasena, contrasena)

    def serialize(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'rol_id': self.rol_id,
            # Incluimos el nombre del rol para facilitar su uso en el frontend
            'rol_nombre': self.rol.nombre if self.rol else None
        }

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

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'presentacion': self.presentacion,
            'sku': self.sku,
            'charolas_por_tarima': self.charolas_por_tarima,
            'activo': self.activo
        }

class ReporteProduccion(db.Model):
    __tablename__ = 'reportes_produccion'
    id = db.Column(db.Integer, primary_key=True)
    fecha_produccion = db.Column(db.Date, nullable=False)
    linea = db.Column(db.String(50))
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    lote = db.Column(db.String(100), nullable=False, unique=True)
    
    # --- COLUMNAS FALTANTES AÑADIDAS ---
    produccion_objetivo = db.Column(db.Integer)
    operador_engargolado_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    responsable_linea_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    # ------------------------------------

    fecha_caducidad = db.Column(db.Date)
    hora_arranque = db.Column(db.Time)
    hora_termino = db.Column(db.Time)
    velocidad_linea_bpm = db.Column(db.Integer)
    elaboro_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    reviso_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    estado = db.Column(SQLAlchemyEnum(Enum("En Proceso", "Terminado", "Cancelado")), nullable=False, default="En Proceso")
    created_at = db.Column(db.TIMESTAMP, server_default=func.now())
    
    # --- NOTA: Tenías 3 columnas 'updated_at', las he reducido a una ---
    updated_at = db.Column(db.TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relaciones
    producto = db.relationship('Producto')
    pallets = db.relationship('PalletTerminado', backref='reporte', cascade="all, delete-orphan")
    paros = db.relationship('ParoLinea', backref='reporte', cascade="all, delete-orphan")
    mermas = db.relationship('Merma', backref='reporte', cascade="all, delete-orphan")
    controles_calidad = db.relationship('ControlCalidadProceso', backref='reporte', cascade="all, delete-orphan")
    inspecciones_sello = db.relationship('InspeccionSelloLateral', backref='reporte', cascade="all, delete-orphan")
    personal_asignado = db.relationship('User', secondary='reporte_personal')

    # La función to_dict que te proporcioné anteriormente sigue siendo válida.
    # Asegúrate de que tu función to_dict incluya los nuevos campos si los necesitas en el frontend.
    def to_dict(self, include_details=False):
        data = {
            'id': self.id,
            'fecha_produccion': self.fecha_produccion.isoformat() if self.fecha_produccion else None,
            'linea': self.linea,
            'producto_id': self.producto_id,
            'lote': self.lote,
            'produccion_objetivo': self.produccion_objetivo,
            'fecha_caducidad': self.fecha_caducidad.isoformat() if self.fecha_caducidad else None,
            'hora_arranque': self.hora_arranque.strftime('%H:%M:%S') if self.hora_arranque else None,
            'hora_termino': self.hora_termino.strftime('%H:%M:%S') if self.hora_termino else None,
            'velocidad_linea_bpm': self.velocidad_linea_bpm,
            'operador_engargolado_id': self.operador_engargolado_id,
            'responsable_linea_id': self.responsable_linea_id,
            'elaboro_id': self.elaboro_id,
            'reviso_id': self.reviso_id,
            'estado': self.estado,
            'producto': self.producto.to_dict() if self.producto else None
        }
        if include_details:
            data['pallets'] = [p.to_dict() for p in self.pallets]
            data['paros'] = [p.to_dict() for p in self.paros]
            data['mermas'] = [m.to_dict() for m in self.mermas]
            data['controles_calidad'] = [c.to_dict() for c in self.controles_calidad]
            data['inspecciones_sello'] = [i.to_dict() for i in self.inspecciones_sello]
            # 'personal_asignado' podría ser muy grande, inclúyelo con cuidado
            # data['personal_asignado'] = [u.serialize() for u in self.personal_asignado]
        return data
class PalletTerminado(db.Model):
    __tablename__ = 'pallets_terminados'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    numero_pallet = db.Column(db.Integer, nullable=False)
    cantidad_charolas = db.Column(db.Integer, nullable=False)
    hora_registro = db.Column(db.Time, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'reporte_id': self.reporte_id,
            'numero_pallet': self.numero_pallet,
            'cantidad_charolas': self.cantidad_charolas,
            'hora_registro': self.hora_registro.strftime('%H:%M:%S') if self.hora_registro else None
        }

class ParoLinea(db.Model):
    __tablename__ = 'paros_linea'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    hora_inicio = db.Column(db.Time)
    hora_fin = db.Column(db.Time)
    duracion_minutos = db.Column(db.Integer, nullable=False)
    descripcion_motivo = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'reporte_id': self.reporte_id,
            'hora_inicio': self.hora_inicio.strftime('%H:%M:%S') if self.hora_inicio else None,
            'hora_fin': self.hora_fin.strftime('%H:%M:%S') if self.hora_fin else None,
            'duracion_minutos': self.duracion_minutos,
            'descripcion_motivo': self.descripcion_motivo
        }
        
class TipoMermaEnum(enum.Enum):
    Tapa_casquillo_operador = 'Tapa/casquillo operador'
    Tapa_casquillo_equipo = 'Tapa/casquillo equipo'
    Tapa_casquillo_muestreo = 'Tapa/casquillo muestreo'
    Botella_muestreo = 'Botella muestreo'

class Merma(db.Model):
    __tablename__ = 'mermas'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    tipo_merma = db.Column(SQLAlchemyEnum(TipoMermaEnum), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'reporte_id': self.reporte_id,
            'tipo_merma': self.tipo_merma,
            'cantidad': self.cantidad
        }

# Tabla de asociación para la relación Many-to-Many entre Reporte y User
reporte_personal = db.Table('reporte_personal',
    db.Column('reporte_id', db.Integer, db.ForeignKey('reportes_produccion.id'), primary_key=True),
    db.Column('usuario_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
)

class ControlCalidadProceso(db.Model):
    __tablename__ = 'controles_calidad_proceso'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    hora_medicion = db.Column(db.Time, nullable=False)
    olor = db.Column(db.String(20), default='OK')
    sabor = db.Column(db.String(20), default='OK')
    apariencia = db.Column(db.String(20), default='OK')
    ozono = db.Column(db.Boolean)
    lampara_uv = db.Column(db.Boolean)
    fugas = db.Column(db.String(20))
    rosca = db.Column(db.String(20))
    faldon = db.Column(db.String(20))
    inversion = db.Column(db.String(20))
    tq1 = db.Column(db.Numeric(5, 2))
    tq2 = db.Column(db.Numeric(5, 2))
    tq3 = db.Column(db.Numeric(5, 2))
    media = db.Column(db.Numeric(5, 2))
    presion = db.Column(db.Numeric(5, 2))
    temperatura = db.Column(db.Numeric(5, 2))
    vol_co2 = db.Column(db.Numeric(5, 2))
    saturador = db.Column(db.Numeric(5, 2))
    inspector_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    def to_dict(self):
        # Esta función convierte todos los campos a un diccionario. ¡Es larga!
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class InspeccionSelloLateral(db.Model):
    __tablename__ = 'inspecciones_sello_lateral'
    id = db.Column(db.Integer, primary_key=True)
    reporte_id = db.Column(db.Integer, db.ForeignKey('reportes_produccion.id'), nullable=False)
    hora_medicion = db.Column(db.Time, nullable=False)
    profundidad_superior_1 = db.Column(db.Numeric(5, 3))
    profundidad_superior_2 = db.Column(db.Numeric(5, 3))
    profundidad_superior_3 = db.Column(db.Numeric(5, 3))
    profundidad_superior_4 = db.Column(db.Numeric(5, 3))
    sello_lateral_1 = db.Column(db.Numeric(5, 3))
    sello_lateral_2 = db.Column(db.Numeric(5, 3))
    sello_lateral_3 = db.Column(db.Numeric(5, 3))
    sello_lateral_4 = db.Column(db.Numeric(5, 3))
    realizo_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    def to_dict(self):
        # Una forma más concisa de serializar
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}