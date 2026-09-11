type OfertaProducto = {
  tipo: "PORCENTAJE" | "MONTO_FIJO";
  valor: unknown;
  fechaInicio: Date;
  fechaFin: Date;
};

export function getOfertaActiva(ofertas: OfertaProducto[], ahora = new Date()) {
  return ofertas.find((o) => o.fechaInicio <= ahora && o.fechaFin >= ahora) ?? null;
}

export function calcularPrecioFinal(precioVenta: unknown, oferta: OfertaProducto | null) {
  const base = Number(precioVenta);
  if (!oferta) return base;

  const valor = Number(oferta.valor);
  if (oferta.tipo === "PORCENTAJE") {
    return Math.round(base * (1 - valor / 100));
  }
  return Math.max(0, base - valor);
}
