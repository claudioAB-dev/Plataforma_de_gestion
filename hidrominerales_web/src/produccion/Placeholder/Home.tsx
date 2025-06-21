import React, { useState, useEffect, useCallback } from "react";
import StartProductionModal from "../components/StartProductionModal";
import RegisterPalletModal from "../components/RegisterPalletModal";
import LineStoppageModal from "../components/LineStoppageModal";
import RegisterMermaModal from "../components/RegisterMermaModal";
import type { MermaData as MermaFormData } from "../components/RegisterMermaModal";
import ProgressChart from "../components/ProgressChart";
import "../styles/ProduccionDashboard.css";

// Interfaces de datos del Frontend
interface Producto {
  id: number;
  nombre: string;
}

interface Pallet {
  cantidad_charolas: number;
}

interface ReporteProduccion {
  id: number;
  lote: string;
  produccion_objetivo: number;
  producto: Producto;
  pallets: Pallet[];
  hora_arranque: string;
  estado: "En Proceso" | "Terminado" | "Cancelado";
}

const BOTELLAS_POR_CHAROLA = 60; // Este valor debería venir idealmente de la API junto con el producto

const Home: React.FC<{ selectedLine: number }> = ({ selectedLine }) => {
  const [activeReport, setActiveReport] = useState<ReporteProduccion | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showPalletModal, setShowPalletModal] = useState(false);
  const [showStoppageModal, setShowStoppageModal] = useState(false);
  const [showMermaModal, setShowMermaModal] = useState(false);

  const fetchActiveReportForLine = useCallback(async (line: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/reportes?linea=${line}&estado=En Proceso`
      );
      if (!response.ok) throw new Error("Error al buscar reporte activo");

      const reports = (await response.json()) as ReporteProduccion[];
      setActiveReport(reports.length > 0 ? reports[0] : null);
    } catch (error) {
      console.error(error);
      setActiveReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveReportForLine(selectedLine);
  }, [selectedLine, fetchActiveReportForLine]);

  const handleModalSave = () => {
    fetchActiveReportForLine(selectedLine);
  };

  const handleFinishProduction = async () => {
    if (!activeReport) return;
    if (
      window.confirm("¿Estás seguro de que deseas finalizar esta producción?")
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
        if (!response.ok) throw new Error("Error al finalizar la producción.");
        setActiveReport(null); // Limpiamos el reporte activo para refrescar la vista a 'Inactiva'
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error desconocido");
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        Verificando estado de la línea {selectedLine}...
      </div>
    );
  }

  // --- Renderizado Condicional ---
  if (!activeReport) {
    return (
      <>
        <StartProductionModal
          isOpen={showStartModal}
          onClose={() => setShowStartModal(false)}
          onSave={handleModalSave}
          lineaProduccion={selectedLine}
        />
        <div className="start-production-container">
          <h2>Línea {selectedLine} - Inactiva</h2>
          <p>
            No hay una producción activa en esta línea. Inicia un nuevo reporte
            para comenzar.
          </p>
          <button
            className="btn-start-production"
            onClick={() => setShowStartModal(true)}
          >
            Iniciar Reporte de Producción
          </button>
        </div>
      </>
    );
  }

  const totalCharolas = activeReport.pallets.reduce(
    (sum, p) => sum + p.cantidad_charolas,
    0
  );
  const botellasProducidas = totalCharolas * BOTELLAS_POR_CHAROLA;

  return (
    <>
      <RegisterPalletModal
        isOpen={showPalletModal}
        onClose={() => setShowPalletModal(false)}
        onSave={handleModalSave}
        reporteId={activeReport.id}
        nextPalletNumber={activeReport.pallets.length + 1}
      />
      <LineStoppageModal
        isOpen={showStoppageModal}
        onClose={() => setShowStoppageModal(false)}
        onSave={handleModalSave}
        reporteId={activeReport.id}
      />
      <RegisterMermaModal
        isOpen={showMermaModal}
        onClose={() => setShowMermaModal(false)}
        onSave={handleModalSave}
        reporteId={activeReport.id}
        currentMerma={{
          tapa_operador: 0,
          tapa_equipo: 0,
          tapa_muestreo: 0,
          botella_muestreo: 0,
          merma_botella: 0,
        }} // Simplificado, una mejora sería fetchear la merma actual
      />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1>Reporte de Producción: Línea {selectedLine}</h1>
            <p>
              <strong>Producto:</strong> {activeReport.producto.nombre} |{" "}
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
              target={activeReport.produccion_objetivo}
            />
          </div>
          <div className="dashboard-card">
            <h3>Producto Terminado</h3>
            <p>
              Registra un pallet de producto que ha sido completado y emplayado.
            </p>
            <button
              className="btn-action"
              onClick={() => setShowPalletModal(true)}
            >
              Registrar Pallet
            </button>
          </div>
          <div className="dashboard-card">
            <h3>Paros de Línea</h3>
            <p>
              Registra cualquier detención en la línea, ya sea programada o
              inesperada.
            </p>
            <button
              className="btn-action btn-stop"
              onClick={() => setShowStoppageModal(true)}
            >
              Registrar Paro
            </button>
          </div>
          <div className="dashboard-card">
            <h3>Merma</h3>
            <p>Registra o actualiza la cantidad de material de desperdicio.</p>
            <button
              className="btn-action btn-merma"
              onClick={() => setShowMermaModal(true)}
            >
              Actualizar Merma
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
