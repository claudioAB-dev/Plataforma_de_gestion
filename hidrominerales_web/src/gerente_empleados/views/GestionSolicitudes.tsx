import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import type { SolicitudFalta, EstadoSolicitud } from "../../types";
import "../../gerente_produccion/styles/Reportes.css";
import "../../gerente_empleados/styles/GerenteEmpleados.css";

const GestionSolicitudes: React.FC = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudFalta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<EstadoSolicitud>("Pendiente");

  const fetchSolicitudes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/solicitudes_falta?estado=${filter}`
      );
      if (!response.ok)
        throw new Error("No se pudieron cargar las solicitudes.");
      setSolicitudes(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const handleReview = async (
    solicitudId: number,
    newState: "Aprobado" | "Rechazado"
  ) => {
    if (!user) return;

    let comentario_gerente = "";
    if (newState === "Rechazado") {
      comentario_gerente =
        prompt("Por favor, ingrese el motivo del rechazo:") ||
        "Rechazado por gerente.";
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/solicitudes_falta/${solicitudId}/revisar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            revisor_id: user.id,
            estado: newState,
            comentario_gerente,
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al revisar la solicitud.");
      }
      fetchSolicitudes(); // Recargar la lista
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="reportes-list-container gerente-empleados-container">
      <h1>Gestión de Solicitudes de Ausencia</h1>
      <div className="filters">
        <label htmlFor="status-filter">Filtrar por estado:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as EstadoSolicitud)}
        >
          <option value="Pendiente">Pendientes</option>
          <option value="Aprobado">Aprobadas</option>
          <option value="Rechazado">Rechazadas</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Fecha de Falta</th>
              <th>Motivo</th>
              <th>Fecha Solicitud</th>
              <th>Estado</th>
              {filter === "Pendiente" && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6}>Cargando...</td>
              </tr>
            ) : solicitudes.length === 0 ? (
              <tr>
                <td colSpan={6}>No hay solicitudes con este estado.</td>
              </tr>
            ) : (
              solicitudes.map((s) => (
                <tr key={s.id}>
                  <td>{s.solicitante_nombre}</td>
                  <td>
                    {new Date(s.fecha_solicitud).toLocaleDateString("es-MX", {
                      timeZone: "UTC",
                    })}
                  </td>
                  <td>{s.motivo}</td>
                  <td>{new Date(s.timestamp).toLocaleDateString("es-MX")}</td>
                  <td>
                    <span className={`status-pill ${s.estado.toLowerCase()}`}>
                      {s.estado}`{"}"}
                    </span>
                  </td>
                  {filter === "Pendiente" && (
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-approve"
                          onClick={() => handleReview(s.id, "Aprobado")}
                        >
                          Aprobar
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleReview(s.id, "Rechazado")}
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionSolicitudes;
