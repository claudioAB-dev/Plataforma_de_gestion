import React, { useState } from "react";
import type { InventarioMateriaPrima } from "../../types";
import "../styles/ProduccionModal.css";

interface RegisterConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  itemToConsume: InventarioMateriaPrima;
  reporteId: number;
  userId: number;
}

const RegisterConsumptionModal: React.FC<RegisterConsumptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToConsume,
  reporteId,
  userId,
}) => {
  const [cantidad, setCantidad] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const consumedAmount = parseFloat(cantidad);
    if (isNaN(consumedAmount) || consumedAmount <= 0) {
      setError("La cantidad debe ser un número positivo.");
      return;
    }
    if (consumedAmount > itemToConsume.cantidad_actual) {
      setError(
        `No se puede consumir más de la cantidad disponible (${itemToConsume.cantidad_actual}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/inventario/consumir`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inventario_mp_id: itemToConsume.id,
            cantidad: consumedAmount,
            reporte_id: reporteId,
            user_id: userId,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al registrar el consumo.");
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Registrar Consumo de Insumo</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Insumo</label>
              <input
                type="text"
                value={itemToConsume.materia_prima.nombre}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Lote</label>
              <input
                type="text"
                value={itemToConsume.lote_proveedor}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Disponible</label>
              <input
                type="text"
                value={`${itemToConsume.cantidad_actual.toLocaleString()} ${
                  itemToConsume.materia_prima.unidad_medida
                }`}
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="cantidad">Cantidad a Consumir</label>
              <input
                type="number"
                id="cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                autoFocus
                step="any"
                min="0.01"
                max={itemToConsume.cantidad_actual}
                placeholder="Ej: 1500"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterConsumptionModal;
