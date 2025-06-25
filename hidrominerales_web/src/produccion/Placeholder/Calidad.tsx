import React, { useState, useEffect, useCallback } from "react";
import "../styles/ProduccionDashboard.css"; // Reutilizamos estilos del dashboard
import "../styles/CalidadDashboard.css"; // Estilos específicos para calidad
import type { ReporteProduccion } from "../../types";

const QualityControlForm: React.FC<{ reporteId: number }> = ({ reporteId }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En el futuro, aquí se haría un POST a un endpoint como:
    // /api/reportes/{reporteId}/controles_calidad
    alert(
      `Guardando medición de calidad para el reporte ID: ${reporteId}. (Endpoint no implementado aún)`
    );
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form className="quality-form" onSubmit={handleSubmit}>
      <h4>Características Organolépticas</h4>
      <div className="form-grid-3">
        <div className="form-group">
          <label>Olor OK</label>
          <input type="checkbox" />
        </div>
        <div className="form-group">
          <label>Sabor OK</label>
          <input type="checkbox" />
        </div>
        <div className="form-group">
          <label>Apariencia OK</label>
          <input type="checkbox" />
        </div>
      </div>

      <h4>Mediciones de Proceso</h4>
      <div className="form-grid-4">
        <div className="form-group">
          <label>TQ 1</label>
          <input type="number" step="0.01" />
        </div>
        <div className="form-group">
          <label>TQ 2</label>
          <input type="number" step="0.01" />
        </div>
        <div className="form-group">
          <label>TQ 3</label>
          <input type="number" step="0.01" />
        </div>
        <div className="form-group">
          <label>TQ 4</label>
          <input type="number" step="0.01" />
        </div>
        <div className="form-group">
          <label>Presión</label>
          <input type="number" step="0.01" />
        </div>
        <div className="form-group">
          <label>Temp °C</label>
          <input type="number" step="0.01" />
        </div>
        <div className="form-group">
          <label>Vol. CO2</label>
          <input type="number" step="0.01" />
        </div>
        <div className="form-group">
          <label>Saturador</label>
          <input type="number" step="0.01" />
        </div>
      </div>

      <button type="submit" className="btn-action btn-save-quality">
        Guardar Medición
      </button>
    </form>
  );
};

interface CalidadViewProps {
  selectedLine: number;
}

const CalidadView: React.FC<CalidadViewProps> = ({ selectedLine }) => {
  const [activeReport, setActiveReport] = useState<ReporteProduccion | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Hook para obtener el reporte activo, similar a Home.tsx
  const fetchActiveReportForLine = useCallback(async (line: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/reportes?linea=${line}&estado=En Proceso`
      );
      if (!response.ok) {
        throw new Error("Error al buscar el reporte de producción activo.");
      }
      const reports: ReporteProduccion[] = await response.json();
      // La API devuelve el más reciente primero, así que tomamos el índice 0
      setActiveReport(reports.length > 0 ? reports[0] : null);
    } catch (error) {
      console.error(error);
      setActiveReport(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Volver a cargar los datos cuando cambia la línea seleccionada
  useEffect(() => {
    fetchActiveReportForLine(selectedLine);
  }, [selectedLine, fetchActiveReportForLine]);

  if (isLoading) {
    return (
      <div className="loading-container">
        Verificando estado de la línea {selectedLine}...
      </div>
    );
  }

  if (!activeReport) {
    return (
      <div className="start-production-container">
        <h2>No hay producción activa en la Línea {selectedLine}</h2>
        <p>
          Inicie un reporte en la sección de "Producción" para poder registrar
          controles de calidad.
        </p>
      </div>
    );
  }

  // Vista principal cuando hay un reporte activo
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Control de Calidad: Línea {selectedLine}</h1>
          <p>
            <strong>Producto:</strong> {activeReport.producto?.nombre} |
            <strong> Lote:</strong> {activeReport.lote}
          </p>
        </div>
      </header>

      <div className="dashboard-grid-quality">
        <div className="dashboard-card">
          <h3>Control de Producto en Proceso</h3>
          <p>
            Registra las mediciones periódicas de calidad según el formato
            PHT-FO-IND/P004.
          </p>
          <QualityControlForm reporteId={activeReport.id} />
        </div>
        <div className="dashboard-card">
          <h3>Inspección de Sello Lateral</h3>
          <p>
            Formulario para registrar las mediciones del sello de la botella.
          </p>
          <button className="btn-action" disabled>
            Registrar Inspección (Próximamente)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalidadView;
