import React, { useState, useEffect } from "react";
import type { User, Rol } from "../../types";
import "../styles/UserManagement.css";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null;
  roles: Rol[];
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  roles,
}) => {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre);
      setRolId(user.rol_id.toString());
      setIsActive(user.is_active ?? true);
      setPassword("");
    } else {
      setNombre("");
      setPassword("");
      setRolId("");
      setIsActive(true);
    }
    setError(null);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !rolId || (!user && !password)) {
      setError(
        "Nombre, rol y contraseña (para usuarios nuevos) son obligatorios."
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const url = user
      ? `http://127.0.0.1:5001/api/users/${user.id}`
      : "http://127.0.0.1:5001/api/users";
    const method = user ? "PUT" : "POST";

    const body: any = {
      nombre,
      rol_id: parseInt(rolId, 10),
      is_active: isActive,
    };

    if (password) {
      body.contrasena = password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar el usuario.");
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="nombre">Nombre de Usuario</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={user ? "Dejar en blanco para no cambiar" : ""}
              required={!user}
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="rol">Rol</label>
            <select
              id="rol"
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Seleccione un rol...
              </option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id.toString()}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group form-group-checkbox">
            <label htmlFor="is_active">Usuario Activo</label>
            <input
              id="is_active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isSubmitting}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
