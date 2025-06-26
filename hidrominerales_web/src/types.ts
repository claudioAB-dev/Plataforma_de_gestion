// Interfaz para el modelo Rol
export interface Rol {
  id: number;
  nombre: string;
  permisos: string | null;
  user_count?: number; // Opcional, desde la serialización
}

// Actualizamos la interfaz de User para que sea más completa
export interface User {
  id: number;
  nombre: string;
  rol_id: number;
  rol_nombre: string | null; // El nombre del rol puede venir en la serialización
}

// Interfaz corregida para coincidir con el to_dict() del modelo Producto
export interface Producto {
  id: number;
  nombre: string;
  presentacion: string;
  sku: string;
  co2_nominal: number | null; // Añadimos el nuevo campo
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

export interface ControlCalidadProceso {
  id: number;
  reporte_id: number;
  hora_medicion: string | null;
  olor: string | null;
  sabor: string | null;
  lampara_uv: boolean | null;
  fugas: string | null;
  rosca: string | null;
  faldon: string | null;
  inversion: string | null;
  tq1: number | null;
  tq2: number | null;
  tq3: number | null;
  media: number | null;
  presion: number | null;
  temperatura: number | null;
  vol_co2: number | null;
  saturador: number | null;
  inspector_id: number;
  inspector_nombre: string | null;
}

export interface InspeccionSelloLateral {
  id: number;
  reporte_id: number;
  hora_medicion: string | null;
  profundidad_superior_1: number | null;
  profundidad_superior_2: number | null;
  profundidad_superior_3: number | null;
  profundidad_superior_4: number | null;
  sello_lateral_1: number | null;
  sello_lateral_2: number | null;
  sello_lateral_3: number | null;
  sello_lateral_4: number | null;
  realizo_id: number;
  realizo_nombre: string | null;
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
  controles_calidad?: ControlCalidadProceso[];
  inspecciones_sello?: InspeccionSelloLateral[];
}

export interface User {
  id: number;
  nombre: string;
  rol_id: number;
  rol_nombre: string | null;
}
