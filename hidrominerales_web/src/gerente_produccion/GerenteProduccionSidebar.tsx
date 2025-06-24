// hidrominerales_web/src/gerente_produccion/GerenteProduccionSidebar.tsx
import React from "react";
import "./styles/GerenteProduccion.css";

// Props para indicar la vista activa y permitir el cambio
interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const GerenteProduccionSidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
}) => {
  return (
    <aside className="gp-sidebar">
      <h2>Gerencia</h2>
      <nav>
        <ul>
          <li
            className={activeView === "productos" ? "active" : ""}
            onClick={() => setActiveView("productos")}
          >
            Gestión de Productos
          </li>
          <li
            className={activeView === "lineas-activas" ? "active" : ""}
            onClick={() => setActiveView("lineas-activas")}
          >
            Líneas Activas
          </li>
          <li
            className={activeView === "reportes" ? "active" : ""}
            onClick={() => setActiveView("reportes")}
          >
            Historial de Reportes
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default GerenteProduccionSidebar;
