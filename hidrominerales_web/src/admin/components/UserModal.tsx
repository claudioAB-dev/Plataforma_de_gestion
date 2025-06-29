// claudioab-dev/plataforma_de_gestion/Plataforma_de_gestion-fcc48bb06575d392a80d27919f2a68d8a85432ba/hidrominerales_web/src/admin/components/UserModal.tsx

import React, { useState, useEffect } from "react";
import type { User, Rol } from "../../types";
import "../styles/UserManagement.css"; // Reutilizamos los estilos que ya tenemos

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null; // Renombrado de 'existingUser' a 'user' para consistencia
  roles: Rol[]; // Recibimos los roles como prop
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  roles,
}) => {
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [rolId, setRolId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popula el formulario cuando se abre para editar un usuario existente
  useEffect(() => {
    if (user) {
      setUsername(user.nombre);
      setNombre(user.nombre);
      setRolId(user.rol_id.toString());
      //setIsActive(user.is_active);
      setPassword(""); // Limpiamos el campo de contraseña
    } else {
      // Reseteamos el formulario para un nuevo usuario
      setUsername("");
      setNombre("");
      setPassword("");
      setRolId("");
      setIsActive(true);
    }
    setError(null); // Limpiamos errores al abrir/cambiar de usuario
  }, [user, isOpen]); // Se ejecuta cuando el usuario o la visibilidad del modal cambian

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !nombre || !rolId || (!user && !password)) {
      setError(
        "Username, nombre, rol y contraseña (para usuarios nuevos) son obligatorios."
      );
      return;
    }
    setError(null);
    setIsSubmitting(true);

    // Endpoints correctos del API de autenticación
    const url = user
      ? `http://127.0.0.1:5001/api/auth/users/${user.id}`
      : "http://127.0.0.1:5001/api/auth/users";
    const method = user ? "PUT" : "POST";

    const body: any = {
      username,
      nombre,
      rol_id: parseInt(rolId, 10),
      is_active: isActive,
    };

    // Solo incluimos la contraseña en el body si se ha escrito algo
    if (password) {
      body.password = password;
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

      onSave(); // Llama a la función para refrescar los datos en la tabla principal
      onClose(); // Cierra el modal
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
            <label htmlFor="username">Username (para iniciar sesión)</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
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
              required={!user} // La contraseña es obligatoria solo para usuarios nuevos
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
