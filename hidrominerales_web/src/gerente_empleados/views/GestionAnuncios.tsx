import React, { useState, useEffect, useCallback } from "react";
import type { Anuncio } from "../../types";
import AnuncioModal from "../components/AnuncioModal";
// Reutilizamos estilos
import "../../gerente_produccion/styles/Reportes.css";

const GestionAnuncios: React.FC = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);

  const fetchAllAnuncios = useCallback(async () => {
    setIsLoading(true);
    const response = await fetch("http://127.0.0.1:5001/api/anuncios/todos");
    const data = await response.json();
    setAnuncios(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllAnuncios();
  }, [fetchAllAnuncios]);

  const handleOpenModal = (anuncio: Anuncio | null = null) => {
    setSelectedAnuncio(anuncio);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnuncio(null);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este anuncio?")) {
      await fetch(`http://127.0.0.1:5001/api/anuncios/${id}`, {
        method: "DELETE",
      });
      fetchAllAnuncios();
    }
  };

  return (
    <div className="reportes-list-container">
      {isModalOpen && (
        <AnuncioModal
          onClose={handleCloseModal}
          onSave={fetchAllAnuncios}
          anuncio={selectedAnuncio}
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Gestionar Anuncios</h1>
        <button onClick={() => handleOpenModal()}>Crear Nuevo Anuncio</button>
      </div>
      <div className="table-responsive">
        <table className="reportes-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Publicado</th>
              <th>Expira</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>Cargando...</td>
              </tr>
            ) : (
              anuncios.map((a) => (
                <tr key={a.id}>
                  <td>{a.titulo}</td>
                  <td>{a.autor_nombre}</td>
                  <td>{new Date(a.timestamp).toLocaleDateString("es-MX")}</td>
                  <td>
                    {a.fecha_expiracion
                      ? new Date(a.fecha_expiracion).toLocaleDateString(
                          "es-MX",
                          { timeZone: "UTC" }
                        )
                      : "No expira"}
                  </td>
                  <td>
                    <button onClick={() => handleOpenModal(a)}>Editar</button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      style={{ marginLeft: "8px", background: "#dc3545" }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionAnuncios;
