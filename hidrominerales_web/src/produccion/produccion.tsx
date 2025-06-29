// claudioab-dev/plataforma_de_gestion/Plataforma_de_gestion-81dcd2cb6692c1863a27d858ea554482df49edab/hidrominerales_web/src/produccion/produccion.tsx

import React, { useState } from "react";
import Sidebar from "./sidebar";
import Home from "./Placeholder/Home";
import CalidadView from "./Placeholder/Calidad";
import InsumosManagement from "./Placeholder/InsumosManagement"; // Importa el nuevo componente
import "./styles/produccion.css";

export type Seccion = "home" | "calidad" | "Insumos";

const ProduccionLayout: React.FC = () => {
  const [seccionActual, setSeccionActual] = useState<Seccion>("home");
  const [selectedLine, setSelectedLine] = useState<number>(1);

  const renderContent = () => {
    switch (seccionActual) {
      case "home":
        return <Home selectedLine={selectedLine} />;
      case "calidad":
        return <CalidadView selectedLine={selectedLine} />;
      case "Insumos":
        return <InsumosManagement selectedLine={selectedLine} />; // Reemplaza el placeholder

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
