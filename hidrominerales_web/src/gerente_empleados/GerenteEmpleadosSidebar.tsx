import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./styles/GerenteEmpleadosLayout.css"; // Reutilizamos estilos para el layout

const GerenteEmpleadosSidebar: React.FC = () => {
  const location = useLocation();

  // Helper para determinar si la ruta está activa
  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <aside className="admin-sidebar">
      <nav>
        <ul>
          <li
            className={
              isActive("/gerente-empleados/solicitudes") ? "active" : ""
            }
          >
            <Link to="/gerente-empleados/solicitudes">
              Gestión de Solicitudes
            </Link>
          </li>
          <li
            className={isActive("/gerente-empleados/anuncios") ? "active" : ""}
          >
            <Link to="/gerente-empleados/anuncios">Gestión de Anuncios</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default GerenteEmpleadosSidebar;
