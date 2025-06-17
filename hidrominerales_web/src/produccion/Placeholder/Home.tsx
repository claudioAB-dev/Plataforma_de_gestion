import React, { useState, useEffect } from "react";
import StartProductionModal from "../components/StartProductionModal";
import RegisterPalletModal from "../components/RegisterPalletModal";
import LineStoppageModal from "../components/LineStoppageModal";
import RegisterMermaModal, {
  type MermaData,
} from "../components/RegisterMermaModal";
import "../styles/ProduccionDashboard.css";
import ProgressChart from "../components/ProgressChart"; // <-- IMPORTAR LA GRÁFICA

// --- SIMULACIÓN DE API ---
const BOTELLAS_POR_CHAROLA = 60; // Asumimos 60 botellas por charola según el reporte
const fetchActiveReportForLine = async (line: number): Promise<any | null> => {
  console.log(`Buscando reporte activo para la línea ${line}...`);
  // Línea 2 tiene un reporte activo para fines de demostración
  if (line === 2) {
    return {
      id: 7,
      producto_nombre: "Felix Peticote 355 ml",
      lote: "CPREFDIC 26 L160.25",
      hora_arranque: "12:13",
      operador_engargolado: "Angel",
      responsable_linea: "Guadalupe M.",
      produccion_objetivo: 20000,
      pallets: [
        {
          id: 1,
          numero_pallet: 1,
          cantidad_charolas: 60,
          hora_registro: "13:01",
        },
        {
          id: 2,
          numero_pallet: 2,
          cantidad_charolas: 60,
          hora_registro: "13:42",
        },
      ],
      stoppages: [
        { id: 1, descripcion: "Comida", duracion: 30, hora_inicio: "15:04" },
      ],
      merma: {
        tapa_operador: 119,
        tapa_equipo: 40,
        tapa_muestreo: 65,
        botella_muestreo: 0,
        merma_botella: 12,
      },
    };
  }
  return null;
};

// --- DEFINICIÓN DE TIPOS ---
interface HomeProps {
  selectedLine: number;
}
interface Pallet {
  id: number;
  numero_pallet: number;
  cantidad_charolas: number;
  hora_registro: string;
}
interface Stoppage {
  id: number;
  descripcion: string;
  duracion: number;
  hora_inicio: string;
}

const Home: React.FC<HomeProps> = ({ selectedLine }) => {
  // --- ESTADOS DEL COMPONENTE ---
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);
  const [isStoppageModalOpen, setIsStoppageModalOpen] = useState(false);
  const [isMermaModalOpen, setIsMermaModalOpen] = useState(false);
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [stoppages, setStoppages] = useState<Stoppage[]>([]);

  // --- EFECTOS ---
  useEffect(() => {
    setIsLoading(true);
    fetchActiveReportForLine(selectedLine)
      .then((report) => {
        const initialMerma = report?.merma || {
          tapa_operador: 0,
          tapa_equipo: 0,
          tapa_muestreo: 0,
          botella_muestreo: 0,
          merma_botella: 0,
        };
        setActiveReport(report ? { ...report, merma: initialMerma } : null);
        setPallets(report?.pallets || []);
        setStoppages(report?.stoppages || []);
      })
      .finally(() => setIsLoading(false));
  }, [selectedLine]);

  // --- MANEJADORES DE EVENTOS ---
  const handleSaveProduction = (data: any) => {
    // Aseguramos que el objetivo se guarde como número
    const newReport = {
      id: Math.floor(Math.random() * 100),
      ...data,
      produccion_objetivo: parseInt(data.produccion_objetivo),
    };
    setActiveReport(newReport);
    setPallets([]);
    setStoppages([]);
    setIsStartModalOpen(false);
  };

  const handleSavePallet = (data: {
    cantidad_charolas: number;
    hora_registro: string;
  }) => {
    const newPallet: Pallet = {
      id: Math.floor(Math.random() * 1000),
      numero_pallet: pallets.length + 1,
      cantidad_charolas: data.cantidad_charolas,
      hora_registro: data.hora_registro,
    };
    setPallets((prev) => [...prev, newPallet]);
    setIsPalletModalOpen(false);
  };

  const handleSaveStoppage = (data: Omit<Stoppage, "id">) => {
    const newStoppage: Stoppage = {
      id: Math.floor(Math.random() * 1000),
      ...data,
    };
    setStoppages((prev) => [...prev, newStoppage]);
    setIsStoppageModalOpen(false);
  };

  const handleSaveMerma = (data: MermaData) => {
    setActiveReport((prev: any) => ({ ...prev, merma: data }));
    setIsMermaModalOpen(false);
  };

  // --- CÁLCULO DE PROGRESO ---
  const totalCharolas = pallets.reduce(
    (sum, p) => sum + p.cantidad_charolas,
    0
  );
  const botellasProducidas = totalCharolas * BOTELLAS_POR_CHAROLA;

  // --- RENDERIZADO ---
  if (isLoading) {
    return (
      <div className="loading-container">
        Cargando datos para la línea {selectedLine}...
      </div>
    );
  }

  return (
    <>
      {/* Renderizado de todos los modales */}
      <StartProductionModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onSave={handleSaveProduction}
        linea={selectedLine}
      />
      <RegisterPalletModal
        isOpen={isPalletModalOpen}
        onClose={() => setIsPalletModalOpen(false)}
        onSave={handleSavePallet}
        nextPalletNumber={pallets.length + 1}
      />
      <LineStoppageModal
        isOpen={isStoppageModalOpen}
        onClose={() => setIsStoppageModalOpen(false)}
        onSave={handleSaveStoppage}
      />
      {activeReport && (
        <RegisterMermaModal
          isOpen={isMermaModalOpen}
          onClose={() => setIsMermaModalOpen(false)}
          onSave={handleSaveMerma}
          currentMerma={activeReport.merma}
        />
      )}

      {/* Operador ternario para mostrar vista activa o inactiva */}
      {!activeReport ? (
        <div className="start-production-container">
          <h2>Línea {selectedLine} - Inactiva</h2>
          <p>No hay una producción activa en esta línea.</p>
          <button
            className="btn-start-production"
            onClick={() => setIsStartModalOpen(true)}
          >
            Iniciar Reporte de Producción
          </button>
        </div>
      ) : (
        <div className="dashboard-container">
          <header className="dashboard-header">
            <div>
              <h1>Reporte Activo: Línea {selectedLine}</h1>
              <p>
                <strong>Producto:</strong> {activeReport.producto_nombre} |{" "}
                <strong>Lote:</strong> {activeReport.lote}
              </p>
              <p className="subtitle">
                <strong>Hora Inicio:</strong> {activeReport.hora_arranque} |{" "}
                <strong>Operador:</strong> {activeReport.operador_engargolado} |{" "}
                <strong>Responsable:</strong> {activeReport.responsable_linea}
              </p>
            </div>
            <button className="btn-finish-production">
              Finalizar Producción
            </button>
          </header>
          <div className="dashboard-grid dashboard-grid-with-progress">
            <div className="dashboard-card progress-card">
              <h3>Progreso del Turno</h3>
              <ProgressChart
                progress={botellasProducidas}
                target={activeReport.produccion_objetivo || 0}
              />
            </div>
            <div className="dashboard-card">
              <h3>Producto Terminado</h3>
              <p>Registra los pallets conforme se completan.</p>
              <button
                className="btn-action"
                onClick={() => setIsPalletModalOpen(true)}
              >
                Registrar Pallet
              </button>
              <div className="log-list-container">
                {pallets.length === 0 ? (
                  <p className="log-list-empty">
                    Aún no hay pallets registrados.
                  </p>
                ) : (
                  <ul className="log-list">
                    {[...pallets].reverse().map((p) => (
                      <li key={p.id} className="log-list-item">
                        <span>
                          <strong>Pallet #{p.numero_pallet}</strong> (
                          {p.cantidad_charolas} charolas)
                        </span>
                        <span className="log-time">{p.hora_registro}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="dashboard-card">
              <h3>Paros de Línea</h3>
              <p>Registra las interrupciones del proceso.</p>
              <button
                className="btn-action btn-stop"
                onClick={() => setIsStoppageModalOpen(true)}
              >
                Iniciar Paro
              </button>
              <div className="log-list-container">
                {stoppages.length === 0 ? (
                  <p className="log-list-empty">
                    Aún no hay paros registrados.
                  </p>
                ) : (
                  <ul className="log-list">
                    {[...stoppages].reverse().map((s) => (
                      <li key={s.id} className="log-list-item">
                        <span>
                          <strong>{s.descripcion}</strong> ({s.duracion} min)
                        </span>
                        <span className="log-time">{s.hora_inicio}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="dashboard-card">
              <h3>Merma</h3>
              <div className="merma-display">
                <div className="merma-item">
                  <span>Tapa / Casquillo:</span>
                  <span>
                    {activeReport.merma.tapa_operador +
                      activeReport.merma.tapa_equipo +
                      activeReport.merma.tapa_muestreo}
                  </span>
                </div>
                <div className="merma-item">
                  <span>Botella:</span>
                  <span>
                    {activeReport.merma.botella_muestreo +
                      activeReport.merma.merma_botella}
                  </span>
                </div>
              </div>
              <button
                className="btn-action btn-merma"
                onClick={() => setIsMermaModalOpen(true)}
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
