import React, { useState, useEffect } from "react";
import type { Cliente } from "../../types";
import "../../gerente_produccion/styles/Modal.css";

interface ClientModalProps {
  onClose: () => void;
  onSave: (client: Cliente) => void;
  existingClient: Cliente | null;
}

const ClientModal: React.FC<ClientModalProps> = ({
  onClose,
  onSave,
  existingClient,
}) => {
  const [nombre, setNombre] = useState("");
  const [rfc, setRfc] = useState("");
  const [datosContacto, setDatosContacto] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingClient) {
      setNombre(existingClient.nombre);
      setRfc(existingClient.rfc || "");
      setDatosContacto(existingClient.datos_contacto || "");
    }
  }, [existingClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }
    setError(null);

    const clientData = {
      id: existingClient?.id || 0,
      nombre,
      rfc,
      datos_contacto: datosContacto,
      activo: true, // Siempre se guarda como activo
    };

    const url = existingClient
      ? `${import.meta.env.VITE_API_URL}/clientes/${existingClient.id}`
      : `${import.meta.env.VITE_API_URL}/clientes`;

    const method = existingClient ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Error al guardar el cliente");
      }

      const savedClient = await response.json();
      onSave(savedClient);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{existingClient ? "Editar Cliente" : "Nuevo Cliente"}</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Cliente</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="rfc">RFC</label>
            <input
              id="rfc"
              type="text"
              value={rfc}
              onChange={(e) => setRfc(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="datosContacto">Datos de Contacto</label>
            <textarea
              id="datosContacto"
              value={datosContacto}
              onChange={(e) => setDatosContacto(e.target.value)}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
