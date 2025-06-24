import React, { useState, useEffect, useCallback } from "react";
import CreateProductModal from "../components/CreateProductModal";
import "../styles/GerenteProduccion.css";
import "../styles/Reportes.css";
interface Producto {
  id: number;
  nombre: string;
  presentacion: string;
  sku: string;
  activo: boolean;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/productos"); // Usamos un nuevo endpoint para ver todos
      if (!response.ok) {
        throw new Error("No se pudo obtener la lista de productos");
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleStatus = async (product: Producto) => {
    const newStatus = !product.activo;
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/productos/${product.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...product, activo: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del producto.");
      }
      // Actualiza la lista para reflejar el cambio
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al cambiar estado");
    }
  };

  const handleSave = () => {
    setIsModalOpen(false);
    fetchProducts();
  };

  if (isLoading) return <p>Cargando productos...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div className="product-management-container">
      <div className="pm-header">
        <h2>Gestión de Productos</h2>
        <button className="pm-create-btn" onClick={() => setIsModalOpen(true)}>
          + Crear Nuevo Producto
        </button>
      </div>

      {isModalOpen && (
        <CreateProductModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <table className="pm-product-list">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Presentación</th>
            <th>SKU</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td data-label="Nombre">{product.nombre}</td>
              <td data-label="Presentación">{product.presentacion}</td>
              <td data-label="SKU">{product.sku}</td>
              <td data-label="Estado">
                <span style={{ color: product.activo ? "green" : "gray" }}>
                  {product.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td data-label="Acción">
                <button
                  onClick={() => handleToggleStatus(product)}
                  className={`pm-status-toggle ${
                    product.activo ? "inactive" : "active"
                  }`}
                >
                  {product.activo ? "Desactivar" : "Activar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManagement;
