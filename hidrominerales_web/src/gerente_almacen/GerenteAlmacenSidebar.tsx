// claudioab-dev/plataforma_de_gestion/Plataforma_de_gestion-81dcd2cb6692c1863a27d858ea554482df49edab/hidrominerales_web/src/gerente_almacen/GerenteAlmacenSidebar.tsx
import React from "react";
import "./styles/GerenteAlmacen.css";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const GerenteAlmacenSidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
}) => {
  return (
    <aside className="ga-sidebar">
      <h2>Gestión de Almacén</h2>
      <nav>
        <ul>
          <li
            className={activeView === "inventario" ? "active" : ""}
            onClick={() => setActiveView("inventario")}
          >
            Dashboard de Inventario
          </li>
          <li
            className={activeView === "recepcion" ? "active" : ""}
            onClick={() => setActiveView("recepcion")}
          >
            Registrar Recepción
          </li>
          <li
            className={activeView === "ajuste" ? "active" : ""}
            onClick={() => setActiveView("ajuste")}
          >
            Ajuste de Inventario
          </li>
          <li
            className={activeView === "despacho" ? "active" : ""}
            onClick={() => setActiveView("despacho")}
          >
            Despacho de Productos
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default GerenteAlmacenSidebar;
