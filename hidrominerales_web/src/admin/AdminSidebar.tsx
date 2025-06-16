import React from "react";
import type { AdminView } from "./AdminLayout";

interface SidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
}) => {
  const navItems = [
    { id: "users", label: "Gestión de Usuarios", icon: "👥" },
    { id: "roles", label: "Gestión de Roles", icon: "🔑" },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeView === item.id ? "active" : ""}`}
                onClick={() => setActiveView(item.id as AdminView)}
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

export default AdminSidebar;
