import React, { useState } from "react";
import "../styles/ProduccionModal.css";

interface LineStoppageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  reporteId: number;
}

const LineStoppageModal: React.FC<LineStoppageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reporteId,
}) => {
  const [motivo, setMotivo] = useState("");
  const [duracion, setDuracion] = useState("");
  const [hora, setHora] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/reportes/${reporteId}/paros`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hora_inicio: hora,
            duracion_minutos: parseInt(duracion),
            descripcion_motivo: motivo,
          }),
        }
      );
      if (!response.ok) throw new Error("Error al registrar el paro.");
      onSave();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Registrar Paro de Línea</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="motivo">Motivo del Paro</label>
              <input
                type="text"
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="duracion">Duración (minutos)</label>
                <input
                  type="number"
                  id="duracion"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="hora_inicio">Hora de Inicio</label>
                <input
                  type="time"
                  id="hora_inicio"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar Paro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LineStoppageModal;
