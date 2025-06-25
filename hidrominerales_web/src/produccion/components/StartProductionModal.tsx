import React, { useState, useEffect } from "react";
import "../styles/ProduccionModal.css";

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
  const [lote, setLote] = useState("");
  const [productoId, setProductoId] = useState("");
  const [turno, setTurno] = useState("");
  const [produccionObjetivo, setProduccionObjetivo] = useState("");
  const [operadorId, setOperadorId] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchInitialData = async () => {
        try {
          const [productsRes, usersRes] = await Promise.all([
            fetch("http://127.0.0.1:5001/api/productos"),
            fetch("http://127.0.0.1:5001/api/users"),
          ]);
          if (!productsRes.ok || !usersRes.ok)
            throw new Error("Error al cargar datos iniciales");
          const productsData = await productsRes.json();
          const usersData = await usersRes.json();
          setProductos(productsData);
          setUsers(usersData);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      };
      fetchInitialData();
      // Resetear estado
      setLote("");
      setTurno("");
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
      !turno ||
      !lote ||
      !productoId ||
      !produccionObjetivo ||
      !operadorId ||
      !responsableId
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const newReportData = {
      turno: turno,
      linea_produccion: String(lineaProduccion),
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
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error del servidor.");
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
            <h2>Iniciar Reporte en Línea {lineaProduccion}</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}
            <div className="form-grid-2">
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
                <label htmlFor="turno">Turno</label>
                <select
                  id="turno"
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Seleccione un turno...
                  </option>
                  <option value="1">Matutino</option>
                  <option value="2">Vespertino</option>
                  <option value="3">Nocturno</option>
                </select>
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
            <div className="form-grid-2">
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
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Iniciar Producción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartProductionModal;
