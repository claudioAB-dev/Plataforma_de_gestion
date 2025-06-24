// hidrominerales_web/src/gerente_produccion/views/ReportesList.tsx
import React, { useEffect, useState } from "react";
import type { ReporteProduccion } from "../../types";
import { useNavigate } from "react-router-dom";
import "../styles/Reportes.css";

const ReportesList: React.FC = () => {
  const [reports, setReports] = useState<ReporteProduccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Se eliminó el header de autorización
        const response = await fetch("http://127.0.0.1:5001/api/reportes");
        if (!response.ok) throw new Error("Error al obtener los reportes");
        const data: ReporteProduccion[] = await response.json();
        setReports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleRowClick = (reportId: number) => {
    navigate(`/gerente-produccion/reportes/${reportId}`);
  };

  if (loading)
    return (
      <div className="loading-container">
        <h2>Cargando Reportes...</h2>
      </div>
    );

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
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} onClick={() => handleRowClick(report.id)}>
                <td>{report.id}</td>
                <td>{report.linea}</td>
                <td>{report.producto?.nombre}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesList;
