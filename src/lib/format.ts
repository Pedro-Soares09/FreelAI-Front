export function formatCurrency(
  amount: number,
  currency = "BRL",
  locale = "pt-BR",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
