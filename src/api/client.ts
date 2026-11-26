import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";
import { ApiError, erroDeResposta } from "./erro";
import {
  lerTokens,
  notificarBloqueioConta,
  notificarExpiracao,
  salvarTokens,
  type BloqueioConta,
} from "./tokens";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ROTAS_PUBLICAS = ["/api/v1/auth/login", "/api/v1/auth/registro", "/api/v1/auth/refresh"];

let renovacaoEmCurso: Promise<boolean | BloqueioConta> | null = null;

function respostaDeBloqueio(bloqueio: BloqueioConta): Response {
  return new Response(
    JSON.stringify({
      detail: {
        codigo: bloqueio.codigo,
        mensagem: bloqueio.mensagem,
        ...(bloqueio.retornoEm ? { retorno_em: bloqueio.retornoEm } : {}),
      },
    }),
    {
      status: 403,
      headers: { "Content-Type": "application/json" },
    },
  );
}

async function bloqueioDaResposta(resposta: Response): Promise<BloqueioConta | null> {
  if (!resposta.headers.get("Content-Type")?.includes("application/json")) return null;
  let corpo: unknown;
  try {
    corpo = await resposta.json();
  } catch (erro) {
    if (erro instanceof SyntaxError) return null;
    throw erro;
  }
  if (typeof corpo !== "object" || corpo === null || !("detail" in corpo)) return null;
  const detalhe = corpo.detail;
  if (typeof detalhe !== "object" || detalhe === null || !("codigo" in detalhe)) return null;
  const codigo = detalhe.codigo;
  if (codigo !== "conta_suspensa" && codigo !== "conta_banida") return null;
  const mensagem =
    "mensagem" in detalhe && typeof detalhe.mensagem === "string"
      ? detalhe.mensagem
      : codigo === "conta_suspensa"
        ? "Esta conta está suspensa."
        : "Esta conta foi banida.";
  const retornoEm =
    "retorno_em" in detalhe && typeof detalhe.retorno_em === "string"
      ? detalhe.retorno_em
      : undefined;
  return { codigo, mensagem, ...(retornoEm ? { retornoEm } : {}) };
}

/** Renova o par de tokens uma única vez, mesmo com várias chamadas falhando juntas. */
function renovar(): Promise<boolean | BloqueioConta> {
  if (renovacaoEmCurso) return renovacaoEmCurso;
  renovacaoEmCurso = (async () => {
    const tokens = lerTokens();
    if (!tokens) return false;
    try {
      const resposta = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens.refresh }),
      });
      if (!resposta.ok) {
        if (resposta.status === 403) return (await bloqueioDaResposta(resposta)) ?? false;
        return false;
      }
      const dados = (await resposta.json()) as { access_token: string; refresh_token: string };
      salvarTokens({ access: dados.access_token, refresh: dados.refresh_token });
      return true;
    } catch {
      return false;
    } finally {
      setTimeout(() => {
        renovacaoEmCurso = null;
      }, 0);
    }
  })();
  return renovacaoEmCurso;
}

function ehPublica(url: string): boolean {
  const caminho = new URL(url).pathname;
  return ROTAS_PUBLICAS.some((r) => caminho.endsWith(r));
}

const sessao: Middleware = {
  async onRequest({ request }) {
    if (!ehPublica(request.url)) {
      const tokens = lerTokens();
      if (tokens) request.headers.set("Authorization", `Bearer ${tokens.access}`);
    }
    return request;
  },
  async onResponse({ request, response }) {
    if (ehPublica(request.url)) return response;
    if (response.status === 403) {
      const bloqueio = await bloqueioDaResposta(response.clone());
      if (bloqueio) notificarBloqueioConta(bloqueio);
      return response;
    }
    if (response.status !== 401) return response;
    const renovacao = await renovar();
    if (renovacao === true) {
      const novo = lerTokens();
      const repetida = request.clone();
      if (novo) repetida.headers.set("Authorization", `Bearer ${novo.access}`);
      const segunda = await fetch(repetida);
      if (segunda.status !== 401) return segunda;
    } else if (renovacao !== false) {
      notificarBloqueioConta(renovacao);
      return respostaDeBloqueio(renovacao);
    }
    notificarExpiracao();
    return response;
  },
};

export const api = createClient<paths>({ baseUrl: BASE_URL });
api.use(sessao);

type Resultado<T> = { data?: T; error?: unknown; response: Response };

/** Devolve os dados ou lança `ApiError` com o envelope de erro da API. */
export async function chamar<T>(promessa: Promise<Resultado<T>>): Promise<T> {
  let resultado: Resultado<T>;
  try {
    resultado = await promessa;
  } catch {
    throw new ApiError(0, "rede", "Não foi possível conectar ao servidor.");
  }
  if (resultado.error !== undefined || !resultado.response.ok) {
    throw erroDeResposta(resultado.response.status, resultado.error);
  }
  return resultado.data as T;
}

/** Requisição autenticada para chamadas fora do cliente tipado, com a mesma renovação de token. */
export async function fetchAutenticado(caminho: string, init?: RequestInit): Promise<Response> {
  const montar = () => {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");
    const tokens = lerTokens();
    if (tokens) headers.set("Authorization", `Bearer ${tokens.access}`);
    return fetch(`${BASE_URL}${caminho}`, { ...init, headers });
  };

  let resposta = await montar();
  if (resposta.status === 401) {
    const renovacao = await renovar();
    if (renovacao === true) resposta = await montar();
    else if (renovacao !== false) {
      notificarBloqueioConta(renovacao);
      return respostaDeBloqueio(renovacao);
    }
    if (resposta.status === 401) notificarExpiracao();
  }
  if (resposta.status === 403) {
    const bloqueio = await bloqueioDaResposta(resposta.clone());
    if (bloqueio) notificarBloqueioConta(bloqueio);
  }
  return resposta;
}
