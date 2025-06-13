import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

// Aseguramos que el elemento root exista antes de renderizar
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      {/* BrowserRouter habilita el ruteo en toda la app */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
} else {
  console.error("No se encontró el elemento con id 'root'");
}
