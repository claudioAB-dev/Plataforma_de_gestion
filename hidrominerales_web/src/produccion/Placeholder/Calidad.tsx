import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import "../styles/ProduccionDashboard.css"; // Reutilizamos estilos del dashboard
import "../styles/CalidadDashboard.css"; // Estilos específicos para calidad
import type { ReporteProduccion } from "../../types";

// --- Formulario para "Control de Producto en Proceso" ---
const ControlProcesoForm: React.FC<{
  reporteId: number;
  inspectorId: number;
}> = ({ reporteId, inspectorId }) => {
  const [formData, setFormData] = useState({
    olor: "OK",
    sabor: "OK",
    lampara_uv: true,
    fugas: "OK",
    rosca: "OK",
    faldon: "OK",
    inversion: "OK",
    tq1: "",
    tq2: "",
    tq3: "",
    media: "",
    presion: "",
    temperatura: "",
    vol_co2: "",
    saturador: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const body = {
      ...formData,
      reporte_id: reporteId,
      inspector_id: inspectorId,
      hora_medicion: new Date().toTimeString().split(" ")[0], // Formato HH:MM:SS
      // Convierte los campos numéricos vacíos a null
      tq1: formData.tq1 === "" ? null : parseFloat(formData.tq1),
      tq2: formData.tq2 === "" ? null : parseFloat(formData.tq2),
      tq3: formData.tq3 === "" ? null : parseFloat(formData.tq3),
      media: formData.media === "" ? null : parseFloat(formData.media),
      presion: formData.presion === "" ? null : parseFloat(formData.presion),
      temperatura:
        formData.temperatura === "" ? null : parseFloat(formData.temperatura),
      vol_co2: formData.vol_co2 === "" ? null : parseFloat(formData.vol_co2),
      saturador:
        formData.saturador === "" ? null : parseFloat(formData.saturador),
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/controles_calidad",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar la medición");
      }

      alert("Medición de control de proceso guardada con éxito.");
      (e.target as HTMLFormElement).reset(); // Limpia el formulario
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="quality-form" onSubmit={handleSubmit}>
      <h4>Características Organolépticas y de Empaque</h4>
      <div className="form-grid-3">
        {/* Usamos inputs de texto en lugar de checkboxes para "OK"/"NO OK" */}
        <div className="form-group">
          <label>Olor</label>
          <input
            type="text"
            name="olor"
            value={formData.olor}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Sabor</label>
          <input
            type="text"
            name="sabor"
            value={formData.sabor}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Lámpara UV</label>
          <input
            type="checkbox"
            name="lampara_uv"
            checked={formData.lampara_uv}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Fugas</label>
          <input
            type="text"
            name="fugas"
            value={formData.fugas}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Rosca</label>
          <input
            type="text"
            name="rosca"
            value={formData.rosca}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Faldón</label>
          <input
            type="text"
            name="faldon"
            value={formData.faldon}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Inversión</label>
          <input
            type="text"
            name="inversion"
            value={formData.inversion}
            onChange={handleChange}
          />
        </div>
      </div>

      <h4>Mediciones de Proceso</h4>
      <div className="form-grid-4">
        <div className="form-group">
          <label>TQ 1</label>
          <input
            type="number"
            name="tq1"
            value={formData.tq1}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>TQ 2</label>
          <input
            type="number"
            name="tq2"
            value={formData.tq2}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>TQ 3</label>
          <input
            type="number"
            name="tq3"
            value={formData.tq3}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Media</label>
          <input
            type="number"
            name="media"
            value={formData.media}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Presión</label>
          <input
            type="number"
            name="presion"
            value={formData.presion}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Temp °C</label>
          <input
            type="number"
            name="temperatura"
            value={formData.temperatura}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Vol. CO2</label>
          <input
            type="number"
            name="vol_co2"
            value={formData.vol_co2}
            onChange={handleChange}
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Saturador</label>
          <input
            type="number"
            name="saturador"
            value={formData.saturador}
            onChange={handleChange}
            step="0.01"
          />
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <button
        type="submit"
        className="btn-action btn-save-quality"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Guardando..." : "Guardar Medición de Proceso"}
      </button>
    </form>
  );
};

// --- Formulario para "Inspección de Sello Lateral" ---
const SelloLateralForm: React.FC<{ reporteId: number; realizoId: number }> = ({
  reporteId,
  realizoId,
}) => {
  const [formData, setFormData] = useState({
    profundidad_superior_1: "",
    profundidad_superior_2: "",
    profundidad_superior_3: "",
    profundidad_superior_4: "",
    sello_lateral_1: "",
    sello_lateral_2: "",
    sello_lateral_3: "",
    sello_lateral_4: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const body = {
      reporte_id: reporteId,
      realizo_id: realizoId,
      hora_medicion: new Date().toTimeString().split(" ")[0],
      ...Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          value === "" ? null : parseFloat(value),
        ])
      ),
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/inspecciones_sello",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar la inspección");
      }

      alert("Inspección de sello guardada con éxito.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="quality-form" onSubmit={handleSubmit}>
      <h4>Mediciones</h4>
      <div className="form-grid-4">
        {Object.keys(formData).map((key) => (
          <div className="form-group" key={key}>
            <label>
              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>
            <input
              type="number"
              name={key}
              value={formData[key as keyof typeof formData]}
              onChange={handleChange}
              step="0.01"
            />
          </div>
        ))}
      </div>

      {error && <p className="error-message">{error}</p>}

      <button
        type="submit"
        className="btn-action btn-save-quality"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Guardando..." : "Guardar Inspección de Sello"}
      </button>
    </form>
  );
};

// --- Componente Principal de la Vista de Calidad ---
interface CalidadViewProps {
  selectedLine: number;
}

const CalidadView: React.FC<CalidadViewProps> = ({ selectedLine }) => {
  const [activeReport, setActiveReport] = useState<ReporteProduccion | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Obtenemos el usuario del contexto

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
      setActiveReport(reports.length > 0 ? reports[0] : null);
    } catch (error) {
      console.error(error);
      setActiveReport(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  if (!user) {
    return (
      <div className="loading-container">
        Cargando información de usuario...
      </div>
    );
  }

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
          <ControlProcesoForm
            reporteId={activeReport.id}
            inspectorId={user.id}
          />
        </div>
        <div className="dashboard-card">
          <h3>Inspección de Sello Lateral</h3>
          <p>
            Formulario para registrar las mediciones del sello de la botella.
          </p>
          <SelloLateralForm reporteId={activeReport.id} realizoId={user.id} />
        </div>
      </div>
    </div>
  );
};

export default CalidadView;
