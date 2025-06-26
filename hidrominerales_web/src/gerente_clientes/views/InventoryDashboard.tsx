import React, { useState, useEffect, useCallback } from "react";
import type {
  Cliente,
  InventarioMateriaPrima,
  PalletTerminado,
} from "../../types";
// Asumimos que también existe un tipo PalletTerminado similar
import "../../gerente_produccion/styles/Reportes.css";

const InventoryDashboard: React.FC = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");

  const [inventoryMP, setInventoryMP] = useState<InventarioMateriaPrima[]>([]);
  const [inventoryPT, setInventoryPT] = useState<PalletTerminado[]>([]);

  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga la lista de clientes para el selector
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/clientes`
        );
        if (!response.ok)
          throw new Error("No se pudieron cargar los clientes.");
        const data: Cliente[] = await response.json();
        setClients(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  // Carga los inventarios cuando se selecciona un cliente
  const fetchInventories = useCallback(async (clientId: string) => {
    if (!clientId) return;

    setIsLoadingInventory(true);
    setError(null);
    setInventoryMP([]);
    setInventoryPT([]);

    try {
      // Hacemos las dos llamadas a la API de forma concurrente
      const [mpResponse, ptResponse] = await Promise.all([
        fetch(
          `${
            import.meta.env.VITE_API_URL
          }/inventario/materia_prima?cliente_id=${clientId}`
        ),
        fetch(
          `${
            import.meta.env.VITE_API_URL
          }/inventario/producto_terminado?cliente_id=${clientId}`
        ),
      ]);

      if (!mpResponse.ok)
        throw new Error("No se pudo cargar el inventario de materia prima.");
      if (!ptResponse.ok)
        throw new Error(
          "No se pudo cargar el inventario de producto terminado."
        );

      const mpData: InventarioMateriaPrima[] = await mpResponse.json();
      const ptData: PalletTerminado[] = await ptResponse.json();

      setInventoryMP(mpData);
      setInventoryPT(ptData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingInventory(false);
    }
  }, []);

  useEffect(() => {
    fetchInventories(selectedClient);
  }, [selectedClient, fetchInventories]);

  return (
    <div className="reportes-list-container">
      <div className="pm-header">
        <h1>Dashboard de Inventario</h1>
      </div>

      <div className="filters-bar">
        <label htmlFor="client-selector">
          Seleccione un Cliente para ver su Inventario:
        </label>
        <select
          id="client-selector"
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          disabled={isLoadingClients}
        >
          <option value="" disabled>
            {isLoadingClients
              ? "Cargando clientes..."
              : "-- Elija un Cliente --"}
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="error-message" style={{ margin: "1rem" }}>
          Error: {error}
        </p>
      )}

      {selectedClient &&
        (isLoadingInventory ? (
          <p style={{ textAlign: "center", padding: "2rem" }}>
            Cargando inventario...
          </p>
        ) : (
          <>
            <h3 className="inventory-subtitle">Inventario de Materia Prima</h3>
            <div className="table-responsive">
              <table className="reportes-table">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Lote Proveedor</th>
                    <th>Cantidad</th>
                    <th>Ubicación</th>
                    <th>Caducidad</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryMP.length > 0 ? (
                    inventoryMP.map((item) => (
                      <tr key={item.id}>
                        <td>{item.materia_prima_nombre}</td>
                        <td>{item.lote_proveedor}</td>
                        <td>{`${item.cantidad_actual} ${item.unidad_medida}`}</td>
                        <td>{item.ubicacion_codigo || "N/A"}</td>
                        <td>
                          {item.fecha_caducidad
                            ? new Date(
                                item.fecha_caducidad
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        No hay inventario de materia prima para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="inventory-subtitle">
              Inventario de Producto Terminado
            </h3>
            <div className="table-responsive">
              <table className="reportes-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Lote Producción</th>
                    <th>Cantidad (Cajas)</th>
                    <th>Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryPT.length > 0 ? (
                    inventoryPT.map((item) => (
                      <tr key={item.id}>
                        <td>{item.producto_nombre}</td>
                        <td>{item.lote_produccion}</td>
                        <td>{item.cantidad_cajas}</td>
                        <td>{item.ubicacion_codigo || "N/A"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        No hay inventario de producto terminado para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ))}
    </div>
  );
};

export default InventoryDashboard;
