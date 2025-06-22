Plataforma de Gestión - Hidrominerales
Este repositorio contiene el código fuente para la Plataforma de Gestión de Hidrominerales, una aplicación web completa diseñada para supervisar y gestionar los procesos de producción de la planta. La plataforma se divide en un backend robusto basado en Flask y un frontend moderno y reactivo construido con React y TypeScript.

🌟 Características Principales
La plataforma ofrece una gama de funcionalidades adaptadas a diferentes roles dentro de la empresa:

Gestión de Autenticación y Roles:
Sistema de inicio de sesión seguro.
Acceso diferenciado basado en roles de usuario (Administrador, Gerente de Producción, Operador de Producción, Calidad, etc.).
Panel de Administración (/admin):
Gestión de Usuarios: Permite ver, crear, editar y eliminar usuarios del sistema.
Gestión de Roles: Interfaz para la futura administración de permisos y roles.
Panel del Gerente de Producción (/gerente-produccion):
Gestión de Productos: Permite crear nuevos productos y activar o desactivar los existentes en el sistema.
Módulo de Producción (/produccion):
Dashboard por Línea: Visualización en tiempo real del estado de cada una de las 5 líneas de producción.
Inicio de Reportes: Creación de nuevos reportes de producción, especificando turno, lote, producto y personal.
Seguimiento de Progreso: Gráfico de avance que compara la producción actual con la meta establecida.
Registro de Pallets: Modal para registrar pallets de producto terminado, calculando automáticamente el siguiente número de pallet.
Registro de Paros de Línea: Interfaz para documentar detenciones en la producción, especificando motivo, duración y hora.
Registro de Merma: Formulario detallado para registrar desperdicios de tapas y botellas por diferentes causas (operador, equipo, muestreo).
Módulo de Calidad (/calidad):
Formularios para el registro de controles de calidad durante el proceso de producción activa en una línea específica.
🛠️ Tecnologías Utilizadas
La plataforma está construida con un stack de tecnologías moderno y eficiente:

Backend (API)
Framework: Python con Flask.
ORM: Flask-SQLAlchemy para la interacción con la base de datos.
API: Creación de una API RESTful para la comunicación con el frontend.
CORS: Flask-Cors para permitir peticiones desde el cliente web.
Servidor: El backend se ejecuta sobre un servidor de desarrollo Werkzeug, iniciado con run.py.
Frontend (Web)
Librería: React 19 con TypeScript.
Bundler: Vite para un desarrollo y compilación ultra rápidos.
Routing: react-router-dom para la navegación y protección de rutas.
Estado Global: React Context API para la gestión de la autenticación del usuario (AuthContext).
Estilos: CSS plano con una arquitectura modular para los estilos de cada componente.
📂 Estructura del Proyecto
El proyecto es un monorepo con una clara separación entre el backend y el frontend:

plataforma_de_gestion/
├── hidrominarales_api/ # Contenedor del backend en Flask
│ ├── app/
│ │ ├── **init**.py
│ │ ├── app.py # Factory de la aplicación Flask
│ │ ├── models.py # Modelos de la base de datos (SQLAlchemy)
│ │ └── routes.py # Definición de las rutas de la API
│ ├── run.py # Script para iniciar el servidor de desarrollo
│ └── .env.example # (Sugerido) Ejemplo de variables de entorno
│
└── hidrominerales_web/ # Contenedor del frontend en React
├── public/
├── src/
│ ├── admin/ # Componentes y vistas para el rol de Administrador
│ ├── context/ # Contexto de autenticación global
│ ├── gerente_produccion/ # Componentes para el rol de Gerente de Producción
│ ├── global/ # Componentes globales (Navbar, Footer)
│ ├── login/ # Componente de la página de inicio de sesión
│ ├── produccion/ # Componentes y vistas para los roles de Producción/Calidad
│ ├── App.tsx # Componente raíz y configuración de rutas
│ ├── main.tsx # Punto de entrada de la aplicación React
│ └── index.css # Estilos globales
├── .gitignore
├── package.json # Dependencias y scripts del frontend
└── vite.config.ts # Configuración de Vite
🚀 Instalación y Puesta en Marcha
Sigue estos pasos para configurar y ejecutar el proyecto en un entorno de desarrollo local.

Pre-requisitos
Node.js (v18 o superior) y npm
Python (v3.8 o superior) y pip
Un gestor de bases de datos compatible con SQLAlchemy (ej. PostgreSQL, MySQL, SQLite).

1. Configuración del Backend (hidrominarales_api)
   Navega al directorio del backend:

Bash

cd hidrominarales_api
Crea y activa un entorno virtual:

Bash

python -m venv venv
source venv/bin/activate # En Windows: venv\Scripts\activate
Instala las dependencias de Python:
Nota: Se asume la existencia de un archivo requirements.txt que puedes generar con pip freeze > requirements.txt.

Bash

pip install Flask Flask-SQLAlchemy Flask-Cors python-dotenv Werkzeug
Configura las variables de entorno:
Crea un archivo .env en la raíz de hidrominarales_api/ y define la URI de tu base de datos:

DATABASE_URI="postgresql://user:password@host:port/database"
Crea las tablas en la base de datos:
Inicia un shell de Python, importa db y create_all:

Python

from app.app import create_app
from app.models import db
app = create_app()
with app.app_context():
db.create_all()
Inicia el servidor del backend:
El servidor se ejecutará en http://127.0.0.1:5001.

Bash

python run.py 2. Configuración del Frontend (hidrominarales_web)
Abre una nueva terminal y navega al directorio del frontend:

Bash

cd hidrominarales_web
Instala las dependencias de Node.js:

Bash

npm install
Inicia el servidor de desarrollo del frontend:
La aplicación estará disponible en http://localhost:5173 (o el puerto que Vite asigne).

Bash

npm run dev
¡Y listo! Ahora puedes abrir tu navegador, acceder a la URL del frontend y empezar a interactuar con la Plataforma de Gestión de Hidrominerales.
