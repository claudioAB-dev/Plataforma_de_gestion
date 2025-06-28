import React, { useEffect, useState } from "react";
import "../styles/Modal.css";
import type { Cliente } from "../../types";

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
  const [co2Nominal, setCo2Nominal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    // Cargar clientes al abrir el modal
    fetch("http://127.0.0.1:5001/api/clientes")
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .catch(() => setClientes([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !presentacion || !sku || !co2Nominal || !clienteId) {
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
        body: JSON.stringify({
          nombre,
          presentacion,
          sku,
          co2Nominal: parseFloat(co2Nominal),
          cliente_id: parseInt(clienteId, 10),
          activo: true,
        }),
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
            <label htmlFor="co2_nominal">CO₂ Nominal (g/L)</label>
            <input
              id="co2_nominal"
              type="number"
              step="any"
              value={co2Nominal}
              onChange={(e) => setCo2Nominal(e.target.value)}
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
          <div className="form-group">
            <label htmlFor="cliente_id">Cliente</label>
            <select
              id="cliente_id"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
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
