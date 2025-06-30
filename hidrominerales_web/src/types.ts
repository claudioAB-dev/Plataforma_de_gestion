export type EstadoSolicitud = "Pendiente" | "Aprobado" | "Rechazado";

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
  cliente_id: number;
  nombre: string;
  presentacion: string;
  sku: string;
  co2_nominal: number | null; // Añadimos el nuevo campo
  activo: boolean;
}

// Interfaz corregida para coincidir con el to_dict() del modelo PalletTerminado
export interface PalletTerminado {
  id: number;
  cliente_id: number;
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
  cliente_id: ReporteProduccion | null;
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
export interface Cliente {
  id: number;
  nombre: string;
  rfc: string | null;
  datos_contacto: string | null;
  activo: boolean;
}

// Interfaz para el modelo MateriaPrima
export interface MateriaPrima {
  cliente_nombre: string;
  id: number;
  cliente_id: number;
  nombre: string;
  sku: string;
  descripcion: string | null;
  unidad_medida: string;
}

// Interfaz para el inventario de Materia Prima
export interface InventarioMateriaPrima {
  fecha_recepcion: string | number | Date;
  materia_prima: any;
  id: number;
  materia_prima_nombre: string;
  cliente_nombre: string;
  ubicacion_codigo: string;
  lote_proveedor: string;
  cantidad_actual: number;
  fecha_caducidad: string | null;
}
// --- Interfaces para el Módulo de Gerente de Clientes ---

export interface Cliente {
  id: number;
  nombre: string;
  rfc: string | null;
  datos_contacto: string | null;
  activo: boolean;
}

export interface MateriaPrima {
  id: number;
  cliente_id: number;
  nombre: string;
  sku: string;
  descripcion: string | null;
  unidad_medida: string;
}

// --- Interfaces para el Dashboard de Inventario ---

/**
 * Representa un lote de materia prima en el inventario.
 */
export interface InventarioMateriaPrima {
  id: number;
  // Asumo que la API puede devolver estos campos directamente
  materia_prima_nombre: string;
  lote_proveedor: string;
  cantidad_actual: number;
  unidad_medida: string;
  fecha_caducidad: string | null;
}

/**
 * Representa un pallet de producto terminado en el inventario.
 */
export interface PalletTerminado {
  id: number;
  // Asumo una estructura similar para el producto terminado
  producto_nombre: string;
  lote_produccion: string;
  cantidad_cajas: number;
  ubicacion_codigo: string | null;
}
// --- Interfaces para el Dashboard de Inventario Consolidado (Gerente de Almacén) ---
export interface InventarioMateriaPrimaConsolidado {
  nombre: string;
  sku: string;
  unidad_medida: string;
  stock_total: number;
}

export interface InventarioProductoTerminadoConsolidado {
  nombre: string;
  sku: string;
  pallets_totales: number;
  charolas_totales: number;
}
export interface MovimientoInventario {
  id: number;
  materia_prima_nombre: string | null;
  user_nombre: string | null;
  tipo_movimiento: string;
  cantidad: number;
  timestamp: string;
  // Añadir otros campos del modelo si se necesitaran en el frontend
}
export interface SolicitudFalta {
  id: number;
  user_id: number;
  solicitante_nombre: string;
  fecha_solicitud: string;
  motivo: string;
  estado: EstadoSolicitud;
  revisado_por_nombre: string | null;
  fecha_revision: string | null;
  comentario_gerente: string | null;
  timestamp: string;
}
