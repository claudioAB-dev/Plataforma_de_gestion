import React from "react";
import type { VentaView } from "./produccion";

interface SidebarProps {
  activeView: VentaView;
  setActiveView: (view: VentaView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: "produccion", label: "Producción", icon: "🔧" },
    { id: "calidad", label: "Calidad", icon: "🥼" },
    { id: "reportes", label: "Reportes", icon: "📄" },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeView === item.id ? "active" : ""}`}
                onClick={() => setActiveView(item.id as VentaView)}
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
