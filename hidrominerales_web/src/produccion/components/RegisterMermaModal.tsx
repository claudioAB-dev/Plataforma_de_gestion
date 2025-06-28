// claudioab-dev/plataforma_de_gestion/Plataforma_de_gestion-fcc48bb06575d392a80d27919f2a68d8a85432ba/hidrominerales_web/src/produccion/components/RegisterMermaModal.tsx

import React, { useState, useEffect } from "react";
import type { Merma } from "../../types";
import "../styles/ProduccionModal.css"; // Estilos principales del modal
import "../styles/merma-stepper.css"; // Nuevos estilos para los controles

interface RegisterMermaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  reporteId: number;
  currentMermas: Merma[]; // Recibimos las mermas actuales
}

// Definimos los tipos de merma que se pueden registrar
const MERMA_TYPES = [
  "Tapa/casquillo operador",
  "Tapa/casquillo equipo",
  "Tapa/casquillo muestreo",
  "Botella muestreo",
];

const RegisterMermaModal: React.FC<RegisterMermaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reporteId,
  currentMermas,
}) => {
  const [mermaState, setMermaState] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa el estado del modal con las mermas actuales del reporte
  useEffect(() => {
    if (isOpen) {
      const initialState = MERMA_TYPES.reduce((acc, type) => {
        const current = currentMermas.find((m) => m.tipo_merma === type);
        acc[type] = current ? current.cantidad : 0;
        return acc;
      }, {} as Record<string, number>);
      setMermaState(initialState);
      setError(null);
    }
  }, [isOpen, currentMermas]);

  // Maneja el cambio directo en el input numérico
  const handleInputChange = (tipo: string, valor: string) => {
    const newValue = parseInt(valor, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      setMermaState((prev) => ({ ...prev, [tipo]: newValue }));
    } else if (valor === "") {
      setMermaState((prev) => ({ ...prev, [tipo]: 0 }));
    }
  };

  // Incrementa la cantidad para un tipo de merma
  const handleIncrement = (tipo: string) => {
    setMermaState((prev) => ({ ...prev, [tipo]: (prev[tipo] || 0) + 1 }));
  };

  // Decrementa la cantidad, asegurando que no sea negativa
  const handleDecrement = (tipo: string) => {
    setMermaState((prev) => ({
      ...prev,
      [tipo]: Math.max(0, (prev[tipo] || 0) - 1),
    }));
  };

  // Envía los datos al backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Calculamos solo las diferencias para enviar al backend
    const mermasToAdd = Object.entries(mermaState)
      .map(([tipo, nuevaCantidad]) => {
        const mermaActual = currentMermas.find((m) => m.tipo_merma === tipo);
        const cantidadActual = mermaActual ? mermaActual.cantidad : 0;
        const diferencia = nuevaCantidad - cantidadActual;

        return {
          tipo_merma: tipo,
          cantidad: diferencia,
        };
      })
      .filter((m) => m.cantidad > 0); // Solo enviamos las que aumentaron

    if (mermasToAdd.length === 0) {
      onClose(); // No hay cambios, solo cerramos el modal
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/reportes/${reporteId}/mermas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mermasToAdd), // Enviamos el lote de mermas
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Una o más mermas no se pudieron registrar."
        );
      }

      onSave(); // Refresca los datos en Home.tsx
      onClose(); // Cierra el modal
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Registrar Merma</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            {error && <p className="error-message">{error}</p>}

            <div className="merma-grid">
              {MERMA_TYPES.map((tipo) => (
                <div key={tipo} className="merma-item-control">
                  <label>{tipo}</label>
                  <div className="merma-stepper">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => handleDecrement(tipo)}
                      disabled={isSubmitting}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="stepper-input"
                      value={mermaState[tipo] || 0}
                      onChange={(e) => handleInputChange(tipo, e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={() => handleIncrement(tipo)}
                      disabled={isSubmitting}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMermaModal;
