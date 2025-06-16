import React, { useState, useEffect } from "react";
import "../Placeholder/placeholder_style/ProduccionView.css"; // Reutilizamos estilos de tabla

// Tipos para los datos de la API
interface ReporteCalidad {
  id: number;
  fecha: string;
  reporte_produccion_id: number;
  lote_evaluado: string;
  aprobado: boolean;
  observaciones: string;
}

const CalidadView: React.FC = () => {
  const [reportes, setReportes] = useState<ReporteCalidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReportesCalidad = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/reportes/calidad"
      );
      const data = await response.json();
      setReportes(data);
    } catch (error) {
      console.error("Error al obtener reportes de calidad:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportesCalidad();
  }, []);

  if (isLoading) {
    return <div>Cargando reportes de calidad...</div>;
  }

  return (
    <div className="produccion-view-container">
      <div className="header-actions">
        <h1>Reportes de Calidad</h1>
        <button
          onClick={() =>
            alert("Modal para añadir reporte de calidad (próximamente).")
          }
          className="btn-add"
        >
          + Registrar Reporte
        </button>
      </div>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Reporte</th>
              <th>Fecha</th>
              <th>ID Reporte Prod.</th>
              <th>Lote Evaluado</th>
              <th>Aprobado</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte) => (
              <tr key={reporte.id}>
                <td>{reporte.id}</td>
                <td>{new Date(reporte.fecha).toLocaleDateString()}</td>
                <td>{reporte.reporte_produccion_id}</td>
                <td>{reporte.lote_evaluado}</td>
                <td>
                  <span
                    className={`status ${
                      reporte.aprobado ? "aprobado" : "rechazado"
                    }`}
                  >
                    {reporte.aprobado ? "Sí" : "No"}
                  </span>
                </td>
                <td>{reporte.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalidadView;
