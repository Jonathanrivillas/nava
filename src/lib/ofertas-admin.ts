export type EstadoOferta = "PROGRAMADA" | "ACTIVA" | "EXPIRADA";

export function getEstadoOferta(fechaInicio: Date, fechaFin: Date, ahora = new Date()): EstadoOferta {
  if (ahora < fechaInicio) return "PROGRAMADA";
  if (ahora > fechaFin) return "EXPIRADA";
  return "ACTIVA";
}

export const ESTADO_OFERTA_LABEL: Record<EstadoOferta, string> = {
  PROGRAMADA: "Programada",
  ACTIVA: "Activa",
  EXPIRADA: "Expirada",
};

export const ESTADO_OFERTA_BADGE_CLASS: Record<EstadoOferta, string> = {
  PROGRAMADA: "bg-info text-info-foreground",
  ACTIVA: "bg-success text-success-foreground",
  EXPIRADA: "bg-muted text-muted-foreground",
};
