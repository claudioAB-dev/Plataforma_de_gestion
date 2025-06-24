import React, { useState } from "react";
import "../styles/Modal.css";

interface CreateProductModalProps {
  onClose: () => void;
  onSave: () => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  onClose,
  onSave,
}) => {
  const [nombre, setNombre] = useState("");
  const [presentacion, setPresentacion] = useState("");
  const [sku, setSku] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !presentacion || !sku) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("http://127.0.0.1:5001/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, presentacion, sku, activo: true }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el producto");
      }

      onSave(); // Llama a onSave para refrescar la lista y cerrar
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Un error inesperado ocurrió."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Crear Nuevo Producto</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Producto</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="presentacion">Presentación</label>
            <input
              id="presentacion"
              type="text"
              value={presentacion}
              onChange={(e) => setPresentacion(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="sku">SKU</label>
            <input
              id="sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
