import React, { useState, useEffect, useCallback } from "react";
import StartProductionModal from "../components/StartProductionModal";
import RegisterPalletModal from "../components/RegisterPalletModal";
import LineStoppageModal from "../components/LineStoppageModal";
import RegisterMermaModal from "../components/RegisterMermaModal";
import ProgressChart from "../components/ProgressChart";
import "../styles/ProduccionDashboard.css";
import type { ReporteProduccion } from "../../types";

const BOTELLAS_POR_CHAROLA = 60;

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
        setActiveReport(null);
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

  // Cálculos de producción
  const totalCharolas = (activeReport.pallets || []).reduce(
    (sum, p) => sum + p.cantidad_charolas,
    0
  );
  const botellasProducidas = totalCharolas * BOTELLAS_POR_CHAROLA;
  const totalMinutosParo = (activeReport.paros || []).reduce(
    (sum, p) => sum + p.duracion_minutos,
    0
  );
  const totalMerma = (activeReport.mermas || []).reduce(
    (sum, m) => sum + m.cantidad,
    0
  );
  const totalPallets = (activeReport.pallets || []).length;

  return (
    <>
      {/* Se pasa `currentMermas` al modal para que conozca el estado actual */}
      <RegisterMermaModal
        isOpen={showMermaModal}
        onClose={() => setShowMermaModal(false)}
        onSave={handleModalSave}
        reporteId={activeReport.id}
        currentMermas={activeReport.mermas || []}
      />

      {/* Otros modales no cambian */}
      <RegisterPalletModal
        isOpen={showPalletModal}
        onClose={() => setShowPalletModal(false)}
        onSave={handleModalSave}
        reporteId={activeReport.id}
        nextPalletNumber={totalPallets + 1}
      />
      <LineStoppageModal
        isOpen={showStoppageModal}
        onClose={() => setShowStoppageModal(false)}
        onSave={handleModalSave}
        reporteId={activeReport.id}
      />

      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1>Reporte de Producción: Línea {selectedLine}</h1>
            <p>
              <strong>Producto:</strong> {activeReport.producto?.nombre} |{" "}
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

        <div className="dashboard-grid">
          {/* Tarjeta de Progreso (sin cambios) */}
          <div className="dashboard-card progress-card main-progress">
            <h3>Progreso del Turno</h3>
            <ProgressChart
              progress={botellasProducidas}
              target={activeReport.produccion_objetivo}
            />
          </div>

          {/* Tarjeta de Pallets (sin cambios) */}
          <div className="dashboard-card summary-card">
            <h3>Historial de Pallets</h3>
            <div className="details-list">
              {(activeReport.pallets || []).length > 0 ? (
                (activeReport.pallets || []).map((pallet) => (
                  <div key={pallet.id} className="details-list-item">
                    <span>
                      Pallet #{pallet.numero_pallet} ({pallet.cantidad_charolas}{" "}
                      ch.)
                    </span>
                    <span>{pallet.hora_registro}</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No hay pallets registrados.</p>
              )}
            </div>
            <button
              className="btn-action"
              onClick={() => setShowPalletModal(true)}
            >
              + Registrar Pallet
            </button>
          </div>

          {/* Tarjeta de Paros (sin cambios) */}
          <div className="dashboard-card summary-card">
            <h3>Paros de Línea</h3>
            <div className="summary-value">{totalMinutosParo}</div>
            <p>Minutos de paro acumulados</p>
            <button
              className="btn-action btn-stop"
              onClick={() => setShowStoppageModal(true)}
            >
              + Registrar Paro
            </button>
          </div>

          {/* --- INICIO DE LA MODIFICACIÓN: Tarjeta de Merma Mejorada --- */}
          <div className="dashboard-card summary-card">
            <h3>Detalle de Merma</h3>
            <div className="merma-display">
              {(activeReport.mermas || []).length > 0 ? (
                (activeReport.mermas || []).map((merma) => (
                  <div key={merma.id} className="merma-item">
                    <span>{merma.tipo_merma}</span>
                    <span>{merma.cantidad.toLocaleString()} uds.</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No hay merma registrada.</p>
              )}
            </div>
            <div className="summary-total">
              Total: {totalMerma.toLocaleString()} uds.
            </div>
            <button
              className="btn-action btn-merma"
              onClick={() => setShowMermaModal(true)}
            >
              +/- Ajustar Merma
            </button>
          </div>
          {/* --- FIN DE LA MODIFICACIÓN --- */}
        </div>
      </div>
    </>
  );
};

export default Home;
