import React, { useState, useEffect } from "react";
// Asegúrate que las rutas de importación sean correctas para tu proyecto
// Asegúrate que las rutas de importación sean correctas para tu proyecto
import type { InventarioMateriaPrima } from "../../types";
import AdjustmentModal from "../components/AdjustmentModal";

const InventoryDashboard: React.FC = () => {
  const [pallets, setPallets] = useState<InventarioMateriaPrima[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPallet, setSelectedPallet] =
    useState<InventarioMateriaPrima | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/inventario/materia_prima/lotes"
      );
      if (!response.ok) {
        throw new Error("Error al cargar el inventario de materia prima.");
      }
      const data: InventarioMateriaPrima[] = await response.json();
      setPallets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (pallet: InventarioMateriaPrima) => {
    setSelectedPallet(pallet);
    setIsModalOpen(true);
  };

  // Esta función ahora sirve tanto para cerrar como para ejecutar en caso de éxito,
  // ya que cierra el modal y recarga los datos.
  const handleCloseAndRefresh = () => {
    setIsModalOpen(false);
    setSelectedPallet(null);
    fetchData();
  };

  const summary = pallets.reduce((acc, pallet) => {
    const name = pallet.materia_prima_nombre;
    if (!acc[name]) {
      acc[name] = {
        count: 0,
        totalQuantity: 0,
        unit: pallet.materia_prima.unidad_medida,
      };
    }
    acc[name].count++;
    acc[name].totalQuantity += pallet.cantidad_actual;
    return acc;
  }, {} as Record<string, { count: number; totalQuantity: number; unit: string }>);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Cargando Inventario de Pallets...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reportes-list-container">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="reportes-list-container">
      {/* La renderización del modal ahora se controla con 'isModalOpen'.
              Cuando 'isModalOpen' es true, el modal se monta en el DOM.
            */}
      {isModalOpen && selectedPallet && (
        <AdjustmentModal
          // --- INICIO DE LA CORRECCIÓN ---
          item={selectedPallet} // 1. Se usa 'item' en lugar de 'lote'.
          onClose={handleCloseAndRefresh} // 2. Se pasa la función para el botón 'Cancelar' o 'X'.
          onSuccess={handleCloseAndRefresh} // 3. Se pasa la misma función para cuando el ajuste es exitoso.
          //    Ya no se pasa 'isOpen'.
          // --- FIN DE LA CORRECCIÓN ---
        />
      )}

      <div className="ga-header">
        <h1>Dashboard de Inventario por Pallets</h1>
      </div>

      <div
        className="summary-cards-container"
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          margin: "1rem 0",
        }}
      >
        {Object.keys(summary).length > 0 ? (
          Object.entries(summary).map(([name, data]) => (
            <div
              key={name}
              className="summary-card"
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                borderRadius: "8px",
                minWidth: "200px",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>{name}</h3>
              <p>
                <strong>{data.count}</strong> Pallets en inventario
              </p>
              <p>
                Stock Total:{" "}
                <strong>
                  {data.totalQuantity.toLocaleString()} {data.unit}
                </strong>
              </p>
            </div>
          ))
        ) : (
          <p>No hay inventario para mostrar.</p>
        )}
      </div>

      <h3 style={{ marginTop: "2rem" }}>Detalle de Pallets en Almacén</h3>
      <div className="table-responsive">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>ID Pallet</th>
              <th>Materia Prima</th>
              <th>Lote Proveedor</th>
              <th>Cantidad en Pallet</th>
              <th>Ubicación</th>
              <th>Fecha Recepción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pallets.map((pallet) => (
              <tr key={pallet.id}>
                <td>{pallet.id}</td>
                <td>{pallet.materia_prima_nombre}</td>
                <td>{pallet.lote_proveedor}</td>
                <td>
                  <strong>{`${pallet.cantidad_actual.toLocaleString()} ${
                    pallet.materia_prima.unidad_medida
                  }`}</strong>
                </td>
                <td>{pallet.ubicacion_codigo || "N/A"}</td>
                <td>{new Date(pallet.fecha_recepcion).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-action btn-merma"
                    onClick={() => handleOpenModal(pallet)}
                  >
                    Ajustar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryDashboard;
