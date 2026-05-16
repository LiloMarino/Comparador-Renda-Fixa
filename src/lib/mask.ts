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
  const cleaned = value.replace(/[^\d,]/g, "").replace(/^,+/, "");
  const [intPart = "", ...rest] = cleaned.split(",");
  const decPart = rest.join("").slice(0, 2);

  if (!intPart && !decPart) {
    return "";
  }

  const hasComma = cleaned.includes(",");
  const formatted = hasComma ? `${intPart || "0"},${decPart}` : intPart;

  return `${formatted}%`;
}
