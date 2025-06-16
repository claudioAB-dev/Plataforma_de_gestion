import React, { useState } from "react";
import "./modal.css"; // Nuevos estilos para el modal

interface Producto {
  id: number;
  nombre: string;
}

interface ProduccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  productos: Producto[];
}

const ProduccionModal: React.FC<ProduccionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productos,
}) => {
  const [productoId, setProductoId] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("");
  const [merma, setMerma] = useState<string>("");
  const [observaciones, setObservaciones] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoId) {
      alert("Por favor, selecciona un producto.");
      return;
    }
    onSave({
      producto_id: parseInt(productoId),
      cantidad_producida: parseInt(cantidad),
      merma: parseInt(merma),
      observaciones,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Registrar Reporte de Producción</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="producto">Producto</label>
            <select
              id="producto"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona un producto
              </option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="cantidad">Cantidad Producida</label>
            <input
              id="cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="merma">Merma</label>
            <input
              id="merma"
              type="number"
              value={merma}
              onChange={(e) => setMerma(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProduccionModal;
