const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatPrecio(valor: number | { toString(): string }) {
  return currencyFormatter.format(Number(valor));
}
