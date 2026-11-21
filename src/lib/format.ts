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

// ===== Chat, acordo e pós-serviço (Pessoa 5) =====

/** "14:22" */
export function formatTime(iso: string, locale = "pt-BR"): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Lista de conversas: hora se for hoje, "Ontem", ou "12/11". */
export function formatChatDate(
  iso: string,
  now = new Date(),
  locale = "pt-BR",
): string {
  const date = new Date(iso);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) return formatTime(iso, locale);
  if (date >= startOfYesterday) return "Ontem";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

/** "16/11 às 18:00" */
export function formatDateTime(iso: string, locale = "pt-BR"): string {
  const date = new Date(iso);
  const day = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
  return `${day} às ${formatTime(iso, locale)}`;
}

/** 48128 → "47 KB" ; 2621440 → "2,5 MB" */
export function formatFileSize(bytes: number, locale = "pt-BR"): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toLocaleString(locale, { maximumFractionDigits: 1 })} MB`;
}
