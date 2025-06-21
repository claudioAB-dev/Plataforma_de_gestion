import React, { useState, useEffect } from "react";
import "../styles/Modal.css";

interface RegisterPalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  reporteId: number;
  nextPalletNumber: number;
}

const RegisterPalletModal: React.FC<RegisterPalletModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reporteId,
  nextPalletNumber,
}) => {
  const [cantidad, setCantidad] = useState("60");
  const [hora, setHora] = useState("");

  useEffect(() => {
    if (isOpen) {
      setHora(new Date().toTimeString().slice(0, 5));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/reportes/${reporteId}/pallets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numero_pallet: nextPalletNumber,
            cantidad_charolas: parseInt(cantidad),
            hora_registro: hora,
          }),
        }
      );
      if (!response.ok) throw new Error("Error al registrar el pallet.");
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
            <h2>Registrar Pallet Terminado</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>N°. de Pallet</label>
              <input type="text" value={nextPalletNumber} disabled />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="cantidad_charolas">Cantidad de Charolas</label>
                <input
                  type="number"
                  id="cantidad_charolas"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="hora_registro">Hora de Registro</label>
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
