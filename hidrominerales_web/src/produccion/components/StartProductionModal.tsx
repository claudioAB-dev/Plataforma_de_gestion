import React, { useState, useEffect } from "react";
import "../styles/Modal.css";

interface StartProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  linea: number;
}

const StartProductionModal: React.FC<StartProductionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  linea,
}) => {
  const [productos, setProductos] = useState<{ id: number; nombre: string }[]>(
    []
  );
  const [users, setUsers] = useState<{ id: number; nombre: string }[]>([]);
  const [horaInicio, setHoraInicio] = useState("");

  useEffect(() => {
    // Cuando el modal se abre, se fija la hora de inicio
    if (isOpen) {
      setHoraInicio(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }

    // Simulación de fetch para llenar los selectores
    setProductos([
      { id: 1, nombre: "Felix Peticote 355 ml" },
      { id: 2, nombre: "Agua Mineral 600ml" },
      { id: 3, nombre: "Otro Producto" },
    ]);
    setUsers([
      { id: 1, nombre: "Angel" },
      { id: 2, nombre: "Guadalupe M." },
      { id: 3, nombre: "Erick" },
      { id: 4, nombre: "Carolina" },
    ]);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      producto_nombre: formData.get("producto_id")
        ? productos.find(
            (p) => p.id === parseInt(formData.get("producto_id") as string)
          )?.nombre
        : "",
      operador_engargolado: formData.get("operador_engargolado_id")
        ? users.find(
            (u) =>
              u.id ===
              parseInt(formData.get("operador_engargolado_id") as string)
          )?.nombre
        : "",
      responsable_linea: formData.get("responsable_linea_id")
        ? users.find(
            (u) =>
              u.id === parseInt(formData.get("responsable_linea_id") as string)
          )?.nombre
        : "",
      lote: formData.get("lote"),
      turno: formData.get("turno"),
      hora_arranque: horaInicio,
      linea,
    };
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Iniciar Producción en Línea {linea}</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="turno">Turno</label>
                <select id="turno" name="turno" required>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="hora_inicio">Hora de Inicio</label>
                <input
                  type="text"
                  id="hora_inicio"
                  name="hora_inicio"
                  value={horaInicio}
                  disabled
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="producto_id">Producto y Presentación</label>
              <select id="producto_id" name="producto_id" required>
                <option value="">Seleccione un producto...</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="lote">Lote de Caducidad</label>
              <input
                type="text"
                id="lote"
                name="lote"
                required
                defaultValue="CPREFDIC 26 L160.25"
              />
            </div>

            <div className="form-group">
              <label htmlFor="produccion_objetivo">
                Producción Objetivo (botellas)
              </label>
              <input
                type="number"
                id="produccion_objetivo"
                name="produccion_objetivo"
                required
                defaultValue="15000"
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="operador_engargolado_id">
                  Operador de Engargolado
                </label>
                <select
                  id="operador_engargolado_id"
                  name="operador_engargolado_id"
                  required
                >
                  <option value="">Seleccione un operador...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="responsable_linea_id">
                  Responsable de Línea
                </label>
                <select
                  id="responsable_linea_id"
                  name="responsable_linea_id"
                  required
                >
                  <option value="">Seleccione un responsable...</option>
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
