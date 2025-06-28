// src/home/HomePage.tsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./styles/HomePage.css";

// Interfaz para definir cada enlace de navegación
interface NavLink {
  path: string;
  label: string;
  description: string;
  icon: string;
  allowedRoles: number[];
}

const allLinks: NavLink[] = [
  {
    path: "/admin",
    label: "Administración",
    description: "Gestionar usuarios y roles del sistema.",
    icon: "👥",
    allowedRoles: [1, 2],
  },
  {
    path: "/gerente-produccion",
    label: "Gerencia de Producción",
    description: "Ver líneas activas y gestionar productos.",
    icon: "📈",
    allowedRoles: [1, 2, 4],
  },
  {
    path: "/produccion",
    label: "Operación de Línea",
    description: "Registrar producción, calidad, paros y mermas.",
    icon: "🏭",
    allowedRoles: [1, 2, 4, 5],
  },
  {
    path: "/gerente-clientes",
    label: "Gestión de Clientes",
    description: "Administrar clientes y su inventario.",
    icon: "💼",
    allowedRoles: [1, 2, 3, 8],
  },
  {
    path: "/gerente-almacen",
    label: "Gestión de Almacén",
    description: "Controlar inventario, recepciones y ajustes.",
    icon: "📦",
    allowedRoles: [1, 2, 6],
  },
];

const HomePage: React.FC = () => {
  const { user } = useAuth();

  // Filtrar los enlaces basados en el rol del usuario actual
  const accessibleLinks = user
    ? allLinks.filter((link) => link.allowedRoles.includes(user.rol_id))
    : [];

  return (
    <div className="home-container">
      <header className="welcome-header">
        <h1>¡Bienvenido, {user?.nombre}!</h1>
        <p>
          Tu rol es: <strong>{user?.rol_nombre}</strong>. Selecciona un módulo
          para comenzar.
        </p>
      </header>

      {accessibleLinks.length > 0 ? (
        <div className="dashboard-grid">
          {accessibleLinks.map((link) => (
            <Link
              to={link.path}
              key={link.path}
              className="dashboard-card-link"
            >
              <div className="dashboard-card">
                <div className="card-icon">{link.icon}</div>
                <div className="card-content">
                  <h2 className="card-title">{link.label}</h2>
                  <p className="card-description">{link.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No tienes módulos asignados. Contacta al administrador.</p>
      )}
    </div>
  );
};

export default HomePage;
