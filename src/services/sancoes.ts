import { ApiError, erroDeResposta } from "@/api/erro";
import { fetchAutenticado } from "@/api/client";
import type { components } from "@/api/schema";

// Situação e contestação de contas suspensas ou banidas (sem sessão), cancelamento de vaga
// e ações da administração sobre sanções.

export type SituacaoDaConta = components["schemas"]["SituacaoDaConta"];
export type PreviaCancelamento = components["schemas"]["PreviaCancelamento"];
export type RespostaCancelamento = components["schemas"]["CancelamentoResposta"];
export type ContestacaoAdmin = components["schemas"]["ContestacaoDaFila"];

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function ler<T>(resposta: Response): Promise<T> {
  if (!resposta.ok) {
    let corpo: unknown;
    try {
      corpo = await resposta.json();
    } catch {
      corpo = undefined;
    }
    throw erroDeResposta(resposta.status, corpo);
  }
  return resposta.json() as Promise<T>;
}

async function publica<T>(caminho: string, corpo: unknown): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
  } catch {
    throw new ApiError(0, "rede", "Não foi possível conectar ao servidor.");
  }
  return ler<T>(resposta);
}

async function autenticada<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetchAutenticado(caminho, init);
  } catch {
    throw new ApiError(0, "rede", "Não foi possível conectar ao servidor.");
  }
  return ler<T>(resposta);
}

export const sancoesApi = {
  situacao: (email: string, senha: string) =>
    publica<SituacaoDaConta>("/api/v1/auth/sancao", { email, senha }),

  contestar: (email: string, senha: string, texto: string) =>
    publica<SituacaoDaConta>("/api/v1/auth/contestacao", { email, senha, texto }),

  previaCancelamento: (vagaId: string) =>
    autenticada<PreviaCancelamento>(`/api/v1/vagas/${vagaId}/cancelamento`),

  cancelar: (vagaId: string, motivo: string) =>
    autenticada<RespostaCancelamento>(`/api/v1/vagas/${vagaId}/cancelamento`, {
      method: "POST",
      body: JSON.stringify({ motivo }),
    }),

  contestacoes: (estado: "abertas" | "decididas") =>
    autenticada<ContestacaoAdmin[]>(`/api/v1/admin/contestacoes?estado=${estado}`),

  decidirContestacao: (id: number, aceita: boolean, motivo: string) =>
    autenticada<ContestacaoAdmin>(`/api/v1/admin/contestacoes/${id}/decisao`, {
      method: "POST",
      body: JSON.stringify({ aceita, motivo }),
    }),
};

export function formatarDataHora(valor?: string | null): string {
  if (!valor) return "";
  return new Date(valor).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
