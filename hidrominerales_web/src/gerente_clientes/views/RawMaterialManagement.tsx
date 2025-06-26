import React, { useState, useEffect, useCallback } from "react";
import type { MateriaPrima, Cliente } from "../../types";
import RawMaterialModal from "../components/RawMaterialModal";
import "../../gerente_produccion/styles/Reportes.css";

const RawMaterialManagement: React.FC = () => {
  const [materials, setMaterials] = useState<MateriaPrima[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MateriaPrima | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la lista de clientes para poblar el filtro desplegable.
   */
  const fetchClients = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/clientes`);
      if (!response.ok) {
        throw new Error("No se pudo cargar la lista de clientes.");
      }
      const data: Cliente[] = await response.json();
      setClients(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error al obtener clientes:", err);
    }
  }, []);

  /**
   * Obtiene la lista de materias primas, opcionalmente filtrada por cliente.
   */
  const fetchMaterials = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    let url = `${import.meta.env.VITE_API_URL}/materias_primas`;
    if (selectedClient) {
      url += `?cliente_id=${selectedClient}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: No se pudo obtener la lista de insumos.`
        );
      }
      const data: MateriaPrima[] = await response.json();
      setMaterials(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Error al obtener insumos:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient]);

  // Efecto para cargar los datos iniciales
  useEffect(() => {
    fetchClients();
    fetchMaterials();
  }, [fetchClients, fetchMaterials]);

  const handleOpenModal = (material: MateriaPrima | null = null) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleCloseModalAndRefresh = () => {
    setIsModalOpen(false);
    fetchMaterials();
  };

  // Función para obtener el nombre del cliente a partir de su ID
  const getClientName = (clientId: number): string => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.nombre : "Desconocido";
  };

  // Placeholder para la función de borrado
  const handleDeleteMaterial = (materialId: number) => {
    console.log("Desactivar material con ID:", materialId);
    // Aquí iría la lógica fetch con método DELETE
    // fetch(`${import.meta.env.VITE_API_URL}/materias_primas/${materialId}`, { method: 'DELETE' })
    //   .then(() => fetchMaterials());
    alert("Funcionalidad de desactivar pendiente de implementación en API.");
  };

  return (
    <div className="reportes-list-container">
      {isModalOpen && (
        <RawMaterialModal
          clients={clients}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCloseModalAndRefresh}
          existingMaterial={editingMaterial}
        />
      )}
      <div className="pm-header">
        <h1>Catálogo de Insumos por Cliente</h1>
        <button className="pm-create-btn" onClick={() => handleOpenModal()}>
          + Nuevo Insumo
        </button>
      </div>

      <div className="filters-bar">
        <label htmlFor="client-filter">Filtrar por Cliente:</label>
        <select
          id="client-filter"
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
        >
          <option value="">Todos los Clientes</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
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
              <th>Nombre del Insumo</th>
              <th>SKU</th>
              <th>Cliente Propietario</th>
              <th>Unidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>Cargando insumos...</td>
              </tr>
            ) : materials.length > 0 ? (
              materials.map((material) => (
                <tr key={material.id}>
                  <td>{material.nombre}</td>
                  <td>{material.sku}</td>
                  <td>{getClientName(material.cliente_id)}</td>
                  <td>{material.unidad_medida}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenModal(material)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteMaterial(material.id)}
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  No hay insumos para mostrar. Pruebe con otro filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RawMaterialManagement;
