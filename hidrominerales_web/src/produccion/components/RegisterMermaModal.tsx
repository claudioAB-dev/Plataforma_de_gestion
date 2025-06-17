import React from "react";
import "../styles/Modal.css";

export interface MermaData {
  tapa_operador: number;
  tapa_equipo: number;
  tapa_muestreo: number;
  botella_muestreo: number;
  merma_botella: number;
}

interface RegisterMermaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MermaData) => void;
  currentMerma: MermaData; // Valores actuales para pre-llenar el form
}

const RegisterMermaModal: React.FC<RegisterMermaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentMerma,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: MermaData = {
      tapa_operador: parseInt(formData.get("tapa_operador") as string) || 0,
      tapa_equipo: parseInt(formData.get("tapa_equipo") as string) || 0,
      tapa_muestreo: parseInt(formData.get("tapa_muestreo") as string) || 0,
      botella_muestreo:
        parseInt(formData.get("botella_muestreo") as string) || 0,
      merma_botella: parseInt(formData.get("merma_botella") as string) || 0,
    };
    onSave(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Registrar / Actualizar Merma</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            <h4>Tapa / Casquillo Generado</h4>
            <div className="form-grid-3">
              <div className="form-group">
                <label htmlFor="tapa_operador">Por Operador</label>
                <input
                  type="number"
                  id="tapa_operador"
                  name="tapa_operador"
                  defaultValue={currentMerma.tapa_operador}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tapa_equipo">Por Equipo</label>
                <input
                  type="number"
                  id="tapa_equipo"
                  name="tapa_equipo"
                  defaultValue={currentMerma.tapa_equipo}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tapa_muestreo">Por Muestreo</label>
                <input
                  type="number"
                  id="tapa_muestreo"
                  name="tapa_muestreo"
                  defaultValue={currentMerma.tapa_muestreo}
                />
              </div>
            </div>
            <h4>Botella / Botellón</h4>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="botella_muestreo">Generada por Muestreo</label>
                <input
                  type="number"
                  id="botella_muestreo"
                  name="botella_muestreo"
                  defaultValue={currentMerma.botella_muestreo}
                />
              </div>
              <div className="form-group">
                <label htmlFor="merma_botella">Merma de Botella</label>
                <input
                  type="number"
                  id="merma_botella"
                  name="merma_botella"
                  defaultValue={currentMerma.merma_botella}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar Merma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMermaModal;
