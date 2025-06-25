import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import UserManagement from "./views/UserManagement";
import RoleManagement from "./views/RoleManagement";
import "../produccion/styles/produccion.css"; // Reutilizamos los estilos del layout
export type AdminView = "users" | "roles";

const AdminLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>("users");

  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <UserManagement />;
      case "roles":
        return <RoleManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="page-layout">
      <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">{renderContent()}</main>
    </div>
  );
};

export default AdminLayout;
