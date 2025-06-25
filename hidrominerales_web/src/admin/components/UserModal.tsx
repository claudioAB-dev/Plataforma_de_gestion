import React, { useState, useEffect } from "react";
import type { User, Rol } from "../../types";
import "../../gerente_produccion/styles/Modal.css";

interface UserModalProps {
  onClose: () => void;
  onSave: () => void;
  existingUser: User | null;
}

const UserModal: React.FC<UserModalProps> = ({
  onClose,
  onSave,
  existingUser,
}) => {
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rolId, setRolId] = useState<string>("");
  const [roles, setRoles] = useState<Rol[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Cargar roles disponibles
    const fetchRoles = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5001/api/roles");
        if (!res.ok) throw new Error("No se pudieron cargar los roles.");
        setRoles(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar roles.");
      }
    };
    fetchRoles();

    if (existingUser) {
      setNombre(existingUser.nombre);
      setRolId(String(existingUser.rol_id));
    }
  }, [existingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !rolId || (!existingUser && !contrasena)) {
      setError(
        "Nombre, rol y contraseña (para usuarios nuevos) son obligatorios."
      );
      return;
    }
    setError(null);
    setIsSubmitting(true);

    const url = existingUser
      ? `http://127.0.0.1:5001/api/users/${existingUser.id}`
      : "http://127.0.0.1:5001/api/users";
    const method = existingUser ? "PUT" : "POST";

    const body: any = { nombre, rol_id: parseInt(rolId) };
    if (contrasena) {
      body.contrasena = contrasena;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{existingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre de Usuario</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder={
                existingUser ? "Dejar en blanco para no cambiar" : ""
              }
              required={!existingUser}
            />
          </div>
          <div className="form-group">
            <label htmlFor="rol">Rol</label>
            <select
              id="rol"
              value={rolId}
              onChange={(e) => setRolId(e.target.value)}
              required
            >
              <option value="" disabled>
                Seleccione un rol...
              </option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
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
              {isSubmitting ? "Guardando..." : "Guardar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
