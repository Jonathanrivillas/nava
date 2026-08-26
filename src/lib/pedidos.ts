export const ESTADOS = [
  "PENDIENTE",
  "CONFIRMADO",
  "EN_PREPARACION",
  "EN_CAMINO",
  "ENTREGADO",
  "CANCELADO",
] as const;

export type Estado = (typeof ESTADOS)[number];

export const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const ESTADO_BADGE_CLASS: Record<string, string> = {
  PENDIENTE: "bg-warning text-warning-foreground",
  CONFIRMADO: "bg-info text-info-foreground",
  EN_PREPARACION: "bg-info text-info-foreground",
  EN_CAMINO: "bg-info text-info-foreground",
  ENTREGADO: "bg-success text-success-foreground",
  CANCELADO: "bg-destructive text-white",
};

export const METODO_PAGO_LABEL: Record<string, string> = {
  CONTRA_ENTREGA: "Pago contra entrega",
  TRANSFERENCIA: "Transferencia bancaria",
  PASARELA_ONLINE: "Pasarela en línea",
};
