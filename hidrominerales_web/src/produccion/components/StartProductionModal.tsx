// hidrominerales_web/src/produccion/components/StartProductionModal.tsx

import React, { useState, useEffect } from "react";
import "../styles/Modal.css";

interface Product {
  id: number;
  nombre: string;
}

interface User {
  id: number;
  nombre: string;
}

interface StartProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  lineaProduccion: number;
}

const StartProductionModal: React.FC<StartProductionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lineaProduccion,
}) => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Estados para cada campo del formulario
  const [lote, setLote] = useState("");
  const [productoId, setProductoId] = useState("");
  const [produccionObjetivo, setProduccionObjetivo] = useState("");
  const [operadorId, setOperadorId] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Cargar productos
      fetch("http://127.0.0.1:5001/api/productos")
        .then((res) => res.json())
        .then(setProductos)
        .catch((err) => console.error("Error fetching productos:", err));

      // Cargar usuarios
      fetch("http://127.0.0.1:5001/api/users")
        .then((res) => res.json())
        .then(setUsers)
        .catch((err) => console.error("Error fetching users:", err));

      // Resetear formulario al abrir
      setLote("");
      setProductoId("");
      setProduccionObjetivo("");
      setOperadorId("");
      setResponsableId("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !lote ||
      !productoId ||
      !produccionObjetivo ||
      !operadorId ||
      !responsableId
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const newReportData = {
      linea_produccion: lineaProduccion,
      lote,
      producto_id: parseInt(productoId),
      produccion_objetivo: parseInt(produccionObjetivo),
      operador_engargolado_id: parseInt(operadorId),
      responsable_linea_id: parseInt(responsableId),
    };

    try {
      const response = await fetch("http://127.0.0.1:5001/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al iniciar la producción");
      }

      onSave(); // Llama a la función del padre para refrescar y cerrar
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error(err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Iniciar Reporte en Línea {lineaProduccion}</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-grid-col-2">
              <div className="form-group">
                <label htmlFor="lote">Lote de Producción</label>
                <input
                  type="text"
                  id="lote"
                  value={lote}
                  onChange={(e) => setLote(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="produccion_objetivo">
                  Meta de Producción (uds)
                </label>
                <input
                  type="number"
                  id="produccion_objetivo"
                  value={produccionObjetivo}
                  onChange={(e) => setProduccionObjetivo(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="producto_id">Producto</label>
              <select
                id="producto_id"
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Seleccione un producto...
                </option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-grid-col-2">
              <div className="form-group">
                <label htmlFor="operador_id">Operador de Engargolado</label>
                <select
                  id="operador_id"
                  value={operadorId}
                  onChange={(e) => setOperadorId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Seleccione un operador...
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="responsable_id">Responsable de Línea</label>
                <select
                  id="responsable_id"
                  value={responsableId}
                  onChange={(e) => setResponsableId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Seleccione un responsable...
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Iniciar Producción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartProductionModal;
