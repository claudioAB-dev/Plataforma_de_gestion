import React, { useState } from "react";
import Sidebar from "./sidebar";
import "./styles/produccion.css";

// Importa las nuevas vistas funcionales
import ProduccionView from "./Placeholder/Home";
import CalidadView from "./Placeholder/Calidad";

// Importa los placeholders que aún no se han implementado
import ReportesGen from "./Placeholder/Reportes_gen";
import Reportes2 from "./Placeholder/Reportes2";

export type Seccion = "home" | "calidad" | "reportes" | "reportes2";

interface SidebarProps {
  seccionActual: Seccion;
  setSeccionActual: React.Dispatch<React.SetStateAction<Seccion>>;
}

const VentasLayout: React.FC = () => {
  const [seccionActual, setSeccionActual] = useState<Seccion>("home");

  const renderContent = () => {
    switch (seccionActual) {
      case "home":
        return <ProduccionView />; // Vista de Producción funcional
      case "calidad":
        return <CalidadView />; // Vista de Calidad funcional
      case "reportes":
        return <ReportesGen />; // Placeholder
      case "reportes2":
        return <Reportes2 />; // Placeholder
      default:
        return <ProduccionView />;
    }
  };

  return (
    <div className="page-layout">
      <Sidebar
        seccionActual={seccionActual}
        setSeccionActual={setSeccionActual}
      />
      <main className="main-content">{renderContent()}</main>
    </div>
  );
};

export default VentasLayout;
