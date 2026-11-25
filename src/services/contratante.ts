import { ApiError, erroDeResposta } from "@/api/erro";
import { fetchAutenticado } from "@/api/client";
import type { components } from "@/api/schema";
import { contaApi } from "@/services/conta";

// Perfil do contratante: personalização (próprio perfil) e visão pública.

export type PerfilContratanteDetalhe = components["schemas"]["PerfilContratanteDetalhe"];
export type PerfilPublicoContratante = components["schemas"]["PerfilPublicoContratante"];
export type AtualizacaoContratante = components["schemas"]["AtualizacaoContratanteEntrada"];

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

// Dados do modo local (sem API).
let perfilLocal: PerfilContratanteDetalhe = {
  id: 1,
  usuario_id: 1,
  nome: "Maria Contratante",
  email: "maria@example.com",
  tipo_pessoa: "pf",
  documento: null,
  razao_social: null,
  telefone: "81988881000",
  selfie_url: null,
  verificacao: "verificado",
  verificacao_motivo: null,
  adicionais_pagos: 0,
  destaque: false,
  bio: "Organizo a casa e contrato serviços pontuais. Prefiro combinar tudo pelo chat.",
  bairro: "Boa Viagem",
  horario_contato: "Seg a sex, 18h às 21h",
  categorias_interesse: ["limpeza", "pintura"],
  exigir_verificado: true,
  aceita_notificacoes: true,
  cor_destaque: "lilas",
  avatar_url: null,
};

const AVALIACOES_LOCAIS = [
  { nota: 5, comentario: "Combinado claro e pagamento em dia.", avaliador_nome: "Ana Souza", vaga_titulo: "Montagem de guarda-roupa", criado_em: new Date(Date.now() - 6 * 86_400_000).toISOString() },
  { nota: 4, comentario: "Tudo certo, só atrasou a liberação do portão.", avaliador_nome: "Carlos Lima", vaga_titulo: "Limpeza pós-obra", criado_em: new Date(Date.now() - 20 * 86_400_000).toISOString() },
];

function publicoLocal(usuarioId: number): PerfilPublicoContratante {
  const p = perfilLocal;
  return {
    usuario_id: usuarioId,
    nome: p.nome,
    tipo_pessoa: p.tipo_pessoa,
    bio: p.bio,
    bairro: p.bairro,
    horario_contato: p.horario_contato,
    categorias_interesse: (p.categorias_interesse ?? []).map((slug) => ({ slug, nome: slug.charAt(0).toUpperCase() + slug.slice(1) })),
    exigir_verificado: p.exigir_verificado ?? false,
    cor_destaque: p.cor_destaque ?? "lilas",
    avatar_url: p.avatar_url,
    verificado: true,
    nota_media: 4.5,
    total_avaliacoes: AVALIACOES_LOCAIS.length,
    adicionais_pagos: 1,
    destaque: true,
    vagas_publicadas: 6,
    servicos_concluidos: 4,
    membro_desde: new Date(Date.now() - 120 * 86_400_000).toISOString(),
    avaliacoes: AVALIACOES_LOCAIS,
  };
}

export const contratanteApi = {
  obterMeu: (): Promise<PerfilContratanteDetalhe> =>
    USA_MOCKS ? Promise.resolve({ ...perfilLocal }) : contaApi.obterPerfilContratante(),

  atualizar: async (corpo: AtualizacaoContratante): Promise<PerfilContratanteDetalhe> => {
    if (USA_MOCKS) {
      const { avatar_arquivo_id: _avatar, ...resto } = corpo;
      void _avatar;
      perfilLocal = { ...perfilLocal, ...Object.fromEntries(Object.entries(resto).filter(([, v]) => v !== undefined)) };
      return { ...perfilLocal };
    }
    return chamar<PerfilContratanteDetalhe>("/api/v1/perfis/contratante/meu", {
      method: "PATCH",
      body: JSON.stringify(corpo),
    });
  },

  enviarAvatar: async (arquivo: File): Promise<PerfilContratanteDetalhe> => {
    if (USA_MOCKS) {
      perfilLocal = { ...perfilLocal, avatar_url: URL.createObjectURL(arquivo) };
      return { ...perfilLocal };
    }
    const enviado = await contaApi.enviarArquivo("foto", arquivo);
    return contratanteApi.atualizar({ avatar_arquivo_id: enviado.id });
  },

  removerAvatar: (): Promise<PerfilContratanteDetalhe> => {
    if (USA_MOCKS) {
      perfilLocal = { ...perfilLocal, avatar_url: null };
      return Promise.resolve({ ...perfilLocal });
    }
    return contratanteApi.atualizar({ avatar_arquivo_id: 0 });
  },

  perfilPublico: (usuarioId: number): Promise<PerfilPublicoContratante> =>
    USA_MOCKS
      ? Promise.resolve(publicoLocal(usuarioId))
      : chamar<PerfilPublicoContratante>(`/api/v1/contratantes/${usuarioId}/perfil`),
};
