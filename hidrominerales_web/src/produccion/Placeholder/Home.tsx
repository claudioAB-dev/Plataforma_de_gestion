import React, { useState, useEffect } from "react";
import "../styles/ProduccionDashboard.css"; // Un nuevo CSS para este componente

// Simulación de una llamada a la API para ver si una línea tiene un reporte activo
const fetchActiveReportForLine = async (line: number): Promise<any | null> => {
  console.log(`Buscando reporte activo para la línea ${line}...`);
  // Lógica de ejemplo: la línea 2 tiene un reporte activo, las demás no.
  if (line === 2) {
    return {
      id: 7,
      producto_nombre: "Felix Peticote 355 ml",
      lote: "CPREFDIC 26 L160.25",
      hora_arranque: "12:13",
      operador: "Angel",
    };
  }
  return null;
};

interface HomeProps {
  selectedLine: number;
}

const Home: React.FC<HomeProps> = ({ selectedLine }) => {
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchActiveReportForLine(selectedLine)
      .then((report) => {
        setActiveReport(report);
      })
      .finally(() => setIsLoading(false));
  }, [selectedLine]); // Se ejecuta cada vez que cambia la línea seleccionada

  const handleStartProduction = () => {
    // Aquí se abriría el modal para iniciar producción que creamos antes
    alert(
      `Iniciando producción en la línea ${selectedLine}. Se abriría un modal.`
    );
    // Simulación: creamos un reporte activo después de "iniciar"
    setActiveReport({
      id: Math.floor(Math.random() * 100),
      producto_nombre: "Nuevo Producto",
      lote: "LOTE-NUEVO-123",
      hora_arranque: new Date().toLocaleTimeString(),
      operador: "Usuario Actual",
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        Cargando datos para la línea {selectedLine}...
      </div>
    );
  }

  // Si no hay reporte activo, mostramos el botón para iniciar
  if (!activeReport) {
    return (
      <div className="start-production-container">
        <h2>Línea {selectedLine} - Inactiva</h2>
        <p>No hay una producción activa en esta línea.</p>
        <button
          className="btn-start-production"
          onClick={handleStartProduction}
        >
          Iniciar Reporte de Producción
        </button>
      </div>
    );
  }

  // Si hay un reporte activo, mostramos el dashboard
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Reporte Activo: Línea {selectedLine}</h1>
          <p>
            <strong>Producto:</strong> {activeReport.producto_nombre} |
            <strong> Lote:</strong> {activeReport.lote} |
            <strong> Operador:</strong> {activeReport.operador}
          </p>
        </div>
        <button className="btn-finish-production">Finalizar Producción</button>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Producto Terminado</h3>
          <p>Registra los pallets conforme se completan.</p>
          <button className="btn-action">Registrar Pallet</button>
        </div>

        <div className="dashboard-card">
          <h3>Paros de Línea</h3>
          <p>Inicia o finaliza un paro de la línea de producción.</p>
          <button className="btn-action btn-stop">Iniciar Paro</button>
        </div>

        <div className="dashboard-card">
          <h3>Merma</h3>
          <p>Registra la merma generada por el operador o equipo.</p>
          <button className="btn-action btn-merma">Registrar Merma</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
