// Interfaz corregida para coincidir con el to_dict() del modelo Producto
export interface Producto {
  id: number;
  nombre: string;
  presentacion: string;
  sku: string;
  activo: boolean;
}

// Interfaz corregida para coincidir con el to_dict() del modelo PalletTerminado
export interface PalletTerminado {
  id: number;
  reporte_id: number;
  numero_pallet: number;
  cantidad_charolas: number; // Propiedad que faltaba
  hora_registro: string;
}

// Interfaz corregida para coincidir con el to_dict() del modelo ParoLinea
export interface ParoLinea {
  id: number;
  reporte_id: number;
  hora_inicio: string | null;
  hora_fin: string | null;
  duracion_minutos: number;
  descripcion_motivo: string;
}

// Interfaz corregida para coincidir con el to_dict() del modelo Merma
export interface Merma {
  id: number;
  reporte_id: number;
  tipo_merma: string;
  cantidad: number;
}

// Interfaz principal corregida para coincidir con el to_dict() del modelo ReporteProduccion
export interface ReporteProduccion {
  id: number; // Corregido de 'id_reporte'
  turno: number;
  fecha_produccion: string;
  linea: string; // Corregido de 'linea_produccion'
  producto_id: number;
  lote: string;
  produccion_objetivo: number; // Corregido de 'meta_produccion'
  hora_arranque: string; // Corregido de 'hora_inicio'
  hora_termino: string | null;
  estado: "En Proceso" | "Terminado" | "Cancelado";

  // Relaciones
  producto: Producto | null; // El producto puede ser nulo si no se carga la relación
  pallets?: PalletTerminado[];
  paros?: ParoLinea[];
  mermas?: Merma[];
}

export interface User {
  id: number;
  nombre: string;
  rol_id: number;
  rol_nombre: string | null;
}
