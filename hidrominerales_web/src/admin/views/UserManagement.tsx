import React, { useState, useEffect } from "react";
import "../styles/UserManagement.css";

// Definimos los tipos para mayor claridad
interface User {
  id: number;
  nombre: string;
  rol_id: number;
  rol_nombre: string;
}

interface Rol {
  id: number;
  nombre: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener usuarios y roles de la API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const usersResponse = await fetch("http://127.0.0.1:5001/api/users");
      const rolesResponse = await fetch("http://127.0.0.1:5001/api/roles");

      if (!usersResponse.ok || !rolesResponse.ok) {
        throw new Error("Error al obtener los datos del servidor.");
      }

      const usersData = await usersResponse.json();
      const rolesData = await rolesResponse.json();

      setUsers(usersData);
      setRoles(rolesData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para cargar los datos cuando el componente se monta
  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = () => {
    // Aquí abrirías un modal para añadir un nuevo usuario
    alert("Funcionalidad para añadir usuario (próximamente).");
  };

  const handleEditUser = (user: User) => {
    // Aquí abrirías un modal para editar el usuario seleccionado
    alert(`Editar usuario: ${user.nombre}`);
  };

  const handleDeleteUser = (userId: number) => {
    // Lógica para borrar usuario (requiere endpoint en la API)
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      alert(
        `Eliminar usuario con ID: ${userId} (requiere implementación en API).`
      );
      // Lógica de DELETE a /api/users/${userId}
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
      <div className="header-actions">
        <h1>Gestión de Usuarios</h1>
        <button onClick={handleAddUser} className="btn-add-user">
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
                    onClick={() => handleEditUser(user)}
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
