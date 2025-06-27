import React, { useState, useEffect } from "react";
import type {
  InventarioMateriaPrimaConsolidado,
  InventarioProductoTerminadoConsolidado,
  MovimientoInventario,
} from "../../types";
import "../../gerente_produccion/styles/Reportes.css";
import "../styles/GerenteAlmacen.css";

const BOTELLAS_POR_CHAROLA = 60;

const InventoryDashboard: React.FC = () => {
  const [invMP, setInvMP] = useState<InventarioMateriaPrimaConsolidado[]>([]);
  const [invPT, setInvPT] = useState<InventarioProductoTerminadoConsolidado[]>(
    []
  );
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [mpResponse, ptResponse, movResponse] = await Promise.all([
          fetch(
            "http://127.0.0.1:5001/api/inventario/materia_prima/consolidado"
          ),
          fetch(
            "http://127.0.0.1:5001/api/inventario/producto_terminado/consolidado"
          ),
          fetch("http://127.0.0.1:5001/api/inventario/movimientos/recientes"),
        ]);

        if (!mpResponse.ok || !ptResponse.ok || !movResponse.ok) {
          throw new Error("Error al obtener los datos del dashboard.");
        }

        setInvMP(await mpResponse.json());
        setInvPT(await ptResponse.json());
        setMovimientos(await movResponse.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTipoMovimiento = (tipo: string) => {
    return tipo.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading)
    return (
      <div className="loading-container">
        <h2>Cargando Dashboard...</h2>
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
        <h1>Dashboard de Inventario Global</h1>
      </div>

      {/* Sección de Movimientos Recientes */}
      <h3 style={{ marginTop: "2rem" }}>Últimos Movimientos de Inventario</h3>
      <div
        className="table-responsive"
        style={{ maxHeight: "300px", overflowY: "auto" }}
      >
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Insumo</th>
              <th>Tipo de Movimiento</th>
              <th>Cantidad</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id}>
                <td>{new Date(mov.timestamp).toLocaleString()}</td>
                <td>{mov.materia_prima_nombre}</td>
                <td>
                  <span className={`status-badge ${mov.tipo_movimiento}`}>
                    {formatTipoMovimiento(mov.tipo_movimiento)}
                  </span>
                </td>
                <td>{mov.cantidad.toLocaleString()}</td>
                <td>{mov.user_nombre || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablas Consolidadas */}
      <h3 style={{ marginTop: "2rem" }}>Resumen de Materia Prima</h3>
      <div className="table-responsive">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Nombre del Insumo</th>
              <th>SKU</th>
              <th>Stock Total</th>
              <th>Unidad de Medida</th>
            </tr>
          </thead>
          <tbody>
            {invMP.map((item) => (
              <tr key={item.sku}>
                <td>{item.nombre}</td>
                <td>{item.sku}</td>
                <td>{item.stock_total.toLocaleString()}</td>
                <td>{item.unidad_medida}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: "2rem" }}>Resumen de Producto Terminado</h3>
      <div className="table-responsive">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Nombre del Producto</th>
              <th>SKU</th>
              <th>Pallets Totales</th>
              <th>Charolas Totales</th>
              <th>Unidades Totales (Aprox.)</th>
            </tr>
          </thead>
          <tbody>
            {invPT.map((item) => (
              <tr key={item.sku}>
                <td>{item.nombre}</td>
                <td>{item.sku}</td>
                <td>{item.pallets_totales.toLocaleString()}</td>
                <td>{item.charolas_totales.toLocaleString()}</td>
                <td>
                  {(
                    item.charolas_totales * BOTELLAS_POR_CHAROLA
                  ).toLocaleString()}
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
