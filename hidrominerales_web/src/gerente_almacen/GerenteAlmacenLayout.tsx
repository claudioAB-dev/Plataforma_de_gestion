import React, { useState } from "react";
import GerenteAlmacenSidebar from "./GerenteAlmacenSidebar";
import InventoryDashboard from "./views/InventoryDashboard";
import ReceptionRegistration from "./views/ReceptionRegistration";
import InventoryAdjustment from "./views/InventoryAdjustment";
import "./styles/GerenteAlmacen.css";

const GerenteAlmacenLayout: React.FC = () => {
  const [activeView, setActiveView] = useState("inventario");

  const renderActiveView = () => {
    switch (activeView) {
      case "inventario":
        return <InventoryDashboard />;
      case "recepcion":
        return <ReceptionRegistration />;
      case "ajuste":
        return <InventoryAdjustment />;
      default:
        return <InventoryDashboard />;
    }
  };

  return (
    <div className="ga-layout">
      <GerenteAlmacenSidebar
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <main className="ga-main-content">{renderActiveView()}</main>
    </div>
  );
};

export default GerenteAlmacenLayout;
