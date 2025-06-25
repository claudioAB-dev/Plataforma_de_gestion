import React, { useState, useEffect, useCallback } from "react";
import type { Rol } from "../../types";
import RoleModal from "../components/RoleModal";
import "../styles/UserManagement.css";

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Rol | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/roles");
      if (!response.ok) throw new Error("Error al cargar los roles.");
      const data = await response.json();
      setRoles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenModal = (role: Rol | null = null) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleSave = () => {
    handleCloseModal();
    fetchRoles(); // Recargar la lista de roles
  };

  const handleDelete = async (roleId: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este rol?")) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5001/api/roles/${roleId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "No se pudo eliminar el rol.");
        }
        fetchRoles(); // Recargar la lista
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error del servidor.");
      }
    }
  };

  if (isLoading) return <p>Cargando roles...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="user-management-container">
      {isModalOpen && (
        <RoleModal
          onClose={handleCloseModal}
          onSave={handleSave}
          existingRole={editingRole}
        />
      )}
      <div className="header-actions">
        <h1>Gestión de Roles</h1>
        <button onClick={() => handleOpenModal()} className="btn-add-user">
          + Añadir Rol
        </button>
      </div>
      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Permisos (descripción)</th>
              <th>Usuarios Asignados</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((rol) => (
              <tr key={rol.id}>
                <td>{rol.id}</td>
                <td>{rol.nombre}</td>
                <td>{rol.permisos || "N/A"}</td>
                <td>{rol.user_count}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleOpenModal(rol)}
                    className="btn-edit"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(rol.id)}
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

export default RoleManagement;
