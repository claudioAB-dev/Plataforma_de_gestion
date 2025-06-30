import React, { useState, useEffect, useCallback } from "react";
import UserModal from "../components/UserModal";
import "../styles/UserManagement.css";
import type { User, Rol } from "../../types";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Hacemos ambas peticiones en paralelo para mayor eficiencia
      const [usersResponse, rolesResponse] = await Promise.all([
        fetch("http://127.0.0.1:5001/api/users"),
        fetch("http://127.0.0.1:5001/api/roles"),
      ]);

      if (!usersResponse.ok) {
        throw new Error("Error al obtener los usuarios del servidor.");
      }
      if (!rolesResponse.ok) {
        throw new Error("Error al obtener los roles del servidor.");
      }

      const usersData = await usersResponse.json();
      const rolesData = await rolesResponse.json();

      setUsers(usersData);
      setRoles(rolesData); // Guardamos los roles en el estado
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lógica para abrir y cerrar el modal
  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = () => {
    handleCloseModal();
    fetchData(); // Recargar la lista de usuarios después de guardar
  };

  // Lógica para eliminar un usuario
  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5001/api/users/${userId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("No se pudo eliminar el usuario.");
        }
        fetchData(); // Recargar la lista
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error del servidor.");
      }
    }
  };

  if (isLoading) {
    return <div>Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="user-management-container">
      {/* Renderizado condicional del modal con las props correctas */}
      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          user={editingUser} // Pasa el usuario a editar (o null si es nuevo)
          roles={roles} // Pasa la lista de roles
          existingUser={null}
        />
      )}

      <div className="header-actions">
        <h1>Gestión de Usuarios</h1>
        <button onClick={() => handleOpenModal()} className="btn-add-user">
          + Añadir Usuario
        </button>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nombre}</td>
                <td>
                  <span className={`role-badge role-${user.rol_id}`}>
                    {user.rol_nombre || "No asignado"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="btn-edit"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn-delete"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
