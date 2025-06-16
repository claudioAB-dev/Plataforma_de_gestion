import React from "react";
import type { Seccion } from "./produccion";

interface SidebarProps {
  seccionActual: Seccion;
  setSeccionActual: (seccion: Seccion) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  seccionActual,
  setSeccionActual,
}) => {
  const navItems = [
    { id: "home", label: "Producción", icon: "🏭" },
    { id: "calidad", label: "Calidad", icon: "✔️" },
    { id: "reportes", label: "Reportes Producción", icon: "📊" },
    { id: "reportes2", label: "Reportes Calidad", icon: "📈" },
  ];

  return (
    <aside className="sidebar">
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
    </aside>
  );
};

export default Sidebar;
