// src/gerente_produccion/GerenteProduccionSidebar.tsx
import React from "react";
import "./styles/GerenteProduccion.css";

// Por ahora la interfaz de props está vacía, pero se prepara para el futuro.
interface GerenteProduccionSidebarProps {
  // setActiveView: (view: string) => void;
  // activeView: string;
}

const GerenteProduccionSidebar: React.FC<
  GerenteProduccionSidebarProps
> = () => {
  return (
    <div className="gp-sidebar">
      <h3>Menú</h3>
      <ul>
        {/* La clase 'active' será dinámica en el futuro cuando haya más vistas */}
        <li className="active">Gestión de Productos</li>
        <li style={{ color: "#6c757d", cursor: "not-allowed" }}>
          Gestión de Inventario (Próximamente)
        </li>
        <li style={{ color: "#6c757d", cursor: "not-allowed" }}>
          Calendario de Producción (Próximamente)
        </li>
        <li style={{ color: "#6c757d", cursor: "not-allowed" }}>
          Reporte de Personal (Próximamente)
        </li>
      </ul>
    </div>
  );
};

export default GerenteProduccionSidebar;
