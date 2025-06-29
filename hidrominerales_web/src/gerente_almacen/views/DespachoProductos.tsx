// hidrominerales_web/src/gerente_almacen/views/DespachoProductos.tsx
import React, { useState, useEffect, useCallback } from "react";
import type { PalletTerminado } from "../../types";
import "../styles/GerenteAlmacen.css";
import "../../gerente_produccion/styles/Reportes.css";

// Extendemos la interfaz para incluir los campos que añadimos en el backend
interface PalletDisponible extends PalletTerminado {
  fecha_produccion: any;
  reporte: any;
  producto_nombre: string;
  lote: string;
}

const DespachoProductos: React.FC = () => {
  const [pallets, setPallets] = useState<PalletDisponible[]>([]);
  const [selectedPallets, setSelectedPallets] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchAvailablePallets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/inventario/producto_terminado/disponible"
      );
      if (!response.ok)
        throw new Error("Error al obtener los pallets disponibles.");
      setPallets(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailablePallets();
  }, [fetchAvailablePallets]);

  const handleSelectPallet = (palletId: number) => {
    setSelectedPallets((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(palletId)) {
        newSelected.delete(palletId);
      } else {
        newSelected.add(palletId);
      }
      return newSelected;
    });
  };

  const handleDispatchSelected = async () => {
    if (selectedPallets.size === 0) {
      alert("Por favor, seleccione al menos un pallet para despachar.");
      return;
    }

    if (
      !window.confirm(
        `¿Está seguro de que desea despachar ${selectedPallets.size} pallets? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setFeedback(null);
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/inventario/producto_terminado/despachar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pallet_ids: Array.from(selectedPallets) }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error en el despacho.");
      }

      setFeedback(data.message);
      setSelectedPallets(new Set()); // Limpiar selección
      fetchAvailablePallets(); // Refrescar la lista
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error inesperado en el despacho."
      );
    }
  };

  if (isLoading)
    return (
      <div className="loading-container">
        <h2>Cargando Pallets Disponibles...</h2>
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
        <h1>Despacho de Producto Terminado</h1>
        <button
          className="pm-create-btn"
          onClick={handleDispatchSelected}
          disabled={selectedPallets.size === 0}
        >
          Despachar ({selectedPallets.size})
        </button>
      </div>
      {feedback && (
        <div className="feedback-message success" style={{ margin: "1rem" }}>
          {feedback}
        </div>
      )}

      <div className="table-responsive">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Seleccionar</th>
              <th>Producto</th>
              <th>Lote</th>
              <th>N° Pallet</th>
              <th>Charolas</th>
              <th>Fecha Registro</th>
            </tr>
          </thead>
          <tbody>
            {pallets.map((pallet) => (
              <tr
                key={pallet.id}
                className={selectedPallets.has(pallet.id) ? "selected-row" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPallets.has(pallet.id)}
                    onChange={() => handleSelectPallet(pallet.id)}
                    style={{ cursor: "pointer", width: "20px", height: "20px" }}
                  />
                </td>
                <td>{pallet.producto_nombre}</td>
                <td>{pallet.lote}</td>
                <td>{pallet.numero_pallet}</td>
                <td>{pallet.cantidad_charolas}</td>
                <td>
                  {pallet.fecha_produccion
                    ? new Date(pallet.fecha_produccion).toLocaleDateString()
                    : "N/A"}{" "}
                  {pallet.hora_registro}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DespachoProductos;
