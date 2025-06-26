import React, { useState, useEffect } from "react";
import type { MateriaPrima, Cliente } from "../../types";
import "../styles/RawMaterialModal.css";
interface RawMaterialModalProps {
  onClose: () => void;
  onSave: () => void;
  existingMaterial: MateriaPrima | null;
  clients: Cliente[];
}

const RawMaterialModal: React.FC<RawMaterialModalProps> = ({
  onClose,
  onSave,
  existingMaterial,
  clients,
}) => {
  const [formData, setFormData] = useState({
    cliente_id: "",
    nombre: "",
    sku: "",
    descripcion: "",
    unidad_medida: "unidades",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingMaterial) {
      setFormData({
        cliente_id: String(existingMaterial.cliente_id),
        nombre: existingMaterial.nombre,
        sku: existingMaterial.sku,
        descripcion: existingMaterial.descripcion || "",
        unidad_medida: existingMaterial.unidad_medida,
      });
    }
  }, [existingMaterial]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.sku || !formData.cliente_id) {
      setError("Cliente, Nombre y SKU son campos obligatorios.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const url = existingMaterial
      ? `${import.meta.env.VITE_API_URL}/materias_primas/${existingMaterial.id}`
      : `${import.meta.env.VITE_API_URL}/materias_primas`;

    const method = existingMaterial ? "PUT" : "POST";

    // Asegurarse de que el cliente_id sea un número
    const body = {
      ...formData,
      cliente_id: Number(formData.cliente_id),
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.message ||
            `Error ${response.status}: No se pudo guardar el insumo`
        );
      }

      onSave(); // Refresca la tabla en el componente padre
      onClose(); // Cierra el modal
    } catch (err: any) {
      setError(err.message);
      console.error("Error al guardar el insumo:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{existingMaterial ? "Editar Insumo" : "Nuevo Insumo"}</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="cliente_id">Cliente Propietario</label>
            <select
              id="cliente_id"
              name="cliente_id"
              value={formData.cliente_id}
              onChange={handleChange}
              required
              disabled={!!existingMaterial} // Deshabilitar al editar para no cambiar de propietario
            >
              <option value="" disabled>
                Seleccione un cliente
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre del Insumo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sku">SKU (Código)</label>
            <input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción (Opcional)</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="unidad_medida">Unidad de Medida</label>
            <select
              id="unidad_medida"
              name="unidad_medida"
              value={formData.unidad_medida}
              onChange={handleChange}
              required
            >
              <option value="unidades">Unidades</option>
              <option value="kg">Kilogramos (kg)</option>
              <option value="litros">Litros (L)</option>
              <option value="metros">Metros (m)</option>
              <option value="botellas">Botellas (u)</option>
              <option value="casquillos">Casquillos (u)</option>
              <option value="etiquetas">Etiquetas (u)</option>
            </select>
          </div>

          {error && <p className="error-message">{error}</p>}

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
              {isSubmitting ? "Guardando..." : "Guardar Insumo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RawMaterialModal;
