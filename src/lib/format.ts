import { format, isValid, parseISO } from "date-fns";

export function toNumber(value: number | string): number {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function toCurrency(value: number | string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(toNumber(value));
}

export function formatDate(value: string | Date): string {
  if (!value) {
    return "";
  }

  const parsed = value instanceof Date ? value : parseISO(value);
  if (!isValid(parsed)) {
    return typeof value === "string" ? value : "";
  }

  return format(parsed, "dd/MM/yyyy");
}

export function formatDateInput(value: string | Date): string {
  if (!value) {
    return "";
  }

  const parsed = value instanceof Date ? value : parseISO(value);
  if (!isValid(parsed)) {
    return typeof value === "string" ? value : "";
  }

  return format(parsed, "yyyy-MM-dd");
}

export function parseDecimalBrazilian(value: number | string): number {
  if (typeof value === "number") {
    return value;
  }

  const normalized = String(value).trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPercent(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercentNumber(value: number, fractionDigits = 2): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}

export function formatDateWithDays(date: Date, days: number): string {
  return `${formatDate(date)} (${days} dias)`;
}
