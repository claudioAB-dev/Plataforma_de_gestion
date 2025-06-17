import React, { useState, useEffect } from "react";
import "../styles/ProduccionDashboard.css"; // Reutilizamos estilos del dashboard
import "../styles/CalidadDashboard.css"; // Estilos específicos para calidad

// La misma función simulada que usamos en Home.tsx
const fetchActiveReportForLine = async (line: number): Promise<any | null> => {
  console.log(`(Calidad) Buscando reporte activo para la línea ${line}...`);
  if (line === 2) {
    return {
      id: 7,
      producto_nombre: "Felix Peticote 355 ml",
      lote: "CPREFDIC 26 L160.25",
    };
  }
  return null;
};

// Componente del formulario, basado en el reporte de calidad en proceso
const QualityControlForm: React.FC<{ reporteId: number }> = ({ reporteId }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se haría un POST a /api/reportes/{reporteId}/controles_calidad
    alert(`Guardando medición de calidad para el reporte ${reporteId}`);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <form className="quality-form" onSubmit={handleSubmit}>
      <h4>Características Organolépticas</h4>
      <div className="form-grid-3">
        {/* Estos serían checkboxes en la vida real */}
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
      {/* Basado en la tabla "PRODUCTO EN PROCESO" del reporte */}
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
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchActiveReportForLine(selectedLine)
      .then((report) => {
        setActiveReport(report);
      })
      .finally(() => setIsLoading(false));
  }, [selectedLine]);

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
        <h2>No hay producción activa</h2>
        <p>
          Inicie un reporte en la sección de "Producción" para poder registrar
          controles de calidad en la línea {selectedLine}.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Control de Calidad: Línea {selectedLine}</h1>
          <p>
            <strong>Producto:</strong> {activeReport.producto_nombre} |
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
          {/* Aquí iría otro componente de formulario para el sello */}
          <button className="btn-action" disabled>
            Registrar Inspección (Próximamente)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalidadView;
