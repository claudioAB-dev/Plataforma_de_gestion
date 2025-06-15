import React, { useState } from "react";
import "./placeholder_style/home.css"; // Se asume que el CSS del ejemplo anterior se mantiene

// 1. Definimos una interfaz para las props del componente.
// Esto permite un tipado fuerte para los datos que el componente recibe.
interface ProductionControlProps {
  initialOee: number;
  orderId: string;
  productName: string;
  productDetails: string[];
  palletOptions: string[];
}

// 2. Usamos React.FC<ProductionControlProps> para tipar el componente funcional.
const ProductionControl: React.FC<ProductionControlProps> = ({
  initialOee,
  orderId,
  productName,
  productDetails,
  palletOptions,
}) => {
  // 3. Manejo de estado para la interactividad del componente.
  const [oee, setOee] = useState<number>(initialOee);
  const [isProductionStopped, setIsProductionStopped] =
    useState<boolean>(false);
  const [registerPalletActive, setRegisterPalletActive] =
    useState<boolean>(false);
  const [selectedPallet, setSelectedPallet] = useState<string>(
    palletOptions[0] || ""
  );

  // 4. Manejadores de eventos para responder a las acciones del usuario.
  const handleToggleProduction = () => {
    setIsProductionStopped(!isProductionStopped);
    // Aquí iría la lógica para comunicarse con el backend (API call)
    console.log(
      `Estado de producción cambiado a: ${
        !isProductionStopped ? "Detenido" : "Iniciado"
      }`
    );
  };

  const handleRegisterPallet = () => {
    if (!registerPalletActive || !selectedPallet) {
      alert("Por favor, active el registro y seleccione un tipo de pallet.");
      return;
    }
    // Lógica para registrar el pallet
    console.log(`Registrando pallet: ${selectedPallet}`);
    alert(`Pallet '${selectedPallet}' registrado exitosamente.`);
  };

  return (
    <div className="production-container">
      <div className="header">
        <h1>Producción</h1>
      </div>

      <div className="main-content">
        <div className="oee-indicator">
          <div className="circular-progress">
            {/* El valor del OEE ahora viene del estado */}
            <span className="oee-value">{oee}%</span>
            <span className="sub-text">OEE</span>
          </div>
        </div>

        <div className="production-details">
          <h2>Detalles de Producción</h2>
          <p className="order-info">
            <strong>Orden:</strong> {orderId}
          </p>
          <p className="product-name">
            <strong>Producto:</strong> {productName}
          </p>
          {/* 5. Renderizado dinámico de una lista de elementos */}
          {productDetails.map((detail, index) => (
            <p key={index} className="additional-info">
              {detail}
            </p>
          ))}

          <div className="register-pallet-section">
            <div className="register-pallet-toggle">
              <input
                type="checkbox"
                id="registerPallet"
                checked={registerPalletActive}
                onChange={(e) => setRegisterPalletActive(e.target.checked)}
              />
              <label htmlFor="registerPallet">Activar Registro de Pallet</label>
            </div>
            {/* El dropdown se muestra solo si el checkbox está activo */}
            {registerPalletActive && (
              <div className="dropdown-container">
                <select
                  value={selectedPallet}
                  onChange={(e) => setSelectedPallet(e.target.value)}
                >
                  <option value="" disabled>
                    Seleccione un pallet...
                  </option>
                  {/* Renderizado dinámico de las opciones */}
                  {palletOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          className="register-button"
          onClick={handleRegisterPallet}
          disabled={!registerPalletActive} // El botón se deshabilita si no está activo el registro
        >
          Registrar Pallet
        </button>
        <button
          className={`start-stop-button ${
            isProductionStopped ? "is-stopped" : ""
          }`}
          onClick={handleToggleProduction}
        >
          {/* 6. Renderizado condicional del texto del botón */}
          {isProductionStopped ? "Reanudar Producción" : "Iniciar Paro"}
        </button>
      </div>
    </div>
  );
};

export default ProductionControl;
