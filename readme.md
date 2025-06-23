# 💧 Plataforma de Gestión - Hidrominerales

Este repositorio contiene el código fuente para la **Plataforma de Gestión de Hidrominerales**, una aplicación web integral diseñada para supervisar y gestionar los procesos de producción de la planta.

Está dividida en un backend robusto basado en **Flask** y un frontend moderno construido con **React** y **TypeScript**.

---

## 🌟 Características Principales

La plataforma ofrece una gama de funcionalidades adaptadas a diferentes roles dentro de la empresa:

### 🔐 Gestión de Autenticación y Roles

- Sistema de inicio de sesión seguro.
- Acceso diferenciado basado en roles de usuario (Administrador, Gerente de Producción, Operador de Producción, Calidad, etc.).

### 🛠️ Panel de Administración (`/admin`)

- **Gestión de Usuarios**: Ver, crear, editar y eliminar usuarios del sistema.
- **Gestión de Roles**: Interfaz para la futura administración de permisos y roles.

### 📈 Panel del Gerente de Producción (`/gerente-produccion`)

- **Gestión de Productos**: Crear y activar/desactivar productos.

### ⚙️ Módulo de Producción (`/produccion`)

- **Dashboard por Línea**: Visualización en tiempo real de cada línea de producción.
- **Inicio de Reportes**: Crear nuevos reportes con turno, lote, producto y personal.
- **Seguimiento de Progreso**: Gráfico comparativo de producción vs meta.
- **Registro de Pallets**: Cálculo automático del siguiente número de pallet.
- **Registro de Paros de Línea**: Documentar detenciones con motivo, duración y hora.
- **Registro de Merma**: Formulario para registrar desperdicios por causa.

### 🧪 Módulo de Calidad (`/calidad`)

- Formularios para registrar controles de calidad durante el proceso activo.

---

## 🛠️ Tecnologías Utilizadas

### 🔙 Backend (API)

- **Framework**: Python con Flask
- **ORM**: Flask-SQLAlchemy
- **API RESTful**
- **CORS**: Flask-Cors
- **Servidor**: Werkzeug (usando `run.py`)

### 🌐 Frontend (Web)

- **Librería**: React 19 + TypeScript
- **Bundler**: Vite
- **Routing**: `react-router-dom`
- **Estado Global**: React Context API
- **Estilos**: CSS modular

---

## 📂 Estructura del Proyecto

```plaintext
plataforma_de_gestion/
├── hidrominerales_api/         # Backend en Flask
│   ├── app/
│   │   ├── __init__.py
│   │   ├── app.py              # Factory Flask
│   │   ├── models.py           # Modelos SQLAlchemy
│   │   └── routes.py           # Rutas de la API
│   ├── run.py                  # Servidor de desarrollo
│   └── .env.example            # Ejemplo de variables de entorno
│
└── hidrominerales_web/         # Frontend en React
    ├── public/
    ├── src/
    │   ├── admin/
    │   ├── context/
    │   ├── gerente_produccion/
    │   ├── global/
    │   ├── login/
    │   ├── produccion/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── .gitignore
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Instalación y Puesta en Marcha

### 📋 Pre-requisitos

- Node.js (v18+)
- Python (v3.8+)
- pip
- Base de datos compatible con SQLAlchemy (PostgreSQL, MySQL o SQLite)

---

### ⚙️ 1. Configuración del Backend (`hidrominerales_api`)

```bash
cd hidrominerales_api
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

Instala dependencias:

```bash
pip install Flask Flask-SQLAlchemy Flask-Cors python-dotenv Werkzeug
```

Configura variables de entorno (`.env`):

```env
DATABASE_URI="postgresql://user:password@host:port/database"
```

Crea las tablas en la base de datos:

```python
from app.app import create_app
from app.models import db

app = create_app()
with app.app_context():
    db.create_all()
```

Inicia el servidor:

```bash
python run.py
```

El backend estará disponible en: [http://127.0.0.1:5001](http://127.0.0.1:5001)

---

### 🌐 2. Configuración del Frontend (`hidrominerales_web`)

```bash
cd hidrominerales_web
npm install
npm run dev
```

La aplicación se ejecutará en: [http://localhost:5173](http://localhost:5173)

---

## ✅ ¡Listo para Usar!

Abre tu navegador y accede a la URL del frontend para comenzar a usar la Plataforma de Gestión de Hidrominerales.

---

## 📬 Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar alguna funcionalidad o corregir errores, ¡no dudes en hacer un pull request o abrir un issue!
