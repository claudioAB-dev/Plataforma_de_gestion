import React, { useEffect, useState, useCallback } from "react";
import type { ReporteProduccion } from "../../types";
import { useNavigate } from "react-router-dom";
import "../styles/Reportes.css";

const ReportesList: React.FC = () => {
  const [reports, setReports] = useState<ReporteProduccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/reportes");
      if (!response.ok) {
        throw new Error("Error al obtener los reportes");
      }
      const data: ReporteProduccion[] = await response.json();
      setReports(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Un error inesperado ocurrió."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleRowClick = (reportId: number) => {
    navigate(`/gerente-produccion/reportes/${reportId}`);
  };

  const handleDelete = async (reportId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Evita que el clic se propague al <tr>
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este reporte? Esta acción no se puede deshacer."
      )
    ) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5001/api/reportes/${reportId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Error al eliminar el reporte.");
        }
        // Actualiza el estado para remover el reporte de la lista
        setReports((prevReports) =>
          prevReports.filter((report) => report.id !== reportId)
        );
      } catch (err) {
        alert(
          err instanceof Error ? err.message : "Error al contactar al servidor."
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Cargando Reportes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reportes-list-container">
        <h1>Error</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="reportes-list-container">
      <h1>Historial de Reportes de Producción</h1>
      <div className="table-responsive">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Línea</th>
              <th>Producto</th>
              <th>Fecha Inicio</th>
              <th>Lote</th>
              <th>Turno</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} onClick={() => handleRowClick(report.id)}>
                <td>{report.id}</td>
                <td>{report.linea}</td>
                <td>{report.producto?.nombre ?? "N/A"}</td>
                <td>
                  {new Date(report.fecha_produccion).toLocaleDateString()}
                </td>
                <td>{report.lote}</td>
                <td>{report.turno}</td>
                <td>
                  <span
                    className={`status-pill ${report.estado
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {report.estado}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-delete-report"
                    onClick={(e) => handleDelete(report.id, e)}
                  >
                    Eliminar
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

export default ReportesList;
