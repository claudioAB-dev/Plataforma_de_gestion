import React, { useState, useEffect, useCallback } from "react";
import StartProductionModal from "../components/StartProductionModal";
import RegisterPalletModal from "../components/RegisterPalletModal";
import LineStoppageModal from "../components/LineStoppageModal";
import RegisterMermaModal, {
  type MermaData as MermaFormData, // Renombramos para claridad
} from "../components/RegisterMermaModal";
import "../styles/ProduccionDashboard.css";
import ProgressChart from "../components/ProgressChart";

// Asumimos un valor constante, idealmente vendría del producto en la API
const BOTELLAS_POR_CHAROLA = 60;

// --- Interfaces actualizadas para coincidir con models.py ---

interface Producto {
  id: number;
  nombre: string;
  presentacion: string;
  sku: string;
  charolas_por_tarima: number;
  activo: boolean;
}

interface Pallet {
  id: number;
  numero_pallet: number;
  cantidad_charolas: number;
  hora_registro: string;
}

interface Paro {
  id: number;
  duracion_minutos: number;
  descripcion_motivo: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Merma {
  id: number;
  tipo_merma: string; // El Enum de Python se serializa como string
  cantidad: number;
}

interface ReporteProduccion {
  id: number;
  lote: string;
  produccion_objetivo: number;
  producto: Producto;
  pallets: Pallet[];
  paros: Paro[];
  mermas: Merma[]; // Ahora es una lista
  estado: "En Proceso" | "Terminado" | "Cancelado";
  hora_arranque: string;
  // Los campos de usuario ahora son IDs, no se mostrarán directamente en este componente
  operador_engargolado_id: number;
  responsable_linea_id: number;
}

const Home: React.FC<{ selectedLine: number }> = ({ selectedLine }) => {
  // El estado ahora puede ser un reporte en cualquier estado, o null.
  const [latestReport, setLatestReport] = useState<ReporteProduccion | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Estados para los modales
  const [showStartModal, setShowStartModal] = useState(false);
  const [showPalletModal, setShowPalletModal] = useState(false);
  const [showStoppageModal, setShowStoppageModal] = useState(false);
  const [showMermaModal, setShowMermaModal] = useState(false);

  /**
   * Carga el reporte más reciente para la línea seleccionada, sin importar el estado.
   */
  const fetchLatestReportForLine = useCallback(async (line: number) => {
    setLoading(true);
    try {
      // Se quita el filtro `&estado=En Proceso` para obtener el más reciente
      const response = await fetch(
        `http://127.0.0.1:5001/api/reportes?linea=${line}`
      );
      if (!response.ok) throw new Error("Error al buscar reportes");

      const reports = (await response.json()) as ReporteProduccion[];
      // La API ya devuelve los reportes ordenados por ID descendente, tomamos el primero
      setLatestReport(reports.length > 0 ? reports[0] : null);
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar la información de la línea.");
      setLatestReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga el reporte cuando la línea seleccionada cambia
  useEffect(() => {
    fetchLatestReportForLine(selectedLine);
  }, [selectedLine, fetchLatestReportForLine]);

  // --- Funciones para manejar las acciones de los modales ---

  const handleCreateReport = () => {
    // Esta función se pasa al modal de inicio. Cuando tiene éxito, refresca los datos.
    fetchLatestReportForLine(selectedLine);
    setShowStartModal(false);
  };

  const handleRegisterPallet = async (data: {
    cantidad_charolas: number;
    hora_registro: string;
  }) => {
    if (!latestReport) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:5001/api/reportes/${latestReport.id}/pallets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            numero_pallet: latestReport.pallets.length + 1,
          }),
        }
      );
      if (!response.ok) throw new Error("Error al registrar el pallet.");
      setShowPalletModal(false);
      fetchLatestReportForLine(selectedLine); // Refrescar datos
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error desconocido.");
    }
  };

  const handleRegisterStoppage = async (data: {
    descripcion: string;
    duracion: number;
    hora_inicio: string;
  }) => {
    if (!latestReport) return;
    try {
      const payload = {
        descripcion_motivo: data.descripcion,
        duracion_minutos: data.duracion,
        hora_inicio: data.hora_inicio,
      };
      const response = await fetch(
        `http://127.0.0.1:5001/api/reportes/${latestReport.id}/paros`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Error al registrar el paro.");
      setShowStoppageModal(false);
      fetchLatestReportForLine(selectedLine); // Refrescar datos
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error desconocido.");
    }
  };

  const handleRegisterMerma = async (formData: MermaFormData) => {
    if (!latestReport) return;

    // Mapeo del formulario a los tipos de merma de la API
    const mermaMap = {
      tapa_operador: "Tapa/casquillo operador",
      tapa_equipo: "Tapa/casquillo equipo",
      tapa_muestreo: "Tapa/casquillo muestreo",
      botella_muestreo: "Botella muestreo",
      // 'merma_botella' no existe en el Enum del backend y se omite.
    };

    const requests = Object.entries(mermaMap)
      .map(([key, tipo_merma]) => {
        const cantidad = formData[key as keyof MermaFormData];
        if (cantidad > 0) {
          return fetch(
            `http://127.0.0.1:5001/api/reportes/${latestReport.id}/mermas`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tipo_merma, cantidad }),
            }
          );
        }
        return null;
      })
      .filter(Boolean);

    try {
      const responses = await Promise.all(requests);
      responses.forEach((res) => {
        if (res && !res.ok)
          throw new Error("Una o más mermas no se pudieron registrar.");
      });
      setShowMermaModal(false);
      fetchLatestReportForLine(selectedLine);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error al guardar merma.");
    }
  };

  const handleFinishProduction = async () => {
    if (!latestReport) return;
    if (
      window.confirm("¿Estás seguro de que deseas finalizar la producción?")
    ) {
      try {
        const response = await fetch(
          `http://127.0.0.1:5001/api/reportes/${latestReport.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "Terminado" }),
          }
        );
        if (!response.ok) throw new Error("Error al finalizar la producción");
        fetchLatestReportForLine(selectedLine); // Refrescar para ver el estado "Terminado"
      } catch (error) {
        console.error(error);
        alert("Hubo un error al finalizar la producción.");
      }
    }
  };

  // --- Cálculos de Progreso ---
  const totalCharolas =
    latestReport?.pallets.reduce((sum, p) => sum + p.cantidad_charolas, 0) || 0;
  const botellasProducidas = totalCharolas * BOTELLAS_POR_CHAROLA;
  const isReportFinished = latestReport?.estado === "Terminado";

  // --- Datos para el modal de merma ---
  const currentMermaForModal: MermaFormData = {
    tapa_operador: 0,
    tapa_equipo: 0,
    tapa_muestreo: 0,
    botella_muestreo: 0,
    merma_botella: 0, // No se usa en el backend, pero se mantiene para la interfaz
  };
  if (latestReport) {
    latestReport.mermas.forEach((m) => {
      if (m.tipo_merma === "Tapa/casquillo operador")
        currentMermaForModal.tapa_operador = m.cantidad;
      if (m.tipo_merma === "Tapa/casquillo equipo")
        currentMermaForModal.tapa_equipo = m.cantidad;
      if (m.tipo_merma === "Tapa/casquillo muestreo")
        currentMermaForModal.tapa_muestreo = m.cantidad;
      if (m.tipo_merma === "Botella muestreo")
        currentMermaForModal.botella_muestreo = m.cantidad;
    });
  }

  if (loading) {
    return (
      <div className="loading-container">
        Cargando información de la línea {selectedLine}...
      </div>
    );
  }

  return (
    <>
      <StartProductionModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onSave={handleCreateReport}
        lineaProduccion={selectedLine}
      />
      {latestReport && (
        <>
          <RegisterPalletModal
            isOpen={showPalletModal}
            onClose={() => setShowPalletModal(false)}
            onSave={handleRegisterPallet}
            nextPalletNumber={(latestReport?.pallets.length || 0) + 1}
          />
          <LineStoppageModal
            isOpen={showStoppageModal}
            onClose={() => setShowStoppageModal(false)}
            onSave={handleRegisterStoppage}
          />
          <RegisterMermaModal
            isOpen={showMermaModal}
            onClose={() => setShowMermaModal(false)}
            onSave={handleRegisterMerma}
            currentMerma={currentMermaForModal}
          />
        </>
      )}

      {!latestReport ? (
        <div className="start-production-container">
          <h2>Línea {selectedLine} - Inactiva</h2>
          <p>No hay reportes de producción para esta línea.</p>
          <button
            className="btn-start-production"
            onClick={() => setShowStartModal(true)}
          >
            Iniciar Reporte de Producción
          </button>
        </div>
      ) : (
        <div className="dashboard-container">
          <header className="dashboard-header">
            <div>
              <h1>Reporte de Producción: Línea {selectedLine}</h1>
              <p>
                <strong>Producto:</strong> {latestReport.producto?.nombre} |
                <strong> Lote:</strong> {latestReport.lote}
              </p>
              <p className="subtitle">
                <strong>Hora Inicio:</strong> {latestReport.hora_arranque} |
                <strong> Estado: </strong>
                <span
                  style={{
                    color: isReportFinished ? "#28a745" : "#ffc107",
                    fontWeight: "bold",
                  }}
                >
                  {latestReport.estado}
                </span>
              </p>
            </div>
            <button
              className="btn-finish-production"
              onClick={handleFinishProduction}
              disabled={isReportFinished}
            >
              {isReportFinished
                ? "Producción Finalizada"
                : "Finalizar Producción"}
            </button>
          </header>

          <div className="dashboard-grid dashboard-grid-with-progress">
            <div className="dashboard-card progress-card">
              <h3>Progreso del Turno</h3>
              <ProgressChart
                progress={botellasProducidas}
                target={latestReport.produccion_objetivo || 0}
              />
            </div>

            <div className="dashboard-card">
              <h3>Producto Terminado</h3>
              <button
                className="btn-action"
                onClick={() => setShowPalletModal(true)}
                disabled={isReportFinished}
              >
                Registrar Pallet
              </button>
            </div>
            <div className="dashboard-card">
              <h3>Paros de Línea</h3>
              <button
                className="btn-action btn-stop"
                onClick={() => setShowStoppageModal(true)}
                disabled={isReportFinished}
              >
                Registrar Paro
              </button>
            </div>
            <div className="dashboard-card">
              <h3>Merma</h3>
              <button
                className="btn-action btn-merma"
                onClick={() => setShowMermaModal(true)}
                disabled={isReportFinished}
              >
                Actualizar Merma
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
