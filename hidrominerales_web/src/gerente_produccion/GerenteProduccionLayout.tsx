// src/gerente_produccion/GerenteProduccionLayout.tsx
import React from "react";
import GerenteProduccionSidebar from "./GerenteProduccionSidebar";
import ProductManagement from "./views/ProductManagement";
import "./styles/GerenteProduccion.css";

const GerenteProduccionLayout: React.FC = () => {
  // En el futuro, este estado controlará qué vista se muestra.
  // const [activeView, setActiveView] = useState('productos');

  return (
    <>
      <div className="gp-layout">
        <GerenteProduccionSidebar />
        <main className="gp-content">
          {/* Aquí se renderizaría la vista activa dinámicamente */}
          <ProductManagement />
        </main>
      </div>
    </>
  );
};

export default GerenteProduccionLayout;
