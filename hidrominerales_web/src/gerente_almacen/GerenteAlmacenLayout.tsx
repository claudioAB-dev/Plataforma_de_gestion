// claudioab-dev/plataforma_de_gestion/Plataforma_de_gestion-81dcd2cb6692c1863a27d858ea554482df49edab/hidrominerales_web/src/gerente_almacen/GerenteAlmacenLayout.tsx
import React, { useState } from "react";
import GerenteAlmacenSidebar from "./GerenteAlmacenSidebar";
import InventoryDashboard from "./views/InventoryDashboard";
import ReceptionRegistration from "./views/ReceptionRegistration";
import InventoryAdjustment from "./views/InventoryAdjustment";
import "./styles/GerenteAlmacen.css";
// --- INICIO DE LA MODIFICACIÓN ---
import DespachoProductos from "./views/DespachoProductos"; // Importamos la nueva vista
// --- FIN DE LA MODIFICACIÓN ---

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
      // --- INICIO DE LA MODIFICACIÓN ---
      case "despacho":
        return <DespachoProductos />;
      // --- FIN DE LA MODIFICACIÓN ---
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
