import React, { useState, useEffect } from "react";
import type { Rol } from "../../types";
import "../../gerente_produccion/styles/Modal.css";

interface RoleModalProps {
  onClose: () => void;
  onSave: () => void;
  existingRole: Rol | null;
}

const RoleModal: React.FC<RoleModalProps> = ({
  onClose,
  onSave,
  existingRole,
}) => {
  const [nombre, setNombre] = useState("");
  const [permisos, setPermisos] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingRole) {
      setNombre(existingRole.nombre);
      setPermisos(existingRole.permisos || "");
    }
  }, [existingRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) {
      setError("El nombre del rol es obligatorio.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const url = existingRole
      ? `http://127.0.0.1:5001/api/roles/${existingRole.id}`
      : "http://127.0.0.1:5001/api/roles";
    const method = existingRole ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, permisos }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar el rol.");
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{existingRole ? "Editar Rol" : "Crear Nuevo Rol"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Rol</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="permisos">Descripción / Permisos</label>
            <input
              id="permisos"
              type="text"
              value={permisos}
              onChange={(e) => setPermisos(e.target.value)}
              placeholder="Ej: Acceso total al sistema"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Rol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleModal;
