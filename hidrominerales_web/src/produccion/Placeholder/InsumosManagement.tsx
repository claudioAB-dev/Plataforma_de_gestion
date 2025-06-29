// Crear nuevo archivo: hidrominerales_web/src/produccion/views/InsumosManagement.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import type { ReporteProduccion, InventarioMateriaPrima } from "../../types";
import RegisterConsumptionModal from "../components/RegisterConsumptionModal";
import "../styles/ProduccionDashboard.css";
import "../../gerente_produccion/styles/Reportes.css";

const InsumosManagement: React.FC<{ selectedLine: number }> = ({
  selectedLine,
}) => {
  const [activeReport, setActiveReport] = useState<ReporteProduccion | null>(
    null
  );
  const [availableLots, setAvailableLots] = useState<InventarioMateriaPrima[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<InventarioMateriaPrima | null>(
    null
  );
  const { user } = useAuth();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reportResponse = await fetch(
        `http://127.0.0.1:5001/api/reportes?linea=${selectedLine}&estado=En Proceso`
      );
      if (!reportResponse.ok)
        throw new Error("Error al buscar reporte activo.");

      const reports = (await reportResponse.json()) as ReporteProduccion[];
      const currentReport = reports.length > 0 ? reports[0] : null;
      setActiveReport(currentReport);

      if (currentReport && currentReport.cliente_id) {
        const lotsResponse = await fetch(
          `http://127.0.0.1:5001/api/inventario/materia_prima/disponible?cliente_id=${currentReport.cliente_id}`
        );
        if (!lotsResponse.ok)
          throw new Error("Error al cargar los lotes de insumos disponibles.");

        const lots = (await lotsResponse.json()) as InventarioMateriaPrima[];
        setAvailableLots(lots);
      } else {
        setAvailableLots([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Un error inesperado ocurrió."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedLine]);

  useEffect(() => {
    fetchAllData();
  }, [selectedLine, fetchAllData]);

  const handleOpenModal = (lot: InventarioMateriaPrima) => {
    setSelectedLot(lot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLot(null);
    setIsModalOpen(false);
  };

  const handleSaveConsumption = () => {
    handleCloseModal();
    fetchAllData();
  };

  if (loading) {
    return (
      <div className="loading-container">
        Verificando estado de la línea {selectedLine}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="reportes-list-container">
        <p className="error-message" style={{ margin: "1rem" }}>
          {error}
        </p>
      </div>
    );
  }

  if (!activeReport) {
    return (
      <div className="start-production-container">
        <h2>No hay producción activa en la Línea {selectedLine}</h2>
        <p>
          Inicie un reporte en la sección de "Producción" para poder registrar
          el consumo de insumos.
        </p>
      </div>
    );
  }

  return (
    <div className="reportes-list-container">
      {isModalOpen && selectedLot && activeReport && user && (
        <RegisterConsumptionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveConsumption}
          itemToConsume={selectedLot}
          reporteId={activeReport.id}
          userId={user.id}
        />
      )}

      <div className="dashboard-header" style={{ alignItems: "center" }}>
        <div>
          <h1>Consumo de Insumos - Línea {selectedLine}</h1>
          <p>
            <strong>Producto:</strong> {activeReport.producto?.nombre} |{" "}
            <strong>Lote:</strong> {activeReport.lote}
          </p>
        </div>
      </div>

      <div className="table-responsive" style={{ padding: "0 2rem 2rem" }}>
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Lote Proveedor</th>
              <th>Stock Disponible</th>
              <th>Ubicación</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {availableLots.length > 0 ? (
              availableLots.map((lote) => (
                <tr key={lote.id}>
                  <td>{lote.materia_prima.nombre}</td>
                  <td>{lote.lote_proveedor}</td>
                  <td>{`${lote.cantidad_actual.toLocaleString()} ${
                    lote.materia_prima.unidad_medida
                  }`}</td>
                  <td>{lote.ubicacion_codigo || "N/A"}</td>
                  <td>
                    <button
                      className="btn-action btn-merma"
                      style={{ margin: 0 }}
                      onClick={() => handleOpenModal(lote)}
                    >
                      Registrar Consumo
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No hay lotes de insumos disponibles para el cliente de este
                  producto. Verifique con Almacén.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InsumosManagement;
