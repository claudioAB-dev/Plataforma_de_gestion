import React from "react";
import "./styles/GerenteCliente.css";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const GerenteClienteSidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
}) => {
  return (
    <aside className="gc-sidebar">
      <h2>Gestión de Clientes</h2>
      <nav>
        <ul>
          <li
            className={activeView === "clientes" ? "active" : ""}
            onClick={() => setActiveView("clientes")}
          >
            Clientes
          </li>
          <li
            className={activeView === "materias" ? "active" : ""}
            onClick={() => setActiveView("materias")}
          >
            Catálogo de Insumos
          </li>
          <li
            className={activeView === "inventario" ? "active" : ""}
            onClick={() => setActiveView("inventario")}
          >
            Dashboard de Inventario
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default GerenteClienteSidebar;
