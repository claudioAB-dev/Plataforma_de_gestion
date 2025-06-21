import React, { useState } from "react";
import Sidebar from "./sidebar";
import Home from "./Placeholder/Home";
import CalidadView from "./Placeholder/Calidad";
import ReportesGen from "./Placeholder/Reportes_gen";
import Reportes2 from "./Placeholder/Reportes2";
import "./styles/produccion.css";

export type Seccion = "home" | "calidad" | "reportes" | "reportes2";

const ProduccionLayout: React.FC = () => {
  const [seccionActual, setSeccionActual] = useState<Seccion>("home");
  const [selectedLine, setSelectedLine] = useState<number>(1);

  const renderContent = () => {
    switch (seccionActual) {
      case "home":
        return <Home selectedLine={selectedLine} />;
      case "calidad":
        return <CalidadView selectedLine={selectedLine} />;
      case "reportes":
        return <ReportesGen />;
      case "reportes2":
        return <Reportes2 />;
      default:
        return <Home selectedLine={selectedLine} />;
    }
  };

  return (
    <div className="page-layout">
      <Sidebar
        seccionActual={seccionActual}
        setSeccionActual={setSeccionActual}
        selectedLine={selectedLine}
        setSelectedLine={setSelectedLine}
      />
      <main className="main-content">{renderContent()}</main>
    </div>
  );
};

export default ProduccionLayout;
