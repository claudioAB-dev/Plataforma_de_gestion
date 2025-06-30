import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import GerenteEmpleadosSidebar from "./GerenteEmpleadosSidebar";
import GestionSolicitudes from "./views/GestionSolicitudes";
import GestionAnuncios from "./views/GestionAnuncios";
import "./styles/GerenteEmpleadosLayout.css"; // Reutilizamos estilos para el layout

const GerenteEmpleadosLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <GerenteEmpleadosSidebar />
      <main className="admin-main-content">
        <Routes>
          {/* Rutas internas del módulo */}
          <Route path="solicitudes" element={<GestionSolicitudes />} />
          <Route path="anuncios" element={<GestionAnuncios />} />

          {/* Ruta por defecto: redirige a la vista de solicitudes */}
          <Route index element={<Navigate to="solicitudes" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default GerenteEmpleadosLayout;
