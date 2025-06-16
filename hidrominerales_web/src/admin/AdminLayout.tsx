import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import UserManagement from "./views/UserManagement";
import "../produccion/styles/produccion.css"; // Reutilizamos los estilos del layout

export type AdminView = "users" | "roles";

const AdminLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>("users");

  const renderContent = () => {
    switch (activeView) {
      case "users":
        return <UserManagement />;
      case "roles":
        // Aquí podrías crear y renderizar un componente para gestionar roles
        return (
          <div>
            <h1>Gestión de Roles</h1>
            <p>Próximamente...</p>
          </div>
        );
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
