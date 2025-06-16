import React, { useState } from "react";
import Sidebar from "./sidebar";

import ProductionControl from "./Placeholder/Home";
import ResumenVentas from "./Placeholder/Calidad";
//import ReportesVentas from "./Placeholder/Reportes2";

import "./styles/produccion.css";

export type VentaView = "produccion" | "calidad" | "reportes";

const VentasLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<VentaView>("produccion");

  const renderContent = () => {
    switch (activeView) {
      case "produccion":
        return <ProductionControl />;
      case "calidad":
        return <ProductionControl />;
      case "reportes":
        return <ProductionControl />;
      default:
        return <ResumenVentas />;
    }
  };

  return (
    <div className="page-layout">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">{renderContent()}</main>
    </div>
  );
};

export default VentasLayout;
