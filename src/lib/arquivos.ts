const BASE_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Torna absoluta a URL de arquivo devolvida pela API (ex.: /api/v1/arquivos/foto/x.jpg). */
export function urlDoArquivo(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (/^(https?:|blob:|data:)/.test(url)) return url;
  return `${BASE_API.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}
