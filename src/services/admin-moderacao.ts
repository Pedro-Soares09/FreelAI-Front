import { ApiError, erroDeResposta } from "@/api/erro";
import { fetchAutenticado } from "@/api/client";
import type { components } from "@/api/schema";
import { BANIDOS_MOCK, DENUNCIAS_MOCK, DISPUTAS_MOCK } from "@/mocks/moderacao";
import { USE_MOCKS as USA_MOCKS } from "@/lib/modo";

// Fila de denúncias e disputas da administração.

export type DenunciaAdmin = components["schemas"]["DenunciaFilaAdmin"];
export type DisputaAdmin = components["schemas"]["DisputaAdminDetalhe"];
export type UsuarioBanido = components["schemas"]["UsuarioBanido"];
export type DecisaoDenuncia = "procedente" | "improcedente";
export type DecisaoDisputa = "reembolso_total" | "reembolso_parcial" | "pagamento_integral";


async function chamar<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetchAutenticado(caminho, init);
  } catch {
    throw new ApiError(0, "rede", "Não foi possível conectar ao servidor.");
  }
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

const json = (corpo: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(corpo) });

export const ROTULOS_MOTIVO: Record<string, string> = {
  comportamento_inadequado: "Comportamento inadequado",
  pagamento_fora_da_plataforma: "Pagamento fora da plataforma",
  cobranca_fora_da_plataforma: "Cobrança fora da plataforma",
  nao_compareceu: "Não compareceu",
  mensagens_ofensivas: "Mensagens ofensivas",
  servico_mal_feito: "Serviço mal feito",
  tentativas_de_contato: "Tentativas de enviar contato",
  assedio: "Assédio",
  fraude: "Fraude",
  outro: "Outro",
};

export function rotuloMotivo(motivo: string): string {
  return ROTULOS_MOTIVO[motivo] ?? motivo.replaceAll("_", " ");
}

// Dados de apoio do modo local (sem API): src/mocks/moderacao.ts.
let denunciasLocais = DENUNCIAS_MOCK as unknown as DenunciaAdmin[];
let disputasLocais = DISPUTAS_MOCK as unknown as DisputaAdmin[];

export const repositorioModeracao = {
  listarDenuncias: async (): Promise<DenunciaAdmin[]> =>
    USA_MOCKS ? denunciasLocais : chamar<DenunciaAdmin[]>("/api/v1/admin/denuncias"),

  decidirDenuncia: async (id: number, decisao: DecisaoDenuncia, motivo: string) => {
    if (USA_MOCKS) {
      denunciasLocais = denunciasLocais.map((d) =>
        d.id === id
          ? { ...d, estado: decisao, decisao_motivo: motivo, decidido_em: new Date().toISOString(), conversa_bloqueada: decisao === "procedente" }
          : d,
      );
      return;
    }
    await chamar<DenunciaAdmin>(`/api/v1/admin/denuncias/${id}/decisao`, json({ decisao, motivo }));
  },

  listarBanimentos: async (): Promise<UsuarioBanido[]> =>
    USA_MOCKS ? (BANIDOS_MOCK as unknown as UsuarioBanido[]) : chamar<UsuarioBanido[]>("/api/v1/admin/banimentos"),

  listarDisputas: async (): Promise<DisputaAdmin[]> =>
    USA_MOCKS ? disputasLocais : chamar<DisputaAdmin[]>("/api/v1/admin/disputas"),

  decidirDisputa: async (
    id: number,
    decisao: DecisaoDisputa,
    motivo: string,
    percentualProfissional?: number,
  ) => {
    if (USA_MOCKS) {
      disputasLocais = disputasLocais.map((d) =>
        d.id === id
          ? {
              ...d,
              estado: decisao,
              decisao_motivo: motivo,
              decidido_em: new Date().toISOString(),
              percentual_reembolso: decisao === "reembolso_total" ? 100 : decisao === "reembolso_parcial" ? 100 - (percentualProfissional ?? 50) : 0,
            }
          : d,
      );
      return;
    }
    await chamar<DisputaAdmin>(
      `/api/v1/admin/disputas/${id}/decisao`,
      json({
        decisao,
        motivo,
        ...(decisao === "reembolso_parcial" && percentualProfissional
          ? { percentual_profissional: percentualProfissional }
          : {}),
      }),
    );
  },
};
