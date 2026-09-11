const GRADIENTES = [
  "from-[oklch(94%_0.03_40)] to-[oklch(90%_0.04_30)]",
  "from-[oklch(93%_0.03_60)] to-[oklch(88%_0.04_50)]",
  "from-[oklch(92%_0.05_20)] to-[oklch(87%_0.06_15)]",
];

export function gradienteFor(id: string) {
  const index = id.charCodeAt(0) % GRADIENTES.length;
  return GRADIENTES[index];
}
