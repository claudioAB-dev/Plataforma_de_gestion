import React, { useState } from "react";
import type { Anuncio } from "../../types";
import { useAuth } from "../../context/AuthContext";
// Reutilizamos estilos del modal de Gerente de Producción
import "../../gerente_produccion/styles/Modal.css";

interface AnuncioModalProps {
  onClose: () => void;
  onSave: () => void;
  anuncio: Anuncio | null;
}

const AnuncioModal: React.FC<AnuncioModalProps> = ({
  onClose,
  onSave,
  anuncio,
}) => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState(anuncio?.titulo || "");
  const [contenido, setContenido] = useState(anuncio?.contenido || "");
  const [fechaExp, setFechaExp] = useState(
    anuncio?.fecha_expiracion?.split("T")[0] || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const url = anuncio
      ? `http://127.0.0.1:5001/api/anuncios/${anuncio.id}`
      : "http://127.0.0.1:5001/api/anuncios";

    const method = anuncio ? "PUT" : "POST";

    const body = {
      titulo,
      contenido,
      user_id: user.id,
      fecha_expiracion: fechaExp || null,
    };

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{anuncio ? "Editar" : "Crear"} Anuncio</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contenido">Contenido</label>
            <textarea
              id="contenido"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fecha_exp">Fecha de Expiración (Opcional)</label>
            <input
              id="fecha_exp"
              type="date"
              value={fechaExp}
              onChange={(e) => setFechaExp(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
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

export default AnuncioModal;
