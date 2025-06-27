import React, { useState, useEffect } from "react";
import type { MateriaPrima } from "../../types";
import "../styles/GerenteAlmacen.css";
import "../../gerente_produccion/styles/Reportes.css"; // Estilos para tablas y feedback

const ReceptionRegistration: React.FC = () => {
  const [materiasPrimas, setMateriasPrimas] = useState<MateriaPrima[]>([]);
  const [selectedMP, setSelectedMP] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("");
  const [loteProveedor, setLoteProveedor] = useState<string>("");
  const [fechaCaducidad, setFechaCaducidad] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Carga los insumos para el menú desplegable al montar el componente
  useEffect(() => {
    const fetchMateriasPrimas = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5001/api/materias_primas"
        );
        if (!response.ok) {
          throw new Error("No se pudo cargar la lista de insumos.");
        }
        const data = await response.json();
        setMateriasPrimas(data);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error desconocido al cargar insumos.";
        setFeedback({ type: "error", message: errorMessage });
      }
    };
    fetchMateriasPrimas();
  }, []);

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // La validación se mantiene igual
    if (!selectedMP || !loteProveedor.trim() || !cantidad) {
      setFeedback({
        type: "error",
        message:
          "Por favor, complete todos los campos obligatorios: Insumo, Lote del Proveedor y Cantidad.",
      });
      return;
    }
    const parsedCantidad = parseFloat(cantidad);
    if (isNaN(parsedCantidad) || parsedCantidad <= 0) {
      setFeedback({
        type: "error",
        message: "La cantidad debe ser un número mayor que cero.",
      });
      return;
    }

    setIsLoading(true);

    // --- CAMBIO CLAVE: Construir FormData en lugar de JSON ---
    const formData = new FormData();
    formData.append("materia_prima_id", selectedMP);
    formData.append("cantidad", cantidad); // Se envía como string, el backend lo convierte a float
    formData.append("lote_proveedor", loteProveedor.trim());

    // Solo añadir la fecha si existe, para que el backend no la reciba como 'undefined' o vacía
    if (fechaCaducidad) {
      formData.append("fecha_caducidad", fechaCaducidad);
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/inventario/materia_prima/registrar_recepcion",
        {
          method: "POST",
          // SIN header 'Content-Type'. El navegador lo establece automáticamente
          // a 'multipart/form-data' con el 'boundary' correcto cuando el body es FormData.
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      setFeedback({
        type: "success",
        message: data.message || "Recepción registrada con éxito.",
      });

      // Resetear el formulario
      setSelectedMP("");
      setCantidad("");
      setLoteProveedor("");
      setFechaCaducidad("");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al registrar la recepción.";
      setFeedback({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reportes-list-container">
      <div className="ga-header">
        <h1>Registrar Recepción de Materia Prima</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="modal-form"
        style={{ maxWidth: "600px", margin: "2rem auto" }}
        noValidate // Desactiva la validación nativa para usar la nuestra
      >
        <div className="form-group">
          <label htmlFor="materiaPrima">Insumo</label>
          <select
            id="materiaPrima"
            value={selectedMP}
            onChange={(e) => setSelectedMP(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Seleccione un insumo --
            </option>
            {materiasPrimas.map((mp) => (
              <option key={mp.id} value={mp.id}>
                {mp.nombre} ({mp.sku})
              </option>
            ))}
          </select>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label htmlFor="loteProveedor">Lote del Proveedor</label>
            <input
              type="text"
              id="loteProveedor"
              value={loteProveedor}
              onChange={(e) => setLoteProveedor(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cantidad">Cantidad Recibida</label>
            <input
              type="number"
              id="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              min="0.01"
              step="any"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="fechaCaducidad">Fecha de Caducidad (Opcional)</label>
          <input
            type="date"
            id="fechaCaducidad"
            value={fechaCaducidad}
            onChange={(e) => setFechaCaducidad(e.target.value)}
            min={new Date().toISOString().split("T")[0]} // Evita seleccionar fechas pasadas
          />
        </div>

        {/* Muestra mensajes de éxito o error */}
        {feedback && (
          <div className={`feedback-message ${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <button type="submit" className="form-submit-btn" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar Entrada"}
        </button>
      </form>
    </div>
  );
};

export default ReceptionRegistration;
