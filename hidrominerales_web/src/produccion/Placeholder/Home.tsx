import React, { useState, useEffect } from "react";
import ProduccionModal from "../Placeholder/produccion/modal";
import "../Placeholder/placeholder_style/ProduccionView.css"; // Reutilizamos estilos de tabla

// Tipos para los datos de la API
interface Producto {
  id: number;
  nombre: string;
}

interface ReporteProduccion {
  id: number;
  fecha: string;
  cantidad_producida: number;
  merma: number;
  observaciones: string;
  producto_id: number;
  producto_nombre: string;
}

const ProduccionView: React.FC = () => {
  const [reportes, setReportes] = useState<ReporteProduccion[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reportesRes, productosRes] = await Promise.all([
        fetch("http://127.0.0.1:5001/api/reportes/produccion"),
        fetch("http://127.0.0.1:5001/api/productos"),
      ]);
      const reportesData = await reportesRes.json();
      const productosData = await productosRes.json();
      setReportes(reportesData);
      setProductos(productosData);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveReporte = async (
    reporteData: Omit<ReporteProduccion, "id" | "fecha" | "producto_nombre">
  ) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5001/api/reportes/produccion",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reporteData),
        }
      );
      if (!response.ok) {
        throw new Error("Error al guardar el reporte");
      }
      setIsModalOpen(false);
      fetchData(); // Recargar datos
    } catch (error) {
      console.error("Fallo al crear reporte:", error);
    }
  };

  if (isLoading) {
    return <div>Cargando datos de producción...</div>;
  }

  return (
    <div className="produccion-view-container">
      <div className="header-actions">
        <h1>Reportes de Producción</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-add">
          + Registrar Producción
        </button>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Reporte</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Cantidad Producida</th>
              <th>Merma</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte) => (
              <tr key={reporte.id}>
                <td>{reporte.id}</td>
                <td>{new Date(reporte.fecha).toLocaleDateString()}</td>
                <td>{reporte.producto_nombre}</td>
                <td>{reporte.cantidad_producida}</td>
                <td>{reporte.merma}</td>
                <td>{reporte.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <ProduccionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveReporte}
          productos={productos}
        />
      )}
    </div>
  );
};

export default ProduccionView;
