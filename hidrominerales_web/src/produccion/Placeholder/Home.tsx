import React, { useState, useEffect, useCallback } from "react";
import StartProductionModal from "../components/StartProductionModal";
import RegisterPalletModal from "../components/RegisterPalletModal";
import LineStoppageModal from "../components/LineStoppageModal";
import RegisterMermaModal, {
  type MermaData,
} from "../components/RegisterMermaModal";
import "../styles/ProduccionDashboard.css";
import ProgressChart from "../components/ProgressChart";

// Asumimos un valor constante, idealmente vendría del producto en la API
const BOTELLAS_POR_CHAROLA = 60;

interface ReporteProduccion {
  id: number;
  lote: string;
  produccion_objetivo: number;
  producto: { nombre: string };
  pallets: any[];
  paros: any[];
  merma: MermaData; // Usamos el tipo exportado
  estado: string;
  hora_arranque: string;
  operador_engargolado: { nombre: string };
  responsable_linea: { nombre: string };
}

// Nota: El componente ahora se llama Home, como en tu estructura original.
const Home: React.FC<{ selectedLine: number }> = ({ selectedLine }) => {
  const [activeReport, setActiveReport] = useState<ReporteProduccion | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  // --- Estados de los modales (ESTO FALTABA) ---
  const [showStartModal, setShowStartModal] = useState(false);
  const [showPalletModal, setShowPalletModal] = useState(false);
  const [showStoppageModal, setShowStoppageModal] = useState(false);
  const [showMermaModal, setShowMermaModal] = useState(false);

  const fetchActiveReportForLine = useCallback(async (line: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/reportes?linea=${line}&estado=En Proceso`
      );
      if (!response.ok) throw new Error("Error al buscar reporte activo");
      const reports = await response.json();
      setActiveReport(reports.length > 0 ? reports[0] : null);
    } catch (error) {
      console.error(error);
      setActiveReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchActiveReportForLine(selectedLine);
  }, [selectedLine, fetchActiveReportForLine]);

  useEffect(() => {
    if (activeReport) {
      const intervalId = setInterval(() => {
        console.log(`Polling para línea ${selectedLine}...`);
        fetchActiveReportForLine(selectedLine);
      }, 120000); // 2 minutos
      return () => clearInterval(intervalId);
    }
  }, [activeReport, selectedLine, fetchActiveReportForLine]);

  const handleFinishProduction = async () => {
    if (!activeReport) return;
    if (
      window.confirm("¿Estás seguro de que deseas finalizar la producción?")
    ) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5001/api/reportes/${activeReport.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "Terminado" }),
          }
        );
        if (!response.ok) throw new Error("Error al finalizar la producción");
        setActiveReport(null);
      } catch (error) {
        console.error(error);
        alert("Hubo un error al finalizar la producción.");
      }
    }
  };

  const refreshReportData = () => {
    fetchActiveReportForLine(selectedLine);
  };

  // --- Cálculo de Progreso ---
  const totalCharolas =
    activeReport?.pallets.reduce((sum, p) => sum + p.cantidad_charolas, 0) || 0;
  const botellasProducidas = totalCharolas * BOTELLAS_POR_CHAROLA;

  if (loading) {
    return (
      <div className="loading-container">
        Cargando información de la línea {selectedLine}...
      </div>
    );
  }

  return (
    <>
      <StartProductionModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onSave={refreshReportData}
        lineaProduccion={selectedLine} // Prop corregida
      />
      <RegisterPalletModal
        isOpen={showPalletModal}
        onClose={() => setShowPalletModal(false)}
        onSave={refreshReportData}
        reporteId={activeReport?.id} // Prop corregida
        nextPalletNumber={(activeReport?.pallets.length || 0) + 1}
      />
      <LineStoppageModal
        isOpen={showStoppageModal}
        onClose={() => setShowStoppageModal(false)}
        onSave={refreshReportData}
        reporteId={activeReport?.id}
      />
      {activeReport && (
        <RegisterMermaModal
          isOpen={showMermaModal}
          onClose={() => setShowMermaModal(false)}
          onSave={refreshReportData}
          currentMerma={activeReport.merma}
          reporteId={activeReport.id}
        />
      )}

      {!activeReport ? (
        <div className="start-production-container">
          <h2>Línea {selectedLine} - Inactiva</h2>
          <p>No hay una producción activa en esta línea.</p>
          <button
            className="btn-start-production"
            onClick={() => setShowStartModal(true)}
          >
            Iniciar Reporte de Producción
          </button>
        </div>
      ) : (
        <div className="dashboard-container">
          <header className="dashboard-header">
            <div>
              <h1>Reporte Activo: Línea {selectedLine}</h1>
              <p>
                <strong>Producto:</strong>{" "}
                {activeReport.producto?.nombre || "N/A"} |{" "}
                <strong>Lote:</strong> {activeReport.lote}
              </p>
              <p className="subtitle">
                <strong>Hora Inicio:</strong> {activeReport.hora_arranque}
              </p>
            </div>
            <button
              className="btn-finish-production"
              onClick={handleFinishProduction}
            >
              Finalizar Producción
            </button>
          </header>

          <div className="dashboard-grid dashboard-grid-with-progress">
            <div className="dashboard-card progress-card">
              <h3>Progreso del Turno</h3>
              <ProgressChart
                progress={botellasProducidas}
                target={activeReport.produccion_objetivo || 0}
              />
            </div>

            {/* Resto de las tarjetas (Pallets, Paros, Merma) */}
            <div className="dashboard-card">
              <h3>Producto Terminado</h3>
              <button
                className="btn-action"
                onClick={() => setShowPalletModal(true)}
              >
                Registrar Pallet
              </button>
            </div>
            <div className="dashboard-card">
              <h3>Paros de Línea</h3>
              <button
                className="btn-action btn-stop"
                onClick={() => setShowStoppageModal(true)}
              >
                Registrar Paro
              </button>
            </div>
            <div className="dashboard-card">
              <h3>Merma</h3>
              <button
                className="btn-action btn-merma"
                onClick={() => setShowMermaModal(true)}
              >
                Actualizar Merma
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
