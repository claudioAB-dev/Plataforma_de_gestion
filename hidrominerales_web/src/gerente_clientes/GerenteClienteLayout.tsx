import React, { useState } from "react";
import GerenteClienteSidebar from "./GerenteClienteSidebar";
import ClientManagement from "./views/ClientManagement";
import RawMaterialManagement from "./views/RawMaterialManagement";
import InventoryDashboard from "./views/InventoryDashboard";
import "./styles/GerenteCliente.css";

const GerenteClienteLayout: React.FC = () => {
  const [activeView, setActiveView] = useState("clientes");

  const renderActiveView = () => {
    switch (activeView) {
      case "clientes":
        return <ClientManagement />;
      case "materias":
        return <RawMaterialManagement />;
      case "inventario":
        return <InventoryDashboard />;
      default:
        return <ClientManagement />;
    }
  };

  return (
    <div className="gc-layout">
      <GerenteClienteSidebar
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <main className="gc-main-content">{renderActiveView()}</main>
    </div>
  );
};

export default GerenteClienteLayout;
