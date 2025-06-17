import React from "react";
import type { Seccion } from "./produccion";
import "./styles/sidebar-extra.css"; // Un nuevo archivo para los estilos del selector

interface SidebarProps {
  seccionActual: Seccion;
  setSeccionActual: (seccion: Seccion) => void;
  selectedLine: number;
  setSelectedLine: (line: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  seccionActual,
  setSeccionActual,
  selectedLine,
  setSelectedLine,
}) => {
  const navItems = [
    { id: "home", label: "Producción", icon: "🏭" },
    { id: "calidad", label: "Calidad", icon: "✔️" },
    { id: "reportes", label: "Reportes Producción", icon: "📊" },
    { id: "reportes2", label: "Reportes Calidad", icon: "📈" },
  ];

  const lineas = [1, 2, 3, 4, 5];

  return (
    <aside className="sidebar">
      {/* Navegación principal de secciones */}
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${
                  seccionActual === item.id ? "active" : ""
                }`}
                onClick={() => setSeccionActual(item.id as Seccion)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Selector de Líneas de Producción */}
      <div className="line-selector">
        <h4 className="line-selector-title">Línea de Producción</h4>
        <div className="line-selector-buttons">
          {lineas.map((line) => (
            <button
              key={line}
              className={`line-btn ${selectedLine === line ? "active" : ""}`}
              onClick={() => setSelectedLine(line)}
            >
              {line}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
