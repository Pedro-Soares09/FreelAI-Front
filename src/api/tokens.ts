const CHAVE = "freelai-tokens";
export const COOKIE_SESSAO = "freelai-sessao";

export type Tokens = { access: string; refresh: string };

type Ouvinte = () => void;
const ouvintesExpiracao = new Set<Ouvinte>();

export function lerTokens(): Tokens | null {
  if (typeof window === "undefined") return null;
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    const dados = JSON.parse(bruto) as Partial<Tokens>;
    if (typeof dados.access === "string" && typeof dados.refresh === "string") {
      return { access: dados.access, refresh: dados.refresh };
    }
  } catch {
    /* armazenamento indisponível ou conteúdo inválido */
  }
  return null;
}

function marcarCookie(ativo: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = ativo
    ? `${COOKIE_SESSAO}=1; path=/; SameSite=Lax`
    : `${COOKIE_SESSAO}=; path=/; max-age=0; SameSite=Lax`;
}

export function salvarTokens(tokens: Tokens) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(tokens));
  } catch {
    /* sem persistência: a sessão vale apenas até recarregar */
  }
  marcarCookie(true);
}

export function limparTokens() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* ignora */
  }
  marcarCookie(false);
}

export function aoExpirarSessao(ouvinte: Ouvinte): () => void {
  ouvintesExpiracao.add(ouvinte);
  return () => ouvintesExpiracao.delete(ouvinte);
}

export function notificarExpiracao() {
  limparTokens();
  ouvintesExpiracao.forEach((o) => o());
}
