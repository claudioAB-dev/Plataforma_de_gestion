import React, { useState } from "react";
import type { InventarioMateriaPrima } from "../../types";
import "../../gerente_produccion/styles/Modal.css";

interface ModalProps {
  item: InventarioMateriaPrima;
  onClose: () => void;
  onSuccess: () => void;
}

const AdjustmentModal: React.FC<ModalProps> = ({
  item,
  onClose,
  onSuccess,
}) => {
  const [newQuantity, setNewQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuantity === "" || !reason) {
      setFeedback({
        type: "error",
        message: "Debe ingresar la nueva cantidad y un motivo.",
      });
      return;
    }
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/inventario/materia_prima/ajustar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inventario_mp_id: item.id,
            nueva_cantidad_fisica: parseFloat(newQuantity),
            motivo: reason,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al ajustar.");

      setFeedback({ type: "success", message: "Ajuste realizado con éxito." });
      setTimeout(() => onSuccess(), 1500);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Error",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h2>Ajustar Inventario</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>
            <strong>Producto:</strong> {item.materia_prima_nombre}
          </p>
          <p>
            <strong>Lote Proveedor:</strong> {item.lote_proveedor}
          </p>
          <p>
            <strong>Stock Actual:</strong>{" "}
            {item.cantidad_actual.toLocaleString()}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newQuantity">Nueva Cantidad Física</label>
              <input
                type="number"
                id="newQuantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                required
                min="0"
                step="any"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reason">Motivo del Ajuste</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Conteo cíclico, merma por daño..."
                required
              />
            </div>
            {feedback && (
              <div className={`feedback-message ${feedback.type}`}>
                {feedback.message}
              </div>
            )}
            <div className="modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Confirmar Ajuste"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentModal;
