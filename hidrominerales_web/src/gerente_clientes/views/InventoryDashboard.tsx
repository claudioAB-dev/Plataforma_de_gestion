// claudioab-dev/plataforma_de_gestion/Plataforma_de_gestion-3e46265e7fafc836dd130dae17e6176f5643f542/hidrominerales_web/src/gerente_clientes/views/InventoryDashboard.tsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type {
  Cliente,
  InventarioMateriaPrima,
  PalletTerminado,
} from "../../types";
// Importamos los nuevos estilos
import "../styles/InventoryDashboard.css";
// Reutilizamos la tabla base
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

    try {
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
    if (selectedClient) {
      fetchInventories(selectedClient);
    }
  }, [selectedClient, fetchInventories]);

  // NUEVO: Hook useMemo para calcular las tarjetas de resumen eficientemente
  const summaryStats = useMemo(() => {
    const totalPallets = inventoryPT.length;
    const totalCharolas = inventoryPT.reduce(
      (sum, item) => sum + (item.cantidad_charolas || 0),
      0
    );
    const uniqueRawMaterials = new Set(
      inventoryMP.map((item) => item.materia_prima_nombre)
    ).size;
    return { totalPallets, totalCharolas, uniqueRawMaterials };
  }, [inventoryMP, inventoryPT]);

  // NUEVO: Función para determinar el estado de un lote y aplicar una clase CSS
  const getLotStatus = (item: InventarioMateriaPrima): string => {
    if (item.fecha_caducidad) {
      const BORDER_DAYS = 15;
      const expiryDate = new Date(item.fecha_caducidad);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "expired";
      if (diffDays <= BORDER_DAYS) return "expiring-soon";
    }
    // Suponiendo que 'stock_minimo_alerta' está en materia_prima
    if (
      item.cantidad_actual <= (item.materia_prima?.stock_minimo_alerta || 0)
    ) {
      return "low-stock";
    }
    return "";
  };

  return (
    <div className="inventory-dashboard-container">
      <div className="inventory-header">
        <h1>Dashboard de Inventario por Cliente</h1>
        <div className="client-selector-wrapper">
          <select
            id="client-selector"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={isLoadingClients}
          >
            <option value="" disabled>
              {isLoadingClients ? "Cargando..." : "📂 Elija un Cliente"}
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="inventory-error">Error: {error}</div>}

      {!selectedClient ? (
        <div className="inventory-prompt">
          <span className="prompt-icon">☝️</span>
          <h2>Seleccione un cliente</h2>
          <p>
            Elija un cliente del menú superior para visualizar su inventario.
          </p>
        </div>
      ) : isLoadingInventory ? (
        <div className="inventory-loading">
          <div className="spinner"></div>
          <p>Cargando datos del inventario...</p>
        </div>
      ) : (
        <>
          {/* NUEVO: Tarjetas de resumen */}
          <div className="summary-cards-grid">
            <div className="summary-card">
              <span className="card-icon">📦</span>
              <div className="card-value">
                {summaryStats.uniqueRawMaterials}
              </div>
              <div className="card-label">Insumos Diferentes</div>
            </div>
            <div className="summary-card">
              <span className="card-icon">🏭</span>
              <div className="card-value">{summaryStats.totalPallets}</div>
              <div className="card-label">Pallets Prod. Terminado</div>
            </div>
            <div className="summary-card">
              <span className="card-icon">📋</span>
              <div className="card-value">
                {summaryStats.totalCharolas.toLocaleString()}
              </div>
              <div className="card-label">Charolas Totales</div>
            </div>
          </div>

          {/* Tablas con mejoras visuales */}
          <div className="inventory-section">
            <h3>Materia Prima</h3>
            <div className="table-responsive">
              <table className="reportes-table">
                {/* ... */}
                <tbody>
                  {inventoryMP.length > 0 ? (
                    inventoryMP.map((item) => (
                      <tr key={item.id} className={getLotStatus(item)}>
                        <td>{item.materia_prima_nombre}</td>
                        <td>{item.lote_proveedor}</td>
                        <td>{`${item.cantidad_actual.toLocaleString()} ${
                          item.unidad_medida
                        }`}</td>
                        <td>{item.ubicacion_codigo || "N/A"}</td>
                        <td>
                          {item.fecha_caducidad
                            ? new Date(item.fecha_caducidad).toLocaleDateString(
                                "es-MX",
                                { timeZone: "UTC" }
                              )
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
          </div>

          <div className="inventory-section">
            <h3>Producto Terminado</h3>
            <div className="table-responsive">
              <table className="reportes-table">
                {/* ... */}
                <tbody>
                  {inventoryPT.length > 0 ? (
                    inventoryPT.map((item) => (
                      <tr key={item.id}>
                        <td>{`Pallet #${item.numero_pallet}`}</td>
                        <td>
                          {item.producto_nombre ||
                            `Reporte #${item.reporte_id}`}
                        </td>
                        <td>{item.hora_registro}</td>
                        <td>{item.cantidad_charolas}</td>
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
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryDashboard;
