export function maskOnlyNumbers(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskCurrency(value: string): string {
  const digits = maskOnlyNumbers(value);
  if (!digits) {
    return "";
  }

  const centsValue = Number(digits) / 100;

  return centsValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function maskCurrencyToNumber(value: string): number {
  const digits = maskOnlyNumbers(value);
  if (!digits) {
    return 0;
  }

  return Number(digits) / 100;
}

export function maskInteger(value: string): string {
  let cleaned = value.replace(/[^\d-]/g, "");
  if (cleaned.includes("-")) {
    cleaned = cleaned.replace(/(?!^)-/g, "");
  }
  return cleaned;
}

export function maskPositiveInteger(value: string): string {
  return maskOnlyNumbers(value);
}

export function maskPositiveDecimal(
  value: string,
  options: { scale?: number } = {},
): string {
  const scale = options.scale ?? 6;

  const cleaned = value.replace(/[^\d.,]/g, "").replace(/\./g, ",");

  const hasTrailingComma = cleaned.endsWith(",");

  const [intPartRaw = "", ...rest] = cleaned.split(",");

  const intPart = intPartRaw || "0";

  const fraction = rest.join("").slice(0, scale);

  if (hasTrailingComma && fraction.length === 0) {
    return `${intPart},`;
  }

  return fraction ? `${intPart},${fraction}` : intPart;
}

export function normalizeDecimalInput(value: string): string {
  if (!value) {
    return "0";
  }

  const cleaned = value.replace(/[^\d.,]/g, "").replace(/\./g, ",");
  const [intPartRaw = "", ...rest] = cleaned.split(",");
  const intPart = intPartRaw || "0";
  const fraction = rest.join("");

  return fraction ? `${intPart}.${fraction}` : intPart;
}
