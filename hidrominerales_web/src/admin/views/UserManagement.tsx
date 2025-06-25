import React, { useState, useEffect, useCallback } from "react";
import type { User } from "../../types";
import UserModal from "../components/UserModal"; // <-- 1. Importar el modal
import "../styles/UserManagement.css";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersResponse = await fetch("http://127.0.0.1:5001/api/users");
      if (!usersResponse.ok) {
        throw new Error("Error al obtener los usuarios del servidor.");
      }
      const usersData = await usersResponse.json();
      setUsers(usersData);
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

  // --- 2. Lógica para abrir y cerrar el modal ---
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
    fetchData(); // Recargar la lista de usuarios
  };

  // --- 3. Lógica para eliminar ---
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
      {/* 4. Renderizar el modal condicionalmente */}
      {isModalOpen && (
        <UserModal
          onClose={handleCloseModal}
          onSave={handleSave}
          existingUser={editingUser}
        />
      )}

      <div className="header-actions">
        <h1>Gestión de Usuarios</h1>
        {/* Actualizar onClick para abrir el modal */}
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
                  {/* Actualizar onClick para editar */}
                  <button
                    onClick={() => handleOpenModal(user)}
                    className="btn-edit"
                  >
                    Editar
                  </button>
                  {/* Actualizar onClick para eliminar */}
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
