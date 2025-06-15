from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

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