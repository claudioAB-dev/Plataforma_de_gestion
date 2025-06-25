// hidrominerales_web/src/gerente_produccion/views/LineasActivas.tsx
import React, { useEffect, useState } from "react";
import type { ReporteProduccion } from "../../types";
import ProgressChart from "../../produccion/components/ProgressChart";
import "../styles/LineasActivas.css";

const BOTELLAS_POR_CHAROLA = 60;

const LineaActivaCard: React.FC<{ report: ReporteProduccion }> = ({
  report,
}) => {
  // Calcula el total de charolas y botellas producidas
  const totalCharolas = (report.pallets || []).reduce(
    (sum, p) => sum + p.cantidad_charolas,
    0
  );
  const botellasProducidas = totalCharolas * BOTELLAS_POR_CHAROLA;

  // Calcula el total de minutos de paro
  const totalMinutosParo = (report.paros || []).reduce(
    (sum, p) => sum + (p.duracion_minutos || 0),
    0
  );

  return (
    <div className="linea-card">
      <div className="card-header">
        <h3>Línea {report.linea}</h3>
        <span className="status-badge en-proceso">{report.estado}</span>
      </div>
      <div className="card-body">
        <p>
          <strong>Producto:</strong> {report.producto?.nombre}
        </p>
        <p>
          <strong>Lote:</strong> {report.lote}
        </p>
        <div className="metrics">
          <div className="metric-item">
            <span>Pallets</span>
            <strong>{report.pallets?.length || 0}</strong>
          </div>
          <div className="metric-item">
            <span>Tiempo Paro (min)</span>
            <strong>{totalMinutosParo}</strong>
          </div>
        </div>
        <div className="progress-chart-wrapper">
          <ProgressChart
            target={report.produccion_objetivo}
            progress={botellasProducidas}
          />
        </div>
        <p className="last-activity">
          Inició:{" "}
          {(() => {
            const fecha = report.fecha_produccion;
            const hora = report.hora_arranque;
            const fechaHora = `${fecha}T${hora}`;
            const dateObj = new Date(fechaHora);
            return dateObj.toLocaleString();
          })()}{" "}
        </p>
      </div>
    </div>
  );
};

const LineasActivas: React.FC = () => {
  const [activeReports, setActiveReports] = useState<ReporteProduccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchActiveReports = async () => {
      setLoading(true);
      try {
        // Se eliminó el header de autorización
        const response = await fetch(
          "http://127.0.0.1:5001/api/reportes?estado=En Proceso"
        );
        if (!response.ok) {
          throw new Error("Error al obtener los reportes activos");
        }
        const data: ReporteProduccion[] = await response.json();
        setActiveReports(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveReports();
    const interval = setInterval(fetchActiveReports, 30000); // Actualiza cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Cargando Líneas Activas...</h2>
      </div>
    );
  }

  return (
    <div className="lineas-activas-dashboard">
      <h1>Líneas de Producción Activas</h1>
      {activeReports.length > 0 ? (
        <div className="cards-container">
          {activeReports.map((report) => (
            <LineaActivaCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="start-production-container">
          <h2>No hay líneas de producción activas en este momento.</h2>
        </div>
      )}
    </div>
  );
};

export default LineasActivas;
