import React, { useState } from "react";
import GerenteProduccionSidebar from "./GerenteProduccionSidebar";
import ProductManagement from "./views/ProductManagement";
import LineasActivas from "./views/LineasActivas"; // Importar
import ReportesList from "./views/ReportesList"; // Importar
import "./styles/GerenteProduccion.css";

const GerenteProduccionLayout: React.FC = () => {
  // Estado para controlar la vista actual
  const [activeView, setActiveView] = useState("lineas-activas"); // Vista por defecto

  // Función para renderizar el componente de la vista activa
  const renderActiveView = () => {
    switch (activeView) {
      case "productos":
        return <ProductManagement />;
      case "lineas-activas":
        return <LineasActivas />;
      case "reportes":
        return <ReportesList />;
      default:
        return <LineasActivas />;
    }
  };

  return (
    <div className="gp-layout">
      <GerenteProduccionSidebar
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <main className="gp-main-content">{renderActiveView()}</main>
    </div>
  );
};

export default GerenteProduccionLayout;
