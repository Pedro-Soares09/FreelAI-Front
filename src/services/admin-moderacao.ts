import { ApiError, erroDeResposta } from "@/api/erro";
import { fetchAutenticado } from "@/api/client";
import type { components } from "@/api/schema";

// Fila de denúncias e disputas da administração.

export type DenunciaAdmin = components["schemas"]["DenunciaFilaAdmin"];
export type DisputaAdmin = components["schemas"]["DisputaAdminDetalhe"];
export type UsuarioBanido = components["schemas"]["UsuarioBanido"];
export type DecisaoDenuncia = "procedente" | "improcedente";
export type DecisaoDisputa = "reembolso_total" | "reembolso_parcial" | "pagamento_integral";

const USA_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

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
  assedio: "Assédio",
  fraude: "Fraude",
  outro: "Outro",
};

export function rotuloMotivo(motivo: string): string {
  return ROTULOS_MOTIVO[motivo] ?? motivo.replaceAll("_", " ");
}

// Dados de apoio do modo local (sem API).
let denunciasLocais: DenunciaAdmin[] = [
  {
    id: 1,
    denunciado_id: 7,
    denunciante_id: 3,
    vaga_id: 42,
    conversa_id: 9,
    origem: "usuario",
    motivo: "comportamento_inadequado",
    descricao: "Pediu pagamento por fora da plataforma.",
    estado: "aberta",
    criado_em: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    tempo_espera_minutos: 120,
    tempo_espera_horas_uteis: 2,
    acima_da_meta: false,
    meta_horas_uteis: 48,
    denuncias_procedentes_acumuladas: 1,
  } as DenunciaAdmin,
];

export const repositorioModeracao = {
  listarDenuncias: async (): Promise<DenunciaAdmin[]> =>
    USA_MOCKS
      ? denunciasLocais.filter((d) => d.estado === "aberta")
      : chamar<DenunciaAdmin[]>("/api/v1/admin/denuncias?estado=aberta"),

  decidirDenuncia: async (id: number, decisao: DecisaoDenuncia, motivo: string) => {
    if (USA_MOCKS) {
      denunciasLocais = denunciasLocais.map((d) => (d.id === id ? { ...d, estado: decisao } : d));
      return;
    }
    await chamar<DenunciaAdmin>(`/api/v1/admin/denuncias/${id}/decisao`, json({ decisao, motivo }));
  },

  listarBanimentos: async (): Promise<UsuarioBanido[]> =>
    USA_MOCKS ? [] : chamar<UsuarioBanido[]>("/api/v1/admin/banimentos"),

  listarDisputas: async (): Promise<DisputaAdmin[]> =>
    USA_MOCKS ? [] : chamar<DisputaAdmin[]>("/api/v1/admin/disputas?estado=aberta"),

  decidirDisputa: async (
    id: number,
    decisao: DecisaoDisputa,
    motivo: string,
    percentualProfissional?: number,
  ) => {
    if (USA_MOCKS) return;
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
