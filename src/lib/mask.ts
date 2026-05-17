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

export function maskPercent(value: string): string {
  const cleaned = value
    .replace(".", ",")
    .replace(/[^\d,]/g, "");

  const parts = cleaned.split(",");

  const intPart = parts[0] ?? "";
  const decPart = parts[1]?.slice(0, 2);

  const normalizedInt = intPart.replace(/^0+(?=\d)/, "");

  if (cleaned.includes(",")) {
    return `${normalizedInt || "0"},${decPart ?? ""}`;
  }

  return normalizedInt;
}
