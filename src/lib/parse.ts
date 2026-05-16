export function parseLocaleNumber(value: string): number {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(/[^\d,]/g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}
