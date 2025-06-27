import React, { useState, useEffect, useCallback } from "react";
import type { InventarioMateriaPrima } from "../../types";
import AdjustmentModal from "../components/AdjustmentModal";
import "../styles/GerenteAlmacen.css";
import "../../gerente_produccion/styles/Reportes.css";

const InventoryAdjustment: React.FC = () => {
  const [lotes, setLotes] = useState<InventarioMateriaPrima[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<InventarioMateriaPrima | null>(null);

  const fetchLotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/inventario/materia_prima/lotes"
      );
      if (!response.ok)
        throw new Error("Error al obtener los lotes del inventario.");
      setLotes(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLotes();
  }, [fetchLotes]);

  const handleOpenModal = (item: InventarioMateriaPrima) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModalAndRefresh = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    fetchLotes();
  };

  if (isLoading)
    return (
      <div className="loading-container">
        <h2>Cargando Lotes de Inventario...</h2>
      </div>
    );
  if (error)
    return (
      <div className="reportes-list-container">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );

  return (
    <div className="reportes-list-container">
      <div className="ga-header">
        <h1>Ajuste de Inventario de Materia Prima</h1>
      </div>
      <p style={{ textAlign: "center", margin: "-1rem 0 2rem" }}>
        Seleccione un lote para corregir su cantidad en el sistema.
      </p>

      <div className="table-responsive">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Lote Proveedor</th>
              <th>Stock Actual</th>
              <th>Ubicación</th>
              <th>Caducidad</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((lote) => (
              <tr key={lote.id}>
                <td>{lote.materia_prima_nombre}</td>
                <td>{lote.lote_proveedor}</td>
                <td>{lote.cantidad_actual.toLocaleString()}</td>
                <td>{lote.ubicacion_codigo || "N/A"}</td>
                <td>
                  {lote.fecha_caducidad
                    ? new Date(lote.fecha_caducidad).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  <button
                    className="btn-small btn-edit"
                    onClick={() => handleOpenModal(lote)}
                  >
                    Ajustar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedItem && (
        <AdjustmentModal
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCloseModalAndRefresh}
        />
      )}
    </div>
  );
};

export default InventoryAdjustment;
