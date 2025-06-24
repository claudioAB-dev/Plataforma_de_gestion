// claudioab-dev/plataforma_de_gestion/Plataforma_de_gestion-fd3f1a044e4e79ecd0ea4efbe2e24e588ad2f2be/hidrominerales_web/src/gerente_produccion/views/ReporteDetalle.tsx

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {
  ReporteProduccion,
  PalletTerminado,
  ParoLinea,
  Merma,
} from "../../types"; // Asegúrate que tus tipos sean correctos
import "../styles/Reportes.css"; // Reutilizamos los estilos

const BOTELLAS_POR_CHAROLA = 60; // Podría venir del producto en el futuro

const ReporteDetalle: React.FC = () => {
  const [report, setReport] = useState<ReporteProduccion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { reporteId } = useParams<{ reporteId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!reporteId) {
      setError("No se proporcionó un ID de reporte.");
      setLoading(false);
      return;
    }

    const fetchReportDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:5001/api/reportes/${reporteId}`
        );
        if (!response.ok) {
          throw new Error(
            `Error al obtener los detalles del reporte (HTTP ${response.status})`
          );
        }
        const data: ReporteProduccion = await response.json();
        setReport(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Un error inesperado ocurrió."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [reporteId]);

  // Cálculos memorizados para no recalcular en cada render
  const { totalCharolas, totalBotellas, totalMinutosParo, totalMerma } =
    useMemo(() => {
      if (!report) {
        return {
          totalCharolas: 0,
          totalBotellas: 0,
          totalMinutosParo: 0,
          totalMerma: 0,
        };
      }
      const totalCharolas =
        report.pallets?.reduce((sum, p) => sum + p.cantidad_charolas, 0) ?? 0;
      const totalBotellas = totalCharolas * BOTELLAS_POR_CHAROLA;
      const totalMinutosParo =
        report.paros?.reduce((sum, p) => sum + p.duracion_minutos, 0) ?? 0;
      const totalMerma =
        report.mermas?.reduce((sum, m) => sum + m.cantidad, 0) ?? 0;

      return { totalCharolas, totalBotellas, totalMinutosParo, totalMerma };
    }, [report]);

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Cargando Detalles del Reporte...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reporte-detalle-container">
        <h1>Error</h1>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate(-1)} className="back-link">
          Volver
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="reporte-detalle-container">
        <h1>Reporte no encontrado</h1>
        <button onClick={() => navigate(-1)} className="back-link">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="reporte-detalle-container">
      <button onClick={() => navigate(-1)} className="back-link">
        &larr; Volver a la lista
      </button>

      <h1>Detalle del Reporte de Producción #{report.id}</h1>

      {/* SECCIÓN DE INFORMACIÓN GENERAL */}
      <section className="detalle-seccion">
        <h2>Información General</h2>
        <div className="info-grid">
          <p>
            <strong>Producto:</strong> {report.producto?.nombre}
          </p>
          <p>
            <strong>Lote:</strong> {report.lote}
          </p>
          <p>
            <strong>Línea de Producción:</strong> {report.linea}
          </p>
          <p>
            <strong>Turno:</strong> {report.turno}
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(report.fecha_produccion).toLocaleDateString()}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`status-pill ${report.estado
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {report.estado}
            </span>
          </p>
          <p>
            <strong>Hora de Arranque:</strong> {report.hora_arranque}
          </p>
          <p>
            <strong>Hora de Término:</strong> {report.hora_termino || "N/A"}
          </p>
        </div>
      </section>

      {/* SECCIÓN DE RESUMEN DE PRODUCCIÓN */}
      <section className="detalle-seccion">
        <h2>Resumen de Producción</h2>
        <div className="info-grid">
          <p>
            <strong>Producción Objetivo:</strong>{" "}
            {report.produccion_objetivo.toLocaleString()} botellas
          </p>
          <p>
            <strong>Producción Real:</strong> {totalBotellas.toLocaleString()}{" "}
            botellas
          </p>
          <p>
            <strong>Total de Pallets:</strong> {report.pallets?.length ?? 0}
          </p>
          <p>
            <strong>Total de Charolas:</strong> {totalCharolas}
          </p>
          <p>
            <strong>Total de Merma:</strong> {totalMerma} unidades
          </p>
          <p>
            <strong>Tiempo total de Paros:</strong> {totalMinutosParo} minutos
          </p>
        </div>
      </section>

      {/* SECCIÓN DE PALLETS */}
      <section className="detalle-seccion">
        <h2>Pallets Registrados</h2>
        <div className="table-responsive">
          <table className="reportes-table">
            <thead>
              <tr>
                <th>N° de Pallet</th>
                <th>Cantidad de Charolas</th>
                <th>Hora de Registro</th>
              </tr>
            </thead>
            <tbody>
              {report.pallets && report.pallets.length > 0 ? (
                report.pallets.map((pallet: PalletTerminado) => (
                  <tr key={pallet.id}>
                    <td>{pallet.numero_pallet}</td>
                    <td>{pallet.cantidad_charolas}</td>
                    <td>{pallet.hora_registro}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No hay pallets registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN DE PAROS DE LÍNEA */}
      <section className="detalle-seccion">
        <h2>Paros de Línea</h2>
        <div className="table-responsive">
          <table className="reportes-table">
            <thead>
              <tr>
                <th>Motivo</th>
                <th>Duración (min)</th>
                <th>Hora de Inicio</th>
              </tr>
            </thead>
            <tbody>
              {report.paros && report.paros.length > 0 ? (
                report.paros.map((paro: ParoLinea) => (
                  <tr key={paro.id}>
                    <td>{paro.descripcion_motivo}</td>
                    <td>{paro.duracion_minutos}</td>
                    <td>{paro.hora_inicio}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No se registraron paros de línea.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN DE MERMA */}
      <section className="detalle-seccion">
        <h2>Merma Registrada</h2>
        <div className="table-responsive">
          <table className="reportes-table">
            <thead>
              <tr>
                <th>Tipo de Merma</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {report.mermas && report.mermas.length > 0 ? (
                report.mermas.map((merma: Merma) => (
                  <tr key={merma.id}>
                    <td>{merma.tipo_merma}</td>
                    <td>{merma.cantidad}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>No se registró merma.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ReporteDetalle;
