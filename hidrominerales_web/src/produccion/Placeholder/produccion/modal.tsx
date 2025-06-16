import React from "react";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const today = new Date().toISOString().split("T")[0];

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí puedes capturar y procesar los datos del formulario.
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    console.log("Datos del formulario:", data);

    alert("Cuestionario enviado. Revisa la consola para ver los datos.");
    onClose(); // Cierra el modal después de enviar
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <div className="modal-header">
          <h3 className="modal-title">Cuestionario de Arranque</h3>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form className="questionnaire-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="codigo">Código</label>
              <input type="text" id="codigo" name="codigo" required />
            </div>

            <div className="form-group">
              <label htmlFor="fecha">Fecha</label>
              <input type="date" id="fecha" name="fecha" defaultValue={today} />
            </div>

            <div className="form-group">
              <label htmlFor="turno">Turno</label>
              <select id="turno" name="turno" defaultValue="primero">
                <option value="primero">Primero</option>
                <option value="segundo">Segundo</option>
                <option value="tercero">Tercero</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="producto">Producto y Presentación</label>
              <input type="text" id="producto" name="producto" required />
            </div>

            <div className="form-group">
              <label htmlFor="horaArranque">Hora de Arranque</label>
              <input
                type="time"
                id="horaArranque"
                name="horaArranque"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="operador">Operador Engargolado</label>
              <input type="text" id="operador" name="operador" required />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-button">
                Cancelar
              </button>
              <button type="submit" className="submit-button">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modal;
