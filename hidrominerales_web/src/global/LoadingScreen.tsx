// hidrominerales_web/src/global/components/LoadingScreen.tsx

import React from "react";
import "./styles/LoadingScreen.css";

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <p className="loading-text">Cargando...</p>
    </div>
  );
};

export default LoadingScreen;
