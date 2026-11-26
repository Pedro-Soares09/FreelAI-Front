import { ApiError, erroDeResposta } from "@/api/erro";
import { fetchAutenticado } from "@/api/client";
import type { components } from "@/api/schema";
import { USE_MOCKS as USA_MOCKS } from "@/lib/modo";

// Visão pública do perfil do profissional (sem CPF, telefone nem endereço exato).

export type PerfilPublicoProfissional = components["schemas"]["PerfilPublicoProfissional"];

const PERFIL_LOCAL: PerfilPublicoProfissional = {
  usuario_id: 1,
  nome: "Ana Souza",
  foto_url: null,
  bairro: "Boa Viagem",
  categorias: [
    { slug: "montagem", nome: "Montagem de móveis", nivel_risco: "baixo" },
    { slug: "limpeza", nome: "Limpeza", nivel_risco: "baixo" },
  ],
  caracteristicas: { comunicacao: 5, agilidade: 4, organizacao: 5 },
  verificado: true,
  pro: false,
  reputacao: 4.6,
  nota_media: 4.7,
  total_avaliacoes: 2,
  servicos_concluidos: 6,
  novo: false,
  membro_desde: "2026-09-10T12:00:00Z",
  avaliacoes: [
    {
      nota: 5,
      comentario: "Pontual e muito organizada.",
      avaliador_nome: "Maria Contratante",
      vaga_titulo: "Montagem de guarda-roupa",
      criado_em: "2026-11-10T12:00:00Z",
    },
    {
      nota: 4,
      comentario: "Serviço bem feito.",
      avaliador_nome: "Roberto Cunha",
      vaga_titulo: "Limpeza pós-obra",
      criado_em: "2026-10-28T12:00:00Z",
    },
  ],
};

export const profissionalApi = {
  perfilPublico: async (usuarioId: number): Promise<PerfilPublicoProfissional> => {
    if (USA_MOCKS) return { ...PERFIL_LOCAL, usuario_id: usuarioId };
    let resposta: Response;
    try {
      resposta = await fetchAutenticado(`/api/v1/profissionais/${usuarioId}/perfil`);
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
    return (await resposta.json()) as PerfilPublicoProfissional;
  },
};
