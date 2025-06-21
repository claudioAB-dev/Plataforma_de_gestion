import React, { useState } from "react";
import "../styles/Modal.css";

export interface MermaData {
  "Tapa/casquillo operador": number;
  "Tapa/casquillo equipo": number;
  "Tapa/casquillo muestreo": number;
  "Botella muestreo": number;
}

interface RegisterMermaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  reporteId: number;
  currentMerma: any; // Se simplifica para este ejemplo
}

const RegisterMermaModal: React.FC<RegisterMermaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reporteId,
}) => {
  const [mermaState, setMermaState] = useState<MermaData>({
    "Tapa/casquillo operador": 0,
    "Tapa/casquillo equipo": 0,
    "Tapa/casquillo muestreo": 0,
    "Botella muestreo": 0,
  });

  const handleInputChange = (tipo: keyof MermaData, valor: string) => {
    setMermaState((prev) => ({ ...prev, [tipo]: parseInt(valor) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requests = Object.entries(mermaState)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([tipo_merma, cantidad]) =>
        fetch(`http://127.0.0.1:5001/api/reportes/${reporteId}/mermas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tipo_merma, cantidad }),
        })
      );

    try {
      const responses = await Promise.all(requests);
      const hasError = responses.some((res) => !res.ok);
      if (hasError)
        throw new Error("Una o más mermas no se pudieron registrar.");

      onSave();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Registrar / Actualizar Merma</h2>
            <button type="button" onClick={onClose} className="modal-close-btn">
              &times;
            </button>
          </div>
          <div className="modal-body">
            <h4>Tapa / Casquillo Generado</h4>
            <div className="form-grid-3">
              <div className="form-group">
                <label>Por Operador</label>
                <input
                  type="number"
                  value={mermaState["Tapa/casquillo operador"]}
                  onChange={(e) =>
                    handleInputChange("Tapa/casquillo operador", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Por Equipo</label>
                <input
                  type="number"
                  value={mermaState["Tapa/casquillo equipo"]}
                  onChange={(e) =>
                    handleInputChange("Tapa/casquillo equipo", e.target.value)
                  }
                />
              </div>
              <div className="form-group">
                <label>Por Muestreo</label>
                <input
                  type="number"
                  value={mermaState["Tapa/casquillo muestreo"]}
                  onChange={(e) =>
                    handleInputChange("Tapa/casquillo muestreo", e.target.value)
                  }
                />
              </div>
            </div>
            <h4>Botella / Botellón</h4>
            <div className="form-group">
              <label>Generada por Muestreo</label>
              <input
                type="number"
                value={mermaState["Botella muestreo"]}
                onChange={(e) =>
                  handleInputChange("Botella muestreo", e.target.value)
                }
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar Merma
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMermaModal;
