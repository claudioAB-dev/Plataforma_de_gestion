import React, { useState, useEffect } from "react";
import "../styles/Modal.css";

interface RegisterPalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  // La función onSave ahora recibirá también la hora
  onSave: (data: { cantidad_charolas: number; hora_registro: string }) => void;
  nextPalletNumber: number;
}

const RegisterPalletModal: React.FC<RegisterPalletModalProps> = ({
  isOpen,
  onClose,
  onSave,
  nextPalletNumber,
}) => {
  // Estado para manejar el valor del input de la hora
  const [hora, setHora] = useState("");

  useEffect(() => {
    // Cuando el modal se abre, se establece la hora actual como valor inicial
    if (isOpen) {
      const now = new Date();
      // Formateamos a "HH:mm" que es lo que espera el input type="time"
      const formattedTime = now.toTimeString().slice(0, 5);
      setHora(formattedTime);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const cantidad_charolas = parseInt(
      formData.get("cantidad_charolas") as string
    );

    // Pasamos la hora del estado (que puede haber sido modificada) a la función onSave
    onSave({
      cantidad_charolas,
      hora_registro: hora,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Registrar Pallet Terminado</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="pallet_numero">N°. de Tarima / Pallet</label>
              <input
                type="text"
                id="pallet_numero"
                value={nextPalletNumber}
                disabled
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="cantidad_charolas">Cantidad de Charolas</label>
                <input
                  type="number"
                  id="cantidad_charolas"
                  name="cantidad_charolas"
                  required
                  autoFocus
                  defaultValue={60}
                />
              </div>
              <div className="form-group">
                <label htmlFor="hora_registro">Hora de Registro</label>
                {/* El input ya no está deshabilitado y es de tipo "time" */}
                <input
                  type="time"
                  id="hora_registro"
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
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPalletModal;
