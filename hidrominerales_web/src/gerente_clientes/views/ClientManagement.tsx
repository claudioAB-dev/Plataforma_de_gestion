import React, { useState, useEffect, useCallback } from "react";
import type { Cliente } from "../../types";
import ClientModal from "../components/ClientModal";
import "../styles/GerenteCliente.css"; // Estilos generales
import "../../gerente_produccion/styles/Reportes.css"; // Reutilizamos estilos de tabla
const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);

  /**
   * Obtiene los datos de los clientes desde la API y actualiza el estado.
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clientes`);
      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudo obtener la lista de clientes.`
        );
      }
      const data: Cliente[] = await response.json();
      setClients(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error al obtener datos de clientes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Abre el modal para crear un nuevo cliente o editar uno existente.
   * @param client El cliente a editar, o null para crear uno nuevo.
   */
  const handleOpenModal = (client: Cliente | null = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  /**
   * Cierra el modal y refresca la lista de clientes si se guardó algo.
   */
  const handleCloseModalAndRefresh = () => {
    setIsModalOpen(false);
    fetchData();
  };

  /**
   * Maneja el borrado lógico de un cliente.
   * @param clientId El ID del cliente a desactivar.
   */
  const handleDeleteClient = async (clientId: number) => {
    // Aquí se podría implementar un modal de confirmación personalizado.
    // Por simplicidad, se ejecuta la acción directamente.
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/clientes/${clientId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("No se pudo desactivar el cliente.");
      }
      // Refrescar la lista para que el cliente desactivado desaparezca.
      fetchData();
    } catch (err: any) {
      setError(err.message);
      console.error("Error al desactivar el cliente:", err);
    }
  };

  return (
    <div className="reportes-list-container">
      {isModalOpen && (
        <ClientModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleCloseModalAndRefresh}
          existingClient={editingClient}
        />
      )}
      <div className="pm-header">
        <h1>Maestro de Clientes</h1>
        <button className="pm-create-btn" onClick={() => handleOpenModal()}>
          + Nuevo Cliente
        </button>
      </div>

      {error && (
        <p className="error-message" style={{ margin: "1rem" }}>
          Error: {error}
        </p>
      )}

      <div className="table-responsive">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RFC</th>
              <th>Datos de Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4}>Cargando clientes...</td>
              </tr>
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.nombre}</td>
                  <td>{client.rfc || "N/A"}</td>
                  <td>{client.datos_contacto || "N/A"}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenModal(client)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No hay clientes para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientManagement;
