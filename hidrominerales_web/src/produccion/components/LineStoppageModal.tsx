import React, { useState } from "react";
import "../styles/Modal.css";

interface StoppageData {
  descripcion: string;
  duracion: number; // en minutos
  hora_inicio: string;
}

interface LineStoppageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StoppageData) => void;
}

// Opciones de paros comunes
const predefinedStoppages = [
  { descripcion: "Comida", duracion: 30 },
  { descripcion: "Revisión de Engargolador", duracion: 15 },
  { descripcion: "Ajuste de Equipo", duracion: 10 },
];

const LineStoppageModal: React.FC<LineStoppageModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [view, setView] = useState<"options" | "custom">("options");

  if (!isOpen) return null;

  const handlePredefinedClick = (stoppage: {
    descripcion: string;
    duracion: number;
  }) => {
    onSave({
      ...stoppage,
      hora_inicio: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  };

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({
      descripcion: formData.get("descripcion") as string,
      duracion: parseInt(formData.get("duracion") as string),
      hora_inicio: formData.get("hora_inicio") as string,
    });
  };

  const resetViewAndClose = () => {
    setView("options");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Registrar Paro de Línea</h2>
          <button
            type="button"
            onClick={resetViewAndClose}
            className="modal-close-btn"
          >
            &times;
          </button>
        </div>

        {view === "options" ? (
          // Vista de opciones predefinidas
          <div className="modal-body">
            <h4>Seleccione una causa predefinida:</h4>
            <div className="predefined-options">
              {predefinedStoppages.map((stoppage) => (
                <button
                  key={stoppage.descripcion}
                  className="btn-predefined"
                  onClick={() => handlePredefinedClick(stoppage)}
                >
                  {stoppage.descripcion} <span>({stoppage.duracion} min)</span>
                </button>
              ))}
              <button
                className="btn-predefined btn-other"
                onClick={() => setView("custom")}
              >
                Otra Causa...
              </button>
            </div>
          </div>
        ) : (
          // Vista para causa personalizada
          <form onSubmit={handleCustomSubmit}>
            <div className="modal-body">
              <h4>Detalle la causa del paro:</h4>
              <div className="form-group">
                <label htmlFor="descripcion">Motivo del Paro</label>
                <input
                  type="text"
                  id="descripcion"
                  name="descripcion"
                  required
                  autoFocus
                />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="hora_inicio">Hora de Inicio</label>
                  <input
                    type="time"
                    id="hora_inicio"
                    name="hora_inicio"
                    defaultValue={new Date().toTimeString().slice(0, 5)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="duracion">Duración (minutos)</label>
                  <input type="number" id="duracion" name="duracion" required />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setView("options")}
              >
                Volver
              </button>
              <button type="submit" className="btn-save">
                Guardar Paro
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LineStoppageModal;
