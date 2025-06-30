import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import type { SolicitudFalta } from "../types";
import "./styles/Empleado.css";

// Componente para el formulario modal
const SolicitudModal: React.FC<{
  onClose: () => void;
  onSave: () => void;
  userId: number;
}> = ({ onClose, onSave, userId }) => {
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      setError("El motivo es obligatorio.");
      return;
    }
    setError(null);
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/solicitudes_falta`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            fecha_solicitud: fecha,
            motivo,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Error al enviar la solicitud.");
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-form-container">
      <div className="modal-form-content">
        <h2>Nueva Solicitud de Falta</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="fecha">Fecha de la Falta</label>
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
          <label htmlFor="motivo">Motivo de la Ausencia</label>
          <textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal de la vista
const EmpleadoLayout: React.FC = () => {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudFalta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSolicitudes = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/solicitudes_falta/mis_solicitudes/${user.id}`
      );
      if (!response.ok)
        throw new Error("No se pudieron cargar tus solicitudes.");
      const data = await response.json();
      setSolicitudes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const solicitudesEsteMes = useMemo(() => {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);
    return solicitudes.filter((s) => new Date(s.timestamp) >= inicioMes).length;
  }, [solicitudes]);

  const puedeSolicitar = solicitudesEsteMes < 2;

  if (isLoading) return <p>Cargando tus solicitudes...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="empleado-container">
      <header className="empleado-header">
        <h1>Mis Solicitudes de Ausencia</h1>

        <div className="status-summary">
          <div className="status-indicator-container">
            <div className="status-circles">
              <div
                className={`status-circle ${
                  solicitudesEsteMes >= 1 ? "used" : "available"
                }`}
              ></div>
              <div
                className={`status-circle ${
                  solicitudesEsteMes >= 2 ? "used" : "available"
                }`}
              ></div>
            </div>
            <span className="status-text">
              {solicitudesEsteMes}/2 faltas usadas este mes
            </span>
          </div>
        </div>
      </header>
      {isModalOpen && user && (
        <SolicitudModal
          onClose={() => setIsModalOpen(false)}
          onSave={fetchSolicitudes}
          userId={user.id}
        />
      )}
      <header className="empleado-header">
        <h1>Mis Solicitudes de Ausencia</h1>
        <p>Este mes has solicitado: {solicitudesEsteMes} de 2.</p>
      </header>

      <button
        className="btn-new-request"
        onClick={() => setIsModalOpen(true)}
        disabled={!puedeSolicitar}
      >
        {puedeSolicitar ? "Solicitar Nueva Falta" : "Límite Mensual Alcanzado"}
      </button>

      <div>
        {solicitudes.map((s) => (
          <div
            key={s.id}
            className={`solicitud-card ${s.estado.toLowerCase()}`}
          >
            <div className="solicitud-card-header">
              <strong>
                {new Date(s.fecha_solicitud).toLocaleDateString("es-MX", {
                  timeZone: "UTC",
                })}
              </strong>
              <span className={`status-pill ${s.estado.toLowerCase()}`}>
                {s.estado}
              </span>
            </div>
            <div className="solicitud-card-body">
              <p className="motivo">
                <strong>Motivo:</strong> {s.motivo}
              </p>
              {s.estado !== "Pendiente" && (
                <p>
                  <strong>Revisado por:</strong>{" "}
                  {s.revisado_por_nombre || "N/A"}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpleadoLayout;
