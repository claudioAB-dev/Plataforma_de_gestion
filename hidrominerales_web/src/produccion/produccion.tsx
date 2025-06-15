import React, { useState } from "react";
import Sidebar from "./sidebar";

import ProductionControl from "./Placeholder/Home";
import ResumenVentas from "./Placeholder/Calidad";
import ReportesVentas from "./Placeholder/Reportes2";

import "./styles/produccion.css";

export type VentaView = "resumen" | "produccion" | "reportes";

const VentasLayout: React.FC = () => {
  const [activeView, setActiveView] = useState<VentaView>("resumen");

  const productionData = {
    initialOee: 85,
    orderId: "OP-2025-06-15-001",
    productName: "Agua Mineral 600ml",
    productDetails: ["Lote: A25B4", "Línea: EM001"],
    palletOptions: ["Pallet CHEP", "Pallet Blanco", "Pallet PECO"],
  };

  const renderContent = () => {
    switch (activeView) {
      case "resumen":
        return <ResumenVentas />;
      case "produccion":
        return <ProductionControl {...productionData} />;
      case "reportes":
        return <ReportesVentas />;
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
