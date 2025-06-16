import React, { useState } from "react";
import Modal from "./produccion/modal";
import "./placeholder_style/home.css";

const ProductionControl: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedLine, setSelectedLine] = useState("1");

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="container">
        <h1>Producción</h1>
        {/* Selector de Línea */}
        <div className="line-selector">
          <label htmlFor="line-select">Selecciona la Línea:</label>
          <select
            id="line-select"
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
          >
            <option value="1">Línea 1</option>
            <option value="2">Línea 2</option>
            <option value="3">Línea 3</option>
            <option value="4">Línea 4</option>
            <option value="5">Línea 5</option>
          </select>
        </div>
        <button onClick={handleOpenModal} className="start-button">
          Iniciar producción en Línea {selectedLine}
        </button>
        {/* Opcional: Puedes pasar la línea seleccionada al modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}></Modal>
      </div>
    </>
  );
};

export default ProductionControl;
